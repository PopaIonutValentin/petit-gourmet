const {test} = require('node:test');
const assert = require('node:assert/strict');
const {DatabaseSync} = require('node:sqlite');
const {escapeLike} = require('../src/utils/escape-like');

test('pune ! in fata caracterelor speciale', () =>
{
    assert.equal(escapeLike('50%_reducere!'), '50!%!_reducere!!');
});

test('cu ESCAPE, % este cautat ca un caracter obisnuit', () =>
{
    const baza = new DatabaseSync(':memory:');
    const cerere = baza.prepare("SELECT ? LIKE ? ESCAPE '!' AS gasit");
    const tipar = '%' + escapeLike('50%') + '%';

    assert.equal(cerere.get('Tort cu 50% zahar', tipar).gasit, 1);
    assert.equal(cerere.get('Tort cu 500 g zahar', tipar).gasit, 0);

    baza.close();
});