const express = require('express');
const {doarLogat} = require('../middleware/acces');
const {citesteId} = require('../utils/citeste-id');
const {poateVedea} = require('../utils/poate-vedea');
const {valideazaRecenzie, curataRecenzie} = require('../utils/validare-recenzie');
const recenzii = require('../models/recenzii');

const router = express.Router();

const MESAJ_NEGASITA = 'Recenzia nu a fost gasita.';

function gasesteRecenziaVizibila(req, res, next)
{
    const idRecenzie = citesteId(req.params.id);

    if(idRecenzie === null)
    {
        return res.status(404).json({eroare: MESAJ_NEGASITA});
    }

    const recenzie = recenzii.gasesteRecenzie(idRecenzie);

    if(!recenzie || !poateVedea(req.utilizator, {vizibilitate: recenzie.vizibilitate, autor_id: recenzie.autor_reteta_id}))
    {
        return res.status(404).json({eroare: MESAJ_NEGASITA});
    }

    req.recenzie = recenzie;
    next();
}

router.put('/:id', doarLogat, gasesteRecenziaVizibila, (req, res) =>
{
    if(req.recenzie.autor_id !== req.utilizator.id)
    {
        return res.status(403).json({eroare: 'Poti modifica doar recenziile tale.'});
    }

    if(req.recenzie.vizibilitate === 'private')
    {
        return res.status(403).json({eroare: 'Nu se pot modifica recenziile retetelor private.'});
    }

    const eroare = valideazaRecenzie(req.body);

    if(eroare)
    {
        return res.status(400).json({eroare});
    }

    recenzii.actualizeazaRecenzie(req.recenzie.id, curataRecenzie(req.body));

    res.json({mesaj: 'Recenzia a fost actualizata.'});
});

module.exports = router;