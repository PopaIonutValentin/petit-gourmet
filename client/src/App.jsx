import {Routes, Route, Link} from 'react-router';
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
    return (
        <>
            <nav>
                <Link to="/">Feed</Link>
                <Link to="/autentificare">Autentificare</Link>
                <Link to="/inregistrare">Inregistrare</Link>
            </nav>
            <Routes>
                    <Route path="/" element={<PaginaFeed />} />
                    <Route path="/autentificare" element={<PaginaAutentificare />} />
                    <Route path="/inregistrare" element={<PaginaInregistrare />} />
                    <Route path="*" element={<PaginaNegasita />} />
            </Routes>
        </>
    );
}