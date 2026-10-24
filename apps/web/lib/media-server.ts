import 'server-only';

export class MediaError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function mediaConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new MediaError(503, 'Supplier photo storage is not configured.');
  if (!url.startsWith('https://')) throw new MediaError(503, 'Storage requires HTTPS.');
  return { url: url.replace(/\/$/, ''), key };
}
export async function storageRequest(path: string, init: RequestInit = {}) {
  const { url, key } = mediaConfig();
  const response = await fetch(`${url}${path}`, { ...init, cache: 'no-store', headers: { apikey: key, Authorization: `Bearer ${key}`, ...init.headers } });
  if (!response.ok) throw new MediaError(502, 'Photo storage operation failed.');
  return response;
}
export async function authorizeProduct(request: Request, productId: string, write = false) {
  if (!/^[a-f0-9-]{36}$/i.test(productId)) throw new MediaError(400, 'Invalid product ID.');
  const authorization = request.headers.get('authorization') || '';
  if (!/^Bearer [A-Za-z0-9._-]+$/.test(authorization)) throw new MediaError(401, 'Sign in to access supplier photos.');
  const { url, key } = mediaConfig();
  const verified = await fetch(`${url}/auth/v1/user`, { cache: 'no-store', headers: { apikey: key, Authorization: authorization } });
  if (!verified.ok) throw new MediaError(401, 'Session is invalid or expired.');
  const user = await verified.json();
  const products = await (await storageRequest(`/rest/v1/products?id=eq.${productId}&select=id,organization_id`)).json();
  const product = products[0];
  if (!product) throw new MediaError(404, 'Product not found.');
  const members = await (await storageRequest(`/rest/v1/organization_members?user_id=eq.${encodeURIComponent(user.id)}&organization_id=eq.${product.organization_id}&select=role`)).json();
  if (!members.some((member: { role: string }) => !write || ['owner', 'admin', 'sales_rep'].includes(member.role))) throw new MediaError(403, 'You do not have access to this product.');
  return { userId: user.id, organizationId: product.organization_id };
}
export async function photoRecord(id: string) {
  if (!/^[a-f0-9-]{36}$/i.test(id)) throw new MediaError(404, 'Photo not found.');
  const rows = await (await storageRequest(`/rest/v1/product_photos?id=eq.${id}&select=*`)).json();
  if (!rows[0]) throw new MediaError(404, 'Photo not found.');
  return rows[0];
}
export function mediaFailure(error: unknown) {
  return Response.json({ error: error instanceof MediaError ? error.message : 'Could not process photo.' }, { status: error instanceof MediaError ? error.status : 400 });
}
