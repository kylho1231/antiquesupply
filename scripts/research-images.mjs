import fs from 'node:fs/promises';
const query = process.argv.slice(2).join(' ') || 'Antique Philippines landscape';
const url = new URL('https://commons.wikimedia.org/w/api.php');
url.search = new URLSearchParams({ action: 'query', format: 'json', generator: 'search', gsrsearch: query, gsrnamespace: '6', gsrlimit: '12', prop: 'imageinfo', iiprop: 'url|size|extmetadata' });
const response = await fetch(url, { headers: { 'User-Agent': 'AntiqueSupplyAssetResearch/1.0 (licensed image research)' } });
if (!response.ok) throw new Error(`Commons HTTP ${response.status}`);
const result = await response.json();
for (const page of Object.values(result.query?.pages || {})) {
  const i = page.imageinfo?.[0];
  console.log(JSON.stringify({ title: page.title, url: i?.url, page: i?.descriptionurl, width: i?.width, height: i?.height, license: i?.extmetadata?.LicenseShortName?.value, author: i?.extmetadata?.Artist?.value, description: i?.extmetadata?.ImageDescription?.value }));
}
