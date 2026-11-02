const multer = require('multer');

const MARIME_MAXIMA = 5*1024*1024;

const incarcare = multer
({
    storage: multer.memoryStorage(),
    limits:
    {
        fileSize : MARIME_MAXIMA,
        files: 1,
        parts: 1
    }
}).single('poza');

function incarcaPoza(req, res, next)
{
    incarcare(req, res, (eroare) =>
    {
        if(eroare instanceof multer.MulterError && eroare.code === 'LIMIT_FILE_SIZE')
        {
            return res.status(413).json({eroare: 'Poza poate avea cel mult 5 MB.'});
        }

        if(eroare)
        {
            return res.status(400).json({eroare: 'Trimite o singura poza in campul "poza".'});
        }
        next();
    });
}

module.exports = {incarcaPoza};