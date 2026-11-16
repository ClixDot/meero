'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FileText, Film, ImageIcon, Link2, Search, UploadCloud, Check } from 'lucide-react';
import { services, type MediaItem, type MediaKind } from '../../lib/services';
import { subscribe } from '../../lib/cms/idb';
import { Button, cx, Input, Modal, Spinner, Tabs, EmptyState, formatBytes } from '../ui/kit';
import { useToast } from '../ui/toast';

/** Resolve a stored media reference to a displayable URL. */
export function useMediaUrl(ref?: string) {
  const [url, setUrl] = useState<string>(ref && !ref.startsWith('media:') ? ref : '');
  useEffect(() => {
    let alive = true;
    if (!ref) { setUrl(''); return; }
    services.media.resolve(ref).then((u) => alive && setUrl(u)).catch(() => alive && setUrl(''));
    return () => { alive = false; };
  }, [ref]);
  return url;
}

export function MediaThumb({ refValue, kind, className, alt = '' }: { refValue?: string; kind?: MediaKind; className?: string; alt?: string }) {
  const url = useMediaUrl(refValue);
  const k = kind ?? (refValue && /\.(mp4|webm|mov)(\?|$)/i.test(refValue) ? 'video' : refValue && /\.(pdf|docx?)(\?|$)/i.test(refValue) ? 'document' : 'image');
  if (!refValue) return <div className={cx('flex items-center justify-center bg-[#F2F6F5] text-[#B4BCBE]', className)}><ImageIcon className="w-6 h-6" /></div>;
  if (!url) return <div className={cx('flex items-center justify-center bg-[#F2F6F5]', className)}><Spinner className="w-4 h-4" /></div>;
  if (k === 'video') return <video src={url} className={cx('object-cover bg-black', className)} muted playsInline preload="metadata" />;
  if (k === 'document') return <div className={cx('flex items-center justify-center bg-[#F2F6F5] text-[#168F88]', className)}><FileText className="w-7 h-7" /></div>;
  // Transparent PNG/SVG logos (often white) get a dark backdrop so they stay visible.
  const transparent = /\.(png|svg)(\?|$)/i.test(refValue);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className={cx(transparent ? 'object-contain p-3 bg-[#1F272A]' : 'object-cover', className)} loading="lazy" />;
}

export function useMediaList() {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const load = useCallback(() => services.media.list().then(setItems).catch(() => setItems([])), []);
  useEffect(() => {
    load();
    return subscribe((e) => e.type === 'media' && load());
  }, [load]);
  return { items, reload: load };
}

export function UploadButton({ accept, onUploaded, multiple, label = 'Upload', variant = 'primary', folder, size, disabled }: {
  accept?: string; onUploaded?: (items: MediaItem[]) => void; multiple?: boolean; label?: string; variant?: 'primary' | 'secondary' | 'soft'; folder?: string; size?: 'sm' | 'md'; disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const toast = useToast();
  const handle = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    setBusy(true);
    setProgress(0);
    const done: MediaItem[] = [];
    for (const [i, f] of list.entries()) {
      try { done.push(await services.media.upload(f, { folder, onProgress: (p) => setProgress(Math.round(((i + p / 100) / list.length) * 100)) })); }
      catch (err) { toast.error(`Could not upload ${f.name}`, err); }
    }
    setBusy(false);
    if (ref.current) ref.current.value = '';
    if (done.length) {
      toast.success(done.length === 1 ? 'Uploaded to the media library' : `${done.length} files uploaded to the media library`, 'Saved to cloud storage and ready to use on the site.');
      onUploaded?.(done);
    }
  };
  return (
    <>
      <input ref={ref} type="file" className="hidden" accept={accept} multiple={multiple} onChange={(e) => handle(e.target.files)} />
      <Button variant={variant} size={size} icon={UploadCloud} loading={busy} disabled={disabled} onClick={() => ref.current?.click()}>{busy ? `Uploading ${progress}%` : label}</Button>
    </>
  );
}

export const acceptFor = (kind: 'image' | 'video' | 'file') => kind === 'image' ? 'image/*' : kind === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/*,video/*,application/pdf,.doc,.docx';

/** Modal to pick (or upload / link) a media item. */
export function MediaPicker({ open, onClose, onSelect, kind = 'image', current }: {
  open: boolean; onClose: () => void; onSelect: (ref: string, item?: MediaItem) => void; kind?: 'image' | 'video' | 'file'; current?: string;
}) {
  const { items } = useMediaList();
  const [tab, setTab] = useState<'library' | 'link'>('library');
  const [q, setQ] = useState('');
  const [link, setLink] = useState('');
  const [linkError, setLinkError] = useState('');

  const filtered = useMemo(() => (items ?? []).filter((m) =>
    (kind === 'file' || m.kind === kind) && `${m.name} ${m.alt} ${m.folder}`.toLowerCase().includes(q.toLowerCase())), [items, kind, q]);

  const pick = (m: MediaItem) => { onSelect(services.media.refFor(m), m); onClose(); };

  return (
    <Modal open={open} onClose={onClose} size="xl" title={`Choose ${kind === 'file' ? 'a file' : `an ${kind}`}`} description="Pick from the media library, upload a new file, or paste a link.">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <Tabs value={tab} onChange={setTab} tabs={[{ value: 'library', label: 'Media library' }, { value: 'link', label: 'Paste link' }]} />
        {tab === 'library' && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-[#A3ACAE] absolute left-3 top-1/2 -translate-y-1/2" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search files" className="pl-9" />
            </div>
            <UploadButton accept={acceptFor(kind)} onUploaded={(list) => pick(list[0])} label="Upload" />
          </div>
        )}
      </div>

      {tab === 'library' ? (
        !items ? <div className="py-16 flex justify-center"><Spinner /></div> :
        filtered.length === 0 ? <EmptyState icon={kind === 'video' ? Film : ImageIcon} title="No matching files" text="Upload a file or paste a link instead." /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((m) => {
              const ref = services.media.refFor(m);
              const selected = ref === current;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => pick(m)}
                  className={cx('group text-left rounded-2xl border bg-white overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#168F88]', selected ? 'border-[#168F88] ring-2 ring-[#168F88]/30' : 'border-[#EDF2F1]')}
                >
                  <div className="relative aspect-[4/3] bg-[#F2F6F5]">
                    <MediaThumb refValue={ref} kind={m.kind} className="w-full h-full" alt={m.alt} />
                    {selected && <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#168F88] text-white flex items-center justify-center"><Check className="w-3.5 h-3.5" /></span>}
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="text-xs font-semibold truncate">{m.name}</p>
                    <p className="text-[10px] text-[#8A9496] truncate">{m.folder}{m.size ? ` · ${formatBytes(m.size)}` : ''}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )
      ) : (
        <div className="space-y-3 max-w-xl">
          <Input value={link} onChange={(e) => { setLink(e.target.value); setLinkError(''); }} placeholder="https://… or /images/…" invalid={!!linkError} />
          {linkError && <p className="text-xs text-[#E5484D]">{linkError}</p>}
          {link && /^(https?:\/\/|\/)/.test(link) && (
            <div className="w-56 aspect-[4/3] rounded-2xl overflow-hidden border border-[#EDF2F1]"><MediaThumb refValue={link} className="w-full h-full" /></div>
          )}
          <div className="flex gap-2">
            <Button icon={Link2} onClick={() => {
              if (!/^(https?:\/\/|\/)/.test(link.trim())) { setLinkError('Enter a full URL (https://…) or a site path starting with /.'); return; }
              onSelect(link.trim());
              onClose();
            }}>Use this link</Button>
            <Button variant="secondary" onClick={async () => {
              try { const item = await services.media.addLink(link); onSelect(services.media.refFor(item), item); onClose(); }
              catch (err) { setLinkError(err instanceof Error ? err.message : 'Could not add link.'); }
            }}>Save to library &amp; use</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
