const db = require ('../db');

const cautaDupaNume = db.prepare('SELECT 1 FROM utilizatori WHERE nume_utilizator = ?');
const cautaDupaEmail = db.prepare('SELECT 1 FROM utilizatori WHERE email = ?');
const inserare = db.prepare('INSERT INTO utilizatori (nume_utilizator, email, parola_hash) VALUES (?, ?, ?)');
const cautaPentruLogin = db.prepare('SELECT id, parola_hash FROM utilizatori WHERE nume_utilizator = ?');
const cautaDupaId = db.prepare('SELECT id, nume_utilizator, email, rol FROM utilizatori WHERE id = ?');
const listeazaToti = db.prepare('SELECT id, nume_utilizator, email, rol, creat_la FROM utilizatori ORDER BY id');
const stergeDupaId = db.prepare('DELETE FROM utilizatori WHERE id = ?');

function existaNumeUtilizator(numeUtilizator)
{
    return cautaDupaNume.get(numeUtilizator) !== undefined;
}

function existaEmail(email)
{
    return cautaDupaEmail.get(email) !== undefined;
}

function creeazaUtilizator(numeUtilizator, email, parolaHash)
{
    const rezultat = inserare.run(numeUtilizator, email, parolaHash);
    return Number(rezultat.lastInsertRowid);
}

function gasesteUtilizatorPentruLogin(numeUtilizator)
{
    return cautaPentruLogin.get(numeUtilizator);
}
function gasesteDupaId (id)
{
    return cautaDupaId.get(id);
}
function listeazaUtilizatori()
{
    return listeazaToti.all();
}
function stergeUtilizator(id)
{
    stergeDupaId.run(id);
}
module.exports = {existaNumeUtilizator, existaEmail, creeazaUtilizator, gasesteUtilizatorPentruLogin, gasesteDupaId, listeazaUtilizatori, stergeUtilizator}; 
