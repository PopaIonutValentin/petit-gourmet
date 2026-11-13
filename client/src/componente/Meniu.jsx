import {NavLink} from 'react-router';
import {House, Search, SquarePlus, User, ShieldCheck, LogIn, UserPlus, LogOut} from 'lucide-react';
import logo from '../imagini/logo-petit-gourmet.webp';

export default function Meniu({utilizator, seVerifica, laDeconectare})
{
    return (
        <nav className="meniu" aria-label="Meniul Principal">
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
            <NavLink to="/cautare" className="meniu-legatura">
                <Search />
                <span>Cautare</span>
            </NavLink>
            {!seVerifica && utilizator &&(
                <>
                    <NavLink to="/retete/noua" className="meniu-legatura">
                        <SquarePlus />
                        <span>Adauga reteta</span>
                    </NavLink>
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
                    <button type="button" className="meniu-legatura" onClick={laDeconectare}>
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