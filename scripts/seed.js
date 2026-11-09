const sharp = require('sharp');
const db = require('../src/db');
const utilizatori = require('../src/models/utilizatori');
const categorii = require('../src/models/categorii');
const retete = require('../src/models/retete');
const recenzii = require('../src/models/recenzii');
const poze = require('../src/models/poze');
const {hashParola} = require('../src/utils/parola');
const {proceseazaPoza} = require('../src/utils/proceseaza-poza');
const {valideazaReteta, curataReteta} = require('../src/utils/validare-reteta');
const {CONTURI, CATEGORII, RETETE, RECENZII} = require('./date-seed');

async function creeazaPoza(culoare)
{
    const original = await sharp({create: {width: 1200, height: 800, channels: 3, background: culoare}}).png().toBuffer();
    const procesata = await proceseazaPoza(original);

    return poze.salveazaPoza(procesata);
}

async function porneste()
{
    if(utilizatori.listeazaUtilizatori().length > 0)
    {
        console.error('Baza de date are deja utilizatori. Sterge data/retete.db si ruleaza din nou.');
        process.exitCode = 1;
        return;
    }

    const idUtilizatori = new Map();

    for(const cont of CONTURI)
    {
        const parolaHash = await hashParola(cont.parola);
        const id = utilizatori.creeazaUtilizator(cont.numeUtilizator, cont.email, parolaHash);

        if(cont.rol === 'admin')
        {
            db.prepare("UPDATE utilizatori SET rol = 'admin' WHERE id = ?").run(id);
        }

        idUtilizatori.set(cont.numeUtilizator, id);
    }

    const idCategorii = new Map();

    for(const nume of CATEGORII)
    {
        idCategorii.set(nume, categorii.creeazaCategorie(nume));
    }

    const idRetete = new Map();

    for(const reteta of RETETE)
    {
        const date = {...reteta, categorie_id: reteta.categorie === null ? null : idCategorii.get(reteta.categorie)};
        const eroare = valideazaReteta(date);

        if(eroare)
        {
            throw new Error(`Reteta "${reteta.titlu}" nu este valida: ${eroare}`);
        }

        const id = retete.creeazaReteta(idUtilizatori.get(reteta.autor), curataReteta(date));

        if(reteta.culoarePoza)
        {
            retete.seteazaPoza(id, await creeazaPoza(reteta.culoarePoza));
        }

        idRetete.set(reteta.titlu, id);
    }

    for(const recenzie of RECENZII)
    {
        recenzii.creeazaRecenzie(idRetete.get(recenzie.reteta), idUtilizatori.get(recenzie.autor), {nota: recenzie.nota, continut: recenzie.continut});
    }

    console.log(`Seed gata: ${CONTURI.length} conturi, ${CATEGORII.length} categorii, ${RETETE.length} retete, ${RECENZII.length} recenzii.`);
}

porneste();