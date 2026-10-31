const db = require('../db');

const listeazaToate = db.prepare('SELECT id, nume FROM categorii ORDER BY nume');
const listeazaCuNumarRetete = db.prepare
(`
    SELECT categorii.id, categorii.nume, COUNT(retete.id) AS numar_retete
    FROM categorii
    LEFT JOIN retete ON retete.categorie_id = categorii.id
    GROUP BY categorii.id
    ORDER BY categorii.nume
`);
const cautaDupaId = db.prepare('SELECT id, nume FROM categorii WHERE id = ?');
const cautaDupaNume = db.prepare('SELECT id FROM categorii WHERE nume = ?');
const insereazaCategoria = db.prepare('INSERT INTO categorii (nume) VALUES (?)');
const stergeCategoriaDinBaza = db.prepare('DELETE FROM categorii WHERE id = ?');

function listeazaCategorii()
{
    return listeazaToate.all();
}

function listeazaCategoriiPentruAdmin()
{
    return listeazaCuNumarRetete.all();
}

function gasesteCategorie(id)
{
    return cautaDupaId.get(id);
}

function existaCategorie(nume)
{
    return cautaDupaNume.get(nume) !== undefined;
}

function creeazaCategorie(nume)
{
    return Number(insereazaCategoria.run(nume).lastInsertRowid);
}

function stergeCategorie(id)
{
    stergeCategoriaDinBaza.run(id);
}

module.exports = {listeazaCategorii, listeazaCategoriiPentruAdmin, gasesteCategorie, existaCategorie, creeazaCategorie, stergeCategorie};
