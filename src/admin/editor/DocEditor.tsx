'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CloudUpload, Eye, EyeOff, Monitor, MoreHorizontal, RotateCcw, Save, Smartphone, Undo2, RefreshCw, ExternalLink } from 'lucide-react';
import { services, type ContentDocMeta } from '../../lib/services';
import type { ContentKey, ContentMap } from '../../lib/cms/defaults';
import { useAdmin, useDirtyGuard } from '../context';
import { useToast } from '../ui/toast';
import { Badge, Button, Card, ConfirmDialog, cx, PageHeader, Skeleton, timeAgo, useClickOutside } from '../ui/kit';
import { FieldsGrid, GroupSection } from './SchemaForm';
import { validate, type Errors, type Field, type FormContext } from './fields';

export function StatusBadge({ meta, dirty }: { meta?: ContentDocMeta; dirty?: boolean }) {
  if (dirty) return <Badge tone="amber" dot>Unsaved changes</Badge>;
  if (!meta) return null;
  if (meta.status === 'draft') return <Badge tone="lavender" dot>Draft – not published</Badge>;
  if (meta.status === 'published') return <Badge tone="green" dot>Published</Badge>;
  return <Badge tone="slate" dot>Original content</Badge>;
}

/* ---------------- Live preview ---------------- */
export function PreviewPanel({ path, contentKey, value, onClose }: { path: string; contentKey: ContentKey; value: unknown; onClose: () => void }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [nonce, setNonce] = useState(0);
  const src = `${path}${path.includes('?') ? '&' : '?'}cmsPreview=1`;

  const post = useCallback(() => {
    frame.current?.contentWindow?.postMessage({ source: 'meero-cms-preview', key: contentKey, value }, window.location.origin);
  }, [contentKey, value]);

  useEffect(() => {
    const t = setTimeout(post, 250);
    return () => clearTimeout(t);
  }, [post]);

  return (
    <Card className="overflow-hidden flex flex-col h-[70dvh] xl:h-[calc(100dvh-140px)]">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#EDF2F1]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-sm font-bold font-heading truncate">Live preview</span>
          <span className="text-xs text-[#8A9496] truncate hidden sm:inline">{path} · unsaved edits included</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setDevice('desktop')} className={cx('p-2 rounded-lg', device === 'desktop' ? 'bg-[#168F88]/10 text-[#168F88]' : 'text-[#8A9496] hover:bg-slate-100')} aria-label="Desktop width"><Monitor className="w-4 h-4" /></button>
          <button type="button" onClick={() => setDevice('mobile')} className={cx('p-2 rounded-lg', device === 'mobile' ? 'bg-[#168F88]/10 text-[#168F88]' : 'text-[#8A9496] hover:bg-slate-100')} aria-label="Mobile width"><Smartphone className="w-4 h-4" /></button>
          <button type="button" onClick={() => setNonce((n) => n + 1)} className="p-2 rounded-lg text-[#8A9496] hover:bg-slate-100" aria-label="Reload preview"><RefreshCw className="w-4 h-4" /></button>
          <a href={src} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-[#8A9496] hover:bg-slate-100" aria-label="Open preview in new tab"><ExternalLink className="w-4 h-4" /></a>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-[#8A9496] hover:bg-slate-100" aria-label="Close preview"><EyeOff className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex-1 bg-[#E9EFEE] flex justify-center overflow-hidden">
        <iframe
          key={nonce}
          ref={frame}
          src={src}
          title="Website preview"
          onLoad={() => setTimeout(post, 400)}
          className={cx('h-full bg-white transition-all duration-300', device === 'mobile' ? 'w-[390px] max-w-full my-3 rounded-[22px] shadow-xl border border-white' : 'w-full')}
        />
      </div>
    </Card>
  );
}

/* ---------------- Document editor ---------------- */
export default function DocEditor<K extends ContentKey>({
  contentKey, title, description, sections, previewPath, ctx = {}, headerExtra,
}: {
  contentKey: K;
  title: string;
  description?: string;
  /** Top-level fields. `group` fields render as section cards. */
  sections: Field[];
  previewPath?: string;
  ctx?: FormContext;
  headerExtra?: React.ReactNode;
}) {
  const { canEdit } = useAdmin();
  const toast = useToast();
  const [value, setValue] = useState<ContentMap[K] | null>(null);
  const [baseline, setBaseline] = useState('');
  const [meta, setMeta] = useState<ContentDocMeta>();
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState<'' | 'save' | 'publish' | 'discard' | 'reset'>('');
  const [confirm, setConfirm] = useState<'' | 'discard' | 'reset'>('');
  const [showPreview, setShowPreview] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  useClickOutside(moreRef, () => setMoreOpen(false), moreOpen);

  const load = useCallback(async () => {
    try {
      const res = await services.content.getEditable(contentKey);
      setValue(res.value);
      setBaseline(JSON.stringify(res.value));
      setMeta(res.meta);
      setErrors({});
    } catch (err) {
      toast.error('Could not load content', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentKey]);

  useEffect(() => { load(); }, [load]);

  const dirty = value !== null && JSON.stringify(value) !== baseline;
  useDirtyGuard(`doc:${contentKey}`, dirty);

  const runValidation = () => {
    const errs = validate(sections, value);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      toast.error('Please fix the highlighted fields', `${Object.keys(errs).length} field(s) need attention.`);
      const top = first.split('.')[0];
      document.getElementById(`section-${top}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return false;
    }
    return true;
  };

  const save = async (publish: boolean) => {
    if (!value || !runValidation()) return;
    setBusy(publish ? 'publish' : 'save');
    try {
      const m = publish ? await services.content.publish(contentKey, value) : await services.content.saveDraft(contentKey, value);
      setMeta(m);
      setBaseline(JSON.stringify(value));
      toast.success(publish ? 'Published' : 'Draft saved', publish ? 'The website now shows these changes.' : 'Not visible on the website until you publish.');
    } catch (err) {
      toast.error(publish ? 'Publish failed' : 'Save failed', err);
    } finally {
      setBusy('');
    }
  };

  const doConfirm = async () => {
    const action = confirm;
    setBusy(action);
    try {
      if (action === 'discard') await services.content.discardDraft(contentKey);
      if (action === 'reset') await services.content.resetToDefault(contentKey);
      await load();
      toast.success(action === 'discard' ? 'Draft discarded' : 'Original content restored');
    } catch (err) {
      toast.error('Action failed', err);
    } finally {
      setBusy('');
      setConfirm('');
    }
  };

  const groups = useMemo(() => sections.filter((s) => s.type === 'group'), [sections]);
  const loose = useMemo(() => sections.filter((s) => s.type !== 'group'), [sections]);

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        badge={<StatusBadge meta={meta} dirty={dirty} />}
        actions={
          <>
            {headerExtra}
            {previewPath && (
              <Button variant="secondary" icon={showPreview ? EyeOff : Eye} onClick={() => setShowPreview((s) => !s)}>{showPreview ? 'Hide preview' : 'Live preview'}</Button>
            )}
            <div ref={moreRef} className="relative">
              <Button variant="secondary" icon={MoreHorizontal} aria-label="More actions" onClick={() => setMoreOpen((o) => !o)} className="px-3"><span className="sr-only">More</span></Button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="absolute right-0 mt-2 w-60 z-30 rounded-2xl bg-white border border-[#EDF2F1] shadow-xl p-1.5">
                    <button type="button" disabled={!dirty} onClick={() => { setMoreOpen(false); setValue(JSON.parse(baseline)); setErrors({}); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-slate-50 disabled:opacity-40"><Undo2 className="w-4 h-4 text-[#8A9496]" /> Undo unsaved edits</button>
                    <button type="button" disabled={!meta?.hasDraft || !canEdit} onClick={() => { setMoreOpen(false); setConfirm('discard'); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-slate-50 disabled:opacity-40"><RotateCcw className="w-4 h-4 text-[#8A9496]" /> Discard saved draft</button>
                    <button type="button" disabled={meta?.status === 'default' || !canEdit} onClick={() => { setMoreOpen(false); setConfirm('reset'); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#E5484D] hover:bg-red-50 disabled:opacity-40"><RotateCcw className="w-4 h-4" /> Restore original content</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Button variant="secondary" icon={Save} onClick={() => save(false)} loading={busy === 'save'} disabled={!canEdit || !value || !dirty}>Save draft</Button>
            <Button icon={CloudUpload} onClick={() => save(true)} loading={busy === 'publish'} disabled={!canEdit || !value || (!dirty && !meta?.hasDraft)}>Publish</Button>
          </>
        }
      />

      {!canEdit && <div className="mb-4 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">You have view-only access. Ask an owner to change your role to edit content.</div>}

      {meta && (meta.updatedAt || meta.publishedAt) && (
        <p className="text-xs text-[#8A9496] -mt-3 mb-5">
          {meta.updatedAt && <>Last saved {timeAgo(meta.updatedAt)}{meta.updatedBy && ` by ${meta.updatedBy}`}</>}
          {meta.publishedAt && <> · Published {timeAgo(meta.publishedAt)}{meta.publishedBy && ` by ${meta.publishedBy}`}</>}
        </p>
      )}

      {groups.length > 3 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 -mx-1 px-1">
          {groups.map((g) => (
            <button key={g.key} type="button" onClick={() => document.getElementById(`section-${g.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="shrink-0 px-3 h-8 rounded-full bg-white/80 border border-white text-xs font-semibold text-[#5E696B] hover:text-[#168F88] shadow-xs">
              {g.label}
            </button>
          ))}
        </div>
      )}

      <div className={cx('grid gap-5', showPreview && previewPath ? 'xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]' : 'grid-cols-1')}>
        <div className="space-y-4 min-w-0">
          {!value ? (
            <>
              <Skeleton className="h-48" />
              <Skeleton className="h-64" />
            </>
          ) : (
            <>
              {loose.length > 0 && (
                <Card className="p-5 sm:p-6">
                  <FieldsGrid fields={loose} value={value} onChange={setValue} errors={errors} ctx={ctx} disabled={!canEdit} />
                </Card>
              )}
              {groups.map((g) => (
                <GroupSection key={g.key} field={g as Extract<Field, { type: 'group' }>} value={(value as any)[g.key] ?? {}} onChange={(v) => setValue({ ...(value as any), [g.key]: v })} errors={errors} prefix={g.key} ctx={ctx} disabled={!canEdit} />
              ))}
            </>
          )}
        </div>
        {showPreview && previewPath && value && (
          <div className="min-w-0 xl:sticky xl:top-24 self-start">
            <PreviewPanel path={previewPath} contentKey={contentKey} value={value} onClose={() => setShowPreview(false)} />
          </div>
        )}
      </div>

      {/* Mobile sticky action bar */}
      {dirty && canEdit && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 flex items-center gap-2 p-2 rounded-2xl bg-[#171B20] text-white shadow-2xl">
          <span className="text-xs font-semibold pl-2 flex-1">Unsaved changes</span>
          <Button size="sm" variant="secondary" onClick={() => save(false)} loading={busy === 'save'}>Save draft</Button>
          <Button size="sm" onClick={() => save(true)} loading={busy === 'publish'}>Publish</Button>
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        onCancel={() => setConfirm('')}
        onConfirm={doConfirm}
        loading={busy === 'discard' || busy === 'reset'}
        title={confirm === 'reset' ? 'Restore original content?' : 'Discard draft?'}
        confirmLabel={confirm === 'reset' ? 'Restore original' : 'Discard draft'}
        message={confirm === 'reset'
          ? 'This removes all saved and published edits for this section. The website goes back to the original built-in content.'
          : 'The saved draft is deleted. The published version on the website is not affected.'}
      />
    </div>
  );
}
