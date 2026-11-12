/**
 * Local (browser) adapters for every CMS service, persisted in IndexedDB.
 *
 * IMPORTANT: this is a development / staging adapter. Data lives only in the
 * current browser profile and admin auth is enforced client-side only.
 * Phase 2 replaces these with server-side MongoDB + Cloudinary adapters.
 */
import { kv, blobs, emit, uid, clearAll } from '../cms/idb';
import {
  contentKeys,
  contentLabels,
  getDefault,
  mergeWithDefault,
  type ContentKey,
  type ContentMap,
} from '../cms/defaults';
import type {
  ActivityEntry,
  AdminRole,
  AdminUser,
  Application,
  ApplicationsService,
  AuthService,
  CareersService,
  ContentDocMeta,
  ContentService,
  EnquiriesService,
  Enquiry,
  MediaItem,
  MediaKind,
  MediaService,
  MediaUsage,
  SettingsService,
} from './types';
import { sampleApplications, sampleEnquiries } from './sampleData';

const now = () => new Date().toISOString();

/* ======================================================================
   Activity log
   ====================================================================== */
let actorName = 'System';

async function log(action: string, target: string, href?: string) {
  const list = ((await kv.get<ActivityEntry[]>('activity')) ?? []).slice(0, 199);
  list.unshift({ id: uid('act'), at: now(), actor: actorName, action, target, href });
  await kv.set('activity', list);
  emit({ type: 'records', key: 'activity' });
}

/* ======================================================================
   Auth
   ====================================================================== */
type StoredUser = AdminUser & { hash: string; salt: string };
type Session = { userId: string; expiresAt: number };

export const DEFAULT_ADMIN = { email: 'admin@meerohr.com', password: 'Meero@2026' };

const toHex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');

async function hashPassword(password: string, salt: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Secure context required: open the admin over https:// or http://localhost.');
  }
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: 120_000 },
    key,
    256,
  );
  return toHex(bits);
}

const publicUser = ({ hash: _h, salt: _s, ...u }: StoredUser): AdminUser => u;

async function getUsers(): Promise<StoredUser[]> {
  let users = await kv.get<StoredUser[]>('auth:users');
  if (!users || users.length === 0) {
    const salt = uid('salt');
    users = [{
      id: uid('usr'),
      name: 'MEERO Admin',
      email: DEFAULT_ADMIN.email,
      role: 'owner',
      active: true,
      createdAt: now(),
      usingDefaultPassword: true,
      salt,
      hash: await hashPassword(DEFAULT_ADMIN.password, salt),
    }];
    await kv.set('auth:users', users);
  }
  return users;
}

function validatePassword(pw: string) {
  if (pw.length < 8) throw new Error('Password must be at least 8 characters.');
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) throw new Error('Password must contain letters and numbers.');
}

const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export const localAuth: AuthService = {
  async login(email, password, remember) {
    const users = await getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || (await hashPassword(password, user.salt)) !== user.hash) {
      throw new Error('Incorrect email or password.');
    }
    if (!user.active) throw new Error('This account is deactivated. Ask an owner to re-enable it.');
    user.lastLoginAt = now();
    await kv.set('auth:users', users);
    const ttl = remember ? 30 * 24 * 3600e3 : 12 * 3600e3;
    await kv.set<Session>('auth:session', { userId: user.id, expiresAt: Date.now() + ttl });
    actorName = user.name;
    await log('signed in', 'Admin dashboard');
    return publicUser(user);
  },
  async logout() {
    await log('signed out', 'Admin dashboard');
    await kv.del('auth:session');
    actorName = 'System';
  },
  async currentUser() {
    const session = await kv.get<Session>('auth:session');
    if (!session || session.expiresAt < Date.now()) return null;
    const user = (await getUsers()).find((u) => u.id === session.userId && u.active);
    if (!user) return null;
    actorName = user.name;
    return publicUser(user);
  },
  async listUsers() {
    return (await getUsers()).map(publicUser);
  },
  async createUser({ name, email, role, password }) {
    const users = await getUsers();
    if (!name.trim()) throw new Error('Name is required.');
    if (!validEmail(email)) throw new Error('Enter a valid email address.');
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) throw new Error('A user with this email already exists.');
    validatePassword(password);
    const salt = uid('salt');
    const user: StoredUser = { id: uid('usr'), name: name.trim(), email: email.trim(), role, active: true, createdAt: now(), salt, hash: await hashPassword(password, salt) };
    users.push(user);
    await kv.set('auth:users', users);
    await log('added admin user', user.name, '/admin/users');
    return publicUser(user);
  },
  async updateUser(id, patch) {
    const users = await getUsers();
    const user = users.find((u) => u.id === id);
    if (!user) throw new Error('User not found.');
    if (patch.email !== undefined) {
      if (!validEmail(patch.email)) throw new Error('Enter a valid email address.');
      if (users.some((u) => u.id !== id && u.email.toLowerCase() === patch.email!.toLowerCase())) throw new Error('Another user already uses this email.');
    }
    const owners = users.filter((u) => u.role === 'owner' && u.active);
    const losesOwner = user.role === 'owner' && ((patch.role && patch.role !== 'owner') || patch.active === false);
    if (losesOwner && owners.length <= 1) throw new Error('At least one active owner is required.');
    Object.assign(user, patch);
    await kv.set('auth:users', users);
    await log('updated admin user', user.name, '/admin/users');
    return publicUser(user);
  },
  async setPassword(id, password) {
    validatePassword(password);
    const users = await getUsers();
    const user = users.find((u) => u.id === id);
    if (!user) throw new Error('User not found.');
    user.salt = uid('salt');
    user.hash = await hashPassword(password, user.salt);
    user.usingDefaultPassword = false;
    await kv.set('auth:users', users);
    await log('changed password for', user.name, '/admin/users');
  },
  async deleteUser(id) {
    const users = await getUsers();
    const user = users.find((u) => u.id === id);
    if (!user) return;
    if (user.role === 'owner' && users.filter((u) => u.role === 'owner').length <= 1) throw new Error('You cannot delete the last owner.');
    const session = await kv.get<Session>('auth:session');
    if (session?.userId === id) throw new Error('You cannot delete the account you are signed in with.');
    await kv.set('auth:users', users.filter((u) => u.id !== id));
    await log('removed admin user', user.name, '/admin/users');
  },
};

/* ======================================================================
   Content (draft / publish)
   ====================================================================== */
type StoredDoc = {
  draft?: unknown;
  published?: unknown;
  updatedAt?: string;
  updatedBy?: string;
  publishedAt?: string;
  publishedBy?: string;
};

const docKey = (k: ContentKey) => `content:${k}`;

function metaOf(key: ContentKey, doc?: StoredDoc): ContentDocMeta {
  const hasDraft = doc?.draft !== undefined;
  return {
    key,
    hasDraft,
    status: hasDraft ? 'draft' : doc?.published !== undefined ? 'published' : 'default',
    updatedAt: doc?.updatedAt,
    updatedBy: doc?.updatedBy,
    publishedAt: doc?.publishedAt,
    publishedBy: doc?.publishedBy,
  };
}

const contentHref = (key: ContentKey) => ({
  home: '/admin/home', about: '/admin/about', servicesPage: '/admin/services', services: '/admin/services',
  careersPage: '/admin/careers', jobs: '/admin/jobs', contactPage: '/admin/contact', company: '/admin/contact',
  galleryPage: '/admin/gallery', gallery: '/admin/gallery', faqs: '/admin/content', steps: '/admin/content',
  headerFooter: '/admin/header-footer', seo: '/admin/seo', design: '/admin/design', general: '/admin/settings',
}[key]);

export const localContent: ContentService = {
  async getEditable(key) {
    const doc = await kv.get<StoredDoc>(docKey(key));
    const raw = doc?.draft ?? doc?.published;
    return { value: mergeWithDefault(getDefault(key), raw), meta: metaOf(key, doc) };
  },
  async getLive(key, preview = false) {
    const doc = await kv.get<StoredDoc>(docKey(key));
    const raw = preview ? doc?.draft ?? doc?.published : doc?.published;
    return mergeWithDefault(getDefault(key), raw);
  },
  async saveDraft(key, value) {
    const doc = (await kv.get<StoredDoc>(docKey(key))) ?? {};
    doc.draft = value;
    doc.updatedAt = now();
    doc.updatedBy = actorName;
    await kv.set(docKey(key), doc);
    emit({ type: 'content', key });
    await log('saved a draft of', contentLabels[key], contentHref(key));
    return metaOf(key, doc);
  },
  async publish(key, value) {
    const doc = (await kv.get<StoredDoc>(docKey(key))) ?? {};
    const next = value ?? doc.draft ?? doc.published;
    if (next === undefined) return metaOf(key, doc);
    doc.published = next;
    delete doc.draft;
    doc.updatedAt = doc.publishedAt = now();
    doc.updatedBy = doc.publishedBy = actorName;
    await kv.set(docKey(key), doc);
    emit({ type: 'content', key });
    await log('published', contentLabels[key], contentHref(key));
    return metaOf(key, doc);
  },
  async discardDraft(key) {
    const doc = (await kv.get<StoredDoc>(docKey(key))) ?? {};
    delete doc.draft;
    await kv.set(docKey(key), doc);
    emit({ type: 'content', key });
    await log('discarded the draft of', contentLabels[key], contentHref(key));
    return metaOf(key, doc);
  },
  async resetToDefault(key) {
    await kv.del(docKey(key));
    emit({ type: 'content', key });
    await log('restored original content for', contentLabels[key], contentHref(key));
    return metaOf(key, undefined);
  },
  async listMeta() {
    return Promise.all(contentKeys.map(async (k) => metaOf(k, await kv.get<StoredDoc>(docKey(k)))));
  },
};

/* ======================================================================
   Media
   ====================================================================== */
const MEDIA_PREFIX = 'media:';

const kindOf = (mime: string): MediaKind => (mime.startsWith('image/') ? 'image' : mime.startsWith('video/') ? 'video' : 'document');

const seedAssets: Array<{ url: string; name: string; alt: string; folder: string }> = [
  { url: '/images/meero.png', name: 'MEERO logo (white)', alt: 'MEERO Overseas HR Consultancy', folder: 'Brand' },
  { url: '/images/meero-mark.png', name: 'MEERO fingerprint mark', alt: '', folder: 'Brand' },
  { url: '/images/meero-logo.png', name: 'MEERO logo', alt: 'MEERO Overseas HR Consultancy', folder: 'Brand' },
  { url: '/images/meero-logo-dark.png', name: 'MEERO logo (dark)', alt: 'MEERO Overseas HR Consultancy', folder: 'Brand' },
  { url: '/images/meero-badge.jpg', name: 'MEERO badge', alt: 'MEERO badge', folder: 'Brand' },
  { url: '/images/credentials/mea-logo-white.png', name: 'Ministry of External Affairs logo', alt: 'Ministry of External Affairs, Government of India', folder: 'Brand' },
  { url: '/images/hero-bg.jpg', name: 'Home hero background', alt: 'International HR team collaboration', folder: 'Backgrounds' },
  { url: '/images/business-card.jpg', name: 'Business card', alt: 'MEERO business card', folder: 'Brand' },
  ...['001', '002', '003', '004', '005', '006', '007', '008'].map((n) => ({ url: `/images/posters/job-${n}.jpg`, name: `Hiring poster job-${n}`, alt: `Hiring poster for job ${n}`, folder: 'Posters' })),
];

async function getMediaIndex(): Promise<MediaItem[]> {
  let list = await kv.get<MediaItem[]>('media:index');
  if (!list) {
    list = seedAssets.map((a) => ({
      id: uid('med'), name: a.name, kind: 'image' as MediaKind, mime: a.url.endsWith('.png') ? 'image/png' : 'image/jpeg',
      size: 0, alt: a.alt, folder: a.folder, source: 'linked' as const, url: a.url, createdAt: now(), updatedAt: now(),
    }));
    await kv.set('media:index', list);
  }
  return list;
}

const urlCache = new Map<string, string>();

function imageSize(file: Blob): Promise<{ width?: number; height?: number }> {
  if (!file.type.startsWith('image/')) return Promise.resolve({});
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url); };
    img.onerror = () => { resolve({}); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

const MAX_UPLOAD = 50 * 1024 * 1024;
const ALLOWED = /^(image\/(png|jpe?g|webp|gif|svg\+xml|avif)|video\/(mp4|webm|quicktime)|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/;

function checkFile(file: File) {
  if (!ALLOWED.test(file.type)) throw new Error(`"${file.name}" is not a supported type. Use images, MP4/WebM video, PDF or Word files.`);
  if (file.size > MAX_UPLOAD) throw new Error(`"${file.name}" is larger than 50 MB.`);
}

function findRefs(value: unknown, needles: string[], path: string, out: string[]) {
  if (typeof value === 'string') {
    if (needles.includes(value)) out.push(path || '(root)');
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => findRefs(v, needles, `${path}[${i}]`, out));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) findRefs(v, needles, path ? `${path}.${k}` : k, out);
  }
}

export const localMedia: MediaService = {
  list: getMediaIndex,
  refFor(item) {
    return item.source === 'linked' && item.url ? item.url : `${MEDIA_PREFIX}${item.id}`;
  },
  async upload(file, opts = {}) {
    checkFile(file);
    const id = uid('med');
    await blobs.set(`media/${id}`, file);
    const item: MediaItem = {
      id, name: file.name, kind: kindOf(file.type), mime: file.type, size: file.size, alt: opts.alt ?? '',
      folder: opts.folder ?? 'Uploads', source: 'upload', createdAt: now(), updatedAt: now(), ...(await imageSize(file)),
    };
    const list = await getMediaIndex();
    list.unshift(item);
    await kv.set('media:index', list);
    emit({ type: 'media' });
    await log('uploaded', item.name, '/admin/media');
    return item;
  },
  async addLink(url, opts = {}) {
    if (!/^(https?:\/\/|\/)/.test(url.trim())) throw new Error('Enter a full URL (https://…) or a site path starting with /.');
    const kind = opts.kind ?? (/\.(mp4|webm|mov)(\?|$)/i.test(url) ? 'video' : /\.(pdf|docx?)(\?|$)/i.test(url) ? 'document' : 'image');
    const item: MediaItem = {
      id: uid('med'), name: opts.name || url.split('/').pop()?.split('?')[0] || 'Linked file', kind, mime: '', size: 0,
      alt: opts.alt ?? '', folder: 'Linked', source: 'linked', url: url.trim(), createdAt: now(), updatedAt: now(),
    };
    const list = await getMediaIndex();
    list.unshift(item);
    await kv.set('media:index', list);
    emit({ type: 'media' });
    await log('linked', item.name, '/admin/media');
    return item;
  },
  async replace(id, file) {
    checkFile(file);
    const list = await getMediaIndex();
    const item = list.find((m) => m.id === id);
    if (!item) throw new Error('File not found.');
    if (item.source === 'linked') {
      throw new Error('Linked site assets cannot be overwritten in the browser. Upload a new file and select it instead.');
    }
    await blobs.set(`media/${id}`, file);
    const old = urlCache.get(id);
    if (old) { URL.revokeObjectURL(old); urlCache.delete(id); }
    Object.assign(item, { mime: file.type, kind: kindOf(file.type), size: file.size, updatedAt: now(), width: undefined, height: undefined }, await imageSize(file));
    await kv.set('media:index', list);
    emit({ type: 'media' });
    await log('replaced', item.name, '/admin/media');
    return item;
  },
  async update(id, patch) {
    const list = await getMediaIndex();
    const item = list.find((m) => m.id === id);
    if (!item) throw new Error('File not found.');
    Object.assign(item, patch, { updatedAt: now() });
    await kv.set('media:index', list);
    emit({ type: 'media' });
    return item;
  },
  async remove(id) {
    const list = await getMediaIndex();
    const item = list.find((m) => m.id === id);
    if (!item) return;
    if (item.source === 'upload') await blobs.del(`media/${id}`);
    await kv.set('media:index', list.filter((m) => m.id !== id));
    emit({ type: 'media' });
    await log('deleted', item.name, '/admin/media');
  },
  async resolve(ref) {
    if (!ref || !ref.startsWith(MEDIA_PREFIX)) return ref;
    const id = ref.slice(MEDIA_PREFIX.length);
    const cached = urlCache.get(id);
    if (cached) return cached;
    const blob = await blobs.get(`media/${id}`);
    if (!blob) return '';
    const url = URL.createObjectURL(blob);
    urlCache.set(id, url);
    return url;
  },
  async usage(id) {
    const item = (await getMediaIndex()).find((m) => m.id === id);
    if (!item) return [];
    const needles = [`${MEDIA_PREFIX}${id}`, ...(item.url ? [item.url] : [])];
    const out: MediaUsage[] = [];
    for (const key of contentKeys) {
      const doc = await kv.get<StoredDoc>(docKey(key));
      const paths: string[] = [];
      findRefs(doc?.draft ?? doc?.published ?? getDefault(key), needles, '', paths);
      paths.forEach((p) => out.push({ key, label: contentLabels[key], path: p }));
    }
    return out;
  },
};

/* ======================================================================
   Careers (job listings live in the `jobs` content document)
   ====================================================================== */
export const localCareers: CareersService = {
  async list() {
    return (await localContent.getEditable('jobs')).value;
  },
  async save(jobs, publish) {
    if (publish) await localContent.publish('jobs', jobs);
    else await localContent.saveDraft('jobs', jobs);
  },
};

/* ======================================================================
   Applications & enquiries
   ====================================================================== */
async function ensureSamples() {
  if (await kv.get('records:seeded')) return;
  await kv.set('applications', sampleApplications());
  await kv.set('enquiries', sampleEnquiries());
  await kv.set('records:seeded', true);
}

async function listOf<T>(key: 'applications' | 'enquiries'): Promise<T[]> {
  await ensureSamples();
  return (await kv.get<T[]>(key)) ?? [];
}

async function saveList<T>(key: 'applications' | 'enquiries', list: T[]) {
  await kv.set(key, list);
  emit({ type: 'records', key });
}

export const localApplications: ApplicationsService = {
  async list() {
    return (await listOf<Application>('applications')).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  },
  async isDuplicate(email, preferredJob) {
    const list = await listOf<Application>('applications');
    const cutoff = Date.now() - 7 * 24 * 3600e3;
    return list.some((a) => !a.sample && a.email.toLowerCase() === email.toLowerCase() && a.preferredJob === preferredJob && Date.parse(a.submittedAt) > cutoff);
  },
  async create(input, cv) {
    const list = await listOf<Application>('applications');
    const id = uid('app');
    if (cv) await blobs.set(`cv/${id}`, cv);
    const app: Application = {
      ...input, id, code: `MEERO-APP-${Math.floor(100000 + Math.random() * 900000)}`, status: 'new', notes: [], read: false,
      hasCv: !!cv, cvFileName: cv?.name, cvSize: cv?.size, submittedAt: now(), updatedAt: now(),
    };
    list.push(app);
    await saveList('applications', list);
    const prev = actorName; actorName = app.fullName;
    await log('submitted an application for', app.preferredJob || 'General pool', '/admin/applications');
    actorName = prev;
    return app;
  },
  async update(id, patch) {
    const list = await listOf<Application>('applications');
    const app = list.find((a) => a.id === id);
    if (!app) throw new Error('Application not found.');
    const statusChanged = patch.status && patch.status !== app.status;
    Object.assign(app, patch, { updatedAt: now() });
    await saveList('applications', list);
    if (statusChanged) await log(`moved to "${patch.status}"`, app.fullName, '/admin/applications');
    return app;
  },
  async addNote(id, text) {
    if (!text.trim()) throw new Error('Note cannot be empty.');
    const list = await listOf<Application>('applications');
    const app = list.find((a) => a.id === id);
    if (!app) throw new Error('Application not found.');
    app.notes.push({ id: uid('note'), text: text.trim(), at: now(), by: actorName });
    app.updatedAt = now();
    await saveList('applications', list);
    return app;
  },
  async remove(id) {
    const list = await listOf<Application>('applications');
    const app = list.find((a) => a.id === id);
    await blobs.del(`cv/${id}`);
    await saveList('applications', list.filter((a) => a.id !== id));
    if (app) await log('deleted application from', app.fullName, '/admin/applications');
  },
  async cvUrl(id) {
    const blob = await blobs.get(`cv/${id}`);
    return blob ? URL.createObjectURL(blob) : null;
  },
};

export const localEnquiries: EnquiriesService = {
  async list() {
    return (await listOf<Enquiry>('enquiries')).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async create(input) {
    const list = await listOf<Enquiry>('enquiries');
    const enq: Enquiry = { ...input, id: uid('enq'), status: 'new', notes: [], read: false, createdAt: now(), updatedAt: now() };
    list.push(enq);
    await saveList('enquiries', list);
    const prev = actorName; actorName = enq.name;
    await log('sent an enquiry', 'Contact form', '/admin/enquiries');
    actorName = prev;
    return enq;
  },
  async update(id, patch) {
    const list = await listOf<Enquiry>('enquiries');
    const enq = list.find((e) => e.id === id);
    if (!enq) throw new Error('Enquiry not found.');
    const statusChanged = patch.status && patch.status !== enq.status;
    Object.assign(enq, patch, { updatedAt: now() });
    await saveList('enquiries', list);
    if (statusChanged) await log(`marked enquiry "${patch.status}" from`, enq.name, '/admin/enquiries');
    return enq;
  },
  async addNote(id, text) {
    if (!text.trim()) throw new Error('Note cannot be empty.');
    const list = await listOf<Enquiry>('enquiries');
    const enq = list.find((e) => e.id === id);
    if (!enq) throw new Error('Enquiry not found.');
    enq.notes.push({ id: uid('note'), text: text.trim(), at: now(), by: actorName });
    enq.updatedAt = now();
    await saveList('enquiries', list);
    return enq;
  },
  async remove(id) {
    const list = await listOf<Enquiry>('enquiries');
    const enq = list.find((e) => e.id === id);
    await saveList('enquiries', list.filter((e) => e.id !== id));
    if (enq) await log('deleted enquiry from', enq.name, '/admin/enquiries');
  },
};

/* ======================================================================
   Settings / maintenance
   ====================================================================== */
export const localSettings: SettingsService = {
  async activity(limit = 50) {
    return ((await kv.get<ActivityEntry[]>('activity')) ?? []).slice(0, limit);
  },
  log,
  async seedSampleData() {
    const apps = await listOf<Application>('applications');
    const enqs = await listOf<Enquiry>('enquiries');
    await saveList('applications', [...apps.filter((a) => !a.sample), ...sampleApplications()]);
    await saveList('enquiries', [...enqs.filter((e) => !e.sample), ...sampleEnquiries()]);
    await log('loaded sample records', 'Applications & enquiries', '/admin/settings');
  },
  async clearSampleData() {
    const apps = await listOf<Application>('applications');
    const enqs = await listOf<Enquiry>('enquiries');
    const removed = apps.filter((a) => a.sample).length + enqs.filter((e) => e.sample).length;
    await saveList('applications', apps.filter((a) => !a.sample));
    await saveList('enquiries', enqs.filter((e) => !e.sample));
    await log('cleared sample records', 'Applications & enquiries', '/admin/settings');
    return removed;
  },
  async exportAll() {
    const out: Record<string, unknown> = { exportedAt: now() };
    for (const key of await kv.keys()) {
      if (key.startsWith('auth:')) continue;
      out[key] = await kv.get(key);
    }
    return out;
  },
  async resetEverything() {
    await clearAll();
    urlCache.forEach((u) => URL.revokeObjectURL(u));
    urlCache.clear();
    emit({ type: 'content' });
    emit({ type: 'media' });
    emit({ type: 'records' });
  },
  async storageEstimate() {
    if (!navigator.storage?.estimate) return null;
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return { usage, quota };
  },
};

export type { AdminRole };
