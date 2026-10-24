import { authorizeProduct, photoRecord, storageRequest, mediaFailure } from '@/lib/media-server';
export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const photo = await photoRecord(id);
    if (!photo.is_published) await authorizeProduct(request, photo.product_id);
    const response = await storageRequest(`/storage/v1/object/authenticated/supplier-photos/${photo.object_path}`);
    return new Response(response.body, { headers: { 'Content-Type': 'image/webp', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': photo.is_published ? 'public, max-age=300' : 'private, no-store', Vary: 'Authorization' } });
  } catch (error) { return mediaFailure(error); }
}
export async function DELETE(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const photo = await photoRecord(id);
    await authorizeProduct(request, photo.product_id, true);
    await storageRequest(`/rest/v1/product_photos?id=eq.${id}`, { method: 'DELETE' });
    await storageRequest('/storage/v1/object/supplier-photos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prefixes: [photo.object_path] }) });
    return new Response(null, { status: 204 });
  } catch (error) { return mediaFailure(error); }
}
