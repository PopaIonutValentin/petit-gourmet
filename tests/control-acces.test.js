process.env.DB_FILE = ':memory:';
process.env.SESSION_SECRET = 'secret-doar-pentru-teste-cu-peste-32-de-caractere';

const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const utilizatori = require('../src/models/utilizatori');
const retete = require('../src/models/retete');
const {hashParola} = require('../src/utils/parola');

const PAROLA_DE_TEST = 'parola de test destul de lunga pentru teste';

let server;
let adresaServer;
let cookieAna;
let cookieBogdan;
let idRetetaPublicaAna;

function cerere(metoda, cale, cookie, corp)
{
    const optiuni = {method: metoda, headers: {}};

    if(cookie)
    {
        optiuni.headers.Cookie = cookie;
    }

    if(corp)
    {
        optiuni.headers['Content-Type'] = 'application/json';
        optiuni.body = JSON.stringify(corp);
    }

    return fetch(adresaServer + cale, optiuni);
}

async function autentifica(numeUtilizator)
{
    const raspuns = await cerere('POST', '/api/login', null, {numeUtilizator, parola: PAROLA_DE_TEST});
    return raspuns.headers.getSetCookie()[0].split(';')[0];
}

function retetaDeTest(titlu, vizibilitate)
{
    return {
        titlu: titlu,
        descriere: 'Descriere pentru testul automat',
        vizibilitate: vizibilitate,
        ingrediente: [{nume: 'faina', cantitate: '100 g'}],
        pasi: ['Amesteca']
    };
}

before(async () =>
{
    const parolaHash = await hashParola(PAROLA_DE_TEST);
    const idAna = utilizatori.creeazaUtilizator('ana', 'ana@exemplu.ro', parolaHash);
    utilizatori.creeazaUtilizator('bogdan', 'bogdan@exemplu.ro', parolaHash);

    idRetetaPublicaAna = retete.creeazaReteta(idAna, retetaDeTest('Reteta publica a Anei', 'public'));

    server = app.listen(0, '127.0.0.1');
    await new Promise((rezolva) => server.once('listening', rezolva));
    adresaServer = `http://127.0.0.1:${server.address().port}`;

    cookieAna = await autentifica('ana');
    cookieBogdan = await autentifica('bogdan');
});

after(() =>
{
    server.close();
});

test('Bogdan primeste 403 cand editeaza reteta Anei', async () =>
{
    const raspuns = await cerere('PUT', `/api/retete/${idRetetaPublicaAna}`, cookieBogdan, retetaDeTest('Modificat de Bogdan', 'public'));

    assert.equal(raspuns.status, 403);
    assert.equal(retete.gasesteReteta(idRetetaPublicaAna).titlu, 'Reteta publica a Anei');
});

test('Bogdan primeste 403 cand sterge reteta Anei', async () =>
{
    const raspuns = await cerere('DELETE', `/api/retete/${idRetetaPublicaAna}`, cookieBogdan);

    assert.equal(raspuns.status, 403);
    assert.notEqual(retete.gasesteReteta(idRetetaPublicaAna), undefined);
});