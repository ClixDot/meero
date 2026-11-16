import { Binary } from 'mongodb';
import { clientIp, getSessionUser, rateLimited } from '../../../lib/server/auth';
import { blobCol } from '../../../lib/server/mongo';

export const runtime = 'nodejs';

const MAX_CV = 5 * 1024 * 1024;
const CV_TYPES = /^(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/;
const KEY = /^cv\/[A-Za-z0-9-]{4,80}$/;

const fail = (error: string, status = 400) => Response.json({ error }, { status });

/** Candidate CVs. Anyone may submit one (once per id, size/type limited); only signed-in admins may read or delete. */
export async function PUT(request: Request) {
  try {
    const key = new URL(request.url).searchParams.get('key') ?? '';
    if (!KEY.test(key)) return fail('Not allowed.', 403);
    if (rateLimited(`cv:${clientIp(request)}`, 8, 10 * 60_000)) return fail('Too many uploads. Please try again later.', 429);
    const type = (request.headers.get('content-type') ?? '').split(';')[0];
    if (!CV_TYPES.test(type)) return fail('CV must be a PDF or Word document.');
    const data = Buffer.from(await request.arrayBuffer());
    if (data.length === 0 || data.length > MAX_CV) return fail('CV must be smaller than 5 MB.', 413);
    const name = decodeURIComponent(request.headers.get('x-file-name') ?? 'cv').slice(0, 200);
    const col = await blobCol();
    if (await col.findOne({ _id: key }, { projection: { _id: 1 } })) return fail('Already uploaded.', 409);
    await col.insertOne({ _id: key, type, name, data: new Binary(data) as unknown as Buffer, createdAt: new Date() });
    return Response.json({ ok: true });
  } catch (e) {
    console.error('[blob:put]', e);
    return fail('The server could not reach the database.', 503);
  }
}

export async function GET(request: Request) {
  try {
    if (!(await getSessionUser(request))) return fail('Please sign in again.', 401);
    const key = new URL(request.url).searchParams.get('key') ?? '';
    const doc = await (await blobCol()).findOne({ _id: key });
    if (!doc) return fail('Not found.', 404);
    const bytes = (doc.data as unknown as Binary).buffer;
    return new Response(new Uint8Array(bytes), {
      headers: { 'Content-Type': doc.type, 'Cache-Control': 'private, no-store', 'X-File-Name': encodeURIComponent(doc.name) },
    });
  } catch (e) {
    console.error('[blob:get]', e);
    return fail('The server could not reach the database.', 503);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user || user.role === 'viewer') return fail('You do not have permission to do that.', user ? 403 : 401);
    const key = new URL(request.url).searchParams.get('key') ?? '';
    await (await blobCol()).deleteOne({ _id: key });
    return Response.json({ ok: true });
  } catch (e) {
    console.error('[blob:delete]', e);
    return fail('The server could not reach the database.', 503);
  }
}
