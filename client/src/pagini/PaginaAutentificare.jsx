import {useState} from 'react';
import {Link, useNavigate} from 'react-router';
import {ChefHat, CircleAlert, LogIn} from 'lucide-react';
import {cerereApi} from '../api.js';
import CampParola from '../componente/CampParola.jsx';

export default function PaginaAutentificare({laAutentificare})
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
            const raspuns = await cerereApi('GET', '/eu');
            laAutentificare(raspuns.utilizator);
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
        <div className="cont-pagina">
            <section className="cont-card" aria-labelledby="titluAutentificare">
                <div className="cont-iconita">
                    <ChefHat aria-hidden="true" />
                </div>
                <h1 id="titluAutentificare">Bine ai revenit</h1>
                <p className="cont-subtitlu">Intra in cont ca sa adaugi retete.</p>
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
                    <label htmlFor="parola">Parola</label>
                    <CampParola
                        id="parola"
                        autoComplete="current-password"
                        valoare={parola}
                        laSchimbare={seteazaParola}
                    />
                    <button type="submit" className="cont-buton" disabled={seTrimite}>
                        <LogIn aria-hidden="true" />
                        {seTrimite ? 'Se verifica...' : 'Autentificare'}
                    </button>
                </form>
                <p className="cont-alternativa">Nu ai cont? <Link to="/inregistrare">Creeaza unul</Link></p>
            </section>
        </div>
    );
}