import {ChefHat, Star} from 'lucide-react';

function textRecenzii(numar)
{
    if(numar === 1)
    {
        return '1 recenzie'
    }

    if(numar >= 20 && (numar % 100 === 0 || numar % 100 >= 20))
    {
        return numar + ' de recenzii';
    }

    return numar + ' de recenzii';
}

export default function CardReteta({reteta})
{
    return (
        <article className="card-reteta">
            {reteta.are_poza ? (
                <img 
                    src={`/api/retete/${reteta.id}/poza`}
                    alt=""
                    className="card-reteta-poza"
                    loading="lazy"
                />
            ) : (
                <div className="card-reteta-poza card-reteta-fara-poza">
                    <ChefHat aria-hidden="true" />
                </div>
            )}
            <div className="card-reteta-text">
                <h2 className="card-reteta-titlu">{reteta.titlu}</h2>
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