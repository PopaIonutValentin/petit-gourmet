const {test} = require('node:test');
const assert = require('node:assert/strict');
const {detecteazaTipImagine} = require('../src/utils/tip-imagine');

test('recunoaste un JPEG', () => 
{
    assert.equal(detecteazaTipImagine(Buffer.from([0xFF, 0xD8, 0xFF, 0xE1])), 'jpeg');
});

test('recunoaste un PNG', () =>
{
    assert.equal(detecteazaTipImagine(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0])), 'png');
});

test('recunoaste un WebP', () => 
{
    const continut = Buffer.concat([Buffer.from('RIFF', 'ascii'), Buffer.alloc(4), Buffer.from('WEBP', 'ascii')]);

    assert.equal(detecteazaTipImagine(continut), 'webp');
});

test('respinge un fisier RIFF care nu e WebP', () =>
{
    const continut = Buffer.concat([Buffer.from('RIFF', 'ascii'), Buffer.alloc(4), Buffer.from('WAVE', 'ascii')]);

    assert.equal(detecteazaTipImagine(continut), null);
});

test('respinge un SVG cu script', () =>
{
    assert.equal(detecteazaTipImagine(Buffer.from('<svg><script>alert(1)</script></svg>')), null);
});

test('respinge un GIF', () => 
{
    assert.equal(detecteazaTipImagine(Buffer.from('GIF89a', 'ascii')), null);
});

test('respinge un fisier mai scurt decat semnatura', () =>
{
    assert.equal(detecteazaTipImagine(Buffer.from([0xFF, 0xD8])), null);
});

test('respinge o valoare care nu e Buffer', () =>
{
    assert.equal(detecteazaTipImagine(undefined), null);
    assert.equal(detecteazaTipImagine('jpeg'), null);
});