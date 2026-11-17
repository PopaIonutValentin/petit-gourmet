import {useState, useEffect} from 'react';
import {Routes, Route, useNavigate} from 'react-router';
import {cerereApi} from './api.js';
import PaginaAutentificare from './pagini/PaginaAutentificare.jsx';
import PaginaInregistrare from './pagini/PaginaInregistrare.jsx';
import PaginaFeed from './pagini/PaginaFeed.jsx';
import Meniu from './componente/Meniu.jsx';
import logo from './imagini/logo-petit-gourmet.webp';
import PaginaCautare from './pagini/PaginaCautare.jsx';
import PopupCautare from './componente/PopupCautare.jsx';
import PopupAdaugaReteta from './componente/PopupAdaugaReteta.jsx';
import PopupReteta from './componente/PopupReteta.jsx';
import PaginaProfil from './pagini/PaginaProfil.jsx';

function PaginaNegasita()
{
    return <h1>Pagina nu exista</h1>;
}

export default function App()
{
    const [utilizator, seteazaUtilizator] = useState(null);
    const [seVerifica, seteazaSeVerifica] = useState(true);
    const [eroareDeconectare, seteazaEroareDeconectare] = useState('');
    const [cautareDeschisa, seteazaCautareDeschisa] = useState(false);
    const [pozitieCautare, seteazaPozitieCautare] = useState(null);
    const [popupDoarCategorii, seteazaPopupDoarCategorii] = useState(false);
    const [adaugareDeschisa, seteazaAdaugareDeschisa] = useState(false);
    const [pozitieAdaugare, seteazaPozitieAdaugare] = useState(null);
    const [idRetetaNoua, seteazaIdRetetaNoua] = useState(null);
    const [versiuneRetete, seteazaVersiuneRetete] = useState(0);
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

    function deschideCautarea(dreptunghiButon, doarCategorii = false)
    {
        seteazaPozitieCautare(dreptunghiButon);
        seteazaPopupDoarCategorii(doarCategorii);
        seteazaCautareDeschisa(true);
    }

    function deschideAdaugarea(dreptunghiButon)
    {
        seteazaPozitieAdaugare(dreptunghiButon);
        seteazaAdaugareDeschisa(true);
    }

    function inchideRetetaNoua()
    {
        seteazaIdRetetaNoua(null);
        seteazaVersiuneRetete((versiuneVeche) => versiuneVeche + 1);
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
                laCautare={deschideCautarea}
                laAdaugare={deschideAdaugarea}
            />
            {cautareDeschisa && (
                <PopupCautare
                    pozitieButon={pozitieCautare}
                    doarCategorii={popupDoarCategorii}
                    laInchidere={() => seteazaCautareDeschisa(false)}
                />
            )}
            {adaugareDeschisa && (
                <PopupAdaugaReteta
                    pozitieButon={pozitieAdaugare}
                    laSalvare={seteazaIdRetetaNoua}
                    laInchidere={() => seteazaAdaugareDeschisa(false)}
                />
            )}
            {idRetetaNoua !== null && !adaugareDeschisa && (
                <PopupReteta
                    idReteta={idRetetaNoua}
                    pozitieCard={null}
                    utilizator={utilizator}
                    laInchidere={inchideRetetaNoua}
                />
            )}
            <main className="continut">
                <p role="alert">{eroareDeconectare}</p>
                <Routes key={versiuneRetete}>
                    <Route path="/" element={<PaginaFeed utilizator={utilizator} />} />
                    <Route path="/cautare" element={<PaginaCautare utilizator={utilizator} laModificare={deschideCautarea} />} />
                    <Route path="/profil" element={<PaginaProfil utilizator={utilizator} seVerifica={seVerifica} />} />
                    <Route path="/autentificare" element={<PaginaAutentificare laAutentificare={seteazaUtilizator} />} />
                    <Route path="/inregistrare" element={<PaginaInregistrare />} />
                    <Route path="*" element={<PaginaNegasita />} />
                </Routes>
            </main>
        </div>
    );
}