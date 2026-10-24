import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import crypto from 'node:crypto';
import { normalizeProductPhoto, MAX_IMAGE_BYTES } from '../apps/web/lib/image-codec.mjs';

test('Editorial assets have complete rights records, matching files and Android copies', async () => {
  const manifest = JSON.parse(await fs.readFile('apps/web/public/image-manifest.json', 'utf8'));
  assert.ok(manifest.length >= 8);
  for (const asset of manifest) {
    for (const key of ['creator', 'license', 'licenseUrl', 'sourceUrl', 'checkedAt', 'usage', 'alt', 'path']) assert.ok(asset[key], `${asset.id}: missing ${key}`);
    assert.match(asset.sourceUrl, /^https:\/\/commons.wikimedia.org\/wiki\/File:/);
    assert.match(asset.license, /^(CC BY(?:-SA)? [234]\.0|CC0)$/);
    const web = await fs.readFile(`apps/web/public${asset.path}`);
    const android = await fs.readFile(`apps/android/app/src/main/assets${asset.path}`);
    assert.deepEqual(web, android);
    assert.equal(crypto.createHash('sha256').update(web).digest('hex'), asset.sha256);
    const meta = await sharp(web).metadata();
    assert.equal(meta.format, 'webp'); assert.equal(meta.width, asset.width); assert.equal(meta.height, asset.height);
    assert.ok(web.length < 500_000, `${asset.id} exceeds the asset budget`);
  }
});
test('Server validation rejects active, corrupt, undersized and oversized content', async () => {
  for (const bytes of [Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'), Buffer.from('not a photo'), Buffer.alloc(MAX_IMAGE_BYTES + 1)]) await assert.rejects(normalizeProductPhoto(bytes));
  const tiny = await sharp({ create: { width: 20, height: 20, channels: 3, background: 'red' } }).png().toBuffer();
  await assert.rejects(normalizeProductPhoto(tiny), /320 pixels/);
});
test('Valid supplier photos are resized, metadata stripped and transcoded', async () => {
  const photo = await sharp({ create: { width: 2100, height: 1700, channels: 3, background: '#647c4e' } }).withMetadata({ exif: { IFD0: { Artist: 'private metadata' } } }).jpeg().toBuffer();
  const result = await normalizeProductPhoto(photo);
  const meta = await sharp(result).metadata();
  assert.equal(meta.format, 'webp'); assert.equal(meta.width, 1600); assert.equal(meta.exif, undefined);
});
