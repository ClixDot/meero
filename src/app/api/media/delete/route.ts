import { createHash } from 'node:crypto';
import { getSessionUser } from '../../../../lib/server/auth';

export const runtime = 'nodejs';

/** Deletes an asset the admin uploaded (never the bundled site images). */
export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !secret) {
    return Response.json({ error: 'Cloudinary is not configured on the server.' }, { status: 500 });
  }
  const user = await getSessionUser(request).catch(() => null);
  if (!user || user.role === 'viewer') return Response.json({ error: 'You do not have permission to do that.' }, { status: user ? 403 : 401 });
  const { publicId, resourceType } = (await request.json().catch(() => ({}))) as { publicId?: string; resourceType?: string };
  if (!publicId || !publicId.startsWith('meero/uploads/') || publicId.includes('..')) {
    return Response.json({ error: 'Invalid asset.' }, { status: 400 });
  }
  const type = ['image', 'video', 'raw'].includes(resourceType ?? '') ? (resourceType as string) : 'image';
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash('sha1').update(`invalidate=true&public_id=${publicId}&timestamp=${timestamp}${secret}`).digest('hex');
  const form = new URLSearchParams({ public_id: publicId, timestamp: String(timestamp), api_key: apiKey, signature, invalidate: 'true' });
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${type}/destroy`, { method: 'POST', body: form });
  const json = await res.json().catch(() => ({}));
  return Response.json(json, { status: res.ok ? 200 : 502 });
}
