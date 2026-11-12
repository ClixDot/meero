/**
 * Minimal IndexedDB wrapper used by the local persistence adapters.
 * Two object stores:
 *   kv    – JSON documents (content, records, users, settings)
 *   blobs – binary files (media library uploads, candidate CVs)
 *
 * This is the only module that touches IndexedDB. Replacing the local adapters
 * with MongoDB / Cloudinary implementations never requires changing callers.
 */

const DB_NAME = 'meero-cms';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available in this browser.'));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
        if (!db.objectStoreNames.contains('blobs')) db.createObjectStore('blobs');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        dbPromise = null;
        reject(req.error ?? new Error('Could not open the local database.'));
      };
    });
  }
  return dbPromise;
}

type StoreName = 'kv' | 'blobs';

async function run<T>(store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const req = fn(tx.objectStore(store));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Local database request failed.'));
    tx.onabort = () => reject(tx.error ?? new Error('Local database transaction aborted (storage may be full).'));
  });
}

export const kv = {
  get<T = unknown>(key: string): Promise<T | undefined> {
    return run<T>('kv', 'readonly', (s) => s.get(key) as IDBRequest<T>);
  },
  async set<T>(key: string, value: T): Promise<void> {
    await run('kv', 'readwrite', (s) => s.put(value, key));
  },
  async del(key: string): Promise<void> {
    await run('kv', 'readwrite', (s) => s.delete(key));
  },
  keys(): Promise<string[]> {
    return run<IDBValidKey[]>('kv', 'readonly', (s) => s.getAllKeys()).then((k) => k.map(String));
  },
};

export const blobs = {
  get(key: string): Promise<Blob | undefined> {
    return run<Blob>('blobs', 'readonly', (s) => s.get(key) as IDBRequest<Blob>);
  },
  async set(key: string, value: Blob): Promise<void> {
    await run('blobs', 'readwrite', (s) => s.put(value, key));
  },
  async del(key: string): Promise<void> {
    await run('blobs', 'readwrite', (s) => s.delete(key));
  },
};

export async function clearAll(): Promise<void> {
  await run('kv', 'readwrite', (s) => s.clear());
  await run('blobs', 'readwrite', (s) => s.clear());
}

/** Cross-tab change notifications (admin tab -> public site tab / preview iframe). */
const CHANNEL = 'meero-cms';
let channel: BroadcastChannel | null = null;
const localListeners = new Set<(msg: CmsEvent) => void>();

export type CmsEvent = { type: 'content' | 'media' | 'records'; key?: string };

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = (e) => localListeners.forEach((l) => l(e.data));
  }
  return channel;
}

export function emit(event: CmsEvent) {
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
