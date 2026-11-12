'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Copy, FileText, Film, FolderOpen, ImageIcon, Link2, RefreshCw, Search, Trash2, UploadCloud } from 'lucide-react';
import { services, type MediaItem, type MediaUsage } from '../../lib/services';
import { MediaThumb, UploadButton, useMediaList, useMediaUrl } from '../editor/media';
import { Badge, Button, Card, ConfirmDialog, cx, Drawer, EmptyState, FieldShell, Input, Modal, PageHeader, Select, Skeleton, formatBytes, formatDate } from '../ui/kit';
import { useToast } from '../ui/toast';
import { useAdmin } from '../context';

const kindIcon = { image: ImageIcon, video: Film, document: FileText };

export default function MediaLibrary() {
  const { canEdit } = useAdmin();
  const toast = useToast();
  const params = useSearchParams();
  const { items } = useMediaList();
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('');
  const [folder, setFolder] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [linkOpen, setLinkOpen] = useState(false);

  useEffect(() => { const id = params?.get('open'); if (id) setOpenId(id); }, [params]);

  const folders = useMemo(() => Array.from(new Set((items ?? []).map((m) => m.folder))).sort(), [items]);
  const filtered = useMemo(() => (items ?? []).filter((m) =>
    (!kind || m.kind === kind) && (!folder || m.folder === folder) && (!q || `${m.name} ${m.alt} ${m.folder}`.toLowerCase().includes(q.toLowerCase()))), [items, kind, folder, q]);
  const open = items?.find((m) => m.id === openId) ?? null;
  const totalSize = (items ?? []).reduce((s, m) => s + m.size, 0);

  const onDrop = async (files: FileList) => {
    if (!canEdit) return;
    const list = Array.from(files);
    setUploading(list.length);
    let ok = 0;
    for (const f of list) {
      try { await services.media.upload(f); ok++; } catch (err) { toast.error(`Could not upload ${f.name}`, err); }
      setUploading((n) => n - 1);
    }
    if (ok) toast.success(`${ok} file${ok > 1 ? 's' : ''} uploaded`, 'Stored in this browser until cloud storage is connected.');
  };

  return (
    <div
      onDragOver={(e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setDragOver(true); } }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDragOver(false); }}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) onDrop(e.dataTransfer.files); }}
      className="relative"
    >
      <PageHeader
        title="Media library"
        description="All images, videos and documents used on the website. Drag files anywhere on this page to upload."
        actions={
          <>
            <Button variant="secondary" icon={Link2} disabled={!canEdit} onClick={() => setLinkOpen(true)}>Add by link</Button>
            {canEdit && <UploadButton multiple accept="image/*,video/mp4,video/webm,video/quicktime,application/pdf,.doc,.docx" label="Upload files" />}
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5">
        {[
          { label: 'Images', value: (items ?? []).filter((m) => m.kind === 'image').length, icon: ImageIcon },
          { label: 'Videos', value: (items ?? []).filter((m) => m.kind === 'video').length, icon: Film },
          { label: 'Documents', value: (items ?? []).filter((m) => m.kind === 'document').length, icon: FileText },
          { label: 'Uploaded storage', value: formatBytes(totalSize), icon: FolderOpen },
        ].map((s) => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#168F88]/10 text-[#168F88] flex items-center justify-center"><s.icon className="w-5 h-5" /></span>
            <span><span className="block text-lg font-extrabold font-heading leading-none">{items ? s.value : '–'}</span><span className="text-xs text-[#8A9496]">{s.label}</span></span>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-2.5 p-4 sm:p-5 border-b border-[#EDF2F1]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A3ACAE] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, alt text or folder" className="pl-9" aria-label="Search media" />
          </div>
          <Select value={kind} onChange={(e) => setKind(e.target.value)} className="md:w-40" aria-label="Type" options={[{ value: '', label: 'All types' }, { value: 'image', label: 'Images' }, { value: 'video', label: 'Videos' }, { value: 'document', label: 'Documents' }]} />
          <Select value={folder} onChange={(e) => setFolder(e.target.value)} className="md:w-44" aria-label="Folder" options={[{ value: '', label: 'All folders' }, ...folders]} />
        </div>
        {uploading > 0 && <div className="px-5 py-2.5 text-xs font-semibold text-[#168F88] bg-[#168F88]/6">Uploading {uploading} file{uploading > 1 ? 's' : ''}…</div>}
        {!items ? (
          <div className="p-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">{Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={FolderOpen} title={items.length ? 'No files match' : 'Your library is empty'} text="Upload images, videos or documents to use them across the website." />
        ) : (
          <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
            {filtered.map((m) => {
              const Icon = kindIcon[m.kind];
              return (
                <button key={m.id} type="button" onClick={() => setOpenId(m.id)} className="group text-left rounded-2xl border border-[#EDF2F1] bg-white overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#168F88]">
                  <div className="relative aspect-square bg-[#F2F6F5]">
                    <MediaThumb refValue={services.media.refFor(m)} kind={m.kind} className="w-full h-full" alt={m.alt} />
                    <span className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-white/90 text-[#168F88] flex items-center justify-center shadow-sm"><Icon className="w-3.5 h-3.5" /></span>
                    {m.source === 'linked' && <span className="absolute top-2 right-2"><Badge tone="lavender">Linked</Badge></span>}
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="text-xs font-semibold truncate">{m.name}</p>
                    <p className="text-[10px] text-[#8A9496] truncate">{m.folder}{m.size ? ` · ${formatBytes(m.size)}` : ''}{!m.alt && m.kind === 'image' ? ' · no alt text' : ''}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {dragOver && canEdit && (
        <div className="fixed inset-0 z-[90] bg-[#168F88]/15 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="rounded-[28px] bg-white px-10 py-8 text-center shadow-2xl border-2 border-dashed border-[#168F88]">
            <UploadCloud className="w-10 h-10 text-[#168F88] mx-auto mb-2" />
            <p className="font-bold font-heading">Drop to upload</p>
          </div>
        </div>
      )}

      <MediaDetails item={open} onClose={() => setOpenId(null)} folders={folders} />
      <AddLinkModal open={linkOpen} onClose={() => setLinkOpen(false)} />
    </div>
  );
}

function MediaDetails({ item, onClose, folders }: { item: MediaItem | null; onClose: () => void; folders: string[] }) {
  const { canEdit } = useAdmin();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', alt: '', folder: '' });
  const [usage, setUsage] = useState<MediaUsage[] | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState('');
  const replaceRef = useRef<HTMLInputElement>(null);
  const ref = item ? services.media.refFor(item) : '';
  const url = useMediaUrl(ref);

  useEffect(() => {
    if (!item) return;
    setForm({ name: item.name, alt: item.alt, folder: item.folder });
    setUsage(null);
    services.media.usage(item.id).then(setUsage).catch(() => setUsage([]));
  }, [item?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = item && (form.name !== item.name || form.alt !== item.alt || form.folder !== item.folder);

  return (
    <>
      <Drawer
        open={!!item}
        onClose={onClose}
        title={item?.name ?? ''}
        subtitle={item && `${item.kind} · ${item.source === 'linked' ? 'Linked asset' : formatBytes(item.size)}${item.width ? ` · ${item.width}×${item.height}` : ''}`}
        footer={item && (
          <>
            <Button variant="ghost" icon={Trash2} className="mr-auto text-[#E5484D]" disabled={!canEdit} onClick={() => setConfirm(true)}>Delete</Button>
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button disabled={!canEdit || !dirty || !form.name.trim()} loading={busy === 'save'} onClick={async () => {
              setBusy('save');
              try { await services.media.update(item.id, { name: form.name.trim(), alt: form.alt.trim(), folder: form.folder.trim() || 'Uploads' }); toast.success('Details saved'); }
              catch (e) { toast.error('Could not save', e); } finally { setBusy(''); }
            }}>Save details</Button>
          </>
        )}
      >
        {item && (
          <div className="space-y-5">
            <div className="rounded-2xl overflow-hidden bg-[#0E1416] flex items-center justify-center min-h-[220px]">
              {item.kind === 'video' ? <video src={url} controls className="max-h-[360px] w-full" /> :
                item.kind === 'document' ? <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 py-12 text-white"><FileText className="w-10 h-10" /><span className="text-sm font-semibold underline">Open document</span></a> :
                  url ? <img src={url} alt={item.alt} className="max-h-[360px] object-contain" /> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="soft" icon={Copy} onClick={async () => { try { await navigator.clipboard.writeText(ref); toast.success('Reference copied'); } catch { toast.error('Clipboard unavailable'); } }}>Copy reference</Button>
              {item.source === 'upload' && (
                <>
                  <input ref={replaceRef} type="file" className="hidden" accept={item.kind === 'image' ? 'image/*' : item.kind === 'video' ? 'video/*' : 'application/pdf,.doc,.docx'}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setBusy('replace');
                      try { await services.media.replace(item.id, f); toast.success('File replaced', 'Every page using it now shows the new file.'); }
                      catch (err) { toast.error('Replace failed', err); } finally { setBusy(''); e.target.value = ''; }
                    }} />
                  <Button size="sm" variant="secondary" icon={RefreshCw} loading={busy === 'replace'} disabled={!canEdit} onClick={() => replaceRef.current?.click()}>Replace file</Button>
                </>
              )}
            </div>
            {item.source === 'linked' && <p className="text-xs text-[#8A9496] -mt-2">Linked assets point to <code className="px-1 rounded bg-slate-100">{item.url}</code>. To change the file everywhere, upload a new one and select it in each editor.</p>}
            <FieldShell label="File name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={!canEdit} /></FieldShell>
            {item.kind === 'image' && (
              <FieldShell label="Alt text" help="Describe the image for screen readers and search engines. Used when the image is picked in an editor.">
                <Input value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} disabled={!canEdit} />
              </FieldShell>
            )}
            <FieldShell label="Folder">
              <Input value={form.folder} list="media-folders" onChange={(e) => setForm({ ...form, folder: e.target.value })} disabled={!canEdit} />
              <datalist id="media-folders">{folders.map((f) => <option key={f} value={f} />)}</datalist>
            </FieldShell>
            <div>
              <h4 className="text-sm font-bold font-heading mb-2">Where it’s used</h4>
              {usage === null ? <Skeleton className="h-10" /> : usage.length === 0 ? <p className="text-xs text-[#8A9496]">Not used in any content.</p> : (
                <ul className="space-y-1.5">
                  {usage.map((u, i) => <li key={i} className="text-xs rounded-xl bg-[#F2F6F5] px-3 py-2"><b>{u.label}</b> <span className="text-[#8A9496]">· {u.path}</span></li>)}
                </ul>
              )}
            </div>
            <p className="text-[11px] text-[#A3ACAE]">Added {formatDate(item.createdAt, true)} · Updated {formatDate(item.updatedAt, true)}</p>
          </div>
        )}
      </Drawer>
      <ConfirmDialog
        open={confirm}
        onCancel={() => setConfirm(false)}
        loading={busy === 'delete'}
        title="Delete this file?"
        message={usage && usage.length > 0
          ? <><b>Warning:</b> this file is used in {usage.length} place{usage.length > 1 ? 's' : ''}. Those images will disappear from the website until you choose a replacement.</>
          : item?.source === 'linked' ? 'The file is removed from the library. The original site asset itself is not deleted.' : 'The file is permanently removed from the library.'}
        onConfirm={async () => {
          if (!item) return;
          setBusy('delete');
          try { await services.media.remove(item.id); toast.success('File deleted'); setConfirm(false); onClose(); }
          catch (e) { toast.error('Delete failed', e); } finally { setBusy(''); }
        }}
      />
    </>
  );
}

function AddLinkModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setUrl(''); setName(''); setError(''); } }, [open]);
  return (
    <Modal open={open} onClose={onClose} title="Add media by link" description="Reference an image, video or document already hosted online or in the site’s /public folder."
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy} onClick={async () => {
        setBusy(true);
        try { await services.media.addLink(url, { name: name.trim() || undefined }); toast.success('Link added to library'); onClose(); }
        catch (e) { setError(e instanceof Error ? e.message : 'Could not add link'); } finally { setBusy(false); }
      }}>Add to library</Button></>}>
      <div className="space-y-4">
        <FieldShell label="URL or path" required error={error}><Input value={url} onChange={(e) => { setUrl(e.target.value); setError(''); }} placeholder="https://… or /images/…" invalid={!!error} /></FieldShell>
        <FieldShell label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" /></FieldShell>
        {/^(https?:\/\/|\/)/.test(url) && <div className={cx('w-48 aspect-[4/3] rounded-2xl overflow-hidden border border-[#EDF2F1]')}><MediaThumb refValue={url} className="w-full h-full" /></div>}
      </div>
    </Modal>
  );
}
