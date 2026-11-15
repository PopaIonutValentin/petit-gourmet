import {useState, useEffect} from 'react';
import {cerereApi} from '../api.js';
import {Link} from 'react-router';
import {CircleAlert, CircleCheck, Info, LogIn} from 'lucide-react';

export default function RecenziiReteta({idReteta, idAutor, estePrivata, utilizator, laIncarcareRecenzii})
{
    const [recenzii, seteazaRecenzii] = useState([]);
    const [seIncarca, seteazaSeIncarca] = useState(true);
    const [eroare, seteazaEroare] = useState('');
    const [nota, seteazaNota] = useState(0);
    const [text, seteazaText] = useState('');
    const [eroareFormular, seteazaEroareFormular] = useState('');
    const [seTrimite, seteazaSeTrimite] = useState(false);
    const [reincarcare, seteazaReincarcare] = useState(0);
     
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
                    laIncarcareRecenzii(idReteta, raspuns.recenzii);
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
    }, [idReteta, reincarcare]);

    const esteLogat = utilizator !== null;
    const esteAutorul = esteLogat && utilizator.id === idAutor;
    const aLasatDeja = esteLogat && recenzii.some((recenzie) => recenzie.autor === utilizator.nume_utilizator);

    async function trimiteRecenzia(eveniment)
    {
        eveniment.preventDefault();
        seteazaEroareFormular('');

        if(nota === 0)
        {
            seteazaEroareFormular('Alege o nota de la 1 la 5 stele.');
            return;
        }

        if([...text.trim()].length < 3)
        {
            seteazaEroareFormular('Recenzia trebuie sa aiba cel putin 3 caractere.');
            return;
        }

        seteazaSeTrimite(true);

        try
        {
            await cerereApi('POST', '/retete/' + idReteta + '/recenzii', {nota: nota, continut: text});
            seteazaNota(0);
            seteazaText('');
            seteazaReincarcare(reincarcare + 1);
        }
        catch (eroareCerere)
        {
            seteazaEroareFormular(eroareCerere.message);
        }
        finally
        {
            seteazaSeTrimite(false);
        }
    }

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
            {!seIncarca && !estePrivata && (
                <div className="recenzie-formular">
                    {!esteLogat && (
                        <Link to="/autentificare" className="recenzie-mesaj recenzie-mesaj-legatura">
                            <LogIn aria-hidden="true" />
                            <span>Autentifica-te ca sa lasi o recenzie.</span>
                        </Link>
                    )}
                    {esteAutorul && (
                        <p className="recenzie-mesaj">
                            <Info aria-hidden="true" />
                            <span>Nu iti poti lasa o recenzie la propria reteta.</span>
                        </p>
                    )}
                    {esteLogat && !esteAutorul && aLasatDeja && (
                        <p className="recenzie-mesaj">
                            <CircleCheck aria-hidden="true" />
                            <span>Ai lasat deja o recenzie la aceasta reteta.</span>
                        </p>
                    )}
                    {esteLogat && !esteAutorul && !aLasatDeja && (
                        <form onSubmit={trimiteRecenzia} noValidate>
                            <fieldset className="recenzie-nota">
                                <legend>Nota ta (1-5 stele)</legend>
                                {[1,2,3,4,5].map((valoare) => (
                                    <label key={valoare}>
                                        <input
                                            type="radio"
                                            name="nota"
                                            value={valoare}
                                            checked={nota === valoare}
                                            onChange={() => seteazaNota(valoare)}
                                            required
                                        />
                                        {valoare}
                                    </label>
                                ))}
                            </fieldset>
                            <label htmlFor="textRecenzie">Recenzia ta</label>
                            <textarea
                                id="textRecenzie"
                                value={text}
                                onChange={(eveniment) => seteazaText(eveniment.target.value)}
                                required
                                minLength={3}
                                maxLength={1000}
                                rows={4}
                            />
                            <div role="alert">
                                {eroareFormular && (
                                    <p className="recenzie-mesaj recenzie-mesaj-eroare">
                                        <CircleAlert aria-hidden="true" />
                                        <span>{eroareFormular}</span>
                                    </p>
                                )}
                            </div>
                            <button type="submit" disabled={seTrimite}>
                                {seTrimite ? 'Se trimite...' : 'Trimite recenzia'}
                            </button>    
                        </form>
                    )}
                </div>
            )}
        </section>
    );
}