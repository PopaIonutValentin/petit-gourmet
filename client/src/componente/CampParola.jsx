import {useState} from 'react';
import {Eye, EyeOff} from 'lucide-react';

export default function CampParola({id, autoComplete, valoare, laSchimbare, lungimeMinima, descriere})
{
    const [esteVizibila, seteazaEsteVizibila] = useState(false);

    return (
        <div className="cont-parola">
            <input
                id={id}
                type={esteVizibila ? 'text' : 'password'}
                autoComplete={autoComplete}
                required
                minLength={lungimeMinima}
                aria-describedby={descriere}
                value={valoare}
                onChange={(eveniment) => laSchimbare(eveniment.target.value)}
            />
            <button
                type="button"
                className="cont-parola-ochi"
                aria-label={esteVizibila ? 'Ascunde parola' : 'Afiseaza parola'}
                aria-controls={id}
                onClick={() => seteazaEsteVizibila((vizibilaInainte) => !vizibilaInainte)}
            >
                {esteVizibila ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
        </div>
    );
}