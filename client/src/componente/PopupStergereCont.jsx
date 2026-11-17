import {useState, useEffect, useRef} from 'react';
import {cerereApi} from '../api.js';

const DURATA_ANIMATIE = 300;

export default function PopupStergereCont({punctPornire, laStergere, laInchidere})
{
    const [parola, seteazaParola] = useState('');
    const [eroare, seteazaEroare] = useState('');
    const [seTrimite, seteazaSeTrimite] = useState(false);
    const fereastra = useRef(null);
    const campParola = useRef(null);
    const contSters = useRef(false);
    const stilFereastra = punctPornire ? {
        '--deplasare-x': (punctPornire.x - window.innerWidth / 2) + 'px',
        '--deplasare-y': (punctPornire.y - window.innerHeight / 2) + 'px'
    } : {};

    function laInchidereaFerestrei()
    {
        setTimeout(() =>
        {
            if(contSters.current)
            {
                laStergere();
            }
            else
            {
                laInchidere();
            }
        }, DURATA_ANIMATIE);
    }

    async function stergeContul(eveniment)
    {
        eveniment.preventDefault();
        seteazaEroare('');

        if(parola === '')
        {
            seteazaEroare('Introdu parola ca sa stergi contul.');
            campParola.current.focus();
            return;
        }

        seteazaSeTrimite(true);

        try
        {
            await cerereApi('DELETE', '/eu', {parola: parola});
            contSters.current = true;
            fereastra.current.close();
        }
        catch (eroareCerere)
        {
            seteazaEroare(eroareCerere.message);
            seteazaParola('');
            campParola.current.focus();
        }
        finally
        {
            seteazaSeTrimite(false);
        }
    }

    useEffect(() =>
    {
        if(!fereastra.current.open)
        {
            fereastra.current.showModal();
            campParola.current.focus();
        }
    }, []);

    return (
        <dialog
            ref={fereastra}
            className="popup popup-confirmare"
            style={stilFereastra}
            role="alertdialog"
            closedby="closerequest"
            aria-labelledby="titluStergereCont"
            aria-describedby="mesajStergereCont"
            onClose={laInchidereaFerestrei}
        >
            <form className="popup-text" onSubmit={stergeContul} noValidate>
                <h2 id="titluStergereCont">Stergi contul?</h2>
                <p id="mesajStergereCont">Toate retetele, pozele si recenziile tale vor fi sterse definitiv. Introdu parola ca sa confirmi.</p>
                <label htmlFor="parolaStergere" className="stergere-cont-eticheta">Parola</label>
                <input
                    ref={campParola}
                    id="parolaStergere"
                    type="password"
                    autoComplete="current-password"
                    className="stergere-cont-parola"
                    value={parola}
                    onChange={(eveniment) => seteazaParola(eveniment.target.value)}
                    aria-invalid={eroare !== ''}
                    aria-describedby={eroare !== '' ? 'eroareStergereCont' : undefined}
                />
                {eroare && <p id="eroareStergereCont" role="alert" className="reteta-eroare-camp">{eroare}</p>}
                <div className="popup-confirmare-butoane">
                    <button
                        type="button"
                        className="popup-confirmare-anulare"
                        onClick={() => fereastra.current.close()}
                    >
                        Anuleaza
                    </button>
                    <button
                        type="submit"
                        className="popup-confirmare-pericol"
                        disabled={seTrimite}
                    >
                        {seTrimite ? 'Se sterge...' : 'Sterge contul'}
                    </button>
                </div>
            </form>
        </dialog>
    );
}