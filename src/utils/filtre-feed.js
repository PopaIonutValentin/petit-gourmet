const {citesteId} = require('./citeste-id');

const LUNGIME_MAXIMA_CAUTARE = 100;

function esteIdValid(valoare)
{
    return typeof valoare === 'string' && citesteId(valoare) !== null;
}

function citesteFiltreFeed(parametri) 
{
    const { cauta, categorie, dupa } = parametri;
        
    if(cauta !== undefined && typeof cauta !== 'string')
    {
        return {eroare: 'Textul cautat nu este valid.'};
    }

    const textCautat = (cauta ?? '').trim();

    if ([...textCautat].length > LUNGIME_MAXIMA_CAUTARE) 
    {
        return { eroare: `Textul cautat poate avea cel mult ${LUNGIME_MAXIMA_CAUTARE} de caractere.` };
    }

    if (categorie !== undefined && !esteIdValid(categorie)) 
    {
        return { eroare: 'Categoria nu este valida.' };
    }

    if (dupa !== undefined && !esteIdValid(dupa)) 
    {
        return { eroare: 'Cursorul de paginare nu este valid.' };
    }

    return {
        filtre:
        {
            cauta: textCautat === '' ? null : textCautat,
            categorieId: categorie === undefined ? null : citesteId(categorie),
            dupa: dupa === undefined ? null : citesteId(dupa)
        }
    };
}

module.exports = {citesteFiltreFeed};