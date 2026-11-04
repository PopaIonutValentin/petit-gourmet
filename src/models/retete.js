const db = require('../db');
const {escapeLike} = require('../utils/escape-like');
const cautaReteta = db.prepare
(`
    SELECT retete.id, retete.autor_id, utilizatori.nume_utilizator AS autor,
           retete.categorie_id, categorii.nume AS categorie,
           retete.titlu, retete.descriere, retete.poza, retete.vizibilitate,
           retete.creat_la, retete.actualizat_la
    FROM retete
    JOIN utilizatori ON utilizatori.id = retete.autor_id
    LEFT JOIN categorii ON categorii.id = retete.categorie_id
    WHERE retete.id = ?  
`);
const cautaIngrediente = db.prepare('SELECT nume, cantitate FROM ingrediente WHERE reteta_id = ? ORDER BY id');
const cautaPasi = db.prepare('SELECT numar, continut FROM pasi WHERE reteta_id = ? ORDER BY numar');
const insereazaReteta = db.prepare('INSERT INTO retete (autor_id, categorie_id, titlu, descriere, vizibilitate) VALUES (?, ?, ?, ?, ?)');
const insereazaIngrediente = db.prepare('INSERT INTO ingrediente (reteta_id, nume, cantitate) VALUES (?, ?, ?)');
const insereazaPas = db.prepare('INSERT INTO pasi (reteta_id, numar, continut) VALUES (?, ?, ?)');
const cautaProprietar = db.prepare('SELECT autor_id, vizibilitate, poza FROM retete WHERE id = ?');
const actualizeazaDateleRetetei = db.prepare
(`
    UPDATE retete
    SET titlu = ?, descriere = ?, vizibilitate = ?, categorie_id = ?, actualizat_la = CURRENT_TIMESTAMP
    WHERE id = ?
`);
const stergeIngrediente = db.prepare('DELETE FROM ingrediente WHERE reteta_id = ?');
const stergePasi = db.prepare('DELETE FROM pasi WHERE reteta_id = ?'); 
const stergeRetetaDinBaza = db.prepare('DELETE FROM retete WHERE id = ?');
const actualizeazaPozaRetetei = db.prepare('UPDATE retete SET poza = ?, actualizat_la = CURRENT_TIMESTAMP WHERE id = ?');
const cautaPozeleFolosite = db.prepare('SELECT poza FROM retete WHERE poza IS NOT NULL');
const cautaFeed = db.prepare
(`
    SELECT retete.id, retete.titlu, utilizatori.nume_utilizator AS autor,
           retete.categorie_id, categorii.nume AS categorie,
           retete.poza IS NOT NULL AS are_poza, retete.creat_la
    FROM retete
    JOIN utilizatori ON utilizatori.id = retete.autor_id
    LEFT JOIN categorii ON categorii.id = retete.categorie_id
    WHERE retete.vizibilitate = 'public'
      AND (:dupa IS NULL OR retete.id < :dupa)
      AND (:categorieId IS NULL OR retete.categorie_id = :categorieId)
      AND (:tipar IS NULL
           OR retete.titlu LIKE :tipar ESCAPE '!'
           OR utilizatori.nume_utilizator LIKE :tipar ESCAPE '!'
           OR EXISTS
           (
               SELECT 1 FROM ingrediente
               WHERE ingrediente.reteta_id = retete.id
                 AND ingrediente.nume LIKE :tipar ESCAPE '!'
           ))
    ORDER BY retete.id DESC
    LIMIT :limita
`);
    


function salveazaIngredienteSiPasi (retetaId, reteta)
{
    for (const ingredient of reteta.ingrediente)
    {
        insereazaIngrediente.run(retetaId, ingredient.nume, ingredient.cantitate);
    }

    reteta.pasi.forEach((continut, index) =>
    {
        insereazaPas.run(retetaId, index + 1, continut);
    });
}

function creeazaReteta (autorId, reteta)
{
    db.exec('BEGIN');

    try
    {
        const rezultat = insereazaReteta.run(autorId, reteta.categorie_id ?? null, reteta.titlu, reteta.descriere, reteta.vizibilitate);
        const retetaId = Number(rezultat.lastInsertRowid);

        salveazaIngredienteSiPasi(retetaId, reteta);

        db.exec('COMMIT');
        return retetaId;
    }
    catch (eroare)
    {
        db.exec('ROLLBACK');
        throw eroare;
    }
}

function gasesteReteta(id)
{
    const reteta = cautaReteta.get(id);

    if(!reteta)
    {
        return undefined;
    }

    reteta.ingrediente = cautaIngrediente.all(id);
    reteta.pasi = cautaPasi.all(id);
    return reteta;
}

function gasesteProprietar(id)
{
    return cautaProprietar.get(id);
}

function actualizeazaReteta(id, reteta)
{
    db.exec('BEGIN');

    try
    {
        actualizeazaDateleRetetei.run(reteta.titlu, reteta.descriere, reteta.vizibilitate, reteta.categorie_id ?? null, id);
        stergeIngrediente.run(id);
        stergePasi.run(id);
        salveazaIngredienteSiPasi(id, reteta);

        db.exec('COMMIT');
    }
    catch (eroare)
    {
        db.exec('ROLLBACK');
        throw eroare;
    }
}

function stergeReteta(id)
{
    stergeRetetaDinBaza.run(id);
}

function seteazaPoza(id, numePoza)
{
    actualizeazaPozaRetetei.run(numePoza, id);
}

function listeazaPozeleFolosite()
{
    return cautaPozeleFolosite.all().map((reteta) => reteta.poza);
}

function listeazaFeed(filtre, limita)
{
    const tipar = filtre.cauta === null ? null: '%' + escapeLike(filtre.cauta) + '%';

    return cautaFeed.all
    ({
        dupa: filtre.dupa,
        categorieId: filtre.categorieId,
        tipar: tipar,
        limita: limita
    });
}

module.exports = {creeazaReteta, gasesteReteta, gasesteProprietar, actualizeazaReteta, stergeReteta, seteazaPoza, listeazaPozeleFolosite, listeazaFeed};