// Uploads everything in public/images to Cloudinary (public_id = meero/images/<path without ext>).
// Usage: node --env-file=.env.local scripts/upload-to-cloudinary.mjs
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, extname, sep } from 'node:path';

const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = process.env;
if (!cloud || !key || !secret) throw new Error('Missing Cloudinary env vars');

const root = join(process.cwd(), 'public', 'images');
const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

for (const file of walk(root)) {
  const rel = relative(root, file).split(sep).join('/');
  if (rel.includes('.backup.') || rel.includes(' ')) { console.log('skip', rel); continue; }
  const publicId = `meero/images/${rel.slice(0, -extname(rel).length)}`;
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `overwrite=true&public_id=${publicId}&timestamp=${timestamp}${secret}`;
  const signature = createHash('sha1').update(toSign).digest('hex');
  const form = new FormData();
  form.append('file', new Blob([readFileSync(file)]), rel);
  form.append('public_id', publicId);
  form.append('overwrite', 'true');
  form.append('timestamp', String(timestamp));
  form.append('api_key', key);
  form.append('signature', signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body: form });
  const json = await res.json();
  console.log(res.ok ? 'ok  ' : 'FAIL', rel, res.ok ? json.secure_url : JSON.stringify(json));
}
