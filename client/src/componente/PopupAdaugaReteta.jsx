import {useState, useEffect, useRef} from 'react';
import {Minus, Plus, X} from 'lucide-react';
import {cerereApi} from '../api.js';

const DURATA_ANIMATIE = 300;
const MAXIM_RANDURI = 50;

function creeazaIngredientGol()
{
    return {cheie: crypto.randomUUID(), cantitate: '', nume: ''};
}

function creeazaPasGol()
{
    return {cheie: crypto.randomUUID(), continut: ''};
}

export default function PopupAdaugaReteta({pozitieButon, laInchidere})
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
    const fereastra = useRef(null);
    const campTitlu = useRef(null);
    const stilFereastra = pozitieButon ? {
        '--deplasare-x': (pozitieButon.left + pozitieButon.width / 2 - window.innerWidth / 2) + 'px',
        '--deplasare-y': (pozitieButon.top + pozitieButon.height / 2 - window.innerHeight / 2) + 'px'
    } : {};

    function laInchidereaFerestrei()
    {
        setTimeout(laInchidere, DURATA_ANIMATIE);
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

    async function trimiteReteta(eveniment) 
    {
        eveniment.preventDefault();
        seteazaEroare('');
        seteazaSeTrimite(true);
        
        try
        {
            await cerereApi('POST', '/retete',
            {
                titlu: titlu,
                descriere: descriere,
                vizibilitate: estePrivata? 'private' : 'public',
                categorie_id: idCategorie === '' ? null : Number(idCategorie),
                ingrediente: ingrediente.map((ingredient) => ({nume: ingredient.nume, cantitate: ingredient.cantitate})),
                pasi: pasi.map((pas) => pas.continut)
            });

            fereastra.current.close();
        }
        catch (eroareCerere)
        {
            seteazaEroare(eroareCerere.message);
        }
        finally
        {
            seteazaSeTrimite(false);
        }
    }

    return (
        <dialog
            ref={fereastra}
            className="popup"
            style={stilFereastra}
            closedby="any"
            aria-labelledby="titluAdaugare"
            onClose={laInchidereaFerestrei}
        >
            <button
                type="button"
                className="popup-inchidere"
                aria-label="Inchide"
                onClick={() => fereastra.current.requestClose()}
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
                        value={titlu}
                        onChange={(eveniment) => seteazaTitlu(eveniment.target.value)}
                    />
                    <label htmlFor="descriereReteta">Descriere</label>
                    <textarea
                        id="descriereReteta"
                        rows={3}
                        maxLength={2000}
                        value={descriere}
                        onChange={(eveniment) => seteazaDescriere(eveniment.target.value)}
                    />
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
                    <fieldset>
                        <legend>Ingrediente</legend>
                        {ingrediente.map((ingredient, pozitie) => (
                            <div key={ingredient.cheie} className="reteta-rand">
                                <input
                                    type="text"
                                    aria-label={'Cantitate, ingredientul ' + (pozitie + 1)}
                                    placeholder="Cantitate (ex. 200 g)"
                                    maxLength={50}
                                    autoFocus
                                    value={ingredient.cantitate}
                                    onChange={(eveniment) => modificaIngredientul(ingredient.cheie, 'cantitate', eveniment.target.value)}
                                />
                                <input
                                    type="text"
                                    aria-label={'Nume, ingredientul ' + (pozitie + 1)}
                                    placeholder="Ingredient (ex. faina)"
                                    maxLength={100}
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
                        {seTrimite ? 'Se salveaza...' : 'Adauga reteta'}
                    </button>
                </form>
            </div>    
        </dialog>
    );
}