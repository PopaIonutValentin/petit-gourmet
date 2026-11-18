import {useState} from 'react';
import {Link} from 'react-router';
import {ChefHat, CircleAlert, CircleCheck, LogIn, UserPlus} from 'lucide-react';
import {cerereApi} from '../api.js';
import CampParola from '../componente/CampParola.jsx';

const LUNGIME_MINIMA_PAROLA = 15;
const LUNGIME_MAXIMA_PAROLA = 128;
const LUNGIME_PAROLA_PUTERNICA = 20;
const LUNGIME_MAXIMA_BARA = 30;

function numaraCaractere(text)
{
    return [...text.normalize('NFC')].length;
}

function descriereParola(parola)
{
    const lungime = numaraCaractere(parola);

    if(lungime === 0)
    {
        return 'Minim 15 caractere.';
    }

    if(lungime < LUNGIME_MINIMA_PAROLA)
    {
        return `Prea scurta: mai ai nevoie de ${LUNGIME_MINIMA_PAROLA - lungime} caractere.`;
    }

    if(lungime > LUNGIME_MAXIMA_PAROLA)
    {
        return `Prea lunga: cel mult ${LUNGIME_MAXIMA_PAROLA} caractere.`;
    }

    if(!parola.trim().includes(' '))
    {
        return 'Lungime buna. Sfat: o fraza din mai multe cuvinte e mai greu de ghicit.';
    }

    return 'Lungime buna.';
}

export default function PaginaInregistrare()
{
    const [numeUtilizator, seteazaNumeUtilizator] = useState('');
    const [email, seteazaEmail] = useState('');
    const [parola, seteazaParola] = useState('');
    const [eroare, seteazaEroare] = useState('');
    const [seTrimite, seteazaSeTrimite] = useState(false);
    const [mesajSucces, seteazaMesajSucces] = useState('');

    async function trimiteFormularul(eveniment)
    {
        eveniment.preventDefault();
        seteazaEroare('');
        seteazaSeTrimite(true);

        try
        {
            const raspuns = await cerereApi('POST', '/inregistrare', {numeUtilizator, email, parola});
            seteazaMesajSucces(raspuns.mesaj);
        }
        catch (eroareCerere)
        {
            seteazaEroare(eroareCerere.message);
        }
        finally
        {
            seteazaSeTrimite(false);
        }
    }

    if(mesajSucces)
    {
        return (
            <div className="cont-pagina">
                <section className="cont-card" aria-labelledby="titluInregistrare">
                    <div className="cont-iconita">
                        <CircleCheck aria-hidden="true" />
                    </div>
                    <h1 id="titluInregistrare">Cont creat</h1>
                    <p role="status" className="cont-subtitlu">{mesajSucces}</p>
                    <Link to="/autentificare" className="cont-buton">
                        <LogIn aria-hidden="true" />
                        Mergi la autentificare
                    </Link>
                </section>
            </div>
        );
    }

    return (
        <div className="cont-pagina">
            <section className="cont-card" aria-labelledby="titluInregistrare">
                <div className="cont-iconita">
                    <ChefHat aria-hidden="true" />
                </div>
                <h1 id="titluInregistrare">Creeaza cont</h1>
                <p className="cont-subtitlu">Salveaza-ti retetele si da note celor preferate.</p>
                <div role="alert">
                    {eroare && (
                        <p className="cont-eroare">
                            <CircleAlert aria-hidden="true" />
                            {eroare}
                        </p>
                    )}
                </div>
                <form className="cont-formular" onSubmit={trimiteFormularul}>
                    <label htmlFor="numeUtilizator">Nume de utilizator</label>
                    <input
                        id="numeUtilizator"
                        type="text"
                        autoComplete="username"
                        required
                        value={numeUtilizator}
                        onChange={(eveniment) => seteazaNumeUtilizator(eveniment.target.value)}
                    />
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(eveniment) => seteazaEmail(eveniment.target.value)}
                    />
                    <label htmlFor="parola">Parola</label>
                    <CampParola
                        id="parola"
                        autoComplete="new-password"
                        lungimeMinima={LUNGIME_MINIMA_PAROLA}
                        descriere="indicatieParola"
                        valoare={parola}
                        laSchimbare={seteazaParola}
                    />
                    <meter
                        min={0}
                        max={LUNGIME_MAXIMA_BARA}
                        low={LUNGIME_MINIMA_PAROLA}
                        high={LUNGIME_PAROLA_PUTERNICA}
                        optimum={LUNGIME_MAXIMA_BARA}
                        value={numaraCaractere(parola)}
                        aria-hidden="true"
                    />
                    <p id="indicatieParola" className="cont-indicatie">{descriereParola(parola)}</p>
                    <button type="submit" className="cont-buton" disabled={seTrimite}>
                        <UserPlus aria-hidden="true" />
                        {seTrimite ? 'Se creeaza contul...' : 'Creeaza contul'}
                    </button>
                </form>
                <p className="cont-alternativa">Ai deja cont? <Link to="/autentificare">Autentifica-te</Link></p>
            </section>
        </div>
    );
}