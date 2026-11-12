const MESAJ_EROARE_GENERALA = 'A aparut o eroare. Incearca din nou.';

export async function cerereApi(metoda, cale, corp)
{
    const optiuni = {method: metoda, headers: {}};

    if(corp !== undefined)
    {
        optiuni.headers['Content-Type'] = 'aplication/json';
        optiuni.body = JSON.stringify(corp);
    }

    const raspuns = await fetch('/api' + cale, optiuni);
    const date = await raspuns.json().catch(() => null);

    if(!raspuns.ok)
    {
        const eroare = new Error(date?.eroare ?? MESAJ_EROARE_GENERALA);
        eroare.status = raspuns.status;
        throw eroare;
    }

    return date;
}