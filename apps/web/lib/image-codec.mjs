import sharp from 'sharp';
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export async function normalizeProductPhoto(bytes) {
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new Error('Photo must be at most 8 MB.');
  const pipeline = sharp(bytes, { limitInputPixels: 40_000_000, failOn: 'warning' });
  const metadata = await pipeline.metadata();
  if (!['jpeg', 'png', 'webp'].includes(metadata.format) || (metadata.pages || 1) !== 1) throw new Error('Only single-frame JPEG, PNG and WebP photos are accepted.');
  if (Math.min(metadata.width || 0, metadata.height || 0) < 320) throw new Error('Photo must be at least 320 pixels on each side.');
  // Re-encoding removes EXIF/GPS, scripts, original names and appended payloads.
  return pipeline.rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
}
