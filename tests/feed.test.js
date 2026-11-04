process.env.DB_FILE = ':memory:';
process.env.SESSION_SECRET = 'secret-doar-pentru-teste-cu-peste-32-de-caractere';

const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const categorii = require('../src/models/categorii');
const retete = require('../src/models/retete');
const {retetaDeTest, creeazaContDeTest} = require('./date-de-test');

let server;
let adresaServer;
let idSupe;

async function cereFeed(parametri)
{
    const raspuns = await fetch(`${adresaServer}/api/retete${parametri}`);
    return {status: raspuns.status, corp: await raspuns.json()};
}

function titluri(corp)
{
    return corp.retete.map((reteta) => reteta.titlu);
}

before(async() =>
{
    const idAna = await creeazaContDeTest('ana');
    const idBogdan = await creeazaContDeTest('bogdan');
    idSupe = categorii.creeazaCategorie('Supe');

    for(let numar = 1; numar <=22; numar++)
    {
        retete.creeazaReteta(idBogdan, retetaDeTest(`Paine ${numar}`, 'public'));
    }

    retete.creeazaReteta(idAna, retetaDeTest('Supa de rosii', 'public', idSupe, 'rosii'));
    retete.creeazaReteta(idBogdan, retetaDeTest('Tort 50% ciocolata', 'public', null, 'zahar'));
    retete.creeazaReteta(idAna, retetaDeTest('Supa secreta', 'private', idSupe, 'rosii'));

    server = app.listen(0, '127.0.0.1');
    await new Promise((rezolva) => server.once('listening', rezolva));
    adresaServer = `http://127.0.0.1:${server.address().port}`;
});

after(() =>
{
    server.close();
    server.closeAllConnections();
});

test('feed-ul nu arata retete private, nici la cautare', async () =>
{
    const feed = await cereFeed('');

    assert.equal(feed.status, 200);
    assert.equal(feed.corp.retete.length, 20);
    assert.equal(feed.corp.retete[0].titlu, 'Tort 50% ciocolata');
    assert.equal(titluri(feed.corp).includes('Supa secreta'), false);
    assert.equal('poza' in feed.corp.retete[0], false);

    const cautare = await cereFeed('?cauta=secreta');

    assert.deepEqual(cautare.corp.retete, []);
});

test('cautarea gaseste dupa titlu, ingredient si autor', async () =>
{
    assert.deepEqual(titluri((await cereFeed('?cauta=ciocolata')).corp), ['Tort 50% ciocolata']);
    assert.deepEqual(titluri((await cereFeed('?cauta=zahar')).corp), ['Tort 50% ciocolata']);
    assert.deepEqual(titluri((await cereFeed('?cauta=ANA')).corp), ['Supa de rosii']);
});

test('caracterele % si _ sunt cautate ca text obisnuit', async () =>
{
    assert.deepEqual(titluri((await cereFeed('?cauta=50%25')).corp), ['Tort 50% ciocolata']);
    assert.deepEqual((await cereFeed('?cauta=_')).corp.retete, []);
});

test('paginarea cu cursor nu repeta si nu sare retete', async () =>
{
    const primaPagina = await cereFeed('?limita=1000');

    assert.equal(primaPagina.corp.retete.length, 20);
    assert.notEqual(primaPagina.corp.urmatorulCursor, null);

    const aDouaPagina = await cereFeed(`?dupa=${primaPagina.corp.urmatorulCursor}`);

    assert.equal(aDouaPagina.corp.retete.length, 4);
    assert.equal(aDouaPagina.corp.urmatorulCursor, null);

    const toateTitlurile = [...titluri(primaPagina.corp), ...titluri(aDouaPagina.corp)];

    assert.equal(toateTitlurile.length, 24);
    assert.equal(new Set(toateTitlurile).size, 24);
});

test('filtrul de categorie arata doar retetele publice din categorie', async () =>
{
    assert.deepEqual(titluri((await cereFeed(`?categorie=${idSupe}`)).corp), ['Supa de rosii']);
    assert.deepEqual(titluri((await cereFeed(`?categorie=${idSupe}&cauta=rosii`)).corp), ['Supa de rosii']);
    assert.deepEqual((await cereFeed('?categorie=9999')).corp.retete, []);
});

test('parametrii gresiti primesc 400', async () =>
{
    const cereriGresite =
    [
        '?cauta=a&cauta=b',
        '?categorie=5&categorie=5',
        '?categorie=abc',
        '?dupa=0',
        '?dupa=-5',
        `?cauta=${'a'.repeat(101)}`
    ];

    for(const parametri of cereriGresite)
    {
        const raspuns = await cereFeed(parametri);

        assert.equal(raspuns.status, 400, parametri);
    }
});