import {useState, useEffect} from 'react';
import {Routes, Route, useNavigate} from 'react-router';
import {cerereApi} from './api.js';
import PaginaAutentificare from './pagini/PaginaAutentificare.jsx';
import PaginaInregistrare from './pagini/PaginaInregistrare.jsx';
import PaginaFeed from './pagini/PaginaFeed.jsx';
import Meniu from './componente/Meniu.jsx';
import logo from './imagini/logo-petit-gourmet.webp';

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
        <div className="aplicatie">
            <header className="antet-mobil">
                <img
                    src={logo}
                    alt="Petit Gourmet"
                    className="antet-mobil-logo"
                    width="480"
                    height="104"
                />
            </header>
            <Meniu
                utilizator={utilizator}
                seVerifica={seVerifica}
                laDeconectare={deconecteaza}
            />
            <main className="continut">
                <p role="alert">{eroareDeconectare}</p>
                <Routes>
                    <Route path="/" element={<PaginaFeed />} />
                    <Route path="/autentificare" element={<PaginaAutentificare laAutentificare={seteazaUtilizator} />} />
                    <Route path="/inregistrare" element={<PaginaInregistrare />} />
                    <Route path="*" element={<PaginaNegasita />} />
                </Routes>
            </main>
        </div>
    );
}