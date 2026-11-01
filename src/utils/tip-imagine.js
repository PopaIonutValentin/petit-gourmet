const SEMNATURA_JPEG = Buffer.from([0xFF, 0xD8, 0xFF]);
const SEMNATURA_PNG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ETICHETA_RIFF = Buffer.from('RIFF', 'ascii');
const ETICHETA_WEBP = Buffer.from('WEBP', 'ascii');

function areOctetii (continut, pozitie, asteptat)
{
    return continut.subarray(pozitie, pozitie + asteptat.length).equals(asteptat);
}

function detecteazaTipImagine(continut)
{
    if(!Buffer.isBuffer(continut))
    {
        return null;
    }

    if(areOctetii(continut, 0, SEMNATURA_JPEG))
    {
        return 'jpeg';
    }

    if(areOctetii(continut, 0, SEMNATURA_PNG))
    {
        return 'png';
    }

    if(areOctetii(continut, 0, ETICHETA_RIFF) && areOctetii(continut, 8, ETICHETA_WEBP))
    {
        return 'webp';
    }

    return null;
}

module.exports = {detecteazaTipImagine};