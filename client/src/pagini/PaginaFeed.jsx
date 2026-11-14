import {useState, useEffect} from 'react';
import {cerereApi} from '../api.js';
import CardReteta from '../componente/CardReteta.jsx';
import PopupReteta from '../componente/PopupReteta.jsx';

export default function PaginaFeed()
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
                    laInchidere={() => seteazaIdRetetaDeschisa(null)}
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