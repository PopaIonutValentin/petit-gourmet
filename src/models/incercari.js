const db = require('../db');

const PASTRARE_MAXIMA_MS = 60*60*1000;

const adauga = db.prepare('INSERT INTO incercari (tip, cheie, creat_la) VALUES (?, ?, ?)');
const numara = db.prepare('SELECT COUNT(*) AS numar FROM incercari WHERE tip = ? AND cheie = ? AND creat_la > ?');
const stergeVechi = db.prepare('DELETE FROM incercari WHERE creat_la <= ?');
const stergePentruCheie = db.prepare('DELETE FROM incercari WHERE tip = ? and cheie = ?');


function inregistreazaIncercare(tip, cheie)
{
    const acum = Date.now();
    stergeVechi.run(acum-PASTRARE_MAXIMA_MS);
    adauga.run(tip, cheie, acum);
}

function numaraIncercari(tip, cheie, fereastraMS)
{
    return numara.get(tip, cheie, Date.now() - fereastraMS).numar;
}

function stergeIncercari(tip, cheie)
{
    stergePentruCheie.run(tip, cheie);
}

module.exports = {inregistreazaIncercare, numaraIncercari, stergeIncercari};