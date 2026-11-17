import {useState, useEffect} from 'react';
import {Navigate} from 'react-router';
import {LoaderCircle, Trash2} from 'lucide-react';
import {cerereApi} from '../api.js';
import PopupConfirmare from '../componente/PopupConfirmare.jsx';

function formateazaData(text)
{
    return new Date(text.replace(' ', 'T') + 'Z').toLocaleDateString('ro-RO');
}

export default function PaginaAdmin({utilizator, seVerifica})
{
    const [utilizatori, seteazaUtilizatori] = useState([]);
    const [seIncarca, seteazaSeIncarca] = useState(true);
    const [eroare, seteazaEroare] = useState('');
    const [utilizatorDeSters, seteazaUtilizatorDeSters] = useState(null);
    const esteAdmin = utilizator !== null && utilizator.rol === 'admin';

    useEffect(() =>
    {
        if(!esteAdmin)
        {
            return;
        }

        let ignora = false;

        async function citesteUtilizatorii() 
        {
            try
            {
                const raspuns = await cerereApi('GET', '/admin/utilizatori');

                if(!ignora)
                {
                    seteazaUtilizatori(raspuns.utilizatori);
                }
            }
            catch (eroareCerere)
            {
                if(!ignora)
                {
                    seteazaEroare(eroareCerere.message);
                }
            }
            finally
            {
                if(!ignora)
                {
                    seteazaSeIncarca(false);
                }
            }
        }

        citesteUtilizatorii();

        return () =>
        {
            ignora = true;
        };
    }, [esteAdmin]);

    function deschideStergerea(eveniment, persoana)
    {
        const dreptunghi = eveniment.currentTarget.getBoundingClientRect();

        seteazaUtilizatorDeSters({
            persoana: persoana,
            punct: {
                x: dreptunghi.left + dreptunghi.width / 2,
                y: dreptunghi.top + dreptunghi.height / 2
            }
        });
    }

    async function stergeUtilizatorul() 
    {
        const idDeSters = utilizatorDeSters.persoana.id;

        seteazaEroare('');

        try
        {
            await cerereApi('DELETE', '/admin/utilizatori/' + idDeSters);
            seteazaUtilizatori((utilizatoriVechi) => utilizatoriVechi.filter((persoana) => persoana.id !== idDeSters));
            return true;
        }
        catch (eroareCerere)
        {
            seteazaEroare(eroareCerere.message);
            return false;
        }
    }

    if(seVerifica)
    {
        return (
            <div className="feed-incarcare">
                <p className="recenzie-mesaj">
                    <LoaderCircle aria-hidden="true" className="feed-rotita" />
                    Se incarca panoul...
                </p>
            </div>
        );
    }

    if(utilizator === null)
    {
        return <Navigate to="/autentificare" replace />;
    }

    if(!esteAdmin)
    {
        return <Navigate to="/" replace />;
    }

    return (
        <>
            <h1>Panoul de admin</h1>
            <section className="admin-sectiune" aria-labelledby="titluUtilizatori">
                <h2 id="titluUtilizatori">Utilizatori</h2>
                <p role="alert">{eroare}</p>
                {seIncarca ? (
                    <p className="recenzie-mesaj">
                        <LoaderCircle aria-hidden="true" className="feed-rotita" />
                        Se incarca utilizatorii...
                    </p>
                ) : (
                    <div className="admin-tabel-cutie">
                        <table className="admin-tabel">
                            <thead>
                                <tr>
                                    <th scope="col">Nume</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Rol</th>
                                    <th scope="col">Creat la</th>
                                    <th scope="col">Actiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {utilizatori.map((persoana) => (
                                    <tr key={persoana.id}>
                                        <td>{persoana.nume_utilizator}</td>
                                        <td>{persoana.email}</td>
                                        <td>{persoana.rol === 'admin' ? 'Administrator' : 'Utilizator'}</td>
                                        <td>{formateazaData(persoana.creat_la)}</td>
                                        <td className="admin-actiuni">
                                            {persoana.rol !== 'admin' && (
                                                <button
                                                    type="button"
                                                    className="recenzie-actiune recenzie-actiune-pericol"
                                                    aria-label={'Sterge utilizatorul ' + persoana.nume_utilizator}
                                                    onClick={(eveniment) => deschideStergerea(eveniment, persoana)}
                                                >
                                                    <Trash2 aria-hidden="true" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
            {utilizatorDeSters !== null && (
                <PopupConfirmare
                    titlu={'Stergi utilizatorul ' + utilizatorDeSters.persoana.nume_utilizator + '?'}
                    mesaj="Contul, retetele, pozele si recenziile lui se sterg definitiv."
                    textAnulare="Anuleaza"
                    textConfirmare="Sterge"
                    punctPornire={utilizatorDeSters.punct}
                    laConfirmare={stergeUtilizatorul}
                    laInchidere={() => seteazaUtilizatorDeSters(null)}
                />
            )}
        </>
    );
}