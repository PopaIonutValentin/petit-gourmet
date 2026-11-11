process.env.DB_FILE = ':memory:';
process.env.SESSION_SECRET = 'secret-doar-pentru-teste-cu-peste-32-de-caractere';

const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const db = require('../src/db');
const retete = require('../src/models/retete');
const {retetaDeTest, creeazaContDeTest, autentificaContDeTest} = require('./date-de-test');

let server;
let adresaServer;
let cookieAna;
let cookieBogdan;
let cookieMaria;
let cookieModerator;
let idRetetaPublica;
let idRetetaPrivata;
let idRecezieBogdan;
let idRecenzieMaria;

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

before(async () =>
{
    const idAna = await creeazaContDeTest('ana');
    await creeazaContDeTest('bogdan');
    await creeazaContDeTest('maria');
    const idModerator = await creeazaContDeTest('moderator');

    db.prepare("UPDATE utilizatori SET rol = 'admin' WHERE id = ?").run(idModerator);

    idRetetaPublica = retete.creeazaReteta(idAna, retetaDeTest('Reteta publica a Anei', 'public'));
    idRetetaPrivata = retete.creeazaReteta(idAna, retetaDeTest('Reteta privata a Anei', 'private'));

    server = app.listen(0, '127.0.0.1');
    await new Promise((rezolva) => server.once('listening', rezolva));
    adresaServer = `http://127.0.0.1:${server.address().port}`;

    cookieAna = await autentificaContDeTest(adresaServer, 'ana');
    cookieBogdan = await autentificaContDeTest(adresaServer, 'bogdan');
    cookieMaria = await autentificaContDeTest(adresaServer, 'maria');
    cookieModerator = await autentificaContDeTest(adresaServer, 'moderator');
});

after(() =>
{
    server.close();
    server.closeAllConnections();
});

test('vizitatorul vede recenziile retetei publice, dar nu poate scrie', async () =>
{
    const lista = await cerere('GET', `/api/retete/${idRetetaPublica}/recenzii`);

    assert.equal(lista.status, 200);
    assert.deepEqual((await lista.json()).recenzii, []);

    const privata = await cerere('GET', `/api/retete/${idRetetaPrivata}/recenzii`);

    assert.equal(privata.status, 404);

    const scriere = await cerere('POST', `/api/retete/${idRetetaPublica}/recenzii`, null, {nota: 5, continut: 'Foarte buna'});

    assert.equal(scriere.status, 401);
});

test('Bogdan lasa o recenzie, iar a doua oara primeste 409', async () =>
{
    const prima = await cerere('POST', `/api/retete/${idRetetaPublica}/recenzii`, cookieBogdan, {nota: 5, continut: 'Foarte buna'});

    assert.equal(prima.status, 201);
    idRecenzieBogdan = (await prima.json()).id;

    const aDoua = await cerere('POST', `/api/retete/${idRetetaPublica}/recenzii`, cookieBogdan, {nota: 1, continut: 'Alta parere'});

    assert.equal(aDoua.status, 409);

    const recenzie = (await (await cerere('GET', `/api/retete/${idRetetaPublica}/recenzii`)).json()).recenzii[0];

    assert.equal(recenzie.autor, 'bogdan');
    assert.equal(recenzie.nota, 5);
    assert.equal('autor_id' in recenzie, false);
    assert.equal('email' in recenzie, false);
});

test('autorul nu isi recenzeaza reteta si nimeni nu recenzeaza retete private', async () =>
{
    const corp = {nota: 5, continut: 'Cea mai buna'};

    assert.equal((await cerere('POST', `/api/retete/${idRetetaPublica}/recenzii`, cookieAna, corp)).status, 403);
    assert.equal((await cerere('POST', `/api/retete/${idRetetaPrivata}/recenzii`, cookieAna, corp)).status, 403);
    assert.equal((await cerere('POST', `/api/retete/${idRetetaPrivata}/recenzii`, cookieModerator, corp)).status, 403);
    assert.equal((await cerere('POST', `/api/retete/${idRetetaPrivata}/recenzii`, cookieBogdan, corp)).status, 404);
});

test('nota si textul sunt validate, iar autorul vine din sesiune', async () =>
{
    const cale = `/api/retete/${idRetetaPublica}/recenzii`;

    assert.equal((await cerere('POST', cale, cookieMaria, {nota: '5', continut: 'Foarte buna'})).status, 400);
    assert.equal((await cerere('POST', cale, cookieMaria, {nota: 6, continut: 'Foarte buna'})).status, 400);
    assert.equal((await cerere('POST', cale, cookieMaria, {nota: 5, continut: '  a  '})).status, 400);

    const cuAutorFals = await cerere('POST', cale, cookieMaria, {nota: 2, continut: 'Prea sarata pentru mine', autor_id: 1});

    assert.equal(cuAutorFals.status, 201);
    idRecenzieMaria = (await cuAutorFals.json()).id;

    const lista = (await (await cerere('GET', cale)).json()).recenzii;

    assert.deepEqual(lista.map((recenzie) => recenzie.autor), ['maria', 'bogdan']);
});

test('doar autorul isi modifica recenzia, nici adminul', async () =>
{
    const corpNou = {nota: 4, continut: 'Buna, dar putin cam sarata'};
    const cale = `/api/recenzii/${idRecenzieBogdan}`;

    assert.equal((await cerere('PUT', cale, cookieMaria, corpNou)).status, 403);
    assert.equal((await cerere('PUT', cale, cookieModerator, corpNou)).status, 403);
    assert.equal((await cerere('PUT', '/api/recenzii/9999', cookieBogdan, corpNou)).status, 404);
    assert.equal((await cerere('PUT', '/api/recenzii/abc', cookieBogdan, corpNou)).status, 404);
    assert.equal((await cerere('PUT', cale, cookieBogdan, {nota: 0, continut: 'Gresit'})).status, 400);
    assert.equal((await cerere('PUT', cale, cookieBogdan, corpNou)).status, 200);

    const lista = (await (await cerere('GET', `/api/retete/${idRetetaPublica}/recenzii`)).json()).recenzii;
    const recenziaLuiBogdan = lista.find((recenzie) => recenzie.autor === 'bogdan');

    assert.equal(recenziaLuiBogdan.nota, 4);
    assert.equal(recenziaLuiBogdan.continut, 'Buna, dar putin cam sarata');
});

test('feed-ul arata media stelelor si numarul de recenzii', async () =>
{
    const feed = (await (await cerere('GET', '/api/retete')).json()).retete;
    const reteta = feed.find((retetaDinFeed) => retetaDinFeed.id === idRetetaPublica);

    assert.equal(reteta.medie_stele, 3);
    assert.equal(reteta.numar_recenzii, 2);
});

test('recenzia o sterge autorul ei sau adminul, nu altcineva', async () =>
{
    const caleBogdan = `/api/recenzii/${idRecenzieBogdan}`;

    assert.equal((await cerere('DELETE', caleBogdan, cookieMaria)).status, 403);
    assert.equal((await cerere('DELETE', caleBogdan)).status, 401);
    assert.equal((await cerere('DELETE', `/api/recenzii/${idRecenzieMaria}`, cookieModerator)).status, 200);
    assert.equal((await cerere('DELETE', caleBogdan, cookieBogdan)).status, 200);
    assert.equal((await cerere('DELETE', caleBogdan, cookieBogdan)).status, 404);

    const lista = (await (await cerere('GET', `/api/retete/${idRetetaPublica}/recenzii`)).json()).recenzii;

    assert.deepEqual(lista, []);
});

test('recenziile retetei private au Cache-Control: no-store', async () =>
{
    const raspuns = await cerere('GET', `/api/retete/${idRetetaPrivata}/recenzii`, cookieAna);

    assert.equal(raspuns.status, 200);
    assert.equal(raspuns.headers.get('cache-control'), 'no-store');
});