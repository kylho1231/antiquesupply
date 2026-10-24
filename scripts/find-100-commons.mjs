import fs from 'node:fs/promises';

const searchQueries = [
  // Antique municipalities & geography
  'Antique Philippines',
  'Tibiao Antique',
  'Culasi Antique',
  'Mararison Island',
  'Pandan Antique',
  'Anini-y Antique',
  'San Jose de Buenavista Antique',
  'Hamtic Antique',
  'Bugasong Antique',
  'Patnongon Antique',
  'Sibalom Antique',
  'Panay Island Philippines',
  'Iloilo Philippines landscape',
  'Aklan Philippines',
  'Boracay Philippines',
  // Agriculture & Sugar
  'Sugarcane Philippines',
  'Muscovado sugar',
  'Sugar mill Philippines',
  'Rice terraces Philippines',
  'Rice harvest Philippines',
  'Paddy field Philippines',
  'Carabao farming Philippines',
  // Coconut & Palm
  'Coconut plantation Philippines',
  'Coconut palm tree Philippines',
  'Copra Philippines',
  'Coconut oil Philippines',
  'Coconut shell Philippines',
  // Textiles & Loom Weaving
  'Weaving Philippines',
  'Handloom Philippines',
  'Patadyong',
  'Hablon',
  'Abaca weaving',
  'Piña cloth weaving',
  'Textiles Philippines',
  // Handicrafts & Palm Crafts
  'Handicraft Philippines',
  'Basket weaving Philippines',
  'Banig weaving Philippines',
  'Bamboo craft Philippines',
  'Rattan Philippines',
  // Salt & Spices & Food
  'Sea salt Philippines',
  'Salt making Philippines',
  'Cacao Philippines',
  'Coffee beans Philippines',
  'Turmeric Philippines',
  'Ginger Philippines',
  'Fruit market Philippines',
  // Fisheries & Marine
  'Fishing boat Philippines banca',
  'Fish market Philippines',
  'Dried fish Philippines',
  'Fishermen Philippines',
  'Seaweed Philippines',
  'Tuna Philippines',
  // Logistics & Trade
  'Warehouse Philippines',
  'Port of Iloilo',
  'Cargo ship Philippines',
  'Truck delivery Philippines',
  'Market stall Philippines wholesale'
];

const headers = {
  'User-Agent': 'AntiqueSupplyAssetResearch/1.0 (academic research & non-profit catalog; contact info@antiquesupply.ph)'
};

async function politeFetch(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { headers });
    if (res.status !== 429) return res;
    console.log('Got 429; waiting 10s...');
    await new Promise(r => setTimeout(r, 10000));
  }
  throw new Error('Rate limit exceeded');
}

const seenTitles = new Set();
const candidates = [];

for (const q of searchQueries) {
  console.log(`Searching: ${q}...`);
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.search = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: q,
    gsrnamespace: '6',
    gsrlimit: '15',
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata'
  });

  try {
    const res = await politeFetch(url);
    if (!res.ok) {
      console.log(`Error ${res.status} for ${q}`);
      continue;
    }
    const data = await res.json();
    const pages = Object.values(data.query?.pages || {});

    for (const page of pages) {
      const info = page.imageinfo?.[0];
      if (!info) continue;
      const title = page.title;
      if (seenTitles.has(title)) continue;

      const lower = title.toLowerCase();
      // Filter out non-photographic or irrelevant files
      if (
        lower.endsWith('.svg') ||
        lower.endsWith('.pdf') ||
        lower.endsWith('.ogv') ||
        lower.includes('locator') ||
        lower.includes('map') ||
        lower.includes('flag_of') ||
        lower.includes('coat_of_arms') ||
        lower.includes('logo') ||
        lower.includes('madrid') || // door in Madrid
        lower.includes('baroque')
      ) {
        continue;
      }

      const meta = info.extmetadata || {};
      const license = meta.LicenseShortName?.value || '';
      if (!/CC|Public domain|CC0/i.test(license)) continue;

      const artist = (meta.Artist?.value || '').replace(/<[^>]*>/g, '').trim() || 'Unknown';
      const desc = (meta.ImageDescription?.value || '').replace(/<[^>]*>/g, '').trim() || '';

      // Skip undersized images
      if (info.width < 400 || info.height < 300) continue;

      seenTitles.add(title);
      candidates.push({
        title,
        query: q,
        url: info.url,
        pageUrl: info.descriptionurl,
        width: info.width,
        height: info.height,
        license,
        artist,
        desc
      });
    }

    // Polite delay between search requests
    await new Promise(r => setTimeout(r, 600));
  } catch (err) {
    console.error(`Query failed for ${q}:`, err.message);
  }
}

console.log(`Total photographic candidates found: ${candidates.length}`);
await fs.writeFile('docs/candidate-100-images.json', JSON.stringify(candidates, null, 2));
