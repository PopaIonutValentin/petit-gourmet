process.env.DB_FILE = ':memory:';
process.env.SESSION_SECRET = 'secret-doar-pentru-teste-cu-peste-32-de-caractere';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const FOLDER_TEST = fs.mkdtempSync(path.join(os.tmpdir(), 'petitgourmet-upload-'));
process.env.UPLOADS_DIR = FOLDER_TEST;

const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const app = require('../src/app');
const retete = require('../src/models/retete');
const {detecteazaTipImagine} = require('../src/utils/tip-imagine');
const {PAROLA_DE_TEST, retetaDeTest, creeazaContDeTest} = require('./date-de-test');

let server;
let adresaServer;
let cookieAna;
let cookieBogdan;
let idRetetaAna;
let idRetetaPrivataAna;

function trimitePoza(idReteta, cookie, continut, numeFisier)
{
    const formular = new FormData();
    formular.append('poza', new Blob([continut]), numeFisier);

    const optiuni = {method: 'POST', body: formular, headers: {}};

    if(cookie)
    {
        optiuni.headers.Cookie = cookie;
    }

    return fetch(`${adresaServer}/api/retete/${idReteta}/poza`, optiuni);
}

function cerePoza(idReteta, cookie)
{
    const optiuni = {headers: {}};

    if(cookie)
    {
        optiuni.headers.Cookie = cookie;
    }

    return fetch(`${adresaServer}/api/retete/${idReteta}/poza`, optiuni);
}

async function autentificare(numeUtilizator)
{
    const raspuns = await fetch(`${adresaServer}/api/login`,
    {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({numeUtilizator, parola: PAROLA_DE_TEST})
    });

    return raspuns.headers.getSetCookie()[0].split(';')[0];
}

function pozaPng(latime, inaltime)
{
    return sharp({create: {width: latime, height: inaltime, channels: 3, background: '#ff8800'}}).png().toBuffer();
}

function pozaDinBaza(idReteta)
{
    return retete.gasesteProprietar(idReteta).poza;
}

function numarFisiere()
{
    return fs.readdirSync(FOLDER_TEST).length;
}

before(async () =>
{
    const idAna = await creeazaContDeTest('ana');
    await creeazaContDeTest('bogdan');

    idRetetaAna = retete.creeazaReteta(idAna, retetaDeTest('Reteta Anei cu poza', 'public'));
    idRetetaPrivataAna = retete.creeazaReteta(idAna, retetaDeTest('Reteta privata a Anei cu poza', 'private'));

    server = app.listen(0, '127.0.0.1');
    await new Promise((rezolva) => server.once('listening', rezolva));
    adresaServer = `http://127.0.0.1:${server.address().port}`;

    cookieAna = await autentificare('ana');
    cookieBogdan = await autentificare('bogdan');
});

after(() =>
{
    server.close();
    server.closeAllConnections();
    fs.rmSync(FOLDER_TEST, {recursive: true, force: true});
});

test('upload fara autentificare primeste 401', async () =>
{
    const raspuns = await trimitePoza(idRetetaAna, null, await pozaPng(100, 100), 'poza.png');

    assert.equal(raspuns.status, 401);
    assert.equal(pozaDinBaza(idRetetaAna), null);
});

test('Bogdan primeste 403 cand pune poza pe reteta Anei', async () =>
{
    const raspuns = await trimitePoza(idRetetaAna, cookieBogdan, await pozaPng(100, 100), 'poza.png');

    assert.equal(raspuns.status, 403);
    assert.equal(pozaDinBaza(idRetetaAna), null);
    assert.equal(numarFisiere(), 0);
});
test('Ana pune o poza PNG pe reteta ei', async () =>
{
    const raspuns = await trimitePoza(idRetetaAna, cookieAna, await pozaPng(800, 600), 'poza.png');
    const numePoza = pozaDinBaza(idRetetaAna);

    assert.equal(raspuns.status, 200);
    assert.match(numePoza, /^[0-9a-f-]{36}\.webp$/);
    assert.equal(numarFisiere(), 1);

    const informatii = await sharp(fs.readFileSync(path.join(FOLDER_TEST, numePoza))).metadata();

    assert.equal(informatii.format, 'webp');
});

test('poza noua o inlocuieste si o sterge pe cea veche', async () =>
{
    const pozaVeche = pozaDinBaza(idRetetaAna);
    const raspuns = await trimitePoza(idRetetaAna, cookieAna, await pozaPng(400, 300), 'alta.png');
    const pozaNoua = pozaDinBaza(idRetetaAna);

    assert.equal(raspuns.status, 200);
    assert.notEqual(pozaNoua, pozaVeche);
    assert.equal(fs.existsSync(path.join(FOLDER_TEST, pozaVeche)), false);
    assert.equal(numarFisiere(), 1);
});

test('respinge un SVG cu script redenumit poza.jpg', async () =>
{
    const pozaInainte = pozaDinBaza(idRetetaAna);
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    const raspuns = await trimitePoza(idRetetaAna, cookieAna, svg, 'poza.jpg');

    assert.equal(raspuns.status, 400);
    assert.equal(pozaDinBaza(idRetetaAna), pozaInainte);
    assert.equal(numarFisiere(), 1);
});

test('respinge un fisier mai mare de 5 MB', async () =>
{
    const pozaInainte = pozaDinBaza(idRetetaAna);
    const raspuns = await trimitePoza(idRetetaAna, cookieAna, Buffer.alloc(5 * 1024 * 1024 + 1), 'mare.png');

    assert.equal(raspuns.status, 413);
    assert.equal(pozaDinBaza(idRetetaAna), pozaInainte);
    assert.equal(numarFisiere(), 1);
});

test('oricine vede poza unei retete publice, ca WebP, cu antete sigure', async () =>
{
    const raspuns = await cerePoza(idRetetaAna, null);
    const continut = Buffer.from(await raspuns.arrayBuffer());

    assert.equal(raspuns.status, 200);
    assert.equal(raspuns.headers.get('content-type'), 'image/webp');
    assert.equal(raspuns.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(raspuns.headers.get('cross-origin-resource-policy'), 'same-origin');
    assert.equal(detecteazaTipImagine(continut), 'webp');
});

test('poza retetei private o vede doar autorul', async () =>
{
    const upload = await trimitePoza(idRetetaPrivataAna, cookieAna, await pozaPng(200,200), 'privata.png');
    assert.equal(upload.status, 200);

    const raspunsAna = await cerePoza(idRetetaPrivataAna, cookieAna);
    await raspunsAna.arrayBuffer();

    assert.equal(raspunsAna.status, 200);
    assert.equal(raspunsAna.headers.get('cache-control'), 'no-store');

    const raspunsBogdan = await cerePoza(idRetetaPrivataAna, cookieBogdan);
    const raspunsVizitator = await cerePoza(idRetetaPrivataAna, null);

    assert.equal(raspunsBogdan.status, 404);
    assert.equal(raspunsVizitator.status, 404);
});

test('stergerea retetei sterge si poza de pe disc', async () =>
{
    const numePoza = pozaDinBaza(idRetetaPrivataAna);
    const raspuns = await fetch(`${adresaServer}/api/retete/${idRetetaPrivataAna}`, {method: 'DELETE', headers: {Cookie: cookieAna}});

    assert.equal(raspuns.status, 200);
    assert.equal(retete.gasesteProprietar(idRetetaPrivataAna), undefined);
    assert.equal(fs.existsSync(path.join(FOLDER_TEST, numePoza)), false);
});