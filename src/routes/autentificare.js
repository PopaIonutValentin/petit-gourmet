const express = require('express');
const {valideazaNumeUtilizator, valideazaEmail} = require('../utils/validare-utilizator');
const {valideazaParola} = require('../utils/validare-parola');
const {esteParolaScursa} = require('../utils/parola-scursa');
const {hashParola, verificareParola} = require('../utils/parola');
const utilizatori = require('../models/utilizatori');
const {doarLogat} = require('../middleware/acces');
const incercari = require('../models/incercari');


const router = express.Router();

const MESAJ_GENERAL = 'Nu s-a putut crea contul cu aceste date.';
const MESAJ_LOGIN_GRESIT = 'Nume de utilizator sau parola gresita.';
const hashFalsPromis = hashParola('parola-falsa-doar-pentru-timp-egal');
const FEREASTRA_LOGIN_MS = 15*60*1000;
const MAXIM_PE_NUME = 5;
const MAXIM_PE_IP = 20;
const MESAJ_PREA_MULTE = 'Prea multe incercari. Incearca din nou mai tarziu.';
const FEREASTRA_INREGISTRARE_MS = 60*60*1000;
const MAXIM_INREGISTRARE_PE_IP = 5;

router.post('/inregistrare', async (req, res) =>
{
    const{numeUtilizator, email, parola}=req.body ??{};

    const eroare = valideazaNumeUtilizator(numeUtilizator)
                ?? valideazaEmail(email)
                ?? valideazaParola(parola, numeUtilizator);
    
    if (eroare)
    {
        return res.status(400).json({eroare});
    }

    const ip = req.ip;

    if(incercari.numaraIncercari('inregistrare_ip', ip, FEREASTRA_INREGISTRARE_MS) >= MAXIM_INREGISTRARE_PE_IP)
    {
        return res.status(429).json({eroare: MESAJ_PREA_MULTE});
    }

    incercari.inregistreazaIncercare('inregistrare_ip', ip);

    if (utilizatori.existaNumeUtilizator(numeUtilizator))
    {
        return res.status(409).json({ eroare: 'Numele de utilizator este deja folosit.'});
    }

    if (utilizatori.existaEmail(email))
    {
        return res.status(400).json({eroare: MESAJ_GENERAL});
    }

    if(await esteParolaScursa(parola))
    {
        return res.status(400).json({eroare: 'Parola apare in scurgeri de date publice. Alege alta.'});
    }

    const parolaHash = await hashParola(parola);

    try
    {
        utilizatori.creeazaUtilizator(numeUtilizator, email, parolaHash);
    }
    catch (eroareInserare)
    {
        console.warn('Inregistrare esuata la salvare:', eroareInserare.message);
        return res.status(400).json({eroare: MESAJ_GENERAL});
    }

    return res.status(201).json({mesaj: 'Contul a fost creat. Te poti autentifica.'});   
});

router.post('/login', async (req,res,next) =>
{
    const { numeUtilizator, parola} = req.body ??{};
   
    if(typeof numeUtilizator !== 'string' || typeof parola !== 'string')
    {
        return res.status(400).json({ eroare: MESAJ_LOGIN_GRESIT});
    }

    const cheieNume = numeUtilizator.toLowerCase();
    const ip = req.ip;

    if(incercari.numaraIncercari('login_nume', cheieNume, FEREASTRA_LOGIN_MS) >= MAXIM_PE_NUME
       || incercari.numaraIncercari('login_ip', ip, FEREASTRA_LOGIN_MS) >= MAXIM_PE_IP)
    {
        return res.status(429).json({ eroare: MESAJ_PREA_MULTE});
    }

    const utilizator = utilizatori.gasesteUtilizatorPentruLogin(numeUtilizator);
    const hashDeVerificat = utilizator ? utilizator.parola_hash: await hashFalsPromis;
    const parolaCorecta = await verificareParola(parola, hashDeVerificat);

    if(!utilizator || !parolaCorecta)
    {
        incercari.inregistreazaIncercare('login_nume', cheieNume);
        incercari.inregistreazaIncercare('login_ip', ip);
        return res.status(401).json({eroare: MESAJ_LOGIN_GRESIT});
    }
    incercari.stergeIncercari('login_nume', cheieNume);

    req.session.regenerate((eroare) =>
    {
        if (eroare)
        {
            return next(eroare);
        }
        req.session.utilizatorId = utilizator.id;

        req.session.save((eroareSalvare) =>
        {
            if(eroareSalvare)
            {
                return next(eroareSalvare);
            }

            res.json({mesaj: 'Autentificare reusita.'});
        });
    });
});

router.post('/logout', (req, res, next) =>
{
    req.session.destroy((eroare) =>
    {
        if (eroare)
        {
            return next(eroare);
        }

        res.clearCookie('sid');
        res.json({ mesaj: 'Te-ai deconectat.'});
    });
});

router.get('/eu', doarLogat, (req, res) => 
{
    res.set('Cache-Control', 'no-store');
    res.json({utilizator: req.utilizator});
});

module.exports = router;


