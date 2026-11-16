import {useState, useEffect, useRef} from 'react';
import {Trash2, X} from 'lucide-react';
import {cerereApi} from '../api.js';
import RecenziiReteta from './RecenziiReteta.jsx';
import PopupConfirmare from './PopupConfirmare.jsx';

const DURATA_ANIMATIE = 300;

export default function PopupReteta({idReteta, pozitieCard, utilizator, laInchidere, laIncarcareRecenzii, laStergere})
{
    const [reteta, seteazaReteta] = useState(null);
    const [eroare, seteazaEroare] = useState('');
    const [confirmareDeschisa, seteazaConfirmareDeschisa] = useState(false);
    const [punctConfirmare, seteazaPunctConfirmare] = useState(null);
    const fereastra = useRef(null);
    const stearsa = useRef(false);
    const punctCard = pozitieCard ? {
        x: pozitieCard.left + pozitieCard.width / 2,
        y: pozitieCard.top + pozitieCard.height / 2
    } : null;
    const stilFereastra = punctCard ? {
        '--deplasare-x': (punctCard.x - window.innerWidth / 2) + 'px',
        '--deplasare-y': (punctCard.y - window.innerHeight / 2) + 'px'
    } : {};
    const poateSterge = utilizator !== null && reteta !== null && (utilizator.id === reteta.autor_id || utilizator.rol === 'admin');
    
    function laInchidereaFerestrei()
    {
        setTimeout(() => 
        {
            if(stearsa.current)
            {
                laStergere?.(idReteta);
            }

            laInchidere();
        }, DURATA_ANIMATIE);
    }

    function deschideConfirmarea(eveniment)
    {
        const dreptunghi = eveniment.currentTarget.getBoundingClientRect();

        seteazaPunctConfirmare({
            x: dreptunghi.left + dreptunghi.width / 2,
            y: dreptunghi.top + dreptunghi.height / 2
        });
        seteazaConfirmareDeschisa(true);
    }

    async function stergeReteta()
    {
        seteazaEroare('');

        try
        {
            await cerereApi('DELETE', '/retete/' + idReteta);
            stearsa.current = true;
            fereastra.current.close();
            return true;
        }
        catch (eroareCerere)
        {
            seteazaEroare(eroareCerere.message);
            return false;
        }
    }

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
        <>
            <dialog
                ref={fereastra}
                className="popup"
                style={stilFereastra}
                closedby="any"
                aria-labelledby="titluPopup"
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
                {poateSterge && (
                    <div className="popup-actiuni">
                        <button
                            type="button"
                            className="popup-actiune popup-actiune-pericol"
                            aria-label="Sterge reteta"
                            onClick={deschideConfirmarea}
                        >
                            <Trash2 aria-hidden="true" />
                        </button>
                    </div>
                )}
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
                                <RecenziiReteta
                                    idReteta={reteta.id}
                                    idAutor={reteta.autor_id}
                                    estePrivata={reteta.vizibilitate === 'private'}
                                    utilizator={utilizator}
                                    laIncarcareRecenzii={laIncarcareRecenzii}
                                />
                            </>
                        )}
                    </div>
                </div>
            </dialog>
            {confirmareDeschisa && (
                <PopupConfirmare
                    titlu="Stergi reteta?"
                    mesaj="Reteta va fi stearsa definitiv. Actiunea nu poate fi anulata."
                    textAnulare="Anuleaza"
                    textConfirmare="Sterge"
                    punctPornire={punctConfirmare}
                    punctIesire={punctCard}
                    laConfirmare={stergeReteta}
                    laInchidere={() => seteazaConfirmareDeschisa(false)}
                />
            )}
        </>
    );
}