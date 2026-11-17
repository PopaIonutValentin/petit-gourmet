import {useState} from 'react';
import {Navigate} from 'react-router';
import {LoaderCircle, Trash2} from 'lucide-react';
import ListaRetete from '../componente/ListaRetete.jsx';
import PopupStergereCont from '../componente/PopupStergereCont.jsx';

export default function PaginaProfil({utilizator, seVerifica, laStergereCont})
{
    const [punctStergere, seteazaPunctStergere] = useState(null);

    function deschideStergerea(eveniment)
    {
        const dreptunghi = eveniment.currentTarget.getBoundingClientRect();

        seteazaPunctStergere({
            x: dreptunghi.left + dreptunghi.width / 2,
            y: dreptunghi.top + dreptunghi.height / 2
        });
    }

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
                continutFinal={
                    <section className="profil-pericol" aria-labelledby="titluPericol">
                        <div>
                            <h2 id="titluPericol">Stergerea contului</h2>
                            <p>Retetele, pozele si recenziile tale se sterg definitiv.</p>
                        </div>
                        <button type="button" className="profil-sterge-cont" onClick={deschideStergerea}>
                            <Trash2 aria-hidden="true" />
                            Sterge contul
                        </button>
                    </section>
                }
            />
            {punctStergere !== null && (
                <PopupStergereCont
                    punctPornire={punctStergere}
                    laStergere={laStergereCont}
                    laInchidere={() => seteazaPunctStergere(null)}
                />
            )}
        </>
    );
}