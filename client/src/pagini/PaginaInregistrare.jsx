import { useState } from 'react';
import {Link} from 'react-router';
import { cerereApi } from '../api.js';

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
    const lungime = numaraCaractere;
    
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
            <main>
                <h1>Inregistrare</h1>
                <p role="status">{mesajSucces}</p>
                <Link to="/autentificare">Mergi la autentificare</Link>
            </main>
        );
    }

    return (
        <main>
            <h1>Inregistrare</h1>
            <p role="alert">{eroare}</p>
            <form onSubmit={trimiteFormularul}>
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
                <input
                    id="parola"
                    type="password"
                    autoComplete="new-password"
                    minLength={LUNGIME_MINIMA_PAROLA}
                    aria-describedby="indicatieParola"
                    value={parola}
                    onChange={(eveniment) => seteazaParola(eveniment.target.value)}
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
                <p id="indicatieParola">{descriereParola(parola)}</p>
                <button type="submit" disabled={seTrimite}>
                    {seTrimite ? 'Se creeaza contul...' : 'Creeaza contul'}
                </button>
            </form>
            <p>Ai deja cont? <Link to="/autentificare">Autentifica-te</Link></p>
        </main>
    );
}
