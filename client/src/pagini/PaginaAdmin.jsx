import {useState, useEffect, useRef} from 'react';
import {Navigate} from 'react-router';
import {LoaderCircle, Plus, Trash2} from 'lucide-react';
import {cerereApi} from '../api.js';
import PopupConfirmare from '../componente/PopupConfirmare.jsx';

function formateazaData(text)
{
    return new Date(text.replace(' ', 'T') + 'Z').toLocaleDateString('ro-RO');
}

function textRetete(numar)
{
    if(numar === 1)
    {
        return '1 reteta';
    }

    if(numar >= 20 && (numar % 100 === 0 || numar % 100 >= 20))
    {
        return numar + ' de retete';
    }

    return numar + ' retete';
}

function punctulButonului(eveniment)
{
    const dreptunghi = eveniment.currentTarget.getBoundingClientRect();

    return {
        x: dreptunghi.left + dreptunghi.width / 2,
        y: dreptunghi.top + dreptunghi.height / 2
    };
}

export default function PaginaAdmin({utilizator, seVerifica})
{
    const [utilizatori, seteazaUtilizatori] = useState([]);
    const [seIncarca, seteazaSeIncarca] = useState(true);
    const [eroare, seteazaEroare] = useState('');
    const [utilizatorDeSters, seteazaUtilizatorDeSters] = useState(null);
    const [categorii, seteazaCategorii] = useState([]);
    const [seIncarcaCategorii, seteazaSeIncarcaCategorii] = useState(true);
    const [eroareCategorii, seteazaEroareCategorii] = useState('');
    const [numeCategorie, seteazaNumeCategorie] = useState('');
    const [eroareFormular, seteazaEroareFormular] = useState('');
    const [seAdauga, seteazaSeAdauga] = useState(false);
    const [categorieDeSters, seteazaCategorieDeSters] = useState(null);
    const campCategorie = useRef(null);
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

        async function citesteCategoriile()
        {
            try
            {
                const raspuns = await cerereApi('GET', '/admin/categorii');

                if(!ignora)
                {
                    seteazaCategorii(raspuns.categorii);
                }
            }
            catch (eroareCerere)
            {
                if(!ignora)
                {
                    seteazaEroareCategorii(eroareCerere.message);
                }
            }
            finally
            {
                if(!ignora)
                {
                    seteazaSeIncarcaCategorii(false);
                }
            }
        }

        citesteUtilizatorii();
        citesteCategoriile();

        return () =>
        {
            ignora = true;
        };
    }, [esteAdmin]);

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

    async function adaugaCategoria(eveniment)
    {
        eveniment.preventDefault();
        seteazaEroareFormular('');

        const numeCurat = numeCategorie.trim();
        const lungime = [...numeCurat].length;

        if(lungime < 2 || lungime > 50)
        {
            seteazaEroareFormular('Numele categoriei trebuie sa aiba intre 2 si 50 de caractere.');
            campCategorie.current.focus();
            return;
        }

        seteazaSeAdauga(true);

        try
        {
            const raspuns = await cerereApi('POST', '/admin/categorii', {nume: numeCurat});

            seteazaCategorii((categoriiVechi) =>
                [...categoriiVechi, {id: raspuns.id, nume: numeCurat, numar_retete: 0}]
                    .sort((prima, aDoua) => prima.nume.localeCompare(aDoua.nume, 'ro'))
            );
            seteazaNumeCategorie('');
        }
        catch (eroareCerere)
        {
            seteazaEroareFormular(eroareCerere.message);
        }
        finally
        {
            seteazaSeAdauga(false);
            campCategorie.current.focus();
        }
    }

    async function stergeCategoria()
    {
        const idDeSters = categorieDeSters.categorie.id;

        seteazaEroareCategorii('');

        try
        {
            await cerereApi('DELETE', '/admin/categorii/' + idDeSters);
            seteazaCategorii((categoriiVechi) => categoriiVechi.filter((categorie) => categorie.id !== idDeSters));
            return true;
        }
        catch (eroareCerere)
        {
            seteazaEroareCategorii(eroareCerere.message);
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
                                                    onClick={(eveniment) => seteazaUtilizatorDeSters({persoana: persoana, punct: punctulButonului(eveniment)})}
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
            <section className="admin-sectiune" aria-labelledby="titluCategorii">
                <h2 id="titluCategorii">Categorii</h2>
                <form className="admin-formular" onSubmit={adaugaCategoria} noValidate>
                    <label htmlFor="numeCategorie" className="admin-eticheta">Categorie noua</label>
                    <div className="admin-formular-rand">
                        <input
                            ref={campCategorie}
                            id="numeCategorie"
                            type="text"
                            maxLength={50}
                            value={numeCategorie}
                            onChange={(eveniment) => seteazaNumeCategorie(eveniment.target.value)}
                            aria-invalid={eroareFormular !== ''}
                            aria-describedby={eroareFormular !== '' ? 'eroareCategorie' : undefined}
                        />
                        <button type="submit" disabled={seAdauga}>
                            <Plus aria-hidden="true" />
                            {seAdauga ? 'Se adauga...' : 'Adauga'}
                        </button>
                    </div>
                    {eroareFormular && <p id="eroareCategorie" role="alert" className="reteta-eroare-camp">{eroareFormular}</p>}
                </form>
                <p role="alert">{eroareCategorii}</p>
                {seIncarcaCategorii ? (
                    <p className="recenzie-mesaj">
                        <LoaderCircle aria-hidden="true" className="feed-rotita" />
                        Se incarca categoriile...
                    </p>
                ) : (
                    <ul className="admin-categorii">
                        {categorii.map((categorie) => (
                            <li key={categorie.id} className="admin-categorie">
                                <span className="admin-categorie-nume">{categorie.nume}</span>
                                <span className="admin-categorie-numar">{textRetete(categorie.numar_retete)}</span>
                                <button
                                    type="button"
                                    className="recenzie-actiune recenzie-actiune-pericol"
                                    aria-label={'Sterge categoria ' + categorie.nume}
                                    onClick={(eveniment) => seteazaCategorieDeSters({categorie: categorie, punct: punctulButonului(eveniment)})}
                                >
                                    <Trash2 aria-hidden="true" />
                                </button>
                            </li>
                        ))}
                    </ul>
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
            {categorieDeSters !== null && (
                <PopupConfirmare
                    titlu={'Stergi categoria ' + categorieDeSters.categorie.nume + '?'}
                    mesaj={categorieDeSters.categorie.numar_retete > 0
                        ? 'Retetele din ea (' + textRetete(categorieDeSters.categorie.numar_retete) + ') raman, dar fara categorie.'
                        : 'Categoria nu are nicio reteta.'}
                    textAnulare="Anuleaza"
                    textConfirmare="Sterge"
                    punctPornire={categorieDeSters.punct}
                    laConfirmare={stergeCategoria}
                    laInchidere={() => seteazaCategorieDeSters(null)}
                />
            )}
        </>
    );
}