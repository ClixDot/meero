/**
 * Client for the CMS storage API (MongoDB Atlas behind /api/store and /api/blob).
 *   kv    - JSON documents (content, records, settings)
 *   blobs - binary files (candidate CVs)
 *
 * This is the only client module that talks to the storage backend. The server decides who may read or write
 * each key (visitors: published content + form submissions only; admins: by role), so nothing here is trusted.
 */

async function api(url: string, init?: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...init });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || (res.status === 401 ? 'Your session has expired. Please sign in again.' : 'Something went wrong. Please try again.'));
  }
  return res;
}

const jsonInit = (method: string, body: unknown): RequestInit => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

/** Site content is fetched once per burst (one request for every content document) instead of once per key. */
let contentCache: { at: number; data: Promise<Record<string, unknown>> } | null = null;
const CONTENT_TTL = 3000;
const dropContentCache = () => { contentCache = null; };

function allContent(): Promise<Record<string, unknown>> {
  if (!contentCache || Date.now() - contentCache.at > CONTENT_TTL) {
    const data = api('/api/store?prefix=content%3A').then((r) => r.json() as Promise<Record<string, unknown>>);
    data.catch(dropContentCache);
    contentCache = { at: Date.now(), data };
  }
  return contentCache.data;
}

/** Identical reads made at nearly the same moment (several dashboard widgets) share one request. */
const inflight = new Map<string, { at: number; p: Promise<unknown> }>();
const SHARE_MS = 1500;

export const kv = {
  async get<T = unknown>(key: string): Promise<T | undefined> {
    if (key.startsWith('content:')) return ((await allContent())[key] ?? undefined) as T | undefined;
    const hit = inflight.get(key);
    if (hit && Date.now() - hit.at < SHARE_MS) return (await hit.p) as T | undefined;
    const p = api(`/api/store?key=${encodeURIComponent(key)}`).then((r) => r.json()).then(({ value }) => (value ?? undefined) as T | undefined);
    inflight.set(key, { at: Date.now(), p });
    p.catch(() => inflight.delete(key));
    return p;
  },
  async set<T>(key: string, value: T): Promise<void> {
    inflight.delete(key);
    await api('/api/store', jsonInit('PUT', { key, value }));
    if (key.startsWith('content:')) dropContentCache();
  },
  async del(key: string): Promise<void> {
    inflight.delete(key);
    await api(`/api/store?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
    if (key.startsWith('content:')) dropContentCache();
  },
  async keys(): Promise<string[]> {
    return (await api('/api/store?keys=1')).json();
  },
  /** Atomically add a record on the server (used by the public forms). Returns the stored record. */
  async append<T>(key: 'applications' | 'enquiries', item: T): Promise<T> {
    inflight.delete(key);
    const { item: stored } = await (await api('/api/store', jsonInit('POST', { op: 'append', key, item }))).json();
    return stored as T;
  },
  /** One-call audit entry (server pushes it atomically). */
  async logActivity(entry: { id: string; action: string; target: string; href?: string }): Promise<void> {
    inflight.delete('activity');
    await api('/api/store', jsonInit('POST', { op: 'log', entry }));
  },
  async markAllRead(key: 'applications' | 'enquiries'): Promise<void> {
    inflight.delete(key);
    await api('/api/store', jsonInit('POST', { op: 'markRead', key }));
  },
  async isDuplicate(email: string, preferredJob: string): Promise<boolean> {
    const { duplicate } = await (await api('/api/store', jsonInit('POST', { op: 'duplicate', email, preferredJob }))).json();
    return !!duplicate;
  },
};

export const blobs = {
  async get(key: string): Promise<Blob | undefined> {
    try { return await (await api(`/api/blob?key=${encodeURIComponent(key)}`)).blob(); } catch { return undefined; }
  },
  async set(key: string, file: File): Promise<void> {
    await api(`/api/blob?key=${encodeURIComponent(key)}`, {
      method: 'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-File-Name': encodeURIComponent(file.name) }, body: file,
    });
  },
  async del(key: string): Promise<void> {
    await api(`/api/blob?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
  },
};

export async function clearAll(): Promise<void> {
  await api('/api/store', jsonInit('POST', { op: 'clear' }));
  dropContentCache();
}

/** Same-browser change notifications (admin tab -> public site tab / preview iframe). */
const CHANNEL = 'meero-cms';
let channel: BroadcastChannel | null = null;
const localListeners = new Set<(msg: CmsEvent) => void>();

export type CmsEvent = { type: 'content' | 'media' | 'records'; key?: string };

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = (e) => {
      if (e.data?.type === 'content') dropContentCache();
      localListeners.forEach((l) => l(e.data));
    };
  }
  return channel;
}

export function emit(event: CmsEvent) {
  if (event.type === 'content') dropContentCache();
  getChannel()?.postMessage(event);
  localListeners.forEach((l) => l(event));
}

export function subscribe(listener: (msg: CmsEvent) => void): () => void {
  getChannel();
  localListeners.add(listener);
  return () => localListeners.delete(listener);
}

export function uid(prefix = 'id'): string {
  const rand = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}
