process.env.DB_FILE = ':memory:';
process.env.SESSION_SECRET = 'secret-doar-pentru-teste-cu-peste-32-de-caractere';

const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const retete = require('../src/models/retete');
const {retetaDeTest, creeazaContDeTest, autentificaContDeTest} = require('./date-de-test');

let server;
let adresaServer;
let cookieAna;

async function cereReteteleMele(cookie, parametri = '')
{
    const optiuni = {headers: {}};

    if(cookie)
    {
        optiuni.headers.Cookie = cookie;
    }

    const raspuns = await fetch(`${adresaServer}/api/eu/retete${parametri}`, optiuni);

    return {
        status: raspuns.status,
        corp: await raspuns.json(),
        cache: raspuns.headers.get('cache-control')
    };
}

before(async () =>
{
    const idAna = await creeazaContDeTest('ana');
    const idBogdan = await creeazaContDeTest('bogdan');

    for(let numar = 1; numar <= 20; numar++)
    {
        retete.creeazaReteta(idAna, retetaDeTest(`Paine ${numar}`, 'public'));
    }

    retete.creeazaReteta(idAna, retetaDeTest('Supa publica a Anei', 'public'));
    retete.creeazaReteta(idAna, retetaDeTest('Supa secreta a Anei', 'private'));
    retete.creeazaReteta(idBogdan, retetaDeTest('Tortul lui Bogdan', 'public'));
    retete.creeazaReteta(idBogdan, retetaDeTest('Secretul lui Bogdan', 'private'));

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

test('retetele mele cer autentificare', async () =>
{
    const raspuns = await cereReteteleMele(null);

    assert.equal(raspuns.status, 401);
});

test('vad doar retetele mele, inclusiv cele private', async () =>
{
    const raspuns = await cereReteteleMele(cookieAna);
    const titluri = raspuns.corp.retete.map((reteta) => reteta.titlu);

    assert.equal(raspuns.status, 200);
    assert.equal(raspuns.cache, 'no-store');
    assert.equal(titluri[0], 'Supa secreta a Anei');
    assert.equal(raspuns.corp.retete[0].vizibilitate, 'private');
    assert.equal(titluri.includes('Tortul lui Bogdan'), false);
    assert.equal(titluri.includes('Secretul lui Bogdan'), false);
});

test('paginarea merge si cursorul gresit e refuzat', async () =>
{
    const prima = await cereReteteleMele(cookieAna);

    assert.equal(prima.corp.retete.length, 20);
    assert.notEqual(prima.corp.urmatorulCursor, null);

    const aDoua = await cereReteteleMele(cookieAna, `?dupa=${prima.corp.urmatorulCursor}`);

    assert.equal(aDoua.corp.retete.length, 2);
    assert.equal(aDoua.corp.urmatorulCursor, null);

    const gresit = await cereReteteleMele(cookieAna, '?dupa=abc');

    assert.equal(gresit.status, 400);
});