import {useState, useEffect} from 'react';
import {cerereApi} from '../api.js';
import CardReteta from '../componente/CardReteta.jsx';

export default function PaginaFeed()
{
    const [retete, seteazaRetete] = useState([]);
    const [seIncarca, seteazaSeIncarca] = useState(true);
    const [eroare, seteazaEroare] = useState('');

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
            <p role="alert">{eroare}</p>
            {seIncarca && <p>Se incarca retetele...</p>}
            {!seIncarca && !eroare && retete.length === 0 && <p>Nu exista inca retete publice.</p>}
            
            <ul className="feed-grila">
                {retete.map((reteta) => (
                    <li key={reteta.id}>
                        <CardReteta reteta={reteta} />
                    </li>
                ))}
            </ul>
        </>
    );
}