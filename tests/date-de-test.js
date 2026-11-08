const utilizatori = require('../src/models/utilizatori');
const {hashParola} = require('../src/utils/parola');

const PAROLA_DE_TEST = 'parola destul de lunga pentru teste';

function retetaDeTest(titlu, vizibilitate, categorieId = null, ingredient = 'faina')
{
    return {
        titlu: titlu,
        descriere: 'Descriere pentru testul automat',
        vizibilitate: vizibilitate,
        categorie_id: categorieId,
        ingrediente: [{nume: ingredient, cantitate: '100 g'}],
        pasi: ['Amesteca']
    };
}

async function creeazaContDeTest(numeUtilizator)
{
    const parolaHash = await hashParola(PAROLA_DE_TEST);
    return utilizatori.creeazaUtilizator(numeUtilizator, `${numeUtilizator}@exemplu.ro`, parolaHash);
}

async function autentificaContDeTest(adresaServer, numeUtilizator)
{
    const raspuns = await fetch(`${adresaServer}/api/login`,
    {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({numeUtilizator: numeUtilizator, parola: PAROLA_DE_TEST})
    });

    return raspuns.headers.getSetCookie()[0].split(';')[0];
}

module.exports = {PAROLA_DE_TEST, retetaDeTest, creeazaContDeTest, autentificaContDeTest};