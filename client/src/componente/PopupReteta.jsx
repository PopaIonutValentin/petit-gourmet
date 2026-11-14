import {useState, useEffect, useRef} from 'react';
import {X} from 'lucide-react';
import {cerereApi} from '../api.js';

export default function PopupReteta({idReteta, pozitieCard, laInchidere})
{
    const [reteta, seteazaReteta] = useState(null);
    const [eroare, seteazaEroare] = useState('');
    const fereastra = useRef(null);
    const stilFereastra = pozitieCard ? {
        '--deplasare-x': (pozitieCard.left + pozitieCard.width / 2 - window.innerWidth / 2) + 'px',
        '--deplasare-y': (pozitieCard.top + pozitieCard.height / 2 - window.innerHeight / 2) + 'px'
    } : {};

    useEffect(() =>
    {
        if(!fereastra.current.open)
        {
            fereastra.current.showModal();
        }
    }, []);

    useEffect(() =>
    {
        let ignora = false;

        async function citesteReteta() 
        {
            try
            {
                const raspuns = await cerereApi('GET', '/retete/' + idReteta);

                if(!ignora)
                {
                    seteazaReteta(raspuns.reteta);
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
        
        citesteReteta();

        return () =>
        {
            ignora = true;
        };
    }, [idReteta]);

    return (
        <dialog
            ref={fereastra}
            className="popup"
            style={stilFereastra}
            closedby="any"
            aria-labelledby="titluPopup"
            onClose={laInchidere}
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
                {reteta && reteta.poza && (
                    <img
                        src={`/api/retete/${reteta.id}/poza`}
                        alt=""
                        className="popup-poza"
                    />
                )}
                <div className="popup-text">
                    <p role="alert">{eroare}</p>
                    {!reteta && !eroare && <p>Se incarca reteta...</p>}
                    {reteta && (
                        <>
                            <h2 id="titluPopup">{reteta.titlu}</h2>
                            <p className="popup-autor">de {reteta.autor}</p>
                            {reteta.descriere && <p>{reteta.descriere}</p>}
                            <h3>Ingrediente</h3>
                            <ul>
                                {reteta.ingrediente.map((ingredient, pozitie) => (
                                    <li key={pozitie}>
                                        {ingredient.cantitate} {ingredient.nume}
                                    </li>
                                ))}
                            </ul>
                            <h3>Pasi</h3>
                            <ol>
                                {reteta.pasi.map((pas) => (
                                    <li key={pas.numar}>{pas.continut}</li>
                                ))}
                            </ol>
                        </>
                    )}
                </div>
            </div>
        </dialog>
    );
}