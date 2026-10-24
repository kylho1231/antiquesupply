import { authorizeProduct, storageRequest, MediaError, mediaFailure } from '@/lib/media-server';
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await authorizeProduct(request, id, true);
    const text = await request.text();
    if (text.length > 2048) throw new MediaError(413, 'Gallery request too large.');
    const body = JSON.parse(text);
    if (!Array.isArray(body.photo_ids) || body.photo_ids.length > 6 || body.photo_ids.some((value: unknown) => typeof value !== 'string' || !/^[a-f0-9-]{36}$/i.test(value))) throw new MediaError(400, 'Choose up to six uploaded photos.');
    await storageRequest('/rest/v1/rpc/publish_product_photos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target_product: id, ordered_ids: body.photo_ids }) });
    return Response.json({ image_urls: body.photo_ids.map((photo: string) => `/api/v1/media/${photo}`) });
  } catch (error) { return mediaFailure(error); }
}
