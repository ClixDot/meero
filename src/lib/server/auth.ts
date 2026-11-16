import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { userCol, type UserDoc } from './mongo';

export const COOKIE = 'meero_session';
export const DEFAULT_ADMIN = { email: 'admin@meerohr.com', password: 'Meero@2026' };

const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error('AUTH_SECRET is not set.');
  return s;
};

/* ---------- passwords ---------- */
export function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString('hex');
}
export const newSalt = () => randomBytes(16).toString('hex');

export function verifyPassword(password: string, salt: string, hash: string) {
  const a = Buffer.from(hashPassword(password, salt), 'hex');
  const b = Buffer.from(hash, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

/* ---------- signed session cookie: base64url(payload).hmac ---------- */
const b64 = (s: string) => Buffer.from(s).toString('base64url');
const sign = (body: string) => createHmac('sha256', secret()).update(body).digest('base64url');

export function makeSession(userId: string, ttlMs: number) {
  const body = b64(JSON.stringify({ u: userId, exp: Date.now() + ttlMs }));
  return `${body}.${sign(body)}`;
}

function readSession(token?: string): string | null {
  if (!token) return null;
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;
  const expected = sign(body);
  if (mac.length !== expected.length || !timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  try {
    const { u, exp } = JSON.parse(Buffer.from(body, 'base64url').toString()) as { u: string; exp: number };
    return exp > Date.now() ? u : null;
  } catch { return null; }
}

export function cookieHeader(token: string, maxAgeSec: number) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`;
}
export const clearCookieHeader = () => cookieHeader('', 0);

function cookieFrom(request: Request): string | undefined {
  const raw = request.headers.get('cookie') ?? '';
  return raw.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
}

/* ---------- users ---------- */
export const publicUser = ({ hash: _h, salt: _s, _id, ...u }: UserDoc) => ({ id: _id, ...u });

/** Creates the first owner account on a fresh database. */
export async function ensureDefaultAdmin() {
  const col = await userCol();
  if ((await col.estimatedDocumentCount()) > 0) return;
  const salt = newSalt();
  await col.insertOne({
    _id: `usr-${randomBytes(6).toString('hex')}`, name: 'MEERO Admin', email: DEFAULT_ADMIN.email, role: 'owner', active: true,
    createdAt: new Date().toISOString(), usingDefaultPassword: true, salt, hash: hashPassword(DEFAULT_ADMIN.password, salt),
  }).catch(() => undefined);
}

export async function getSessionUser(request: Request): Promise<UserDoc | null> {
  const id = readSession(cookieFrom(request));
  if (!id) return null;
  const user = await (await userCol()).findOne({ _id: id });
  return user && user.active ? user : null;
}

/* ---------- tiny in-memory rate limiter (per server instance) ---------- */
const hits = new Map<string, number[]>();
export function rateLimited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  return list.length > max;
}
export const clientIp = (request: Request) => request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
