process.env.DB_FILE = ':memory:';
process.env.SESSION_SECRET = 'secret-doar-pentru-teste-cu-peste-32-de-caractere';

const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const retete = require('../src/models/retete');
const {PAROLA_DE_TEST, retetaDeTest, creeazaContDeTest} = require('./date-de-test');

let server;
let adresaServer;
let cookieAna;
let cookieBogdan;
let idRetetaPublicaAna;
let idRetetaPrivataAna;

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

before(async () =>
{
    const idAna = await creeazaContDeTest('ana');
    await creeazaContDeTest('bogdan');

    idRetetaPublicaAna = retete.creeazaReteta(idAna, retetaDeTest('Reteta publica a Anei', 'public'));
    idRetetaPrivataAna = retete.creeazaReteta(idAna, retetaDeTest('Reteta privata a Anei', 'private'));

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

test('Bogdan primeste 404 la reteta privata a Anei', async () =>
{
    const raspuns = await cerere('GET', `/api/retete/${idRetetaPrivataAna}`, cookieBogdan);

    assert.equal(raspuns.status, 404);
});

test('Ana isi vede propria reteta privata', async () =>
{
    const raspuns = await cerere('GET', `/api/retete/${idRetetaPrivataAna}`, cookieAna);

    assert.equal(raspuns.status, 200)
});

test('un utilizator obisnuit primeste 403 la lista de utilizatori (functie de admin)', async () =>
{
    const raspuns = await cerere('GET', '/api/admin/utilizatori', cookieBogdan);

    assert.equal(raspuns.status, 403);
});

test('cookie-ul vechi nu mai functioneaza dupa logout', async () =>
{
    const cookieTemporar = await autentifica('bogdan');
    await cerere('POST', '/api/logout', cookieTemporar);

    const raspuns = await cerere('GET', '/api/eu', cookieTemporar);

    assert.equal(raspuns.status, 401);
});