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
import { HelpTip } from '../onboarding/HelpTip';
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

  const groups = useMemo(() => sections.filter((s) => s.type === 'group') as Array<Extract<Field, { type: 'group' }>>, [sections]);
  const loose = useMemo(() => sections.filter((s) => s.type !== 'group'), [sections]);

  // Accordion: one section open at a time keeps long pages calm. First section starts open.
  const [openKey, setOpenKey] = useState<string | null>(() => groups[0]?.key ?? null);
  const goTo = (key: string) => {
    setOpenKey(key);
    // Wait for the previous section to collapse so the scroll lands in the right place.
    // 104px = sticky top bar (88px) + breathing room.
    setTimeout(() => {
      const el = document.getElementById(`section-${key}`);
      if (el) window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - 104), behavior: 'smooth' });
    }, 260);
  };

  const runValidation = () => {
    const errs = validate(sections, value);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      toast.error('Please fix the highlighted fields', `${Object.keys(errs).length} field(s) need attention.`);
      const top = first.split('.')[0];
      if (groups.some((g) => g.key === top)) goTo(top);
      else document.getElementById(`section-${top}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return false;
    }
    return true;
  };

  const sectionHasError = (key: string) => Object.keys(errors).some((k) => k.startsWith(`${key}.`));
  const sectionHidden = (g: Extract<Field, { type: 'group' }>) => !!g.visibilityKey && (value as any)?.[g.key]?.[g.visibilityKey] === false;
  const undoEdits = () => { setValue(JSON.parse(baseline)); setErrors({}); };

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

  const useRail = groups.length > 3;
  // Side list needs room; with the preview open it turns into a chip row.
  const sideRail = useRail && !(showPreview && previewPath);

  return (
    <div className={cx(dirty && canEdit && 'pb-24')}>
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
                    <button type="button" disabled={!dirty} onClick={() => { setMoreOpen(false); undoEdits(); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-slate-50 disabled:opacity-40"><Undo2 className="w-4 h-4 text-[#8A9496]" /> Undo unsaved edits</button>
                    <button type="button" disabled={!meta?.hasDraft || !canEdit} onClick={() => { setMoreOpen(false); setConfirm('discard'); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-slate-50 disabled:opacity-40"><RotateCcw className="w-4 h-4 text-[#8A9496]" /> Discard saved draft</button>
                    <button type="button" disabled={meta?.status === 'default' || !canEdit} onClick={() => { setMoreOpen(false); setConfirm('reset'); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#E5484D] hover:bg-red-50 disabled:opacity-40"><RotateCcw className="w-4 h-4" /> Restore original content</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span data-tour="publish-actions" className="inline-flex flex-wrap items-center gap-2">
              <Button variant="secondary" icon={Save} onClick={() => save(false)} loading={busy === 'save'} disabled={!canEdit || !value || !dirty}>Save draft</Button>
              <Button icon={CloudUpload} onClick={() => save(true)} loading={busy === 'publish'} disabled={!canEdit || !value || (!dirty && !meta?.hasDraft)}>Publish</Button>
              <HelpTip label="Draft vs publish">
                <b>Save draft</b> keeps your changes private. <b>Publish</b> makes them visible on the public website.
              </HelpTip>
            </span>
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

      {/* Chip row: small screens, or when the preview takes the side space */}
      {useRail && (
        <div className={cx('flex gap-2 overflow-x-auto no-scrollbar mb-4 -mx-1 px-1 py-1', sideRail && 'lg:hidden')}>
          {groups.map((g, i) => {
            const active = openKey === g.key;
            return (
              <button key={g.key} type="button" onClick={() => goTo(g.key)} className={cx('shrink-0 inline-flex items-center gap-1.5 pl-1.5 pr-3 h-8 rounded-full border text-xs font-semibold transition-colors', active ? 'bg-[#168F88] border-[#168F88] text-white' : 'bg-white/80 border-white text-[#5E696B] hover:text-[#168F88] shadow-xs')}>
                <span className={cx('w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px]', active ? 'bg-white/25' : 'bg-[#168F88]/10 text-[#168F88]')}>{i + 1}</span>
                {g.label}
                {sectionHasError(g.key) && <span className="w-1.5 h-1.5 rounded-full bg-[#E5484D]" />}
              </button>
            );
          })}
        </div>
      )}

      <div className={cx('grid gap-5', sideRail && 'lg:grid-cols-[232px_minmax(0,1fr)]')}>
      {sideRail && (
        <nav aria-label="Page sections" data-tour="page-sections" className="hidden lg:block sticky top-[104px] self-start">
          <Card className="p-2">
            <p className="px-3 pt-2 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#A3ACAE]">Page sections</p>
            <ul className="space-y-0.5">
              {groups.map((g, i) => {
                const active = openKey === g.key;
                const err = sectionHasError(g.key);
                const hidden = sectionHidden(g);
                return (
                  <li key={g.key}>
                    <button type="button" onClick={() => goTo(g.key)} aria-current={active ? 'true' : undefined} className={cx('w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-left text-[13px] font-semibold transition-colors', active ? 'bg-[#168F88]/10 text-[#127a74]' : 'text-[#5E696B] hover:bg-slate-50 hover:text-[#171B20]')}>
                      <span className={cx('w-6 h-6 rounded-lg inline-flex items-center justify-center text-[11px] font-bold shrink-0', err ? 'bg-red-50 text-[#E5484D]' : active ? 'bg-[#168F88] text-white' : 'bg-slate-100 text-[#7A8587]')}>{i + 1}</span>
                      <span className={cx('flex-1 truncate', hidden && !active && 'text-[#A3ACAE]')}>{g.label}</span>
                      {err ? <span className="w-2 h-2 rounded-full bg-[#E5484D] shrink-0" title="Needs attention" />
                        : hidden ? <EyeOff className="w-3.5 h-3.5 text-[#A3ACAE] shrink-0" aria-label="Hidden on site" /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        </nav>
      )}

      <div className={cx('grid gap-5 min-w-0', showPreview && previewPath ? 'xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]' : 'grid-cols-1')}>
        <div className="space-y-3 min-w-0" data-tour="page-editor">
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
              {groups.map((g, i) => (
                <GroupSection
                  key={g.key}
                  field={g}
                  index={groups.length > 1 ? i : undefined}
                  open={groups.length > 1 ? openKey === g.key : undefined}
                  onOpenChange={groups.length > 1 ? (o) => setOpenKey(o ? g.key : null) : undefined}
                  value={(value as any)[g.key] ?? {}}
                  onChange={(v) => setValue({ ...(value as any), [g.key]: v })}
                  errors={errors}
                  prefix={g.key}
                  ctx={ctx}
                  disabled={!canEdit}
                />
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
      </div>

      {/* Save bar: always in reach while there are unsaved edits */}
      <AnimatePresence>
        {dirty && canEdit && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(620px,calc(100%-24px))] flex items-center gap-2 p-2 pl-4 rounded-2xl bg-[#171B20] text-white shadow-2xl"
            role="region"
            aria-label="Unsaved changes"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span className="text-sm font-semibold flex-1 min-w-0 truncate">Unsaved changes</span>
            <button type="button" onClick={undoEdits} className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10"><Undo2 className="w-3.5 h-3.5" /> Undo</button>
            <Button size="sm" variant="secondary" onClick={() => save(false)} loading={busy === 'save'}>Save draft</Button>
            <Button size="sm" onClick={() => save(true)} loading={busy === 'publish'}>Publish</Button>
          </motion.div>
        )}
      </AnimatePresence>

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
