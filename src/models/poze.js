const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const FOLDER_POZE = process.env.UPLOADS_DIR || path.join(__dirname, '..', '..', 'uploads');
const FORMAT_NUME_POZA = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/;

fs.mkdirSync(FOLDER_POZE, {recursive: true});

function caleaPozei(numePoza)
{
    if(typeof numePoza !== 'string' || !FORMAT_NUME_POZA.test(numePoza))
    {
        return null;
    }

    return path.join(FOLDER_POZE, numePoza);
}

async function salveazaPoza(continut)
{
    const numePoza = `${crypto.randomUUID()}.webp`;

    await fs.promises.writeFile(caleaPozei(numePoza), continut, {flag: 'wx'});

    return numePoza;
}

async function stergePoza(numePoza)
{
    const cale = caleaPozei(numePoza);

    if(cale === null)
    {
        return;
    }

    await fs.promises.rm(cale, {force: true});
}

async function stergePozeOrfane (numePozeFolosite)
{
    const pozeFolosite = new Set (numePozeFolosite);
    const fisiere = await fs.promises.readdir(FOLDER_POZE);
    let numarSterse = 0;

    for(const numeFisier of fisiere)
    {
        if(caleaPozei(numeFisier) === null || pozeFolosite.has(numeFisier))
        {
            continue;
        }

        try
        {
            await stergePoza(numeFisier);
            numarSterse = numarSterse + 1;
        }
        catch (eroare)
        {
            console.warn('Poza orfana nu a putut fi stearsa:', numeFisier, eroare.code);
        }
    }

    return numarSterse;
}

module.exports = {salveazaPoza, stergePoza, caleaPozei, stergePozeOrfane};