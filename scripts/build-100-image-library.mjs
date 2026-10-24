import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import crypto from 'node:crypto';

const candidatesRaw = JSON.parse(await fs.readFile('docs/candidate-100-images.json', 'utf8'));

// The 9 foundational existing assets must be preserved in the 100
const existingManifest = JSON.parse(await fs.readFile('apps/web/public/image-manifest.json', 'utf8'));
const existingTitles = new Set(existingManifest.map(e => e.title));

// Helper to sanitize title
function sanitizeTitle(t) {
  return t.replace(/^File:/, '').replace(/\.(jpg|jpeg|png|webp)$/i, '').replace(/[^\w\s-]/g, '').trim();
}

// Group candidates by domain
const domainMatchers = [
  {
    category: 'municipalities',
    label: 'Antique Municipalities & Geography',
    filter: c => c.query.includes('Antique') || c.query.includes('Mararison') || c.query.includes('Pandan') || c.query.includes('Tibiao') || c.query.includes('Culasi') || c.query.includes('Hamtic') || c.query.includes('Bugasong') || c.query.includes('Anini-y') || c.query.includes('Patnongon') || c.query.includes('Sibalom'),
    target: 18,
    ratio: '16:9',
    width: 1200,
    height: 675
  },
  {
    category: 'sugar',
    label: 'Muscovado Sugar & Sugarcane',
    filter: c => c.query.includes('Sugar') || c.query.includes('Muscovado') || c.query.includes('Cane'),
    target: 10,
    ratio: '1:1',
    width: 800,
    height: 800
  },
  {
    category: 'coconut',
    label: 'Coconut & Palm Products',
    filter: c => c.query.includes('Coconut') || c.query.includes('Copra'),
    target: 10,
    ratio: '1:1',
    width: 800,
    height: 800
  },
  {
    category: 'textiles',
    label: 'Handwoven Textiles & Loom Weaving',
    filter: c => c.query.includes('Weaving') || c.query.includes('Loom') || c.query.includes('Patadyong') || c.query.includes('Hablon') || c.query.includes('Abaca') || c.query.includes('Piña') || c.query.includes('Textiles'),
    target: 12,
    ratio: '1:1',
    width: 800,
    height: 800
  },
  {
    category: 'handicrafts',
    label: 'Bariw, Buri & Bamboo Crafts',
    filter: c => c.query.includes('Handicraft') || c.query.includes('Basket') || c.query.includes('Banig') || c.query.includes('Bamboo') || c.query.includes('Rattan'),
    target: 12,
    ratio: '1:1',
    width: 800,
    height: 800
  },
  {
    category: 'food_spices',
    label: 'Artisanal Salt, Coffee, Cacao & Spices',
    filter: c => c.query.includes('Salt') || c.query.includes('Cacao') || c.query.includes('Coffee') || c.query.includes('Turmeric') || c.query.includes('Ginger') || c.query.includes('Fruit'),
    target: 10,
    ratio: '1:1',
    width: 800,
    height: 800
  },
  {
    category: 'fisheries',
    label: 'Fisheries, Marine & Coastal Trade',
    filter: c => c.query.includes('Fish') || c.query.includes('Seaweed') || c.query.includes('Tuna') || c.query.includes('banca') || c.query.includes('Fishermen'),
    target: 10,
    ratio: '1:1',
    width: 800,
    height: 800
  },
  {
    category: 'logistics',
    label: 'Logistics, Port Freight & Warehousing',
    filter: c => c.query.includes('Warehouse') || c.query.includes('Port') || c.query.includes('Cargo') || c.query.includes('Truck') || c.query.includes('Market stall'),
    target: 10,
    ratio: '16:9',
    width: 1200,
    height: 675
  },
  {
    category: 'regional',
    label: 'Panay Regional Expansion & Boracay',
    filter: c => c.query.includes('Panay') || c.query.includes('Iloilo') || c.query.includes('Aklan') || c.query.includes('Boracay') || c.query.includes('Rice harvest') || c.query.includes('Rice terraces') || c.query.includes('Paddy field') || c.query.includes('Carabao'),
    target: 8,
    ratio: '16:9',
    width: 1200,
    height: 675
  }
];

// Curate selection
const selectedPlan = [];
const usedTitles = new Set();

// 1. Add existing 9 foundational assets first
for (const ex of existingManifest) {
  let cat = 'municipalities';
  if (ex.id.includes('muscovado') || ex.id.includes('sugar')) cat = 'sugar';
  else if (ex.id.includes('coconut')) cat = 'coconut';
  else if (ex.id.includes('textile') || ex.id.includes('weaving')) cat = 'textiles';
  else if (ex.id.includes('bags') || ex.id.includes('craft')) cat = 'handicrafts';
  else if (ex.id.includes('salt')) cat = 'food_spices';
  else if (ex.id.includes('harvest')) cat = 'regional';
  else if (ex.id.includes('logistics')) cat = 'logistics';

  selectedPlan.push({
    id: ex.id,
    title: ex.title,
    category: cat,
    url: ex.originalUrl,
    pageUrl: ex.sourceUrl,
    creator: ex.creator,
    license: ex.license,
    licenseUrl: ex.licenseUrl,
    usage: ex.usage,
    alt: ex.alt,
    width: ex.width,
    height: ex.height,
    isExisting: true
  });
  usedTitles.add(ex.title);
  usedTitles.add(`File:${ex.title}`);
}

// 2. Fill slots domain by domain
for (const dom of domainMatchers) {
  const currentInCat = selectedPlan.filter(p => p.category === dom.category).length;
  const needed = dom.target - currentInCat;
  if (needed <= 0) continue;

  const matchingCandidates = candidatesRaw.filter(c => dom.filter(c) && !usedTitles.has(c.title));

  let added = 0;
  for (const c of matchingCandidates) {
    if (added >= needed) break;

    const slug = `${dom.category.slice(0, 3)}-${sanitizeTitle(c.title).toLowerCase().slice(0, 32).replace(/[\s_]+/g, '-')}-${added + 1}`;
    selectedPlan.push({
      id: slug,
      title: c.title.replace(/^File:/, ''),
      category: dom.category,
      url: c.url,
      pageUrl: c.pageUrl,
      creator: c.artist || 'Wikimedia Commons Contributor',
      license: c.license || 'CC BY-SA 4.0',
      licenseUrl: c.license.includes('Public domain')
        ? 'https://creativecommons.org/publicdomain/mark/1.0/'
        : 'https://creativecommons.org/licenses/by-sa/4.0/',
      usage: `${dom.label} illustrative sample; B2B procurement catalog`,
      alt: c.desc ? c.desc.slice(0, 100) : `${dom.label} in Western Visayas, Philippines`,
      width: dom.width,
      height: dom.height,
      ratio: dom.ratio,
      isExisting: false
    });
    usedTitles.add(c.title);
    added++;
  }
}

// 3. If still under 100, fill from general high-res candidates
if (selectedPlan.length < 100) {
  for (const c of candidatesRaw) {
    if (selectedPlan.length >= 100) break;
    if (usedTitles.has(c.title)) continue;
    const slug = `gen-${sanitizeTitle(c.title).toLowerCase().slice(0, 30).replace(/[\s_]+/g, '-')}-${selectedPlan.length + 1}`;
    selectedPlan.push({
      id: slug,
      title: c.title.replace(/^File:/, ''),
      category: 'regional',
      url: c.url,
      pageUrl: c.pageUrl,
      creator: c.artist || 'Wikimedia Commons Contributor',
      license: c.license || 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      usage: 'Regional commerce and local products illustration',
      alt: c.desc ? c.desc.slice(0, 100) : 'Philippine local trade and production',
      width: 1000,
      height: 750,
      ratio: '4:3',
      isExisting: false
    });
    usedTitles.add(c.title);
  }
}

// Ensure exactly 100
const finalSelection = selectedPlan.slice(0, 100);
console.log(`Plan assembled: exactly ${finalSelection.length} curated images across categories:`);
const counts = {};
for (const item of finalSelection) {
  counts[item.category] = (counts[item.category] || 0) + 1;
}
console.log(counts);

await fs.writeFile('docs/curated-100-selection.json', JSON.stringify(finalSelection, null, 2));
