process.env.DB_FILE = ':memory:';
process.env.SESSION_SECRET = 'secret-doar-pentru-teste-cu-peste-32-de-caractere';

const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const {PAROLA_DE_TEST, creeazaContDeTest, autentificaContDeTest} = require('./date-de-test');
const db = require('../src/db');

const PAROLA_GRESITA = 'parola gresita dar destul de lunga';
const NUMAR_CERERI = 20;
const NUMAR_CERERI_PE_IP = 30;
const NUMAR_NUME_DIFERITE = 6;

let server;
let adresaServer;
let cookieIrina;

function cerere(metoda, cale, cookie, corp)
{
    const optiuni = {method: metoda, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(corp)};

    if(cookie)
    {
        optiuni.headers.Cookie = cookie;
    }

    return fetch(adresaServer + cale, optiuni);
}

function numaraStatusuri(raspunsuri)
{
    const numar = {};

    for(const raspuns of raspunsuri)
    {
        numar[raspuns.status] = (numar[raspuns.status] ?? 0) + 1;
    }

    return numar;
}

before(async () =>
{
    await creeazaContDeTest('gelu');
    await creeazaContDeTest('irina');
    await creeazaContDeTest('horia');

    server = app.listen(0, '127.0.0.1');
    await new Promise((rezolva) => server.once('listening', rezolva));
    adresaServer = `http://127.0.0.1:${server.address().port}`;

    cookieIrina = await autentificaContDeTest(adresaServer, 'irina');
});

after(() =>
{
    server.close();
    server.closeAllConnections();
});

test('20 de login-uri gresite trimise deodata: doar 5 ajung la verificarea parolei', async () =>
{
    const cereri = [];

    for(let index = 0; index < NUMAR_CERERI; index++)
    {
        cereri.push(cerere('POST', '/api/login', null, {numeUtilizator: 'gelu', parola: PAROLA_GRESITA}));
    }

    const raspunsuri = await Promise.all(cereri);

    assert.deepEqual(numaraStatusuri(raspunsuri), {401: 5, 429: 15});
    assert.equal((await cerere('POST', '/api/login', null, {numeUtilizator: 'gelu', parola: PAROLA_DE_TEST})).status, 429);
});

test('20 de stergeri de cont cu parola gresita trimise deodata: doar 5 ajung la verificare', async () =>
{
    const cereri = [];

    for(let index = 0; index < NUMAR_CERERI; index++)
    {
        cereri.push(cerere('DELETE', '/api/eu', cookieIrina, {parola: PAROLA_GRESITA}));
    }

    const raspunsuri = await Promise.all(cereri);

    assert.deepEqual(numaraStatusuri(raspunsuri), {403: 5, 429: 15});
    assert.equal((await cerere('DELETE', '/api/eu', cookieIrina, {parola: PAROLA_DE_TEST})).status, 429);
});

test('de pe acelasi IP trec doar 20 de login-uri gresite, chiar cu nume diferite', async () =>
{
    db.exec('DELETE FROM incercari');

    const cereri = [];

    for(let index = 0; index < NUMAR_CERERI_PE_IP; index++)
    {
        cereri.push(cerere('POST', '/api/login', null, {numeUtilizator: `necunoscut${index % NUMAR_NUME_DIFERITE}`, parola: PAROLA_GRESITA}));
    }

    const raspunsuri = await Promise.all(cereri);

    assert.deepEqual(numaraStatusuri(raspunsuri), {401: 20, 429: NUMAR_CERERI_PE_IP - 20});
    assert.equal((await cerere('POST', '/api/login', null, {numeUtilizator: 'horia', parola: PAROLA_DE_TEST})).status, 429);
});