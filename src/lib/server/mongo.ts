import { MongoClient, type Db } from 'mongodb';

/** Server-only MongoDB access. The client is cached on globalThis so dev hot-reloads reuse one connection pool. */
const g = globalThis as unknown as { __meeroMongo?: Promise<MongoClient> };

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set.');
  if (!g.__meeroMongo) {
    g.__meeroMongo = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000, ignoreUndefined: true }).connect().catch((e) => {
      g.__meeroMongo = undefined;
      throw e;
    });
  }
  return (await g.__meeroMongo).db(process.env.MONGODB_DB || 'meero');
}

export interface KvDoc { _id: string; value: unknown; updatedAt: Date }
export interface BlobDoc { _id: string; type: string; name: string; data: Buffer; createdAt: Date }
export interface UserDoc {
  _id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
  usingDefaultPassword?: boolean;
  salt: string;
  hash: string;
}

export const kvCol = async () => (await getDb()).collection<KvDoc>('kv');
export const blobCol = async () => (await getDb()).collection<BlobDoc>('blobs');
export const userCol = async () => (await getDb()).collection<UserDoc>('users');
