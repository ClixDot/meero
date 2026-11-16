/**
 * CMS service adapters. Data is stored in MongoDB Atlas through the /api routes (see ../cms/idb.ts),
 * media in Cloudinary, and admin auth is enforced server-side.
 */
import { kv, blobs, emit, uid, clearAll } from '../cms/idb';
import { uploadToCloudinary, deleteFromCloudinary } from './cloudinary';
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
  OnboardingService,
  OnboardingState,
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
   Auth (server-side: password hashing, signed httpOnly session cookie, roles – see /api/auth)
   ====================================================================== */
async function authCall<T = Record<string, never>>(body: Record<string, unknown>): Promise<T> {
  let res: Response;
  try {
    res = await fetch('/api/auth', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data as T;
}

export const localAuth: AuthService = {
  async login(email, password, remember) {
    const { user } = await authCall<{ user: AdminUser }>({ op: 'login', email, password, remember });
    actorName = user.name;
    await log('signed in', 'Admin dashboard');
    return user;
  },
  async logout() {
    await log('signed out', 'Admin dashboard').catch(() => undefined);
    await authCall({ op: 'logout' });
    actorName = 'System';
  },
  async currentUser() {
    const { user } = await authCall<{ user: AdminUser | null }>({ op: 'me' });
    if (user) actorName = user.name;
    return user;
  },
  async defaultLoginHint() {
    return process.env.NODE_ENV !== 'production' && (await authCall<{ show: boolean }>({ op: 'hint' })).show;
  },
  async listUsers() {
    return (await authCall<{ users: AdminUser[] }>({ op: 'listUsers' })).users;
  },
  async createUser(input) {
    const { user } = await authCall<{ user: AdminUser }>({ op: 'createUser', ...input });
    await log('added admin user', user.name, '/admin/users');
    return user;
  },
  async updateUser(id, patch) {
    const { user } = await authCall<{ user: AdminUser }>({ op: 'updateUser', id, patch });
    await log('updated admin user', user.name, '/admin/users');
    return user;
  },
  async setPassword(id, password) {
    await authCall({ op: 'setPassword', id, password });
    await log('changed a password', 'Admin users', '/admin/users');
  },
  async deleteUser(id) {
    await authCall({ op: 'deleteUser', id });
    await log('removed an admin user', 'Admin users', '/admin/users');
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
  { url: 'https://res.cloudinary.com/inu9dzib/image/upload/f_auto,q_auto/meero/images/meero.png', name: 'MEERO logo (white)', alt: 'MEERO Overseas HR Consultancy', folder: 'Brand' },
  { url: 'https://res.cloudinary.com/inu9dzib/image/upload/f_auto,q_auto/meero/images/meero-mark.png', name: 'MEERO fingerprint mark', alt: '', folder: 'Brand' },
  { url: 'https://res.cloudinary.com/inu9dzib/image/upload/f_auto,q_auto/meero/images/meero-logo.png', name: 'MEERO logo', alt: 'MEERO Overseas HR Consultancy', folder: 'Brand' },
  { url: 'https://res.cloudinary.com/inu9dzib/image/upload/f_auto,q_auto/meero/images/meero-logo-dark.png', name: 'MEERO logo (dark)', alt: 'MEERO Overseas HR Consultancy', folder: 'Brand' },
  { url: 'https://res.cloudinary.com/inu9dzib/image/upload/f_auto,q_auto/meero/images/meero-badge.jpg', name: 'MEERO badge', alt: 'MEERO badge', folder: 'Brand' },
  { url: 'https://res.cloudinary.com/inu9dzib/image/upload/f_auto,q_auto/meero/images/credentials/mea-logo-white.png', name: 'Ministry of External Affairs logo', alt: 'Ministry of External Affairs, Government of India', folder: 'Brand' },
  { url: 'https://res.cloudinary.com/inu9dzib/image/upload/f_auto,q_auto/meero/images/hero-bg.jpg', name: 'Home hero background', alt: 'International HR team collaboration', folder: 'Backgrounds' },
  { url: 'https://res.cloudinary.com/inu9dzib/image/upload/f_auto,q_auto/meero/images/business-card.jpg', name: 'Business card', alt: 'MEERO business card', folder: 'Brand' },
  ...['001', '002', '003', '004', '005', '006', '007', '008'].map((n) => ({ url: `https://res.cloudinary.com/inu9dzib/image/upload/f_auto,q_auto/meero/images/posters/job-${n}.jpg`, name: `Hiring poster job-${n}`, alt: `Hiring poster for job ${n}`, folder: 'Posters' })),
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
    return item.url ? item.url : `${MEDIA_PREFIX}${item.id}`;
  },
  async upload(file, opts = {}) {
    checkFile(file);
    const asset = await uploadToCloudinary(file, { onProgress: opts.onProgress });
    const item: MediaItem = {
      id: uid('med'), name: file.name, kind: kindOf(file.type), mime: file.type, size: asset.bytes ?? file.size, alt: opts.alt ?? '',
      folder: opts.folder ?? 'Uploads', source: 'upload', url: asset.url, publicId: asset.publicId, resourceType: asset.resourceType,
      width: asset.width, height: asset.height, createdAt: now(), updatedAt: now(),
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
  async replace(id, file, opts = {}) {
    checkFile(file);
    const list = await getMediaIndex();
    const item = list.find((m) => m.id === id);
    if (!item) throw new Error('File not found.');
    if (item.source === 'linked') {
      throw new Error('Linked site assets cannot be overwritten in the browser. Upload a new file and select it instead.');
    }
    // Same Cloudinary asset id → every page using it picks up the new file. Legacy browser-stored items get a fresh cloud asset.
    const asset = await uploadToCloudinary(file, { publicId: item.publicId, onProgress: opts.onProgress });
    if (!item.publicId) {
      await blobs.del(`media/${id}`);
      const old = urlCache.get(id);
      if (old) { URL.revokeObjectURL(old); urlCache.delete(id); }
    }
    Object.assign(item, {
      mime: file.type, kind: kindOf(file.type), size: asset.bytes ?? file.size, updatedAt: now(),
      url: asset.url, publicId: asset.publicId, resourceType: asset.resourceType, width: asset.width, height: asset.height,
    });
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
    if (item.source === 'upload') {
      if (item.publicId) await deleteFromCloudinary(item.publicId, item.resourceType ?? 'image');
      else await blobs.del(`media/${id}`);
    }
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
  // Intentionally empty: real submissions only. Demo data can be loaded from Settings.
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
    return kv.isDuplicate(email, preferredJob);
  },
  async create(input, cv) {
    const id = uid('app');
    if (cv) await blobs.set(`cv/${id}`, cv);
    const stamp = now();
    const app: Application = {
      ...input, id, code: `MEERO-APP-${Math.floor(100000 + Math.random() * 900000)}`, status: 'new', notes: [], read: false,
      hasCv: !!cv, cvFileName: cv?.name, cvSize: cv?.size, submittedAt: stamp, updatedAt: stamp,
    };
    // The server validates, stores atomically and writes the activity entry (visitors cannot read or edit records).
    return kv.append('applications', app);
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
    const stamp = now();
    const enq: Enquiry = { ...input, id: uid('enq'), status: 'new', notes: [], read: false, createdAt: stamp, updatedAt: stamp };
    return kv.append('enquiries', enq);
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
    return null; // data lives in MongoDB Atlas, not in the browser
  },
};

export type { AdminRole };

/* ---------------- Onboarding ----------------
 * One record per admin under `onboarding:<userId>`. The adapter resolves the admin from the
 * active session itself, so a caller can never read or write another admin's progress.
 * A server adapter must do the same check against the authenticated user.
 */
export const ONBOARDING_VERSION = '1.0.0';

const onboardingDefault = (userId: string): OnboardingState => ({
  userId, version: ONBOARDING_VERSION, status: 'not_started', currentStepId: null, completedSteps: [],
  hideWelcome: false, welcomeSeenForLogin: null, startedAt: null, completedAt: null, updatedAt: null,
});

async function sessionUserId(): Promise<string> {
  const user = await localAuth.currentUser();
  if (!user) throw new Error('Not signed in.');
  return user.id;
}

export const localOnboarding: OnboardingService = {
  async get() {
    const userId = await sessionUserId();
    const saved = await kv.get<OnboardingState>(`onboarding:${userId}`);
    return saved && saved.userId === userId ? { ...onboardingDefault(userId), ...saved } : onboardingDefault(userId);
  },
  async update(patch) {
    const userId = await sessionUserId();
    const current = await localOnboarding.get();
    // userId is not patchable: the record always belongs to the session's admin.
    const next: OnboardingState = { ...current, ...patch, userId, updatedAt: now() };
    await kv.set(`onboarding:${userId}`, next);
    return next;
  },
};
