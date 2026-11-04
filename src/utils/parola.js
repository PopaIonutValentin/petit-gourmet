const crypto = require('node:crypto');
const { promisify }= require('node:util');

const scrypt = promisify(crypto.scrypt);

const SETARI =
{
    cost: 2**17,
    blockSize: 8,
    parallelization: 1,
    maxmem: 256*1024*1024
};

const LUNGIME_SARE=16;
const LUNGIME_HASH=64;

async function hashParola(parola)
{
    const sare = crypto.randomBytes(LUNGIME_SARE);
    const hash = await scrypt(parola, sare, LUNGIME_HASH, SETARI);
    return sare.toString('base64') + ':' + hash.toString('base64');
}

async function verificareParola(parola, textSalvat)
{
    const [sareBase64, hashBase64] = textSalvat.split(':');
    const sare = Buffer.from(sareBase64, 'base64');
    const hashSalvat = Buffer.from(hashBase64, 'base64');

    const hashNou = await scrypt(parola, sare, hashSalvat.length, SETARI);

    return crypto.timingSafeEqual(hashNou, hashSalvat);
}

module.exports ={hashParola, verificareParola};

