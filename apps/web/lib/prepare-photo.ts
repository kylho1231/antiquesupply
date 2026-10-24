export const MAX_PHOTOS = 6;
export async function preparePhoto(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPEG, PNG or WebP photo.');
  if (file.size > 8 * 1024 * 1024 || !file.size) throw new Error('Each photo must be between 1 byte and 8 MB.');
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const jpeg = head[0] === 255 && head[1] === 216 && head[2] === 255;
  const png = head[0] === 137 && head[1] === 80 && head[2] === 78 && head[3] === 71;
  const webp = String.fromCharCode(...head.slice(0, 4)) === 'RIFF' && String.fromCharCode(...head.slice(8, 12)) === 'WEBP';
  if (!(jpeg || png || webp)) throw new Error('This file is not a supported photograph.');
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 40_000_000 || Math.min(bitmap.width, bitmap.height) < 320) throw new Error('Use a photo at least 320 pixels on each side and under 40 megapixels.');
    const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Photo processing is unavailable in this browser.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.8, 0.65, 0.5]) {
      const encoded = canvas.toDataURL('image/webp', quality);
      if (encoded.length <= 300_000) return encoded;
    }
    throw new Error('This photo is too detailed for local demo storage. Choose a smaller photo.');
  } finally { bitmap.close(); }
}
