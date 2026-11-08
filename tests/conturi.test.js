const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const FOLDER_TEST = fs.mkdtempSync(path.join(os.tmpdir(), 'petitgourmet-conturi-'));

process.env.DB_FILE = ':memory:';
process.env.SESSION_SECRET = 'secret-doar-pentru-teste-cu-peste-32-de-caractere';
process.env.UPLOADS_DIR = FOLDER_TEST;

const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const db = require('../src/db');
const retete = require('../src/models/retete');
const recenzii = require('../src/models/recenzii');
const poze = require('../src/models/poze');
const {PAROLA_DE_TEST, retetaDeTest, creeazaContDeTest, autentificaContDeTest} = require('./date-de-test');

let server;
let adresaServer;
let idAna;
let idModerator;
let idAltAdmin;
let idRetetaAna;
let idRetetaBogdan;
let numePozaAna;
let cookieAna;
let cookieBogdan;
let cookieModerator;
let cookieCristi;
let cookieDan;

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
    idAna = await creeazaContDeTest('ana');
    const idBogdan = await creeazaContDeTest('bogdan');
    await creeazaContDeTest('cristi');
    await creeazaContDeTest('dan');
    idModerator = await creeazaContDeTest('moderator');
    idAltAdmin = await creeazaContDeTest('altadmin');

    db.prepare("UPDATE utilizatori SET rol = 'admin' WHERE id IN (?, ?)").run(idModerator, idAltAdmin);

    idRetetaAna = retete.creeazaReteta(idAna, retetaDeTest('Reteta Anei cu poza', 'public'));
    idRetetaBogdan = retete.creeazaReteta(idBogdan, retetaDeTest('Reteta lui Bogdan', 'public'));
    numePozaAna = await poze.salveazaPoza(Buffer.from('continut de test'));
    retete.seteazaPoza(idRetetaAna, numePozaAna);
    recenzii.creeazaRecenzie(idRetetaBogdan, idAna, {nota: 5, continut: 'Recenzia Anei'});

    server = app.listen(0, '127.0.0.1');
    await new Promise((rezolva) => server.once('listening', rezolva));
    adresaServer = `http://127.0.0.1:${server.address().port}`;

    cookieAna = await autentificaContDeTest(adresaServer, 'ana');
    cookieBogdan = await autentificaContDeTest(adresaServer, 'bogdan');
    cookieModerator = await autentificaContDeTest(adresaServer, 'moderator');
    cookieCristi = await autentificaContDeTest(adresaServer, 'cristi');
    cookieDan = await autentificaContDeTest(adresaServer, 'dan');
});

after(() =>
{
    server.close();
    server.closeAllConnections();
    fs.rmSync(FOLDER_TEST, {recursive: true, force: true});
});

test('un utilizator obisnuit nu poate sterge conturi', async () =>
{
    assert.equal((await cerere('DELETE', `/api/admin/utilizatori/${idAna}`, cookieBogdan)).status, 403);
    assert.equal((await cerere('DELETE', `/api/admin/utilizatori/${idAna}`)).status, 401);
});

test('adminul nu poate sterge un admin, nici pe el insusi', async () =>
{
    assert.equal((await cerere('DELETE', `/api/admin/utilizatori/${idAltAdmin}`, cookieModerator)).status, 403);
    assert.equal((await cerere('DELETE', `/api/admin/utilizatori/${idModerator}`, cookieModerator)).status, 403);
    assert.equal((await cerere('DELETE', '/api/admin/utilizatori/9999', cookieModerator)).status, 404);
    assert.equal((await cerere('DELETE', '/api/admin/utilizatori/abc', cookieModerator)).status, 404);
});

test('adminul sterge un utilizator cu tot cu retete, recenzii si poze', async () =>
{
    const calePoza = poze.caleaPozei(numePozaAna);

    assert.equal(fs.existsSync(calePoza), true);

    const raspuns = await cerere('DELETE', `/api/admin/utilizatori/${idAna}`, cookieModerator);

    assert.equal(raspuns.status, 200);
    assert.equal(fs.existsSync(calePoza), false);
    assert.equal(retete.gasesteReteta(idRetetaAna), undefined);
    assert.deepEqual(recenzii.listeazaRecenzii(idRetetaBogdan), []);
    assert.equal((await cerere('GET', '/api/eu', cookieAna)).status, 401);
    assert.equal((await cerere('DELETE', `/api/admin/utilizatori/${idAna}`, cookieModerator)).status, 404);
});

test('utilizatorul isi sterge contul doar cu parola corecta', async () =>
{
    assert.equal((await cerere('DELETE', '/api/eu', cookieCristi)).status, 400);
    assert.equal((await cerere('DELETE', '/api/eu', cookieCristi, {parola: 'parola gresita de proba'})).status, 403);

    const raspuns = await cerere('DELETE', '/api/eu', cookieCristi, {parola: PAROLA_DE_TEST});

    assert.equal(raspuns.status, 200);
    assert.equal(raspuns.headers.getSetCookie()[0].startsWith('sid=;'), true);
    assert.equal((await cerere('GET', '/api/eu', cookieCristi)).status, 401);

    const login = await cerere('POST', '/api/login', null, {numeUtilizator: 'cristi', parola: PAROLA_DE_TEST});

    assert.equal(login.status, 401);
});

test('dupa 5 parole gresite la stergere apare 429, si la login', async () =>
{
    for(let incercare = 1; incercare <= 5; incercare++)
    {
        const raspuns = await cerere('DELETE', '/api/eu', cookieDan, {parola: 'parola gresita de proba'});

        assert.equal(raspuns.status, 403);
    }

    assert.equal((await cerere('DELETE', '/api/eu', cookieDan, {parola: PAROLA_DE_TEST})).status, 429);
    assert.equal((await cerere('POST', '/api/login', null, {numeUtilizator: 'dan', parola: PAROLA_DE_TEST})).status, 429);
});