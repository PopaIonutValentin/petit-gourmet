import {useState} from 'react';
import {ChefHat, Star} from 'lucide-react';

function textRecenzii(numar)
{
    if(numar === 1)
    {
        return '1 recenzie';
    }

    if(numar >= 20 && (numar % 100 === 0 || numar % 100 >= 20))
    {
        return numar + ' de recenzii';
    }

    return numar + ' recenzii';
}

export default function CardReteta({reteta, laDeschidere})
{
    const [pozaIncarcata, seteazaPozaIncarcata] = useState(false);
    const [pozaEsuata, seteazaPozaEsuata] = useState(false);
    const adresaPoza = reteta.actualizat_la
        ? `/api/retete/${reteta.id}/poza?v=${encodeURIComponent(reteta.actualizat_la)}`
        : `/api/retete/${reteta.id}/poza`;

    return (
        <article className="card-reteta">
            {reteta.are_poza && !pozaEsuata ? (
                <img 
                    src={adresaPoza}
                    alt=""
                    className={pozaIncarcata ? 'card-reteta-poza' : 'card-reteta-poza card-reteta-poza-schelet'}
                    loading="lazy"
                    onLoad={() => seteazaPozaIncarcata(true)}
                    onError={() => seteazaPozaEsuata(true)}
                />
            ) : (
                <div className="card-reteta-poza card-reteta-fara-poza">
                    <ChefHat aria-hidden="true" />
                </div>
            )}
            <div className="card-reteta-text">
                <h2 className="card-reteta-titlu">
                    <button
                        type="button"
                        className="card-reteta-buton"
                        onClick={(eveniment) => laDeschidere(reteta.id, eveniment.currentTarget.closest('.card-reteta').getBoundingClientRect())}
                    >
                        {reteta.titlu}
                    </button>    
                </h2>
                <p className="card-reteta-autor">de {reteta.autor}</p>
                {reteta.categorie && <p className="card-reteta-categorie">{reteta.categorie}</p>}
                <p className="card-reteta-stele">
                    <Star aria-hidden="true" />
                    {reteta.numar_recenzii > 0 ? (
                        <span>{reteta.medie_stele} · {textRecenzii(reteta.numar_recenzii)}</span>
                    ) : (
                        <span>Fara recenzii</span>
                    )}
                </p>
            </div>
        </article>
    );
}