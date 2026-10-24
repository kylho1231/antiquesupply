import { randomUUID } from 'node:crypto';
import { MAX_IMAGE_BYTES, normalizeProductPhoto } from '@/lib/image-codec.mjs';
import { authorizeProduct, storageRequest, MediaError, mediaFailure } from '@/lib/media-server';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const productId = new URL(request.url).searchParams.get('product_id') || '';
    const access = await authorizeProduct(request, productId, true);
    if (request.headers.get('x-photo-rights-confirmed') !== 'true') throw new MediaError(400, 'Confirm authorization to use this photo.');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(request.headers.get('content-type') || '')) throw new MediaError(415, 'Unsupported image type.');
    if (Number(request.headers.get('content-length')) > MAX_IMAGE_BYTES) throw new MediaError(413, 'Photo is too large.');
    const reader = request.body?.getReader();
    if (!reader) throw new MediaError(400, 'Photo is required.');
    let size = 0; const chunks: Uint8Array[] = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_IMAGE_BYTES) { await reader.cancel(); throw new MediaError(413, 'Photo is too large.'); }
      chunks.push(value);
    }
    const normalized = await normalizeProductPhoto(Buffer.concat(chunks));
    const id = randomUUID();
    const objectPath = `${access.organizationId}/${productId}/${id}.webp`;
    await storageRequest(`/storage/v1/object/supplier-photos/${objectPath}`, { method: 'POST', headers: { 'Content-Type': 'image/webp', 'x-upsert': 'false' }, body: new Uint8Array(normalized) });
    try {
      await storageRequest('/rest/v1/product_photos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, product_id: productId, organization_id: access.organizationId, uploaded_by: access.userId, object_path: objectPath, rights_confirmed_at: new Date().toISOString(), alt: 'Supplier-provided product photograph', bytes: normalized.length }) });
    } catch (error) {
      await storageRequest('/storage/v1/object/supplier-photos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prefixes: [objectPath] }) });
      throw error;
    }
    return Response.json({ id, url: `/api/v1/media/${id}`, status: 'private' }, { status: 201 });
  } catch (error) { return mediaFailure(error); }
}
