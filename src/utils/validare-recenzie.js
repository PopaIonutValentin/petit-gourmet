const LUNGIME_MINIMA_TEXT = 3;
const LUNGIME_MAXIMA_TEXT = 1000;

function valideazaRecenzie(date)
{
    if(typeof date !== 'object' || date == null)
    {
        return 'Datele recenziei lipsesc.';
    }

    const {nota, continut} = date;

    if(!Number.isInteger(nota) || nota < 1 || nota > 5)
    {
        return 'Nota trebuie sa fie un numar intreg de la 1 la 5.';
    }

    if(typeof continut !== 'string')
    {
        return 'Textul recenziei lipseste.';
    }

    const numarCaractere = [...continut.trim()].length;

    if(numarCaractere < LUNGIME_MINIMA_TEXT || numarCaractere > LUNGIME_MAXIMA_TEXT)
    {
        return `Textul recenziei trebuie sa aiba intre ${LUNGIME_MINIMA_TEXT} si ${LUNGIME_MAXIMA_TEXT} de caractere.`;
    }

    return null;
}

function curataRecenzie(date)
{
    return {
        nota: date.nota,
        continut: date.continut.trim()
    };
}

module.exports = {valideazaRecenzie, curataRecenzie};