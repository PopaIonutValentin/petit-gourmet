import {useState, useEffect, useRef} from 'react';
import {CircleCheck, LoaderCircle} from 'lucide-react';
import {cerereApi} from '../api.js';
import CardReteta from './CardReteta.jsx';
import PopupReteta from './PopupReteta.jsx';

function construiesteCalea(filtre, cursor)
{
    const parametri = new URLSearchParams(filtre);

    if(cursor !== null)
    {
        parametri.set('dupa', cursor);
    }

    const textParametri = parametri.toString();

    return textParametri === '' ? '/retete' : '/retete?' + textParametri;
}

export default function ListaRetete({filtre, utilizator, mesajGol})
{
    const [retete, seteazaRetete] = useState([]);
    const [seIncarca, seteazaSeIncarca] = useState(true);
    const [eroare, seteazaEroare] = useState('');
    const [idRetetaDeschisa, seteazaIdRetetaDeschisa] = useState(null);
    const [pozitieCard, seteazaPozitieCard] = useState(null);
    const [cursor, seteazaCursor] = useState(null);
    const [seIncarcaMaiMulte, seteazaSeIncarcaMaiMulte] = useState(false);
    const capatulListei = useRef(null);

    function deschideReteta(idReteta, dreptunghiCard)
    {
        seteazaPozitieCard(dreptunghiCard);
        seteazaIdRetetaDeschisa(idReteta);
    }

    function actualizeazaStelele(idReteta, recenziiReteta)
    {
        const numar = recenziiReteta.length;
        const suma = recenziiReteta.reduce((total, recenzie) => total + recenzie.nota, 0);
        const medie = numar > 0 ? Math.round(suma / numar * 10) / 10 : null;

        seteazaRetete((reteteVechi) => reteteVechi.map((reteta) =>
            reteta.id === idReteta ? {...reteta, numar_recenzii: numar, medie_stele: medie} : reteta
        ));
    }

    function scoateReteta(idReteta)
    {
        seteazaRetete((reteteVechi) => reteteVechi.filter((reteta) => reteta.id !== idReteta));
    }

    async function incarcaMaiMulte()
    {
        seteazaSeIncarcaMaiMulte(true);

        try
        {
            const raspuns = await cerereApi('GET', construiesteCalea(filtre, cursor));

            seteazaRetete((reteteVechi) => [...reteteVechi, ...raspuns.retete]);
            seteazaCursor(raspuns.urmatorulCursor);
        }
        catch (eroareCerere)
        {
            seteazaEroare(eroareCerere.message);
        }
        finally
        {
            seteazaSeIncarcaMaiMulte(false);
        }
    }

    useEffect(() =>
    {
        let ignora = false;

        async function citesteRetete()
        {
            try
            {
                const raspuns = await cerereApi('GET', construiesteCalea(filtre, null));

                if(!ignora)
                {
                    seteazaRetete(raspuns.retete);
                    seteazaCursor(raspuns.urmatorulCursor);
                }
            }
            catch (eroareCerere)
            {
                if(!ignora)
                {
                    seteazaEroare(eroareCerere.message);
                }
            }
            finally
            {
                if(!ignora)
                {
                    seteazaSeIncarca(false);
                }
            }
        }

        citesteRetete();

        return () =>
        {
            ignora = true;
        };
    }, [filtre]);

    useEffect(() =>
    {
        if(cursor === null || eroare || seIncarcaMaiMulte)
        {
            return;
        }

        const observator = new IntersectionObserver((intrari) =>
        {
            if(intrari[0].isIntersecting)
            {
                incarcaMaiMulte();
            }
        }, {rootMargin: '400px'});

        observator.observe(capatulListei.current);

        return () =>
        {
            observator.disconnect();
        };
    }, [cursor, eroare, seIncarcaMaiMulte]);

    return (
        <>
            {idRetetaDeschisa !== null && (
                <PopupReteta
                    idReteta={idRetetaDeschisa}
                    pozitieCard={pozitieCard}
                    utilizator={utilizator}
                    laInchidere={() => seteazaIdRetetaDeschisa(null)}
                    laIncarcareRecenzii={actualizeazaStelele}
                    laStergere={scoateReteta}
                />
            )}
            <p role="alert">{eroare}</p>
            {seIncarca && (
                <div className="feed-incarcare">
                    <p className="recenzie-mesaj">
                        <LoaderCircle aria-hidden="true" className="feed-rotita" />
                        Se incarca retetele...
                    </p>
                </div>
            )}
            {!seIncarca && !eroare && retete.length === 0 && mesajGol}
            <ul className="feed-grila">
                {retete.map((reteta) => (
                    <li key={reteta.id}>
                        <CardReteta reteta={reteta} laDeschidere={deschideReteta}/>
                    </li>
                ))}
            </ul>
            {cursor !== null && !eroare && (
                <div ref={capatulListei} className="feed-final">
                    {seIncarcaMaiMulte && (
                        <p className="recenzie-mesaj">
                            <LoaderCircle aria-hidden="true" className="feed-rotita" />
                            Se incarca retetele...
                        </p>
                    )}
                </div>
            )}
            {!seIncarca && !eroare && cursor === null && retete.length > 0 && (
                <div className="feed-final">
                    <p className="recenzie-mesaj">
                        <CircleCheck aria-hidden="true" />
                        Ai vazut toate retetele.
                    </p>
                </div>
            )}
        </>
    );
}