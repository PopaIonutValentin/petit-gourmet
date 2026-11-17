import {useState, useEffect, useRef} from 'react';
import {flushSync} from 'react-dom';

const DURATA_ANIMATIE = 300;

export default function PopupConfirmare({titlu, mesaj, textAnulare, textConfirmare, punctPornire, punctIntoarcere = punctPornire, punctIesire, laConfirmare, laInchidere})
{
    const [seConfirma, seteazaSeConfirma] = useState(false);
    const [seAsteapta, seteazaSeAsteapta] = useState(false);
    const [seIntoarce, seteazaSeIntoarce] = useState(false);
    const fereastra = useRef(null);
    const butonAnulare = useRef(null);
    const punctAnimatie = seConfirma ? punctIesire : (seIntoarce ? punctIntoarcere : punctPornire);
    const stilFereastra = punctAnimatie ? {
        '--deplasare-x': (punctAnimatie.x - window.innerWidth / 2) + 'px',
        '--deplasare-y': (punctAnimatie.y - window.innerHeight / 2) + 'px'
    } : {};

    function laInchidereaFerestrei()
    {
        setTimeout(laInchidere, DURATA_ANIMATIE);
    }

    function pregatesteIntoarcerea()
    {
        flushSync(() =>
        {
            seteazaSeIntoarce(true);
        });
    }

    function anuleaza()
    {
        pregatesteIntoarcerea();
        fereastra.current.close();
    }

    async function confirma()
    {
        seteazaSeAsteapta(true);

        const reusit = await laConfirmare();

        if(reusit === false)
        {
            seteazaSeAsteapta(false);
            fereastra.current.close();
            return;
        }

        flushSync(() =>
        {
            seteazaSeConfirma(true);
        });
        fereastra.current.close();
    }

    useEffect(() =>
    {
        if(!fereastra.current.open)
        {
            fereastra.current.showModal();
            butonAnulare.current.focus();
        }
    }, []);

    return (
        <dialog
            ref={fereastra}
            className="popup popup-confirmare"
            style={stilFereastra}
            role="alertdialog"
            closedby="closerequest"
            aria-labelledby="titluConfirmare"
            aria-describedby="mesajConfirmare"
            onCancel={pregatesteIntoarcerea}
            onClose={laInchidereaFerestrei}
        >
            <div className="popup-text">
                <h2 id="titluConfirmare">{titlu}</h2>
                <p id="mesajConfirmare">{mesaj}</p>
                <div className="popup-confirmare-butoane">
                    <button
                        ref={butonAnulare}
                        type="button"
                        className="popup-confirmare-anulare"
                        onClick={anuleaza}
                    >
                        {textAnulare}
                    </button>
                    <button
                        type="button"
                        className="popup-confirmare-pericol"
                        disabled={seAsteapta}
                        onClick={confirma}
                    >
                        {seAsteapta ? 'Se proceseaza...' : textConfirmare}
                    </button>
                </div>
            </div>
        </dialog>
    );
}