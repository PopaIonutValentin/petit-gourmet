import {Navigate} from 'react-router';
import {LoaderCircle} from 'lucide-react';
import ListaRetete from '../componente/ListaRetete.jsx';

export default function PaginaProfil({utilizator, seVerifica})
{
    if(seVerifica)
    {
        return (
            <div className="feed-incarcare">
                <p className="recenzie-mesaj">
                    <LoaderCircle aria-hidden="true" className="feed-rotita" />
                    Se incarca profilul...
                </p>
            </div>
        );
    }

    if(utilizator === null)
    {
        return <Navigate to="/autentificare" replace />;
    }

    return (
        <>
            <h1>Profilul meu</h1>
            <section className="profil-cont" aria-labelledby="titluCont">
                <h2 id="titluCont">Contul meu</h2>
                <dl className="profil-date">
                    <dt>Nume de utilizator</dt>
                    <dd>{utilizator.nume_utilizator}</dd>
                    <dt>Email</dt>
                    <dd>{utilizator.email}</dd>
                    <dt>Rol</dt>
                    <dd>{utilizator.rol === 'admin' ? 'Administrator' : 'Utilizator'}</dd>
                </dl>
            </section>
            <h2 className="profil-subtitlu">Retetele mele</h2>
            <ListaRetete
                cale="/eu/retete"
                filtre=""
                utilizator={utilizator}
                cuPrivate
                mesajGol={<p>Nu ai adaugat inca nicio reteta.</p>}
            />
        </>
    );
}