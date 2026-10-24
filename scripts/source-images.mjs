import fs from 'node:fs/promises';
import sharp from 'sharp';
import crypto from 'node:crypto';

// Curated file titles discovered on Commons; URLs are always resolved by the API.
const selections = [
  ['antique-rice-terraces', 'Rice terraces in Tibiao, Antique.jpg', 'Homepage hero; regional agriculture', 'Rice terraces in Tibiao, Antique', 1600],
  ['muscovado-detail', 'Muscovado 04.jpg', 'Illustrative sugar sample; not supplier packaging', 'Muscovado sugar texture', 1000],
  ['antique-textile', 'Patadyong Bugasong textile Antique AssociationH.jpg', 'Weaving category and illustrative sample', 'Patadyong textiles from Bugasong, Antique', 1200],
  ['antique-weaving', 'Patadyong Bugasong Weavers Antique1.jpg', 'Weaving story and illustrative sample', 'Patadyong cloth displayed at a crafts fair by weavers from Bugasong, Antique', 1200],
  ['coconut-oil', 'Coconut-oil-on-wooden-spoon.jpg', 'Coconut category; illustrative sample', 'Coconut oil on a wooden spoon', 1000],
  ['woven-bags', 'Hand crafted bags.jpg', 'Handicrafts category; illustrative sample', 'Handcrafted woven bags', 1000],
  ['regional-salt', 'Tultul Asin.jpg', 'Regional food category only; not Patnongon salt flakes', 'Traditional tultul salt from the Philippines', 1000],
  ['panay-harvest', 'Sugarcane harvesting in Batad.jpg', 'Supplier story; regional farming', 'Sugarcane harvesting in Batad, Iloilo', 1400],
  ['philippine-logistics', 'Nasipit - port of Nasipit warehouse - Oct 2024.jpg', 'Supplier dashboard logistics illustration; not an Antique facility', 'Warehouse at the port of Nasipit, Philippines', 1200],
];
const headers = { 'User-Agent': 'AntiqueSupplyAssetResearch/1.0 (licensed image research)' };
const plain = value => (value || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim();
const root = 'apps/web/public/images/editorial';
await fs.mkdir(root, { recursive: true });
await fs.mkdir('docs/image-evidence', { recursive: true });
await fs.mkdir('apps/android/app/src/main/assets/images/editorial', { recursive: true });
const manifest = [];
const offline = process.argv.includes('--offline');
async function politeFetch(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(url, { headers });
    if (response.status !== 429) return response;
    const retry = response.headers.get('retry-after');
    const delay = retry && /^\d+$/.test(retry) ? Number(retry) * 1000 : 65000;
    console.log(`Provider rate limit; waiting ${Math.max(65000, delay) / 1000}s before retry.`);
    await new Promise(resolve => setTimeout(resolve, Math.max(65000, delay)));
  }
  throw new Error('Provider rate limit persisted; retry later.');
}
for (const [id, title, usage, alt, maxWidth] of selections) {
  if (offline) {
    try { await fs.access(`${root}/${id}.webp`); }
    catch { console.log(`Not downloaded: ${id}; omitted from manifest.`); continue; }
  }
  const api = new URL('https://commons.wikimedia.org/w/api.php');
  api.search = new URLSearchParams({ action: 'query', format: 'json', titles: `File:${title}`, prop: 'imageinfo', iiprop: 'url|size|extmetadata|sha1' });
  const evidence = offline ? JSON.parse(await fs.readFile(`docs/image-evidence/${id}.json`, 'utf8')) : await (async () => {
    const response = await politeFetch(api);
    if (!response.ok) throw new Error(`Metadata ${id}: ${response.status}`);
    return response.json();
  })();
  const info = Object.values(evidence.query.pages)[0].imageinfo?.[0];
  if (!info) throw new Error(`Missing file: ${title}`);
  const meta = info.extmetadata;
  // Reviewed file histories explicitly identify the self-publishing uploader.
  if (['antique-textile', 'antique-weaving'].includes(id) && !meta.Artist?.value) {
    meta.Artist = { value: 'Valenzuela400', source: 'Manually checked source file history and self-published license on 2026-10-24' };
  }
  if (!plain(meta.Artist?.value)) throw new Error(`Missing creator: ${id}`);
  const license = plain(meta.LicenseShortName?.value);
  if (!/^(CC BY(?:-SA)? [234]\.0|CC0)$/.test(license)) throw new Error(`Review license manually: ${id} ${license}`);
  await fs.writeFile(`docs/image-evidence/${id}.json`, JSON.stringify(evidence, null, 2));
  let optimized;
  try { optimized = await fs.readFile(`${root}/${id}.webp`); } catch {
    const imageResponse = await politeFetch(info.url);
    if (!imageResponse.ok) throw new Error(`Download ${id}: ${imageResponse.status}`);
    const original = Buffer.from(await imageResponse.arrayBuffer());
    optimized = await sharp(original, { limitInputPixels: 40_000_000 }).rotate().resize({ width: maxWidth, height: 1200, fit: 'inside', withoutEnlargement: true }).webp({ quality: id === 'antique-rice-terraces' ? 65 : 78, effort: 6 }).toBuffer();
    await new Promise(resolve => setTimeout(resolve, 15000));
  }
  const size = await sharp(optimized).metadata();
  const path = `/images/editorial/${id}.webp`;
  await fs.writeFile(`apps/web/public${path}`, optimized);
  await fs.copyFile(`apps/web/public${path}`, `apps/android/app/src/main/assets${path}`);
  const entry = { id, title, sourceUrl: info.descriptionurl, originalUrl: info.url, creator: plain(meta.Artist?.value), license, licenseUrl: meta.LicenseUrl?.value?.replace(/^http:/, 'https:') || 'https://creativecommons.org/publicdomain/zero/1.0/', attribution: `${plain(meta.Artist?.value)} / Wikimedia Commons / ${license}`, checkedAt: new Date().toISOString(), usage, alt, path, androidPath: `file:///android_asset${path}`, width: size.width, height: size.height, bytes: optimized.length, originalWidth: info.width, originalHeight: info.height, sha256: crypto.createHash('sha256').update(optimized).digest('hex'), modifications: 'Resized and converted to WebP; interface may crop. Derivatives retain the source license.', sourceDescription: plain(meta.ImageDescription?.value), restrictions: plain(meta.Restrictions?.value), kind: 'editorial', commercialUse: true };
  manifest.push(entry);
  console.log(`${id}: ${license}, ${size.width}x${size.height}, ${Math.round(optimized.length / 1024)} KB; ${entry.creator}`);
}
await fs.writeFile('apps/web/public/image-manifest.json', JSON.stringify(manifest, null, 2));
await fs.copyFile('apps/web/public/image-manifest.json', 'apps/android/app/src/main/assets/image-manifest.json');
const thumbs = await Promise.all(manifest.map(async (asset, index) => ({ input: await sharp(`apps/web/public${asset.path}`).resize(300, 220, { fit: 'contain', background: '#e9e5da' }).png().toBuffer(), left: (index % 3) * 300, top: Math.floor(index / 3) * 220 })));
await sharp({ create: { width: 900, height: Math.ceil(manifest.length / 3) * 220, channels: 3, background: '#e9e5da' } }).composite(thumbs).png().toFile('docs/image-contact-sheet.png');
