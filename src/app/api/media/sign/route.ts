import { createHash } from 'node:crypto';
import { getSessionUser } from '../../../../lib/server/auth';

export const runtime = 'nodejs';

const FOLDER = 'meero/uploads';

/** Signs a Cloudinary upload so the browser can send files straight to Cloudinary without ever seeing the API secret. */
export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !secret) {
    return Response.json({ error: 'Cloudinary is not configured on the server.' }, { status: 500 });
  }
  const user = await getSessionUser(request).catch(() => null);
  if (!user || user.role === 'viewer') return Response.json({ error: 'Please sign in to upload files.' }, { status: user ? 403 : 401 });
  const body = (await request.json().catch(() => ({}))) as { publicId?: string };
  const timestamp = Math.floor(Date.now() / 1000);

  // Only these params are signed – the client cannot upload outside meero/uploads.
  const params: Record<string, string | number> = { timestamp };
  if (body.publicId) {
    if (!body.publicId.startsWith(`${FOLDER}/`) || body.publicId.includes('..')) {
      return Response.json({ error: 'Invalid asset.' }, { status: 400 });
    }
    params.public_id = body.publicId;
    params.overwrite = 'true';
    params.invalidate = 'true';
  } else {
    params.folder = FOLDER;
  }
  const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&');
  const signature = createHash('sha1').update(toSign + secret).digest('hex');
  return Response.json({ cloudName, apiKey, signature, params });
}
