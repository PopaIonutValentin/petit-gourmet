function valideazaNumeCategorie(nume)
{
    if(typeof nume !== 'string')
    {
        return 'Numele categoriei lipseste.';
    }

    const numarCaractere = [...nume.trim()].length;

    if(numarCaractere < 2 || numarCaractere > 50)
    {
        return 'Numele categoriei trebuie sa aiba intre 2 si 50 de caractere.';
    }

    return null;
}

module.exports = {valideazaNumeCategorie};