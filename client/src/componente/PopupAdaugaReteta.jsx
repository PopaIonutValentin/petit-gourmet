import {useState, useEffect, useRef} from 'react';
import {ImagePlus, Minus, Plus, X} from 'lucide-react';
import {cerereApi} from '../api.js';
import PopupConfirmare from './PopupConfirmare.jsx';
import {flushSync} from 'react-dom';

const DURATA_ANIMATIE = 300;
const MAXIM_RANDURI = 50;
const TIPURI_POZA = ['image/jpeg', 'image/png', 'image/webp'];
const MARIME_MAXIMA_POZA = 5 * 1024 * 1024;

function creeazaIngredientGol()
{
    return {cheie: crypto.randomUUID(), cantitate: '', nume: ''};
}

function creeazaPasGol()
{
    return {cheie: crypto.randomUUID(), continut: ''};
}

function numaraCaractere(text)
{
    return [...text.trim()].length;
}

export default function PopupAdaugaReteta({pozitieButon, laSalvare, laInchidere})
{
    const [titlu, seteazaTitlu] = useState('');
    const [descriere, seteazaDescriere] = useState('');
    const [idCategorie, seteazaIdCategorie] = useState('');
    const [estePrivata, seteazaEstePrivata] = useState(false);
    const [ingrediente, seteazaIngrediente] = useState(() => [creeazaIngredientGol()]);
    const [pasi, seteazaPasi] = useState(() => [creeazaPasGol()]);
    const [categorii, seteazaCategorii] = useState([]);
    const [eroare, seteazaEroare] = useState('');
    const [seTrimite, seteazaSeTrimite] = useState(false);
    const [confirmareDeschisa, seteazaConfirmareDeschisa] = useState(false);
    const [punctConfirmare, seteazaPunctConfirmare] = useState(null);
    const [poza, seteazaPoza] = useState(null);
    const [adresaPrevizualizare, seteazaAdresaPrevizualizare] = useState('');
    const [eroarePoza, seteazaEroarePoza] = useState('');
    const [idRetetaSalvata, seteazaIdRetetaSalvata] = useState(null);
    const [trimitereIncercata, seteazaTrimitereIncercata] = useState(false);
    const punctApasare = useRef(null);
    const fereastra = useRef(null);
    const campTitlu = useRef(null);
    const campPoza = useRef(null);
    const punctButon = pozitieButon ? {
        x: pozitieButon.left + pozitieButon.width / 2,
        y: pozitieButon.top + pozitieButon.height / 2
    } : null;
    const stilFereastra = punctButon ? {
        '--deplasare-x': (punctButon.x - window.innerWidth / 2) + 'px',
        '--deplasare-y': (punctButon.y - window.innerHeight / 2) + 'px'
    } : {};

    const areModificari =
        titlu.trim() !== '' ||
        descriere.trim() !== '' ||
        idCategorie !== '' ||
        estePrivata ||
        ingrediente.some((ingredient) => ingredient.cantitate.trim() !== '' || ingredient.nume.trim() !== '') ||
        pasi.some((pas) => pas.continut.trim() !== '') ||
        poza !== null;

    function gasesteErorile()
    {
        const eroriGasite = {};
        const lungimeTitlu = numaraCaractere(titlu);
        const lungimeDescriere = numaraCaractere(descriere);

        if(lungimeTitlu < 3 || lungimeTitlu > 100)
        {
            eroriGasite.titlu = 'Titlul tre sa aiba intre 3 si 100 de caractere.';
        }

        if(lungimeDescriere < 10 || lungimeDescriere > 2000)
        {
            eroriGasite.descriere = 'Descrierea trebuie sa aiba intre 10 si 2000 de caractere.';
        }

        if(ingrediente.some((ingredient) => ingredient.cantitate.trim() === '' || ingredient.nume.trim() === ''))
        {
            eroriGasite.ingrediente = 'Completeaza cantitatea si numele la fiecare ingredient sau sterge randurile goale.';
        }

        if(pasi.some((pas) => pas.continut.trim() === ''))
        {
            eroriGasite.pasi = 'Completeaza fiecare pas sau sterge pasii goi.';
        }

        return eroriGasite;
    }

    const erori = trimitereIncercata && idRetetaSalvata === null ? gasesteErorile() : {};
    
    function laInchidereaFerestrei()
    {
        setTimeout(laInchidere, DURATA_ANIMATIE);
    }

    function laCerereDeInchidere(eveniment)
    {
        if(areModificari && idRetetaSalvata === null)
        {
            eveniment.preventDefault();
            seteazaPunctConfirmare(punctApasare.current);
            seteazaConfirmareDeschisa(true);
        }

        punctApasare.current = null;
    }

    function retinePunctulApasarii(eveniment)
    {
        if(eveniment.target === eveniment.currentTarget)
        {
            punctApasare.current = {x: eveniment.clientX, y: eveniment.clientY};
        }
    }

    function uitaPunctulLaEsc(eveniment)
    {
        if(eveniment.key === 'Escape')
        {
            punctApasare.current = null;
        }
    }

    function inchidereDinButon(eveniment)
    {
        const dreptunghi = eveniment.currentTarget.getBoundingClientRect();

        punctApasare.current = {
            x: dreptunghi.left + dreptunghi.width / 2,
            y: dreptunghi.top + dreptunghi.height / 2
        };
        fereastra.current.requestClose();
    }

    function renuntaLaReteta()
    {
        fereastra.current.close();
    }

    function modificaIngredientul(cheie, camp, valoare)
    {
        seteazaIngrediente((ingredienteVechi) => ingredienteVechi.map((ingredient) =>
            ingredient.cheie === cheie ? {...ingredient, [camp]: valoare} : ingredient
        ));
    }

    function modificaPasul(cheie, valoare)
    {
        seteazaPasi((pasiVechi) => pasiVechi.map((pas) =>
            pas.cheie === cheie ? {...pas, continut: valoare} : pas
        ));
    }

    function adaugaIngredient()
    {
        seteazaIngrediente((ingredienteVechi) => [...ingredienteVechi, creeazaIngredientGol()]);
    }

    function stergeIngredientul(cheie)
    {
        seteazaIngrediente((ingredienteVechi) => ingredienteVechi.filter((ingredient) => ingredient.cheie !== cheie));
    }

    function adaugaPas()
    {
        seteazaPasi((pasiVechi) => [...pasiVechi, creeazaPasGol()]);
    }

    function stergePasul(cheie)
    {
        seteazaPasi((pasiVechi) => pasiVechi.filter((pas) => pas.cheie !== cheie));
    }

    function alegePoza(eveniment)
    {
        const fisier = eveniment.target.files[0];

        eveniment.target.value = '';

        if(fisier === undefined)
        {
            return;
        }

        if(!TIPURI_POZA.includes(fisier.type))
        {
            seteazaEroarePoza('Poza trebuie sa fie JPEG, PNG sau WebP.');
            return;
        }

        if(fisier.size > MARIME_MAXIMA_POZA)
        {
            seteazaEroarePoza('Poza poate avea cel mult 5 MB.');
            return;
        }

        seteazaEroarePoza('');
        seteazaPoza(fisier);
    }

    function scoatePoza()
    {
        seteazaPoza(null);
        campPoza.current.focus();
    }

    useEffect(() =>
    {
        if(!fereastra.current.open)
        {
            fereastra.current.showModal();
            campTitlu.current.focus();
        }
    }, []);

    useEffect(() =>
    {
        let ignora = false;

        async function citesteCategoriile()
        {
            try
            {
                const raspuns = await cerereApi('GET', '/categorii');

                if(!ignora)
                {
                    seteazaCategorii(raspuns.categorii);
                }
            }
            catch (eroareCerere)
            {
                if(!ignora)
                {
                    seteazaEroare(eroareCerere.message);
                }
            }
        }

        citesteCategoriile();

        return () =>
        {
            ignora = true;
        };
    }, []);

    useEffect(() =>
    {
        if(poza === null)
        {
            seteazaAdresaPrevizualizare('');
            return;
        }

        const adresa = URL.createObjectURL(poza);

        seteazaAdresaPrevizualizare(adresa);

        return () =>
        {
            URL.revokeObjectURL(adresa);
        };
    }, [poza]);

    async function trimiteReteta(eveniment)
    {
        eveniment.preventDefault();
        
        if(idRetetaSalvata === null && Object.keys(gasesteErorile()).length > 0)
        {
            flushSync(() =>
            {
                seteazaTrimitereIncercata(true);
            });
            fereastra.current.querySelector('[aria-invalid="true"]').focus();
            return;
        }
        seteazaEroare('');
        seteazaSeTrimite(true);

        let idReteta = idRetetaSalvata;

        try
        {
            if(idReteta === null)
            {
                const raspuns = await cerereApi('POST', '/retete',
                {
                    titlu: titlu,
                    descriere: descriere,
                    vizibilitate: estePrivata ? 'private' : 'public',
                    categorie_id: idCategorie === '' ? null : Number(idCategorie),
                    ingrediente: ingrediente.map((ingredient) => ({nume: ingredient.nume, cantitate: ingredient.cantitate})),
                    pasi: pasi.map((pas) => pas.continut)
                });

                idReteta = raspuns.id;
                seteazaIdRetetaSalvata(idReteta);
                laSalvare(idReteta);
            }

            if(poza !== null)
            {
                const datePoza = new FormData();

                datePoza.append('poza', poza);
                await cerereApi('POST', '/retete/' + idReteta + '/poza', datePoza);
            }

            fereastra.current.close();
        }
        catch (eroareCerere)
        {
            if(idReteta === null)
            {
                seteazaEroare(eroareCerere.message);
            }
            else
            {
                seteazaEroare('Reteta a fost salvata, dar poza nu: ' + eroareCerere.message);
            }
        }
        finally
        {
            seteazaSeTrimite(false);
        }
    }

    return (
        <>
            <dialog
                ref={fereastra}
                className="popup"
                style={stilFereastra}
                closedby="any"
                aria-labelledby="titluAdaugare"
                onCancel={laCerereDeInchidere}
                onClose={laInchidereaFerestrei}
                onPointerDown={retinePunctulApasarii}
                onKeyDown={uitaPunctulLaEsc}
            >
                <button
                    type="button"
                    className="popup-inchidere"
                    aria-label="Inchide"
                    onClick={inchidereDinButon}
                >
                    <X aria-hidden="true" />
                </button>
                <div className="popup-continut">
                    <form className="popup-text reteta-formular" onSubmit={trimiteReteta} noValidate>
                        <h2 id="titluAdaugare">Adauga o reteta</h2>
                        <label htmlFor="titluReteta">Titlu</label>
                        <input
                            ref={campTitlu}
                            id="titluReteta"
                            type="text"
                            maxLength={100}
                            aria-invalid={erori.titlu !== undefined}
                            aria-describedby={erori.titlu !== undefined ? 'eroareTitlu' : undefined}
                            value={titlu}
                            onChange={(eveniment) => seteazaTitlu(eveniment.target.value)}
                        />
                        {erori.titlu && <p id="eroareTitlu" className="reteta-eroare-camp">{erori.titlu}</p>}
                        <label htmlFor="descriereReteta">Descriere</label>
                        <textarea
                            id="descriereReteta"
                            rows={3}
                            maxLength={2000}
                            aria-invalid={erori.descriere !== undefined}
                            aria-describedby={erori.descriere !== undefined ? 'eroareDescriere' : undefined}
                            value={descriere}
                            onChange={(eveniment) => seteazaDescriere(eveniment.target.value)}
                        />
                        {erori.descriere && <p id="eroareDescriere" className="reteta-eroare-camp">{erori.descriere}</p>}
                        <label htmlFor="categorieReteta">Categorie</label>
                        <select
                            id="categorieReteta"
                            value={idCategorie}
                            onChange={(eveniment) => seteazaIdCategorie(eveniment.target.value)}
                        >
                            <option value="">Fara categorie</option>
                            {categorii.map((categorie) => (
                                <option key={categorie.id} value={categorie.id}>{categorie.nume}</option>
                            ))}
                        </select>
                        <label className="reteta-comutator">
                            <input
                                type="checkbox"
                                role="switch"
                                checked={estePrivata}
                                onChange={(eveniment) => seteazaEstePrivata(eveniment.target.checked)}
                            />
                            <span className="reteta-comutator-sina" aria-hidden="true"></span>
                            Privata (doar eu o vad)
                        </label>
                        <div className="reteta-poza">
                            {poza !== null && adresaPrevizualizare !== '' && (
                                <div className="reteta-poza-previzualizare">
                                    <img src={adresaPrevizualizare} alt="Previzualizarea pozei alese" />
                                    <button
                                        type="button"
                                        className="reteta-poza-scoate"
                                        aria-label="Scoate poza"
                                        onClick={scoatePoza}
                                    >
                                        <X aria-hidden="true" />
                                    </button>
                                </div>
                            )}
                            <label className="reteta-poza-zona">
                                <input
                                    ref={campPoza}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={alegePoza}
                                />
                                <ImagePlus aria-hidden="true" />
                                {poza === null ? 'Alege o poza (optional)' : 'Schimba poza'}
                            </label>
                            {eroarePoza && <p role="alert" className="recenzie-mesaj recenzie-mesaj-eroare">{eroarePoza}</p>}
                        </div>
                        <fieldset>
                            <legend>Ingrediente</legend>
                            {ingrediente.map((ingredient, pozitie) => (
                                <div key={ingredient.cheie} className="reteta-rand">
                                    <input
                                        type="text"
                                        aria-label={'Cantitate, ingredientul ' + (pozitie + 1)}
                                        placeholder="Cantitate (ex. 200 g)"
                                        maxLength={50}
                                        aria-invalid={erori.ingrediente !== undefined && ingredient.cantitate.trim() === ''}
                                        aria-describedby={erori.ingrediente !== undefined ? 'eroareIngrediente' : undefined}
                                        autoFocus
                                        value={ingredient.cantitate}
                                        onChange={(eveniment) => modificaIngredientul(ingredient.cheie, 'cantitate', eveniment.target.value)}
                                    />
                                    <input
                                        type="text"
                                        aria-label={'Nume, ingredientul ' + (pozitie + 1)}
                                        placeholder="Ingredient (ex. faina)"
                                        maxLength={100}
                                        aria-invalid={erori.ingrediente !== undefined && ingredient.nume.trim() === ''}
                                        aria-describedby={erori.ingrediente !== undefined ? 'eroareIngrediente' : undefined}
                                        value={ingredient.nume}
                                        onChange={(eveniment) => modificaIngredientul(ingredient.cheie, 'nume', eveniment.target.value)}
                                    />
                                    {ingrediente.length > 1 && (
                                        <button
                                            type="button"
                                            className="reteta-sterge-rand"
                                            aria-label={'Sterge ingredientul ' + (pozitie + 1)}
                                            onClick={() => stergeIngredientul(ingredient.cheie)}
                                        >
                                            <Minus aria-hidden="true" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {erori.ingrediente && <p id="eroareIngrediente" className="reteta-eroare-camp">{erori.ingrediente}</p>}
                            {ingrediente.length < MAXIM_RANDURI && (
                                <button type="button" className="reteta-adauga-rand" onClick={adaugaIngredient}>
                                    <Plus aria-hidden="true" />
                                    Adauga ingredient
                                </button>
                            )}
                        </fieldset>
                        <fieldset>
                            <legend>Pasi</legend>
                            <ol className="reteta-pasi">
                                {pasi.map((pas, pozitie) => (
                                    <li key={pas.cheie} className="reteta-pas">
                                        <span className="reteta-pas-numar" aria-hidden="true">{pozitie + 1}</span>
                                        <textarea
                                            aria-label={'Pasul ' + (pozitie + 1)}
                                            placeholder="Descrie pasul..."
                                            rows={2}
                                            maxLength={1000}
                                            aria-invalid={erori.pasi !== undefined && pas.continut.trim() === ''}
                                            aria-describedby={erori.pasi !== undefined ? 'eroarePasi' : undefined}
                                            autoFocus
                                            value={pas.continut}
                                            onChange={(eveniment) => modificaPasul(pas.cheie, eveniment.target.value)}
                                        />
                                        {pasi.length > 1 && (
                                            <button
                                                type="button"
                                                className="reteta-sterge-rand"
                                                aria-label={'Sterge pasul ' + (pozitie + 1)}
                                                onClick={() => stergePasul(pas.cheie)}
                                            >
                                                <Minus aria-hidden="true" />
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ol>
                            {erori.pasi && <p id="eroarePasi" className="reteta-eroare-camp">{erori.pasi}</p>}
                            {pasi.length < MAXIM_RANDURI && (
                                <button type="button" className="reteta-adauga-rand" onClick={adaugaPas}>
                                    <Plus aria-hidden="true" />
                                    Adauga pas
                                </button>
                            )}
                        </fieldset>
                        {eroare && <p role="alert" className="recenzie-mesaj recenzie-mesaj-eroare">{eroare}</p>}
                        <button type="submit" disabled={seTrimite}>
                            <Plus aria-hidden="true" />
                            {seTrimite ? 'Se salveaza...' : (idRetetaSalvata === null ? 'Adauga reteta' : 'Salveaza poza')}
                        </button>
                    </form>
                </div>
            </dialog>
            {confirmareDeschisa && (
                <PopupConfirmare
                    titlu="Renunti la reteta?"
                    mesaj="Ce ai completat pana acum se va pierde."
                    textAnulare="Continua editarea"
                    textConfirmare="Renunta"
                    punctPornire={punctConfirmare}
                    punctIesire={punctButon}
                    laConfirmare={renuntaLaReteta}
                    laInchidere={() => seteazaConfirmareDeschisa(false)}
                />
            )}
        </>
    );
}