import { clientIp, getSessionUser, rateLimited } from '../../../lib/server/auth';
import { blobCol, kvCol, type UserDoc } from '../../../lib/server/mongo';

export const runtime = 'nodejs';

const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const fail = (error: string, status = 400) => json({ error }, status);

type Doc = { published?: unknown; draft?: unknown } & Record<string, unknown>;

/** Visitors only ever see published content; drafts are for signed-in admins. */
const forViewer = (key: string, value: unknown, user: UserDoc | null) => {
  if (user || !key.startsWith('content:') || !value || typeof value !== 'object') return value;
  const { draft: _d, updatedBy: _u, publishedBy: _p, ...rest } = value as Doc;
  return rest;
};

function canRead(key: string, user: UserDoc | null) {
  if (key.startsWith('content:')) return true;
  if (!user || key.startsWith('auth:')) return false;
  if (key.startsWith('onboarding:')) return key === `onboarding:${user._id}`;
  return true;
}
function canWrite(key: string, user: UserDoc | null) {
  if (!user || key.startsWith('auth:')) return false;
  if (key.startsWith('onboarding:')) return key === `onboarding:${user._id}`;
  if (key === 'activity') return true; // viewers still leave an audit trail
  return user.role === 'owner' || user.role === 'editor';
}

const str = (v: unknown, max = 500) => (typeof v === 'string' ? v.slice(0, max) : '');
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);

function cleanApplication(i: Record<string, unknown>) {
  const nowIso = new Date().toISOString();
  return {
    id: str(i.id, 60), code: str(i.code, 40), fullName: str(i.fullName, 120), email: str(i.email, 160), phone: str(i.phone, 40),
    preferredJob: str(i.preferredJob, 160), qualification: str(i.qualification, 160), experienceYears: str(i.experienceYears, 20),
    currentLocation: str(i.currentLocation, 160) || undefined, cvFileName: str(i.cvFileName, 200) || undefined, cvSize: num(i.cvSize),
    hasCv: i.hasCv === true, status: 'new', notes: [], read: false, submittedAt: nowIso, updatedAt: nowIso,
  };
}
function cleanEnquiry(i: Record<string, unknown>) {
  const nowIso = new Date().toISOString();
  return {
    id: str(i.id, 60), name: str(i.name, 120), email: str(i.email, 160), phone: str(i.phone, 40), subject: str(i.subject, 200) || undefined,
    message: str(i.message, 5000), status: 'new', notes: [], read: false, createdAt: nowIso, updatedAt: nowIso,
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const user = await getSessionUser(request);
    const col = await kvCol();

    const prefix = url.searchParams.get('prefix');
    if (prefix) {
      if (prefix !== 'content:' && !user) return fail('Please sign in again.', 401);
      if (prefix.startsWith('auth:')) return fail('Not allowed.', 403);
      const docs = await col.find({ _id: { $regex: `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}` } }).toArray();
      return json(Object.fromEntries(docs.filter((d) => canRead(d._id, user)).map((d) => [d._id, forViewer(d._id, d.value, user)])));
    }
    if (url.searchParams.get('keys')) {
      if (!user) return fail('Please sign in again.', 401);
      return json((await col.find({}, { projection: { _id: 1 } }).toArray()).map((d) => d._id).filter((k) => canRead(k, user)));
    }
    const key = url.searchParams.get('key') ?? '';
    if (!canRead(key, user)) return fail('Please sign in again.', user ? 403 : 401);
    const doc = await col.findOne({ _id: key });
    return json({ value: doc ? forViewer(key, doc.value, user) : null });
  } catch (e) {
    console.error('[store:get]', e);
    return fail('The server could not reach the database.', 503);
  }
}

export async function PUT(request: Request) {
  try {
    const { key, value } = (await request.json().catch(() => ({}))) as { key?: string; value?: unknown };
    const user = await getSessionUser(request);
    if (!key || !canWrite(key, user)) return fail(user ? 'You do not have permission to do that.' : 'Please sign in again.', user ? 403 : 401);
    if (JSON.stringify(value ?? null).length > 8_000_000) return fail('That is too large to save.', 413);
    await (await kvCol()).updateOne({ _id: key }, { $set: { value, updatedAt: new Date() } }, { upsert: true });
    return json({ ok: true });
  } catch (e) {
    console.error('[store:put]', e);
    return fail('The server could not reach the database.', 503);
  }
}

export async function DELETE(request: Request) {
  try {
    const key = new URL(request.url).searchParams.get('key') ?? '';
    const user = await getSessionUser(request);
    if (!canWrite(key, user)) return fail(user ? 'You do not have permission to do that.' : 'Please sign in again.', user ? 403 : 401);
    await (await kvCol()).deleteOne({ _id: key });
    return json({ ok: true });
  } catch (e) {
    console.error('[store:delete]', e);
    return fail('The server could not reach the database.', 503);
  }
}

/** Public, tightly-scoped writes (form submissions) plus owner maintenance. */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, any>;
    const col = await kvCol();

    if (body.op === 'append') {
      const key = body.key as string;
      if (key !== 'applications' && key !== 'enquiries') return fail('Not allowed.', 403);
      if (rateLimited(`append:${key}:${clientIp(request)}`, 6, 10 * 60_000)) return fail('Too many submissions. Please try again later.', 429);
      const raw = (body.item ?? {}) as Record<string, unknown>;
      const item = key === 'applications' ? cleanApplication(raw) : cleanEnquiry(raw);
      const who = 'fullName' in item ? item.fullName : (item as { name: string }).name;
      if (!who || !item.id || !item.email) return fail('Missing required details.');
      await col.updateOne({ _id: key }, { $push: { value: item } as never, $set: { updatedAt: new Date() } }, { upsert: true });
      const entry = {
        id: `act-${Date.now().toString(36)}`, at: item.updatedAt, actor: who,
        action: key === 'applications' ? 'submitted an application for' : 'sent an enquiry',
        target: key === 'applications' ? (item as { preferredJob: string }).preferredJob || 'General pool' : 'Contact form',
        href: key === 'applications' ? '/admin/applications' : '/admin/enquiries',
      };
      await col.updateOne({ _id: 'activity' }, { $push: { value: { $each: [entry], $position: 0, $slice: 200 } } as never }, { upsert: true });
      return json({ item });
    }

    if (body.op === 'duplicate') {
      if (rateLimited(`dup:${clientIp(request)}`, 30, 10 * 60_000)) return json({ duplicate: false });
      const doc = await col.findOne({ _id: 'applications' });
      const cutoff = Date.now() - 7 * 24 * 3600e3;
      const list = (Array.isArray(doc?.value) ? doc.value : []) as Array<Record<string, any>>;
      const email = String(body.email ?? '').toLowerCase();
      return json({
        duplicate: list.some((a) => !a.sample && String(a.email).toLowerCase() === email && a.preferredJob === body.preferredJob && Date.parse(a.submittedAt) > cutoff),
      });
    }

    if (body.op === 'clear') {
      const user = await getSessionUser(request);
      if (user?.role !== 'owner') return fail('Only owners can do that.', 403);
      await col.deleteMany({});
      await (await blobCol()).deleteMany({});
      return json({ ok: true });
    }
    return fail('Unknown request.');
  } catch (e) {
    console.error('[store:post]', e);
    return fail('The server could not reach the database.', 503);
  }
}
