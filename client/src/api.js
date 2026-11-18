const MESAJ_EROARE_GENERALA = 'A aparut o eroare. Incearca din nou.';
const MESAJ_FARA_CONEXIUNE = 'Nu ma pot conecta la server. Verifica internetul si incearca din nou.';

export async function cerereApi(metoda, cale, corp)
{
    const optiuni = {method: metoda, headers: {}};

    if(corp instanceof FormData)
    {
        optiuni.body = corp;
    }
    else if(corp !== undefined)
    {
        optiuni.headers['Content-Type'] = 'application/json';
        optiuni.body = JSON.stringify(corp);
    }

    let raspuns;

    try
    {
        raspuns = await fetch('/api' + cale, optiuni);
    }
    catch
    {
        throw new Error(MESAJ_FARA_CONEXIUNE);
    }

    const date = await raspuns.json().catch(() => null);

    if(!raspuns.ok)
    {
        const eroare = new Error(date?.eroare ?? MESAJ_EROARE_GENERALA);
        eroare.status = raspuns.status;
        throw eroare;
    }

    return date;
}