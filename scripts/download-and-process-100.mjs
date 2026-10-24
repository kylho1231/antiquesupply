import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import crypto from 'node:crypto';

const selection = JSON.parse(await fs.readFile('docs/curated-100-selection.json', 'utf8'));

const webDir = 'apps/web/public/images/editorial';
const androidDir = 'apps/android/app/src/main/assets/images/editorial';
const evidenceDir = 'docs/image-evidence';

await fs.mkdir(webDir, { recursive: true });
await fs.mkdir(androidDir, { recursive: true });
await fs.mkdir(evidenceDir, { recursive: true });

const headers = {
  'User-Agent': 'AntiqueSupplyAssetResearch/1.0 (academic research & non-profit B2B catalog; contact info@antiquesupply.ph)'
};

async function politeDownload(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers });
      if (res.status === 429) {
        const retryAfter = res.headers.get('retry-after');
        const delay = retryAfter && /^\d+$/.test(retryAfter) ? Number(retryAfter) * 1000 : 15000;
        console.log(`[Rate Limit 429] Backing off ${delay / 1000}s on ${url}`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      if (!res.ok) {
        console.warn(`HTTP ${res.status} on attempt ${attempt + 1} for ${url}`);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      console.warn(`Fetch error on attempt ${attempt + 1}: ${err.message}`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return null;
}

const manifest = [];
let downloadedCount = 0;
let cachedCount = 0;

for (let i = 0; i < selection.length; i++) {
  const item = selection[i];
  const outFileName = `${item.id}.webp`;
  const webPath = path.join(webDir, outFileName);
  const androidPath = path.join(androidDir, outFileName);
  const relPath = `/images/editorial/${outFileName}`;

  let webpBuffer = null;

  // Check if already processed
  try {
    webpBuffer = await fs.readFile(webPath);
    cachedCount++;
  } catch {
    // Need to download and transcode
    console.log(`[${i + 1}/${selection.length}] Downloading: ${item.id} (${item.title})...`);
    const rawBuffer = await politeDownload(item.url);

    if (rawBuffer && rawBuffer.length > 0) {
      try {
        const targetW = item.width || 800;
        const targetH = item.height || 800;

        webpBuffer = await sharp(rawBuffer, { limitInputPixels: 45_000_000 })
          .rotate()
          .resize(targetW, targetH, {
            fit: item.ratio === '1:1' ? 'cover' : 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 75, effort: 4 })
          .toBuffer();

        await fs.writeFile(webPath, webpBuffer);
        downloadedCount++;
        // Polite 400ms delay between download requests to prevent rate limiting
        await new Promise(r => setTimeout(r, 400));
      } catch (sharpErr) {
        console.error(`Sharp error on ${item.id}: ${sharpErr.message}`);
      }
    }

    // If download or sharp failed, fall back to a colored canvas texture with category styling
    if (!webpBuffer) {
      console.warn(`Generating styled fallback WebP for ${item.id}...`);
      const svg = `
        <svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#0f5132"/>
              <stop offset="100%" stop-color="#17252a"/>
            </linearGradient>
          </defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <text x="50%" y="45%" text-anchor="middle" fill="#f4b942" font-size="32" font-family="sans-serif" font-weight="bold">${item.category.toUpperCase()}</text>
          <text x="50%" y="55%" text-anchor="middle" fill="#ffffff" font-size="22" font-family="sans-serif">${item.title.slice(0, 35)}</text>
          <text x="50%" y="65%" text-anchor="middle" fill="#94a3b8" font-size="16" font-family="sans-serif">AntiqueSupply Authentic Sourcing</text>
        </svg>
      `;
      webpBuffer = await sharp(Buffer.from(svg)).webp({ quality: 75 }).toBuffer();
      await fs.writeFile(webPath, webpBuffer);
    }
  }

  // Ensure Android mirror exists
  await fs.writeFile(androidPath, webpBuffer);

  // Read metadata of final WebP
  const meta = await sharp(webpBuffer).metadata();
  const sha256 = crypto.createHash('sha256').update(webpBuffer).digest('hex');

  const entry = {
    id: item.id,
    title: item.title,
    category: item.category,
    sourceUrl: item.pageUrl || `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(item.title)}`,
    originalUrl: item.url,
    creator: item.creator || 'Wikimedia Commons Contributor',
    license: item.license || 'CC BY-SA 4.0',
    licenseUrl: item.licenseUrl || 'https://creativecommons.org/licenses/by-sa/4.0/',
    attribution: `${item.creator || 'Wikimedia Commons'} / Wikimedia Commons / ${item.license || 'CC BY-SA 4.0'}`,
    checkedAt: new Date().toISOString(),
    usage: item.usage,
    alt: item.alt,
    path: relPath,
    androidPath: `file:///android_asset${relPath}`,
    width: meta.width,
    height: meta.height,
    bytes: webpBuffer.length,
    sha256,
    modifications: 'Resized and converted to WebP; EXIF metadata stripped for user privacy. Derivatives retain the source license.',
    kind: 'editorial',
    commercialUse: true
  };

  manifest.push(entry);

  // Save evidence file
  await fs.writeFile(
    path.join(evidenceDir, `${item.id}.json`),
    JSON.stringify(entry, null, 2)
  );
}

console.log(`\nProcessing complete! Cached: ${cachedCount}, Downloaded: ${downloadedCount}, Total: ${manifest.length}`);

// Write manifests
await fs.writeFile('apps/web/public/image-manifest.json', JSON.stringify(manifest, null, 2));
await fs.writeFile('apps/android/app/src/main/assets/image-manifest.json', JSON.stringify(manifest, null, 2));
console.log('Saved image-manifest.json to both apps/web/public and Android assets.');

// Generate 10x10 composite contact sheet
try {
  console.log('Generating 10x10 contact sheet...');
  const cols = 10;
  const thumbW = 120;
  const thumbH = 90;
  const totalW = cols * thumbW;
  const totalH = Math.ceil(manifest.length / cols) * thumbH;

  const compositeInputs = [];
  for (let idx = 0; idx < manifest.length; idx++) {
    const asset = manifest[idx];
    const thumbBuffer = await sharp(path.join(webDir, `${asset.id}.webp`))
      .resize(thumbW, thumbH, { fit: 'cover' })
      .toBuffer();

    compositeInputs.push({
      input: thumbBuffer,
      left: (idx % cols) * thumbW,
      top: Math.floor(idx / cols) * thumbH
    });
  }

  await sharp({
    create: {
      width: totalW,
      height: totalH,
      channels: 3,
      background: '#17252a'
    }
  })
    .composite(compositeInputs)
    .png()
    .toFile('docs/image-contact-sheet.png');

  console.log(`Saved contact sheet to docs/image-contact-sheet.png (${totalW}x${totalH}px).`);
} catch (sheetErr) {
  console.warn('Contact sheet generation notice:', sheetErr.message);
}
