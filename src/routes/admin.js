const express = require('express');
const { doarLogat, doarAdmin} = require('../middleware/acces');
const utilizatori = require('../models/utilizatori');
const categorii = require('../models/categorii');
const {valideazaNumeCategorie} = require('../utils/validare-categorie');
const {citesteId} = require('../utils/citeste-id');
const {stergeContulCuPoze} = require('../utils/sterge-cont');

const router = express.Router();

router.use(doarLogat, doarAdmin);

router.get('/utilizatori', (req,res) =>
{
    res.set('Cache-Control', 'no-store');
    res.json({utilizatori: utilizatori.listeazaUtilizatori() });
});

router.delete('/utilizatori/:id', async (req, res) =>
{
    const idUtilizator = citesteId(req.params.id);

    if(idUtilizator === null)
    {
        return res.status(404).json({eroare: 'Utilizatorul nu a fost gasit.'});
    }

    const utilizator = utilizatori.gasesteDupaId(idUtilizator);

    if(!utilizator)
    {
        return res.status(404).json({eroare: 'Utilizatorul nu a fost gasit.'});
    }

    if(utilizator.rol === 'admin')
    {
        return res.status(403).json({eroare: 'Un administrator nu poate fi sters de aici.'});
    }

    await stergeContulCuPoze(idUtilizator);

    res.json({mesaj: 'Utilizatorul a fost sters.'});
});

router.get('/categorii', (req, res) =>
{
    res.json({ categorii: categorii.listeazaCategoriiPentruAdmin()});
});

router.post('/categorii', (req, res) =>
{
    const nume = req.body?.nume;
    const eroare = valideazaNumeCategorie(nume);

    if(eroare)
    {
        return res.status(400).json({eroare});
    }

    const numeCurat = nume.trim();

    if(categorii.existaCategorie(numeCurat))
    {
        return res.status(409).json({eroare: 'Exista deja o categorie cu acest nume.'});
    }

    const id = categorii.creeazaCategorie(numeCurat);

    res.status(201).json({id});
});

router.delete('/categorii/:id', (req, res) =>
{
    const idCategorie = citesteId(req.params.id);

    if(idCategorie === null || !categorii.gasesteCategorie(idCategorie))
    {
        return res.status(404).json({eroare: 'Categoria nu a fost gasita.'});
    }

    categorii.stergeCategorie(idCategorie);

    res.json({mesaj: 'Categoria a fost stearsa.'});
});

module.exports = router;