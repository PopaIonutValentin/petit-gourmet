import {useState, useEffect} from 'react';
import {cerereApi} from '../api.js';
import CardReteta from '../componente/CardReteta.jsx';
import PopupReteta from '../componente/PopupReteta.jsx';

export default function PaginaFeed({utilizator})
{
    const [retete, seteazaRetete] = useState([]);
    const [seIncarca, seteazaSeIncarca] = useState(true);
    const [eroare, seteazaEroare] = useState('');
    const [idRetetaDeschisa, seteazaIdRetetaDeschisa] = useState(null);
    const [pozitieCard, seteazaPozitieCard] = useState(null);

    function deschideReteta(idReteta, dreptunghiCard)
    {
        seteazaPozitieCard(dreptunghiCard);
        seteazaIdRetetaDeschisa(idReteta);
    }

    function actualizeazaStelele(idReteta, recenziiReteta)
    {
        const numar = recenziiReteta.length;
        const suma = recenziiReteta.reduce((total, recenzie) => total + recenzie.nota, 0);
        const medie = numar > 0 ? Math.round(suma / numar * 10) / 10 :null;

        seteazaRetete((reteteVechi) => reteteVechi.map((reteta) =>
            reteta.id === idReteta ? {...reteta, numar_recenzii: numar, medie_stele: medie} : reteta
        ));
    }

    useEffect(() =>
    {
        let ignora = false;

        async function citesteRetete()
        {
            try
            {
                const raspuns = await cerereApi('GET', '/retete');

                if(!ignora)
                {
                    seteazaRetete(raspuns.retete);
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
    }, []);

    return (
        <>
            <h1>Feed</h1>
            {idRetetaDeschisa !== null && (
                <PopupReteta
                    idReteta={idRetetaDeschisa}
                    pozitieCard={pozitieCard}
                    utilizator={utilizator}
                    laInchidere={() => seteazaIdRetetaDeschisa(null)}
                    laIncarcareRecenzii={actualizeazaStelele}
                />
            )}
            <p role="alert">{eroare}</p>
            {seIncarca && <p>Se incarca retetele...</p>}
            {!seIncarca && !eroare && retete.length === 0 && <p>Nu exista inca retete publice.</p>}
            <ul className="feed-grila">
                {retete.map((reteta) => (
                    <li key={reteta.id}>
                        <CardReteta reteta={reteta} laDeschidere={deschideReteta}/>
                    </li>
                ))}
            </ul>
        </>
    );
}