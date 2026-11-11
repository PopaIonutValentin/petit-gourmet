const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const FOLDER_TEST = fs.mkdtempSync(path.join(os.tmpdir(), 'petitgourmet-interfata-'));
const HTML_DE_TEST = '<!doctype html><title>Petit Gourmet test</title>';

fs.writeFileSync(path.join(FOLDER_TEST, 'index.html'), HTML_DE_TEST);

process.env.DB_FILE = ':memory:';
process.env.SESSION_SECRET = 'secret-doar-pentru-teste-cu-peste-32-de-caractere';
process.env.INTERFATA_DIR = FOLDER_TEST;

const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

let server;
let adresaServer;

before(async () =>
{
    server = app.listen(0, '127.0.0.1');
    await new Promise((rezolva) => server.once('listening', rezolva));
    adresaServer = `http://127.0.0.1:${server.address().port}`;
});

after(() =>
{
    server.close();
    server.closeAllConnections();
    fs.rmSync(FOLDER_TEST, {recursive: true, force: true});
});

test('o ruta /api necunoscuta primeste 404 JSON, nu pagina interfetei', async () =>
{
    const raspuns = await fetch(`${adresaServer}/api/nu-exista`);

    assert.equal(raspuns.status, 404);
    assert.match(raspuns.headers.get('content-type'), /application\/json/);
    assert.deepEqual(await raspuns.json(), {eroare: 'Ruta nu exista.'});
});

test('un fisier lipsa din /assets primeste 404 JSON, nu pagina interfetei', async () =>
{
    const raspuns = await fetch(`${adresaServer}/assets/nu-exista.js`);

    assert.equal(raspuns.status, 404);
    assert.match(raspuns.headers.get('content-type'), /application\/json/);
    assert.deepEqual(await raspuns.json(), {eroare: 'Ruta nu exista.'});
});

test('orice alta cale primeste pagina interfetei, cu Content-Security-Policy', async () =>
{
    for(const cale of ['/', '/retete/5', '/profil'])
    {
        const raspuns = await fetch(adresaServer + cale);

        assert.equal(raspuns.status, 200);
        assert.match(raspuns.headers.get('content-type'), /text\/html/);
        assert.ok(raspuns.headers.get('content-security-policy'));
        assert.equal(await raspuns.text(), HTML_DE_TEST);
    }
});