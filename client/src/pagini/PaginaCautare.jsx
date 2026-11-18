import {useState, useEffect, useRef} from 'react';
import {useSearchParams} from 'react-router';
import {RotateCcw, Search, SearchX, SlidersHorizontal} from 'lucide-react';
import {cerereApi} from '../api.js';
import ListaRetete from '../componente/ListaRetete.jsx';

const INTARZIERE_CAUTARE = 400;

export default function PaginaCautare({utilizator, laModificare})
{
    const [parametriAdresa, seteazaParametriAdresa] = useSearchParams();
    const [categorii, seteazaCategorii] = useState([]);
    const [eroare, seteazaEroare] = useState('');
    const textCautat = parametriAdresa.get('cauta') ?? '';
    const [textCamp, seteazaTextCamp] = useState(textCautat);
    const idCategorie = parametriAdresa.get('categorie');
    const filtre = parametriAdresa.toString();
    const categorieAleasa = categorii.find((categorie) => String(categorie.id) === idCategorie);
    const campCautare = useRef(null);
    
        function aplicaTextul(text)
    {
        const textCurat = text.trim();

        seteazaParametriAdresa((parametriVechi) =>
        {
            const parametriNoi = new URLSearchParams(parametriVechi);

            if(textCurat === '')
            {
                parametriNoi.delete('cauta');
            }
            else
            {
                parametriNoi.set('cauta', textCurat);
            }

            return parametriNoi;
        }, {replace: true});
    }

    function trimiteCautarea(eveniment)
    {
        eveniment.preventDefault();
        aplicaTextul(textCamp);
    }

    function reseteazaFiltrele()
    {
        seteazaParametriAdresa(new URLSearchParams());
        campCautare.current.focus();
    }

    useEffect(() =>
    {
        seteazaTextCamp((textVechi) => textVechi.trim() === textCautat ? textVechi : textCautat);
    }, [textCautat]);

    useEffect(() =>
    {
        if(textCamp.trim() === textCautat)
        {
            return;
        }

        const temporizator = setTimeout(() => aplicaTextul(textCamp), INTARZIERE_CAUTARE);

        return () =>
        {
            clearTimeout(temporizator);
        };
    }, [textCamp, textCautat]);

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

    return (
        <>
            <h1>Cautare</h1>
            <p role="alert">{eroare}</p>
            <div className="cautare-rezumat">
                <form role="search" className="cautare-camp" onSubmit={trimiteCautarea}>
                    <Search aria-hidden="true" />
                    <input
                        ref={campCautare}
                        type="search"
                        aria-label="Cauta dupa nume, autor sau ingredient"
                        placeholder="Nume, autor sau ingredient"
                        maxLength={100}
                        value={textCamp}
                        onChange={(eveniment) => seteazaTextCamp(eveniment.target.value)}
                    />
                </form>
                <span className="cautare-categorie">
                    {categorieAleasa ? categorieAleasa.nume : 'Toate categoriile'}
                </span>
                <button
                    type="button"
                    aria-haspopup="dialog"
                    onClick={(eveniment) => laModificare(eveniment.currentTarget.getBoundingClientRect(), true)}
                >
                    <SlidersHorizontal aria-hidden="true" />
                    Modifica
                </button>
            </div>
            <ListaRetete
                key={filtre}
                filtre={filtre}
                utilizator={utilizator}
                mesajGol={
                    <div className="cautare-gol">
                        <SearchX aria-hidden="true" className="cautare-gol-iconita" />
                        <h2>Nicio reteta gasita</h2>
                        <p>Incearca alt cuvant sau alege alta categorie.</p>
                        <button type="button" onClick={reseteazaFiltrele}>
                            <RotateCcw aria-hidden="true" />
                            Reseteaza filtrele
                        </button>
                    </div>
                }
            />
        </>
    );
}