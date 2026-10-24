import fs from 'node:fs/promises';
import sharp from 'sharp';
const path = 'apps/web/public/images/editorial/antique-rice-terraces.webp';
const image = await sharp(await fs.readFile(path)).resize(1440, 810, { fit: 'cover' }).webp({ quality: 65, effort: 6 }).toBuffer();
await fs.writeFile(path, image);
console.log(`Hero optimized to 16:9, ${Math.round(image.length / 1024)} KB`);
