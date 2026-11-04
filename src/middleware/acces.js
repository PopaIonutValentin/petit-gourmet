const utilizatori = require ('../models/utilizatori');

const MESAJ_NEAUTENTIFICAT = 'Trebuie sa fii autentificat.';

function doarLogat (req, res, next)
{
    const id = req.session?.utilizatorId;

    if(!id)
    {
        return res.status(401).json({eroare: MESAJ_NEAUTENTIFICAT});
    }

    const utilizator = utilizatori.gasesteDupaId(id);

    if(!utilizator)
    {
        return req.session.destroy(() =>
        {
            res.status(401).json({eroare: MESAJ_NEAUTENTIFICAT});
        });
    }

    req.utilizator = utilizator;
    next();
}

function doarAdmin(req, res, next)
{
    if(!req.utilizator)
    {
        return res.status(401).json({eroare: MESAJ_NEAUTENTIFICAT});
    }

    if(req.utilizator.rol !== 'admin')
    {
        return res.status(403).json({eroare: 'Nu ai permisiune pentru aceasta actiune.'});
    }

    next();
}

function identificaUtilizatorul(req, res, next)
{
    const id = req.session?.utilizatorId;

    if(id)
    {
        req.utilizator = utilizatori.gasesteDupaId(id);
    }

    next();
}
module.exports = {doarLogat, doarAdmin,identificaUtilizatorul};