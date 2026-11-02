const {test, after} = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const FOLDER_TEST = fs.mkdtempSync(path.join(os.tmpdir(), 'petiegurmet-poze-'));
process.env.UPLOADS_DIR = FOLDER_TEST;

const poze = require('../src/models/poze');
const { equal } = require('node:assert');

after(() =>
{
    fs.rmSync(FOLDER_TEST, {recursive: true, force: true});
});

test('salveaza poza cu nume aleator si o sterge', async () =>
{
    const numePoza = await poze.salveazaPoza(Buffer.from('continut de proba'));

    assert.match(numePoza, /^[0-9a-f-]{36}\.webp$/);
    assert.equal(fs.existsSync(path.join(FOLDER_TEST, numePoza)), true);

    await poze.stergePoza(numePoza);

    assert.equal(fs.existsSync(path.join(FOLDER_TEST, numePoza)), false);
});

test('doua poze primesc nume diferite', async () =>
{
    const prima = await poze.salveazaPoza(Buffer.from('a'));
    const aDoua = await poze.salveazaPoza(Buffer.from('b'));

    assert.notEqual(prima, aDoua);
});

test('caleaPozei refuza numele care ies din folder', () =>
{
    assert.equal(poze.caleaPozei('../.env'), null);
    assert.equal(poze.caleaPozei('..\\..\\data\\retete.db'), null);
    assert.equal(poze.caleaPozei('poza.webp'), null);
    assert.equal(poze.caleaPozei(null), null);
});

test('stergePoza nu sterge fisiere cu nume invalid', async () =>
{
    const fisier = path.join(FOLDER_TEST, 'secret.txt');
    fs.writeFileSync(fisier, 'nu trebuie sters');

    await poze.stergePoza('secret.txt');

    assert.equal(fs.existsSync(fisier), true);
});

test('stergePoza nu da eroare daca poza nu mai exista', async () =>
{
    await assert.doesNotReject(poze.stergePoza('00000000-0000-0000-0000-000000000000.webp'));
});

test('stergePozeOrfane sterge doar pozele nefolosite', async () =>
{
    const pozaFolosita = await poze.salveazaPoza(Buffer.from('folosita'));
    const pozaOrfana = await poze.salveazaPoza(Buffer.from('orfana'));
    const fisierStrain = path.join(FOLDER_TEST, 'alt_fisier.txt');
    fs.writeFileSync(fisierStrain, 'nu e o poza');

    await poze.stergePozeOrfane([pozaFolosita]);

    const pozeRamase = fs.readdirSync(FOLDER_TEST).filter((numeFisier) => numeFisier.endsWith('.webp'));

    assert.deepEqual(pozeRamase, [pozaFolosita]);
    assert.equal(fs.existsSync(path.join(FOLDER_TEST, pozaOrfana)), false);
    assert.equal(fs.existsSync(fisierStrain), true);
});