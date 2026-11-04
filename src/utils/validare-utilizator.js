const REGULA_NUME = /^[a-zA-Z0-9._-]{3,30}$/;
const REGULA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LUNGIME_MAXIMA_EMAIL = 254;

function valideazaNumeUtilizator(nume)
{
    if(typeof nume !== 'string')
    {
        return 'Numele de utilizator este obligatoriu.';
    }

    if(!REGULA_NUME.test(nume))
    {
        return 'Numele de utilizator trebuie sa aiba 3-30 caractere: litere fara diacritice, cifre, punct, _ sau -.';
    }

    return null;
}

function valideazaEmail(email)
{
    if(typeof email !== 'string')
    {
        return 'Emailul este obligatoriu.';
    }

    if(email.length > LUNGIME_MAXIMA_EMAIL)
    {
        return `Emailul poate avea cel mult ${LUNGIME_MAXIMA_EMAIL} caractere.`;
    }

    if(!REGULA_EMAIL.test(email))
    {
        return 'Emailul nu are un format valid.';
    }

    return null;
}

module.exports = {valideazaNumeUtilizator, valideazaEmail};