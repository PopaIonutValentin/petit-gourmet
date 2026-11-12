import {useState} from 'react';
import {Link, useNavigate} from 'react-router';
import {cerereApi} from '../api.js';

export default function PaginaAutentificare() 
{
    const [numeUtilizator, seteazaNumeUtilizator] = useState('');
    const [parola, seteazaParola] = useState('');
    const [eroare, seteazaEroare] = useState('');
    const [seTrimite, seteazaSeTrimite] = useState(false);
    const navigheaza = useNavigate();

    async function trimiteFormularul(eveniment)
    {
        eveniment.preventDefault();
        seteazaEroare('');
        seteazaSeTrimite(true);

        try
        {
            await cerereApi('POST', '/login', {numeUtilizator, parola});
            navigheaza('/');
        }
        catch (eroareCerere)
        {
            seteazaEroare(eroareCerere.message);
            seteazaParola('');
        }
        finally
        {
            seteazaSeTrimite(false);
        }
    }

    return (
        <main>
            <h1>Autentificare</h1>
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
                <label htmlFor="parola">Parola</label>
                <input
                    id="parola"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={parola}
                    onChange={(eveniment) => seteazaParola(eveniment.target.value)}
                />
                <button type="submit" disabled={seTrimite}>
                    {seTrimite ? 'Se verifica...' : 'Autentificare'}
                </button>
            </form>
            <p>Nu ai cont? <Link to="/inregistrare">Creeaza unul</Link></p>
        </main>
    );
}