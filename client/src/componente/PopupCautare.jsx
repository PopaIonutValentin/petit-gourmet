import {useState, useEffect, useRef} from 'react';
import {useNavigate, useSearchParams} from 'react-router';
import {Search, X} from 'lucide-react';
import {cerereApi} from '../api.js';

const DURATA_ANIMATIE = 300;

export default function PopupCautare({pozitieButon, doarCategorii, laInchidere})
{
    const [parametriAdresa] = useSearchParams();
    const [textCautat, seteazaTextCautat] = useState(parametriAdresa.get('cauta') ?? '');
    const [idCategorieAleasa, seteazaIdCategorieAleasa] = useState(parametriAdresa.get('categorie'));
    const [categorii, seteazaCategorii] = useState([]);
    const [eroare, seteazaEroare] = useState('');
    const fereastra = useRef(null);
    const campCautare = useRef(null);
    const navigheaza = useNavigate();
    const stilFereastra = pozitieButon ? {
        '--deplasare-x': (pozitieButon.left + pozitieButon.width / 2 - window.innerWidth / 2) + 'px',
        '--deplasare-y': (pozitieButon.top + pozitieButon.height / 2 - window.innerHeight / 2) + 'px'
    } : {};

    function laInchidereaFerestrei()
    {
        setTimeout(laInchidere, DURATA_ANIMATIE);
    }

    useEffect(() => 
    {
        if(!fereastra.current.open)
        {
            fereastra.current.showModal();
            campCautare.current?.focus();
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

    function cauta(eveniment)
    {
        eveniment.preventDefault();

        const parametriNoi = new URLSearchParams();
        const textCurat = textCautat.trim();

        if(textCurat !== '')
        {
            parametriNoi.set('cauta', textCurat);
        }

        if(idCategorieAleasa !== null)
        {
            parametriNoi.set('categorie', idCategorieAleasa);
        }

        navigheaza({pathname: '/cautare', search: parametriNoi.toString()});
        fereastra.current.close();
    }

    return (
        <dialog
            ref={fereastra}
            className="popup"
            style={stilFereastra}
            closedby="any"
            aria-labelledby="titluCautare"
            onClose={laInchidereaFerestrei}
        >
            <button
                type="button"
                className="popup-inchidere"
                aria-label="Inchide"
                onClick={() => fereastra.current.close()}
            >
                <X aria-hidden="true" />
            </button>
            <div className="popup-continut">
                <form className="popup-text cautare-formular" onSubmit={cauta}>
                    <h2 id="titluCautare">{doarCategorii ? 'Alege categoria' : 'Cauta o reteta'}</h2>
                    {!doarCategorii && (
                        <input
                            ref={campCautare}
                            type="search"
                            aria-label="Nume, autor sau ingredient"
                            placeholder="Nume, autor sau ingredient"
                            maxLength={100}
                            value={textCautat}
                            onChange={(eveniment) => seteazaTextCautat(eveniment.target.value)}
                        />
                    )}
                    <p id="etichetaCategorii" className="cautare-eticheta">Categorie</p>
                    <div className="cautare-categorii" role="group" aria-labelledby="etichetaCategorii">
                        <button
                            type="button"
                            className="cautare-pastila"
                            aria-pressed={idCategorieAleasa === null}
                            onClick={() => seteazaIdCategorieAleasa(null)}
                        >
                            Toate
                        </button>
                        {categorii.map((categorie) => (
                            <button
                                key={categorie.id}
                                type="button"
                                className="cautare-pastila"
                                aria-pressed={idCategorieAleasa === String(categorie.id)}
                                onClick={() => seteazaIdCategorieAleasa(String(categorie.id))}
                            >
                                {categorie.nume}
                            </button>
                        ))}
                    </div>
                    {eroare && <p role="alert" className="recenzie-mesaj recenzie-mesaj-eroare">{eroare}</p>}
                    <button type="submit">
                        <Search aria-hidden="true" />
                        {doarCategorii ? 'Aplica' : 'Cauta'}
                    </button>
                </form>
            </div>
        </dialog>
    );
}
