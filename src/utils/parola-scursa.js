const crypto = require('node:crypto');

const ADRESA_API ='https://api.pwnedpasswords.com/range/';
const TIMP_MAXIM_MS = 3000;

async function esteParolaScursa(parola) 
{
    const hash = crypto.createHash('sha1').update(parola, 'utf8').digest('hex').toUpperCase();
    const prefix = hash.slice(0, 5);
    const sufix = hash.slice(5);

    try
    {
        const raspuns = await fetch(ADRESA_API+ prefix,
        {
            headers:
            {
                'User-Agent': 'PetitGourmet-proiect-facultate',
                'Add-Padding': 'true'
            },
            signal: AbortSignal.timeout(TIMP_MAXIM_MS)
        });

        if(!raspuns.ok)
        {
            console.warn('HIBP a raspuns cu codul', raspuns.status);
            return false;
        }

        const text = await raspuns.text();

        for(const linie of text.split('\n'))
        {
            const[sufixPrimit, numar] = linie.trim().split(':');

            if(sufixPrimit === sufix && Number(numar) > 0)
            {
                return true;
            }
        }
        return false;
    }
    catch (eroare)
    {
        console.warn('Verificarea HIBP a esuat:', eroare.message);
        return false;
    }
}
   
module.exports = { esteParolaScursa };