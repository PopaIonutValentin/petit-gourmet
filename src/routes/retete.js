const express = require('express');
const {doarLogat, identificaUtilizatorul} = require('../middleware/acces');
const {valideazaReteta, curataReteta} = require('../utils/validare-reteta');
const retete = require('../models/retete');
const {citesteId} = require('../utils/citeste-id');
const categorii = require('../models/categorii');
const {incarcaPoza} = require('../middleware/incarca-poza');
const {detecteazaTipImagine} = require('../utils/tip-imagine');
const {proceseazaPoza} = require('../utils/proceseaza-poza');
const poze = require('../models/poze');
const {citesteFiltreFeed} = require('../utils/filtre-feed');
const recenzii = require('../models/recenzii');
const {valideazaRecenzie, curataRecenzie} = require('../utils/validare-recenzie');
const {poateVedea} = require('../utils/poate-vedea');

const router = express.Router();

const MESAJ_NEGASITA = 'Reteta nu a fost gasita.';
const MARIME_PAGINA = 20;

function categoriaEstePermisa(reteta)
{
    return reteta.categorie_id === null || categorii.gasesteCategorie(reteta.categorie_id) !== undefined;
}

function doarAutorulRetetei(req, res, next)
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
        return res.status(403).json({eroare: 'Poti schimba poza doar la retetele tale.'});
    }

    req.idReteta = idReteta;
    req.proprietar = proprietar;
    next();
}

router.get('/', (req, res) =>
{
    const rezultat = citesteFiltreFeed(req.query);

    if(rezultat.eroare)
    {
        return res.status(400).json({eroare: rezultat.eroare});
    }

    const gasite = retete.listeazaFeed(rezultat.filtre, MARIME_PAGINA+1);
    const maiSunt = gasite.length > MARIME_PAGINA;
    const pagina = gasite.slice(0, MARIME_PAGINA);

    res.json
    ({
        retete: pagina,
        urmatorulCursor: maiSunt ? pagina[pagina.length - 1].id : null
    });
});

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

router.get('/:id/recenzii', identificaUtilizatorul, (req, res) =>
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

    res.json({recenzii: recenzii.listeazaRecenzii(idReteta)});
});

router.post('/:id/recenzii', doarLogat, (req, res) =>
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

    if(proprietar.vizibilitate === 'private')
    {
        return res.status(403).json({eroare: 'Nu se pot lasa recenzii la retetele private.'});
    }

    if(proprietar.autor_id === req.utilizator.id)
    {
        return res.status(403).json({eroare: 'Nu iti poti recenza propria reteta.'});
    }

    const eroare = valideazaRecenzie(req.body);

    if(eroare)
    {
        return res.status(400).json({eroare});
    }

    if(recenzii.existaRecenzie(idReteta, req.utilizator.id))
    {
        return res.status(409).json({eroare: 'Ai lasat deja o recenzie la aceasta reteta.'});
    }

    const id = recenzii.creeazaRecenzie(idReteta, req.utilizator.id, curataRecenzie(req.body));

    res.status(201).json({id});
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

router.delete('/:id', doarLogat, async (req, res) =>
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

    try
    {
        await poze.stergePoza(proprietar.poza);
    }
    catch (eroare)
    {
        console.warn('Poza retetei sterse nu a putut fi stearsa:', proprietar.poza, eroare.code);
    }

    res.json({mesaj: 'Reteta a fost stearsa.'});
});

router.post('/:id/poza', doarLogat, doarAutorulRetetei, incarcaPoza, async (req, res) =>
{
    if(!req.file)
    {
        return res.status(400).json({eroare: 'Nu ai trimis nicio poza.'});
    }

    if(detecteazaTipImagine(req.file.buffer) === null)
    {
        return res.status(400).json({eroare: 'Poza trebuie sa fie JPEG, PNG sau WebP.'});
    }

    let pozaProcesata;

    try
    {
        pozaProcesata = await proceseazaPoza(req.file.buffer);
    }
    catch
    {
        return res.status(400).json({eroare: 'Poza nu a putut fi procesata.'});
    }

    const numePoza = await poze.salveazaPoza(pozaProcesata);

    try
    {
        retete.seteazaPoza(req.idReteta, numePoza);
    }
    catch (eroare)
    {
        await poze.stergePoza(numePoza);
        throw eroare;
    }

    try
    {
        await poze.stergePoza(req.proprietar.poza);
    }
    catch (eroare)
    {
        console.warn('Poza veche nu a putut fi stearsa:', req.proprietar.poza, eroare.code);
    }

    res.json({mesaj: 'Poza a fost salvata.'});
});

router.get('/:id/poza' , identificaUtilizatorul, (req, res) =>
{
    const idReteta = citesteId(req.params.id);

    if(idReteta === null)
    {
        return res.status(404).json({eroare: MESAJ_NEGASITA});
    }

    const proprietar = retete.gasesteProprietar(idReteta);

    if(!proprietar || !poateVedea (req.utilizator, proprietar))
    {
        return res.status(404).json({eroare: MESAJ_NEGASITA});
    }

    const cale = poze.caleaPozei(proprietar.poza);

    if(cale === null)
    {
        return res.status(404).json({eroare: 'Reteta nu are poza.'});
    }

    if(proprietar.vizibilitate === 'private')
    {
        res.set('Cache-Control', 'no-store');
    }

    res.sendFile(cale, (eroare) =>
    {
        if(eroare && !res.headersSent)
        {
            res.status(404).json({eroare: 'Poza nu a fost gasita.'});
        }
    });
});
module.exports = router;
