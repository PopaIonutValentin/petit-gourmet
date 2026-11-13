import {useState, useEffect} from 'react';
import {Routes, Route, Link, useNavigate} from 'react-router';
import {cerereApi} from './api.js';
import PaginaAutentificare from './pagini/PaginaAutentificare.jsx';
import PaginaInregistrare from './pagini/PaginaInregistrare.jsx';

function PaginaFeed()
{
    return <h1>Feed</h1>;
}

function PaginaNegasita()
{
    return <h1>Pagina nu exista</h1>;
}

export default function App()
{
    const[utilizator, seteazaUtilizator] = useState(null);
    const[seVerifica, seteazaSeVerifica] = useState(true);
    const[eroareDeconectare, seteazaEroareDeconectare] = useState('');
    const navigheaza = useNavigate();

    useEffect(() =>
    {
        let ignora = false;

        async function citesteUtilizatorul()
        {
            try
            {
                const raspuns = await cerereApi('GET', '/eu');

                if(!ignora)
                {
                    seteazaUtilizator(raspuns.utilizator);
                }
            }
            catch
            {
                if(!ignora)
                {
                    seteazaUtilizator(null);
                }
            }
            finally
            {
                if(!ignora)
                {
                    seteazaSeVerifica(false);
                }
            }
        }

        citesteUtilizatorul();

        return () =>
        {
            ignora=true;
        };
    }, []);

    async function deconecteaza()
    {
        seteazaEroareDeconectare('');

        try
        {
            await cerereApi('POST', '/logout');
            seteazaUtilizator(null);
            navigheaza('/autentificare');
        }
        catch (eroareCerere)
        {
            seteazaEroareDeconectare(eroareCerere.message);
        }
    }

    return (
        <>
            <nav>
                <Link to="/">Feed</Link>
                {!seVerifica && utilizator && (
                    <>
                        <span>{utilizator.nume_utilizator}</span>
                        <button type="button" onClick={deconecteaza}>Deconectare</button>
                    </>
                )}
                {!seVerifica && !utilizator && (
                    <>
                        <Link to="/autentificare">Autentificare</Link>
                        <Link to="/inregistrare">Inregistrare</Link>
                    </>
                )}
            </nav>
            <Routes>
                    <Route path="/" element={<PaginaFeed />} />
                    <Route path="/autentificare" element={<PaginaAutentificare laAutentificare={seteazaUtilizator} />} />
                    <Route path="/inregistrare" element={<PaginaInregistrare />} />
                    <Route path="*" element={<PaginaNegasita />} />
            </Routes>
        </>
    );
}