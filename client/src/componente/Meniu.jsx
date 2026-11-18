import {NavLink, useLocation} from 'react-router';
import {House, Search, SquarePlus, User, ShieldCheck, LogIn, UserPlus, LogOut} from 'lucide-react';
import logo from '../imagini/logo-petit-gourmet.webp';

export default function Meniu({utilizator, seVerifica, laDeconectare, laCautare, laAdaugare})
{
    const locatie = useLocation();

    return (
        <nav className="meniu" aria-label="Meniul principal">
            <img
                src={logo}
                alt="Petit Gourmet"
                className="meniu-logo"
                width="480"
                height="104"
            />
            <NavLink to="/" className="meniu-legatura">
                <House />
                <span>Feed</span>
            </NavLink>
            <button
                type="button"
                className={locatie.pathname === '/cautare' ? 'meniu-legatura active' : 'meniu-legatura'}
                aria-haspopup="dialog"
                onClick={(eveniment) => laCautare(eveniment.currentTarget.getBoundingClientRect())}
            >
                <Search />
                <span>Cautare</span>
            </button>
            {!seVerifica && utilizator && (
                <>
                    <button
                        type="button"
                        className="meniu-legatura"
                        aria-haspopup="dialog"
                        onClick={(eveniment) => laAdaugare(eveniment.currentTarget.getBoundingClientRect())}
                    >
                        <SquarePlus />
                        <span>Adauga reteta</span>
                    </button>
                    <NavLink to="/profil" className="meniu-legatura">
                        <User />
                        <span>Profilul meu</span>
                    </NavLink>
                    {utilizator.rol === 'admin' && (
                        <NavLink to="/admin" className="meniu-legatura">
                            <ShieldCheck />
                            <span>Admin</span>
                        </NavLink>
                    )}
                    <button
                        type="button"
                        className="meniu-legatura"
                        aria-haspopup="dialog"
                        onClick={(eveniment) => laDeconectare(eveniment.currentTarget.getBoundingClientRect())}
                    >
                        <LogOut />
                        <span>Deconectare</span>
                    </button>
                </>
            )}
            {!seVerifica && !utilizator && (
                <>
                    <NavLink to="/autentificare" className="meniu-legatura">
                        <LogIn />
                        <span>Autentificare</span>
                    </NavLink>
                    <NavLink to="/inregistrare" className="meniu-legatura">
                        <UserPlus />
                        <span>Inregistrare</span>
                    </NavLink>
                </>
            )}
        </nav>
    );
}