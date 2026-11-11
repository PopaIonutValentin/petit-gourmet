const path = require('node:path');
const express = require('express');

const folderInterfata = process.env.INTERFATA_DIR || path.join(__dirname, '..', '..', 'client', 'dist');

const rutaInterfata = express.Router();

rutaInterfata.use(express.static(folderInterfata));

rutaInterfata.get('/{*cale}', (req, res, next) =>
{
    if(req.path.startsWith('/assets/'))
    {
        return next();
    }

    res.sendFile('index.html', {root: folderInterfata}, (eroare) =>
    {
        if(eroare)
        {
            next(eroare);
        }
    });
});

module.exports = rutaInterfata; 