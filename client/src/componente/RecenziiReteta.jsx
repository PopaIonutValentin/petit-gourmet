import {useState, useEffect} from 'react';
import { cerereApi } from '../api.js';

export default function RecenziiReteta({idReteta})
{
    const [recenzii, seteazaRecenzii] = useState([]);
    const [seIncarca, seteazaSeIncarca] = useState(true);
    const [eroare, seteazaEroare] = useState('');
     
    useEffect(() =>
    {
        let ignora = false;

        async function citesteRecenziile()
        {
            try
            {
                const raspuns = await cerereApi ('GET', '/retete/' + idReteta + '/recenzii');

                if(!ignora)
                {
                    seteazaRecenzii(raspuns.recenzii);
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

        citesteRecenziile();

        return () =>
        {
            ignora = true;
        };
    }, [idReteta]);

    return (
        <section className="recenzii" aria-labelledby="titluRecenzii">
            <h3 id="titluRecenzii">Recenzii</h3>
            <p role="alert">{eroare}</p>
            {seIncarca && <p>Se incarca recenziile...</p>}
            {!seIncarca && !eroare && recenzii.length === 0 && <p>Nicio recenzie inca.</p>}
            <ul className="recenzii-lista">
                {recenzii.map((recenzie) => (
                    <li key={recenzie.id} className="recenzie">
                        <div className="recenzie-antet">
                            <span className="recenzie-autor">{recenzie.autor}</span>
                            <span
                                className="recenzie-stele"
                                role="img"
                                aria-label={recenzie.nota + ' din 5 stele'}
                            >
                                {'★'.repeat(recenzie.nota)}{'☆'.repeat(5 - recenzie.nota)}
                            </span>    
                        </div>
                        <p className="recenzie-text">{recenzie.continut}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
}