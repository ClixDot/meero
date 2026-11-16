/** Browser-side Cloudinary helper: signed direct upload (with progress) + server-signed delete. */

export interface CloudAsset {
  publicId: string;
  resourceType: 'image' | 'video' | 'raw';
  url: string;
  width?: number;
  height?: number;
  bytes: number;
}

const OPTIMISED = /^(png|jpe?g|webp|gif|avif)$/i;

/** Version-less, auto-quality delivery URL that keeps the original format/extension. */
function deliveryUrl(secureUrl: string, resourceType: string, format?: string) {
  const clean = secureUrl.replace(/\/v\d+\//, '/');
  return resourceType === 'image' && format && OPTIMISED.test(format) ? clean.replace('/upload/', '/upload/q_auto/') : clean;
}

export async function uploadToCloudinary(file: File, opts: { publicId?: string; onProgress?: (pct: number) => void } = {}): Promise<CloudAsset> {
  const signRes = await fetch('/api/media/sign', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publicId: opts.publicId }),
  });
  const sign = await signRes.json().catch(() => ({}));
  if (!signRes.ok) throw new Error(sign.error || 'Could not start the upload. Please try again.');

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sign.apiKey);
  form.append('signature', sign.signature);
  for (const [k, v] of Object.entries(sign.params)) form.append(k, String(v));

  return new Promise<CloudAsset>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) opts.onProgress?.(Math.round((e.loaded / e.total) * 100)); };
    xhr.onerror = () => reject(new Error('Network error while uploading. Check your connection and try again.'));
    xhr.onload = () => {
      let json: Record<string, any> = {};
      try { json = JSON.parse(xhr.responseText); } catch { /* ignore */ }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          publicId: json.public_id, resourceType: json.resource_type, bytes: json.bytes,
          url: deliveryUrl(json.secure_url, json.resource_type, json.format), width: json.width, height: json.height,
        });
      } else reject(new Error(json.error?.message || 'Upload failed.'));
    };
    xhr.send(form);
  });
}

export async function deleteFromCloudinary(publicId: string, resourceType: string) {
  await fetch('/api/media/delete', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publicId, resourceType }),
  }).catch(() => undefined);
}
