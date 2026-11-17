import { randomBytes } from 'node:crypto';
import {
  clearCookieHeader, dropUserCache, clientIp, cookieHeader, ensureDefaultAdmin, getSessionUser, hashPassword, makeSession,
  newSalt, publicUser, rateLimited, verifyPassword,
} from '../../../lib/server/auth';
import { userCol, type UserDoc } from '../../../lib/server/mongo';

export const runtime = 'nodejs';

const json = (data: unknown, status = 200, headers?: HeadersInit) => Response.json(data, { status, headers });
const fail = (error: string, status = 400) => json({ error }, status);

const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
function passwordProblem(pw: string) {
  if (typeof pw !== 'string' || pw.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Password must contain letters and numbers.';
  return null;
}
const ROLES = ['owner', 'editor', 'viewer'];

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, any>;
    if (['setPassword', 'createUser', 'updateUser', 'deleteUser', 'login'].includes(body.op)) dropUserCache();
    const col = await userCol();
    await ensureDefaultAdmin();

    if (body.op === 'login') {
      if (rateLimited(`login:${clientIp(request)}`, 10, 10 * 60_000)) return fail('Too many attempts. Try again in a few minutes.', 429);
      const email = String(body.email ?? '').trim().toLowerCase();
      const user = await col.findOne({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
      if (!user || !verifyPassword(String(body.password ?? ''), user.salt, user.hash)) return fail('Incorrect email or password.', 401);
      if (!user.active) return fail('This account is deactivated. Ask an owner to re-enable it.', 403);
      const lastLoginAt = new Date().toISOString();
      await col.updateOne({ _id: user._id }, { $set: { lastLoginAt } });
      const ttl = body.remember ? 30 * 24 * 3600e3 : 12 * 3600e3;
      return json({ user: publicUser({ ...user, lastLoginAt }) }, 200, { 'Set-Cookie': cookieHeader(makeSession(user._id, ttl), ttl / 1000) });
    }
    if (body.op === 'hint') {
      return json({ show: false }); // credentials come from the environment and are never shown on the page
    }
    if (body.op === 'logout') return json({ ok: true }, 200, { 'Set-Cookie': clearCookieHeader() });

    const me = await getSessionUser(request);
    if (body.op === 'me') return json({ user: me ? publicUser(me) : null });
    if (!me) return fail('Please sign in again.', 401);

    // Everyone may change their own password; everything else here is owner-only.
    if (body.op === 'setPassword' && (me.role === 'owner' || body.id === me._id)) {
      const problem = passwordProblem(body.password);
      if (problem) return fail(problem);
      const salt = newSalt();
      const res = await col.updateOne({ _id: String(body.id) }, { $set: { salt, hash: hashPassword(body.password, salt), usingDefaultPassword: false } });
      return res.matchedCount ? json({ ok: true }) : fail('User not found.', 404);
    }
    if (me.role !== 'owner') return fail('Only owners can manage users.', 403);

    if (body.op === 'listUsers') return json({ users: (await col.find().sort({ createdAt: 1 }).toArray()).map(publicUser) });

    if (body.op === 'createUser') {
      const name = String(body.name ?? '').trim();
      const email = String(body.email ?? '').trim();
      if (!name) return fail('Name is required.');
      if (!validEmail(email)) return fail('Enter a valid email address.');
      if (!ROLES.includes(body.role)) return fail('Invalid role.');
      if (await col.findOne({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') })) return fail('A user with this email already exists.');
      const problem = passwordProblem(body.password);
      if (problem) return fail(problem);
      const salt = newSalt();
      const user: UserDoc = { _id: `usr-${randomBytes(6).toString('hex')}`, name, email, role: body.role, active: true, createdAt: new Date().toISOString(), salt, hash: hashPassword(body.password, salt) };
      await col.insertOne(user);
      return json({ user: publicUser(user) });
    }

    if (body.op === 'updateUser') {
      const id = String(body.id);
      const user = await col.findOne({ _id: id });
      if (!user) return fail('User not found.', 404);
      const patch: Partial<UserDoc> = {};
      const p = (body.patch ?? {}) as Record<string, unknown>;
      if (typeof p.name === 'string') patch.name = p.name.trim();
      if (typeof p.email === 'string') {
        if (!validEmail(p.email)) return fail('Enter a valid email address.');
        const clash = await col.findOne({ _id: { $ne: id }, email: new RegExp(`^${p.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
        if (clash) return fail('Another user already uses this email.');
        patch.email = p.email.trim();
      }
      if (typeof p.role === 'string') { if (!ROLES.includes(p.role)) return fail('Invalid role.'); patch.role = p.role as UserDoc['role']; }
      if (typeof p.active === 'boolean') patch.active = p.active;
      const losesOwner = user.role === 'owner' && ((patch.role && patch.role !== 'owner') || patch.active === false);
      if (losesOwner && (await col.countDocuments({ role: 'owner', active: true })) <= 1) return fail('At least one active owner is required.');
      await col.updateOne({ _id: id }, { $set: patch });
      return json({ user: publicUser({ ...user, ...patch }) });
    }

    if (body.op === 'deleteUser') {
      const id = String(body.id);
      const user = await col.findOne({ _id: id });
      if (!user) return json({ ok: true });
      if (id === me._id) return fail('You cannot delete the account you are signed in with.');
      if (user.role === 'owner' && (await col.countDocuments({ role: 'owner' })) <= 1) return fail('You cannot delete the last owner.');
      await col.deleteOne({ _id: id });
      return json({ ok: true });
    }
    return fail('Unknown request.');
  } catch (e) {
    console.error('[auth]', e);
    return fail('The server could not reach the database. Please try again shortly.', 503);
  }
}
