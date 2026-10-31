const express = require('express');
const {doarLogat, identificaUtilizatorul} = require('../middleware/acces');
const {valideazaReteta, curataReteta} = require('../utils/validare-reteta');
const retete = require('../models/retete');
const {citesteId} = require('../utils/citeste-id');
const categorii = require('../models/categorii');

const router = express.Router();

const MESAJ_NEGASITA = 'Reteta nu a fost gasita.';

function poateVedea(utilizator, reteta)
{
    if (reteta.vizibilitate === 'public')
    {
        return true;
    }

    if(!utilizator)
    {
        return false;
    }

    return utilizator.id === reteta.autor_id || utilizator.rol ==='admin';
}

function categoriaEstePermisa(reteta)
{
    return reteta.categorie_id === null || categorii.gasesteCategorie(reteta.categorie_id) !== undefined;
}

router.post('/', doarLogat, (req, res) =>
{
    const eroare = valideazaReteta(req.body);
    
    if(eroare)
    {
        return res.status(400).json({eroare});
    }

    const reteta = curataReteta(req.body);

    if(!categoriaEstePermisa(reteta))
    {
        return res.status(400).json({eroare: 'Categoria aleasa nu exista.'});
    }

    const id = retete.creeazaReteta(req.utilizator.id, reteta);

    res.status(201).json({id});
});

router.get('/:id', identificaUtilizatorul, (req, res) =>
{
    const idReteta = citesteId(req.params.id);

    if(idReteta === null)
    {
        return res.status(404).json({eroare: MESAJ_NEGASITA});
    }

    const reteta = retete.gasesteReteta(idReteta);

    if(!reteta || !poateVedea(req.utilizator, reteta))
    {
        return res.status(404).json({eroare: MESAJ_NEGASITA});
    }

    if (reteta.vizibilitate === 'private')
    {
        res.set('Cache-Control', 'no-store');
    }

    res.json({reteta});
});

router.put('/:id', doarLogat, (req, res) =>
{
    const idReteta = citesteId(req.params.id);

    if(idReteta === null)
    {
        return res.status(404).json({eroare: MESAJ_NEGASITA});
    }

    const proprietar = retete.gasesteProprietar(idReteta);

    if(!proprietar || !poateVedea(req.utilizator, proprietar))
    {
        return res.status(404).json({eroare: MESAJ_NEGASITA});
    }

    if(proprietar.autor_id !== req.utilizator.id)
    {
        return res.status(403).json({eroare: 'Poti modifica doar retetele tale.'});
    }

    const eroare = valideazaReteta(req.body);

    if (eroare)
    {
        return res.status(400).json({eroare});
    }

    const reteta = curataReteta(req.body);

    if(!categoriaEstePermisa(reteta))
    {
        return res.status(400).json({eroare: 'Categoria aleasa nu exista.'});
    }

    retete.actualizeazaReteta(idReteta, reteta);

    res.json({mesaj: 'Reteta a fost actualizata.'});
});

router.delete('/:id', doarLogat, (req, res) =>
{
    const idReteta = citesteId(req.params.id);

    if(idReteta === null)
    {
        return res.status(404).json({eroare: MESAJ_NEGASITA});
    }

    const proprietar = retete.gasesteProprietar(idReteta);

    if(!proprietar || !poateVedea(req.utilizator, proprietar))
    {
        return res.status(404).json({eroare: MESAJ_NEGASITA});
    }

    if(proprietar.autor_id !== req.utilizator.id && req.utilizator.rol !== 'admin')
    {
        return res.status(403).json({eroare: 'Nu ai permisiunea sa stergi aceasta reteta.'});
    }

    retete.stergeReteta(idReteta);

    res.json({mesaj: 'Reteta a fost stearsa.'});
})
module.exports = router;
