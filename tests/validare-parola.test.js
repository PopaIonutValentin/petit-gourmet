const { test } = require('node:test');
const assert = require('node:assert/strict');
const { valideazaParola } = require('../src/utils/validare-parola');

test('respinge parola sub 15 caractere', () =>
{
    assert.match(valideazaParola('scurta','alexandra'), /cel putin 15/);
});

test('respinge parola peste 128 caractere', () =>
{
    assert.match(valideazaParola('b'.repeat(130), 'mihai_pop'), /cel mult 128/);
});

test('respinge o secventa', () =>
{
    assert.match(valideazaParola('9876543210987654321', 'andrei.v'), /previzibila/);
});

test('respinge o repetitie', () =>
{
    assert.match(valideazaParola('CiocolataCiocolata', 'elena_m'), /previzibila/);
});

test('respinge parola identica cu numele de utilizator', () =>
{
    assert.match(valideazaParola('alexandra.popescu', 'Alexandra.Popescu'), /numele de utilizator/);
});

test('respinge valoarea care nu e text',() =>
{
    assert.equal(valideazaParola(98765, 'radu'), 'Parola este obligatorie.');
});

test('accepta o fraza lunga', ()=>
{
    assert.equal(valideazaParola('plimbare lunga prin parcul din oras', 'alexandra'),null);
});

test('respinge o parola usor de ghicit', () =>
{
    assert.match(valideazaParola('Parola123456789!', 'alexandra'), /usor de ghicit/);
});

test('respinge numele de utilizator cu cifre si simboluri',() =>
{
    assert.match(valideazaParola('alexandra2026!!!', 'alexandra'), /numele de utilizator/);
});