const sharp = require('sharp');

const LATURA_MAXIMA = 1600;
const PIXELI_MAXIMI = 50_000_000;
const CALITATE_WEBP = 80;

async function proceseazaPoza(continut) 
{
    return sharp(continut, {limitInputPixels: PIXELI_MAXIMI, failOn: 'warning'})
          .autoOrient()
          .resize(LATURA_MAXIMA, LATURA_MAXIMA, {fit: 'inside', withoutEnlargement: true})
          .webp({quality: CALITATE_WEBP})
          .toBuffer();
}

module.exports = {proceseazaPoza};