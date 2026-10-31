const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
require('./db');
const StoreSQLite = require('./models/sesiuni');
const rutaAutentificare = require('./routes/autentificare');
const rutaAdmin = require('./routes/admin');
const rutaRetete = require('./routes/retete');
const rutaCategorii = require('./routes/categorii');

const SESSION_SECRET = process.env.SESSION_SECRET;

if(!SESSION_SECRET || SESSION_SECRET.length < 32)
{
    throw new Error ('Lipseste SESSION_SECRET din .env (minim 32 caractere).');
}

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({limit: '10kb'}));

app.use(session
({
    name: 'sid',
    secret: SESSION_SECRET,
    store: new StoreSQLite(),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie:
    {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.COOKIE_SECURE === 'true',
        maxAge: 30*60*1000
    }
}));

app.use('/api', rutaAutentificare);
app.use('/api/admin', rutaAdmin);
app.use('/api/retete', rutaRetete);
app.use('/api/categorii', rutaCategorii);

app.use((req, res) =>
{
    res.status(404).json({ eroare: 'Ruta nu exista'});
});

app.use((err, req, res, next) =>
{
    if(res.headersSent)
    {
        return next(err);
    }

    const status = Number(err.status || err.statusCode) || 500;

    if(status >= 400 && status < 500)
    {
        return res.status(status).json({eroare: 'Cerere invalida.'});
    }

    console.error('Eroare interna: ', err);
    res.status(500).json({eroare: 'A aparut o eroare interna pe server.'});

});

module.exports = app;
