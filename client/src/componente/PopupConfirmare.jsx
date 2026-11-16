import {useEffect, useRef} from "react";

const DURATA_ANIMATIE = 300;

export default function PopupConfirmare({titlu, mesaj, textAnulare, textConfirmare, laConfirmare, laInchidere})
{
    const fereastra = useRef(null);
    const butonAnulare = useRef(null);

    function laInchidereaFerestrei()
    {
        setTimeout(laInchidere, DURATA_ANIMATIE);
    }

    function confirma()
    {
        fereastra.current.close();
        laConfirmare();
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
            role="alertdialog"
            closedby="any"
            aria-labelledby="titluConfirmare"
            aria-describedby="mesajConfirmare"
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
                        onClick={() => fereastra.current.close()}
                    >
                        {textAnulare}
                    </button>
                    <button
                        type="button"
                        className="popup-confirmare-pericol"
                        onClick={confirma}
                    >
                        {textConfirmare}
                    </button>
                </div>
            </div>
        </dialog>
    );
}