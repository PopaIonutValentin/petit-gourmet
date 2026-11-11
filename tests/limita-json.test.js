process.env.DB_FILE = ':memory:';
process.env.SESSION_SECRET = 'secret-doar-pentru-teste-cu-peste-32-de-caractere';

const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const retete = require('../src/models/retete');
const {retetaDeTest, creeazaContDeTest, autentificaContDeTest} = require('./date-de-test');

const EMOJI = '🍰';
const OCTETI_PESTE_LIMITA_RETETA = 500 * 1024;
const OCTETI_PESTE_LIMITA_GENERALA = 20 * 1024;

let server;
let adresaServer;
let cookieAna;
let idRetetaAna;

function cerere(metoda, cale, cookie, textCorp)
{
    const optiuni = {method: metoda, headers: {'Content-Type': 'application/json'}, body: textCorp};

    if(cookie)
    {
        optiuni.headers.Cookie = cookie;
    }

    return fetch(adresaServer + cale, optiuni);
}

function retetaMaxima()
{
    return {
        titlu: EMOJI.repeat(100),
        descriere: EMOJI.repeat(2000),
        vizibilitate: 'public',
        categorie_id: null,
        ingrediente: Array.from({length: 50}, () => ({nume: EMOJI.repeat(100), cantitate: EMOJI.repeat(50)})),
        pasi: Array.from({length: 50}, () => EMOJI.repeat(1000))
    };
}

before(async () =>
{
    const idAna = await creeazaContDeTest('ana');
    idRetetaAna = retete.creeazaReteta(idAna, retetaDeTest('Reteta Anei', 'public'));

    server = app.listen(0, '127.0.0.1');
    await new Promise((rezolva) => server.once('listening', rezolva));
    adresaServer = `http://127.0.0.1:${server.address().port}`;

    cookieAna = await autentificaContDeTest(adresaServer, 'ana');
});

after(() =>
{
    server.close();
    server.closeAllConnections();
});

test('cea mai mare reteta valida, scrisa cu emoji, e acceptata la creare', async () =>
{
    const textCorp = JSON.stringify(retetaMaxima());

    assert.ok(Buffer.byteLength(textCorp) > 200 * 1024);
    assert.equal((await cerere('POST', '/api/retete', cookieAna, textCorp)).status, 201);
});

test('cea mai mare reteta valida e acceptata si la modificare', async () =>
{
    const raspuns = await cerere('PUT', `/api/retete/${idRetetaAna}`, cookieAna, JSON.stringify(retetaMaxima()));

    assert.equal(raspuns.status, 200);
});

test('o reteta peste limita de 400 kB primeste 413', async () =>
{
    const textCorp = JSON.stringify({titlu: 'a'.repeat(OCTETI_PESTE_LIMITA_RETETA)});

    assert.equal((await cerere('POST', '/api/retete', cookieAna, textCorp)).status, 413);
});

test('restul API-ului ramane la 10 kB, inclusiv recenziile de sub /api/retete', async () =>
{
    const textCorp = JSON.stringify({continut: 'a'.repeat(OCTETI_PESTE_LIMITA_GENERALA)});

    assert.equal((await cerere('POST', '/api/login', null, textCorp)).status, 413);
    assert.equal((await cerere('POST', `/api/retete/${idRetetaAna}/recenzii`, cookieAna, textCorp)).status, 413);
});
