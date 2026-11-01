const {test} = require('node:test');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const {proceseazaPoza} = require('../src/utils/proceseaza-poza');

function creeazaPoza(latime, inaltime)
{
    return sharp({ create: {width: latime, height: inaltime, channels: 3, background: '#ff8800'}});
}

test('micsoreaza poza si o salveaza in WebP', async () =>
{
    const original = await creeazaPoza(3000, 2000).png().toBuffer();
    const informatii = await sharp(await proceseazaPoza(original)).metadata();

    assert.equal(informatii.format, 'webp');
    assert.equal(informatii.width, 1600);
    assert.equal(informatii.height, 1067);
});

test('sterge metadatele EXIF, inclusiv locatia GPS', async () =>
{
    const original = await creeazaPoza(200, 100)
                    .withExif({IFD3: {GPSLatitudeRef: 'N', GPSLatitude: '44/1 25/1 0/1'}})
                    .jpeg()
                    .toBuffer();

    assert.ok((await sharp(original).metadata()).exif);

    const rezultat = await proceseazaPoza(original);

    assert.equal((await sharp(rezultat).metadata()).exif, undefined);
});

test('roteste poza dupa orientarea din EXIF', async () =>
{
    const original = await creeazaPoza(300, 100).withMetadata({orientation: 6}).jpeg().toBuffer();
    const informatii = await sharp(await proceseazaPoza(original)).metadata();

    assert.equal(informatii.width, 100);
    assert.equal(informatii.height, 300);
});

test('refuza o poza peste limita de pixeli', async () =>
{
    const original = await creeazaPoza(8000, 8000).png().toBuffer();

    await assert.rejects(proceseazaPoza(original), /pixel limit/);
});
