const{test} = require('node:test');
const assert = require('node:assert/strict');
const{valideazaReteta, curataReteta} = require('../src/utils/validare-reteta');

function retetaValida()
{
    return {
        titlu: 'Clatite',
        descriere: 'Clatite simple de duminica',
        vizibilitate: 'public',
        ingrediente: [{nume: 'faina', cantitate:'200 g'}],
        pasi: ['Amesteca tot', 'Prajeste']
    };
}

test('accepta o reteta valida', () => 
{
    assert.equal(valideazaReteta(retetaValida()), null);
});

test('respinge titlul format doar din spatii', () =>
{
    const reteta = retetaValida();
    reteta.titlu = '      ';
    assert.match(valideazaReteta(reteta), /Titlul/);
});

test('respinge reteta fara ingrediente', () =>
{
    const reteta = retetaValida();
    reteta.ingrediente = [];
    assert.match(valideazaReteta(reteta), /ingredient/);
});

test('respinge vizibilitatea necunoscuta', () =>
{
    const reteta = retetaValida();
    reteta.vizibilitate = 'secret';
    assert.match(valideazaReteta(reteta), /Vizibilitatea/);
});

test('respinge ingrediente fara cantitate', () =>
{
    const reteta = retetaValida();
    reteta.ingrediente = [{nume: 'zahar'}];
    assert.match(valideazaReteta(reteta), /Cantitate/);
});

test('respinge peste 50 de pasi', () =>
{
    const reteta = retetaValida();
    reteta.pasi = Array(51).fill('Amesteca');
    assert.match(valideazaReteta(reteta), /pasi/);
});

test('curataReteta pastreaza doar campurile permise', () => 
{
    const reteta = retetaValida();
    reteta.autor_id = 99;
    reteta.ingrediente[0].reteta_id = 5;
    reteta.titlu = '   Clatite    ';

    const curata = curataReteta(reteta);

    assert.equal(curata.titlu, 'Clatite');
    assert.equal(curata.autor_id, undefined);
    assert.deepEqual(curata.ingrediente, [{nume: 'faina', cantitate: '200 g'}]);
});

test('respinge categoria trimisa ca text', () =>
{
    const reteta= retetaValida();
    reteta.categorie_id = '2';
    assert.match(valideazaReteta(reteta), /Categoria/);
});