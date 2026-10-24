import sharp from 'sharp';
import fs from 'node:fs/promises';
await fs.mkdir('tests/.fixtures', { recursive: true });
for (const [name, color] of [['green', '#126747'], ['amber', '#d69d31']]) await sharp({ create: { width: 640, height: 640, channels: 3, background: color } }).png().toFile(`tests/.fixtures/${name}.png`);
