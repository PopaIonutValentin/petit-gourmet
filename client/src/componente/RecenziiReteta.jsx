import {useState, useEffect} from 'react';
import {cerereApi} from '../api.js';
import {Link} from 'react-router';
import {CircleAlert, CircleCheck, Info, LogIn, Pencil, Trash2} from 'lucide-react';
import PopupConfirmare from './PopupConfirmare.jsx';

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
    const [idRecenzieEditata, seteazaIdRecenzieEditata] = useState(null);
    const [recenzieDeSters, seteazaRecenzieDeSters] = useState(null);

    useEffect(() =>
    {
        let ignora = false;

        async function citesteRecenziile()
        {
            try
            {
                const raspuns = await cerereApi('GET', '/retete/' + idReteta + '/recenzii');

                if(!ignora)
                {
                    seteazaRecenzii(raspuns.recenzii);
                    laIncarcareRecenzii?.(idReteta, raspuns.recenzii);
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
    const esteAdmin = esteLogat && utilizator.rol === 'admin';
    const aLasatDeja = esteLogat && recenzii.some((recenzie) => recenzie.autor === utilizator.nume_utilizator);
    const seEditeaza = idRecenzieEditata !== null;

    function esteRecenziaMea(recenzie)
    {
        return esteLogat && recenzie.autor === utilizator.nume_utilizator;
    }

    function incepeEditarea(recenzie)
    {
        seteazaEroareFormular('');
        seteazaNota(recenzie.nota);
        seteazaText(recenzie.continut);
        seteazaIdRecenzieEditata(recenzie.id);
    }

    function anuleazaEditarea()
    {
        seteazaEroareFormular('');
        seteazaNota(0);
        seteazaText('');
        seteazaIdRecenzieEditata(null);
    }

    function deschideStergerea(eveniment, idRecenzie)
    {
        const dreptunghi = eveniment.currentTarget.getBoundingClientRect();

        seteazaRecenzieDeSters({
            id: idRecenzie,
            punct: {
                x: dreptunghi.left + dreptunghi.width / 2,
                y: dreptunghi.top + dreptunghi.height / 2
            }
        });
    }

    async function stergeRecenzia()
    {
        seteazaEroare('');

        try
        {
            await cerereApi('DELETE', '/recenzii/' + recenzieDeSters.id);

            if(recenzieDeSters.id === idRecenzieEditata)
            {
                anuleazaEditarea();
            }

            seteazaReincarcare((reincarcareVeche) => reincarcareVeche + 1);
            return true;
        }
        catch (eroareCerere)
        {
            seteazaEroare(eroareCerere.message);
            return false;
        }
    }

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
            if(seEditeaza)
            {
                await cerereApi('PUT', '/recenzii/' + idRecenzieEditata, {nota: nota, continut: text});
            }
            else
            {
                await cerereApi('POST', '/retete/' + idReteta + '/recenzii', {nota: nota, continut: text});
            }

            seteazaNota(0);
            seteazaText('');
            seteazaIdRecenzieEditata(null);
            seteazaReincarcare((reincarcareVeche) => reincarcareVeche + 1);
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
                            {(esteRecenziaMea(recenzie) || esteAdmin) && (
                                <div className="recenzie-actiuni">
                                    {esteRecenziaMea(recenzie) && !estePrivata && (
                                        <button
                                            type="button"
                                            className="recenzie-actiune"
                                            aria-label="Editeaza recenzia"
                                            onClick={() => incepeEditarea(recenzie)}
                                        >
                                            <Pencil aria-hidden="true" />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="recenzie-actiune recenzie-actiune-pericol"
                                        aria-label="Sterge recenzia"
                                        onClick={(eveniment) => deschideStergerea(eveniment, recenzie.id)}
                                    >
                                        <Trash2 aria-hidden="true" />
                                    </button>
                                </div>
                            )}
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
                    {esteLogat && !esteAutorul && aLasatDeja && !seEditeaza && (
                        <p className="recenzie-mesaj">
                            <CircleCheck aria-hidden="true" />
                            <span>Ai lasat deja o recenzie la aceasta reteta.</span>
                        </p>
                    )}
                    {esteLogat && !esteAutorul && (!aLasatDeja || seEditeaza) && (
                        <form onSubmit={trimiteRecenzia} noValidate>
                            <fieldset className="recenzie-nota">
                                <legend>{seEditeaza ? 'Modifica nota (1-5 stele)' : 'Nota ta (1-5 stele)'}</legend>
                                {[1, 2, 3, 4, 5].map((valoare) => (
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
                            <label htmlFor="textRecenzie">{seEditeaza ? 'Modifica recenzia' : 'Recenzia ta'}</label>
                            <textarea
                                id="textRecenzie"
                                value={text}
                                onChange={(eveniment) => seteazaText(eveniment.target.value)}
                                required
                                minLength={3}
                                maxLength={1000}
                                rows={4}
                                autoFocus={seEditeaza}
                            />
                            <div role="alert">
                                {eroareFormular && (
                                    <p className="recenzie-mesaj recenzie-mesaj-eroare">
                                        <CircleAlert aria-hidden="true" />
                                        <span>{eroareFormular}</span>
                                    </p>
                                )}
                            </div>
                            <div className="recenzie-formular-butoane">
                                <button type="submit" disabled={seTrimite}>
                                    {seTrimite ? 'Se trimite...' : (seEditeaza ? 'Salveaza modificarile' : 'Trimite recenzia')}
                                </button>
                                {seEditeaza && (
                                    <button type="button" className="recenzie-anuleaza" onClick={anuleazaEditarea}>
                                        Anuleaza
                                    </button>
                                )}
                            </div>
                        </form>
                    )}
                </div>
            )}
            {recenzieDeSters !== null && (
                <PopupConfirmare
                    titlu="Stergi recenzia?"
                    mesaj="Recenzia va fi stearsa definitiv."
                    textAnulare="Anuleaza"
                    textConfirmare="Sterge"
                    punctPornire={recenzieDeSters.punct}
                    punctIesire={recenzieDeSters.punct}
                    laConfirmare={stergeRecenzia}
                    laInchidere={() => seteazaRecenzieDeSters(null)}
                />
            )}
        </section>
    );
}