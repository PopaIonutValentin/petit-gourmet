const db = require('../db');

const cautaPentruReteta = db.prepare
(`
    SELECT recenzii.id, recenzii.nota, recenzii.continut,
           utilizatori.nume_utilizator AS autor,
           recenzii.creat_la, recenzii.actualizat_la
    FROM recenzii
    JOIN utilizatori ON utilizatori.id = recenzii.autor_id
    WHERE recenzii.reteta_id = ?
    ORDER BY recenzii.id DESC
`);
const cautaDupaRetetaSiAutor = db.prepare('SELECT 1 FROM recenzii WHERE reteta_id = ? AND autor_id = ?');
const insereazaRecenzia = db.prepare('INSERT INTO recenzii (reteta_id, autor_id, nota, continut) VALUES (?,?,?,?)');
const cautaDupaId = db.prepare
(`
    SELECT recenzii.id, recenzii.autor_id,
           retete.autor_id AS autor_reteta_id, retete.vizibilitate
    FROM recenzii
    JOIN retete ON retete.id = recenzii.reteta_id
    WHERE recenzii.id = ?
`);
const actualizeazaRecenzia = db.prepare('UPDATE recenzii SET nota = ?, continut = ?, actualizat_la = CURRENT_TIMESTAMP WHERE id = ?');
const stergeRecenziaDinBaza = db.prepare('DELETE FROM recenzii WHERE id = ?');

function listeazaRecenzii(retetaId)
{
    return cautaPentruReteta.all(retetaId);
}

function existaRecenzie(retetaId, autorId)
{
    return cautaDupaRetetaSiAutor.get(retetaId, autorId) !== undefined;
}

function creeazaRecenzie(retetaId, autorId, recenzie)
{
    const rezultat = insereazaRecenzia.run(retetaId, autorId, recenzie.nota, recenzie.continut);
    return Number(rezultat.lastInsertRowid);
}

function gasesteRecenzie(id)
{
    return cautaDupaId.get(id);
}

function actualizeazaRecenzie(id, recenzie)
{
    actualizeazaRecenzia.run(recenzie.nota, recenzie.continut, id);
}

function stergeRecenzie(id)
{
    stergeRecenziaDinBaza.run(id);
}

module.exports = {listeazaRecenzii, existaRecenzie, creeazaRecenzie, gasesteRecenzie, actualizeazaRecenzie, stergeRecenzie};