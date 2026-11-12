'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CloudUpload, Copy, Eye, EyeOff, GripVertical, LayoutGrid, List, MoreHorizontal, Pencil, Plus, RotateCcw, Save, Search, Trash2, Undo2, Inbox,
} from 'lucide-react';
import { services, type ContentDocMeta } from '../../lib/services';
import type { ContentKey } from '../../lib/cms/defaults';
import { useAdmin, useDirtyGuard } from '../context';
import { useToast } from '../ui/toast';
import { Badge, Button, Card, ConfirmDialog, cx, Drawer, EmptyState, Input, PageHeader, Select, Skeleton, timeAgo, useClickOutside } from '../ui/kit';
import { FieldsGrid, move, useDragSort } from './SchemaForm';
import { MediaThumb } from './media';
import { StatusBadge, PreviewPanel } from './DocEditor';
import { validate, newId, type Errors, type Field, type FormContext } from './fields';

type Item = { id: string; visible?: boolean; [k: string]: any };
export type CollectionKey = Extract<ContentKey, 'services' | 'jobs' | 'gallery' | 'faqs' | 'steps'>;

export default function CollectionEditor({
  contentKey, title, description, itemLabel, fields, itemTitle, itemSubtitle, imageKey, newItem, searchKeys,
  filter, previewPath, ctx = {}, gridView = false, idPrefix = 'item', embedded = false,
}: {
  contentKey: CollectionKey;
  title: string;
  description?: string;
  itemLabel: string;
  fields: Field[];
  itemTitle: (item: any) => string;
  itemSubtitle?: (item: any) => string;
  imageKey?: string;
  newItem: () => any;
  searchKeys: string[];
  filter?: { key: string; label: string; options: string[] | ((ctx: FormContext) => string[]) };
  previewPath?: string;
  ctx?: FormContext;
  gridView?: boolean;
  idPrefix?: string;
  /** Render without the page header (when used inside a tab). */
  embedded?: boolean;
}) {
  const { canEdit } = useAdmin();
  const toast = useToast();
  const params = useSearchParams();
  const [items, setItems] = useState<Item[] | null>(null);
  const [baseline, setBaseline] = useState('');
  const [meta, setMeta] = useState<ContentDocMeta>();
  const [q, setQ] = useState('');
  const [filterVal, setFilterVal] = useState('');
  const [visibility, setVisibility] = useState<'' | 'shown' | 'hidden'>('');
  const [view, setView] = useState<'list' | 'grid'>(gridView ? 'grid' : 'list');
  const [editing, setEditing] = useState<{ index: number; draft: Item; isNew: boolean } | null>(null);
  const [editErrors, setEditErrors] = useState<Errors>({});
  const [toDelete, setToDelete] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<'' | 'discard' | 'reset'>('');
  const [busy, setBusy] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  useClickOutside(moreRef, () => setMoreOpen(false), moreOpen);

  const load = useCallback(async () => {
    const res = await services.content.getEditable(contentKey);
    const list = (res.value as Item[]).map((i) => ({ ...i, id: i.id || newId(idPrefix) }));
    setItems(list);
    setBaseline(JSON.stringify(list));
    setMeta(res.meta);
  }, [contentKey, idPrefix]);

  useEffect(() => { load().catch((e) => toast.error('Could not load', e)); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [load]);

  // Deep link: ?edit=<id>
  const editParam = params?.get('edit');
  useEffect(() => {
    if (!items || !editParam) return;
    const i = items.findIndex((x) => x.id === editParam);
    if (i >= 0) setEditing({ index: i, draft: structuredClone(items[i]), isNew: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editParam, items === null]);

  const dirty = items !== null && JSON.stringify(items) !== baseline;
  useDirtyGuard(`col:${contentKey}`, dirty || !!editing);

  const filterOptions = filter ? (typeof filter.options === 'function' ? filter.options(ctx) : filter.options) : [];
  const filtering = !!(q || filterVal || visibility);
  const shown = useMemo(() => (items ?? []).map((item, index) => ({ item, index })).filter(({ item }) => {
    if (q && !searchKeys.some((k) => String(item[k] ?? '').toLowerCase().includes(q.toLowerCase()))) return false;
    if (filter && filterVal && item[filter.key] !== filterVal) return false;
    if (visibility === 'shown' && item.visible === false) return false;
    if (visibility === 'hidden' && item.visible !== false) return false;
    return true;
  }), [items, q, filterVal, visibility, searchKeys, filter]);

  const { handlers, overIndex, dragIndex } = useDragSort(items ?? [], (next) => setItems(next));
  const visibleCount = (items ?? []).filter((i) => i.visible !== false).length;

  const persist = async (publish: boolean) => {
    if (!items) return;
    const errs = items.reduce<Errors>((acc, item, i) => ({ ...acc, ...validate(fields, item, String(i)) }), {});
    const firstBad = Object.keys(errs)[0];
    if (firstBad) {
      const i = Number(firstBad.split('.')[0]);
      toast.error('Some items have missing or invalid fields', `Check “${itemTitle(items[i]) || `${itemLabel} ${i + 1}`}”.`);
      setEditing({ index: i, draft: structuredClone(items[i]), isNew: false });
      setEditErrors(validate(fields, items[i]));
      return;
    }
    setBusy(publish ? 'publish' : 'save');
    try {
      const m = publish ? await services.content.publish(contentKey, items as any) : await services.content.saveDraft(contentKey, items as any);
      setMeta(m);
      setBaseline(JSON.stringify(items));
      toast.success(publish ? `${title} published` : 'Draft saved', publish ? 'Live on the website now.' : 'Publish when you are ready.');
    } catch (err) {
      toast.error('Could not save', err);
    } finally {
      setBusy('');
    }
  };

  const applyEdit = () => {
    if (!editing || !items) return;
    const errs = validate(fields, editing.draft);
    setEditErrors(errs);
    if (Object.keys(errs).length) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    const next = editing.isNew ? [...items, editing.draft] : items.map((x, i) => (i === editing.index ? editing.draft : x));
    setItems(next);
    setEditing(null);
    toast.info(editing.isNew ? `${itemLabel} added` : `${itemLabel} updated`, 'Save draft or publish to keep these changes.');
  };

  const editingDirty = editing && (editing.isNew || JSON.stringify(editing.draft) !== JSON.stringify(items?.[editing.index]));
  const [closeAsk, setCloseAsk] = useState(false);
  const closeEditor = () => (editingDirty ? setCloseAsk(true) : setEditing(null));

  const toggleVisible = (index: number) => setItems((list) => list!.map((x, i) => (i === index ? { ...x, visible: x.visible === false } : x)));
  const duplicate = (index: number) => setItems((list) => {
    const copy = { ...structuredClone(list![index]), id: newId(idPrefix), visible: false };
    if ('title' in copy) copy.title = `${copy.title} (copy)`;
    if ('question' in copy) copy.question = `${copy.question} (copy)`;
    const next = [...list!];
    next.splice(index + 1, 0, copy);
    return next;
  });

  const doConfirm = async () => {
    setBusy(confirm);
    try {
      if (confirm === 'discard') await services.content.discardDraft(contentKey);
      if (confirm === 'reset') await services.content.resetToDefault(contentKey);
      await load();
      toast.success(confirm === 'discard' ? 'Draft discarded' : 'Original list restored');
    } catch (err) { toast.error('Action failed', err); }
    finally { setBusy(''); setConfirm(''); }
  };

  const actions = (
    <>
      {previewPath && <Button variant="secondary" icon={showPreview ? EyeOff : Eye} onClick={() => setShowPreview((s) => !s)}>{showPreview ? 'Hide preview' : 'Live preview'}</Button>}
      <div ref={moreRef} className="relative">
        <Button variant="secondary" icon={MoreHorizontal} onClick={() => setMoreOpen((o) => !o)} className="px-3" aria-label="More actions"><span className="sr-only">More</span></Button>
        <AnimatePresence>
          {moreOpen && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="absolute right-0 mt-2 w-60 z-30 rounded-2xl bg-white border border-[#EDF2F1] shadow-xl p-1.5">
              <button type="button" disabled={!dirty} onClick={() => { setMoreOpen(false); setItems(JSON.parse(baseline)); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-slate-50 disabled:opacity-40"><Undo2 className="w-4 h-4 text-[#8A9496]" /> Undo unsaved edits</button>
              <button type="button" disabled={!meta?.hasDraft || !canEdit} onClick={() => { setMoreOpen(false); setConfirm('discard'); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-slate-50 disabled:opacity-40"><RotateCcw className="w-4 h-4 text-[#8A9496]" /> Discard saved draft</button>
              <button type="button" disabled={meta?.status === 'default' || !canEdit} onClick={() => { setMoreOpen(false); setConfirm('reset'); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#E5484D] hover:bg-red-50 disabled:opacity-40"><RotateCcw className="w-4 h-4" /> Restore original list</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Button variant="secondary" icon={Save} onClick={() => persist(false)} loading={busy === 'save'} disabled={!canEdit || !dirty}>Save draft</Button>
      <Button icon={CloudUpload} onClick={() => persist(true)} loading={busy === 'publish'} disabled={!canEdit || (!dirty && !meta?.hasDraft)}>Publish</Button>
    </>
  );

  return (
    <div>
      {embedded ? (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg font-bold font-heading">{title}</h2>
            <StatusBadge meta={meta} dirty={dirty} />
          </div>
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        </div>
      ) : (
        <PageHeader title={title} description={description} badge={<StatusBadge meta={meta} dirty={dirty} />} actions={actions} />
      )}
      {meta?.updatedAt && <p className="text-xs text-[#8A9496] -mt-2 mb-4">Last saved {timeAgo(meta.updatedAt)}{meta.updatedBy && ` by ${meta.updatedBy}`}{meta.publishedAt && ` · Published ${timeAgo(meta.publishedAt)}`}</p>}

      <div className={cx('grid gap-5', showPreview && previewPath ? 'xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]' : 'grid-cols-1')}>
        <Card className="min-w-0">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center gap-2.5 p-4 sm:p-5 border-b border-[#EDF2F1]">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-[#A3ACAE] absolute left-3 top-1/2 -translate-y-1/2" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${title.toLowerCase()}`} className="pl-9" aria-label="Search" />
            </div>
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2">
              {filter && (
                <Select value={filterVal} onChange={(e) => setFilterVal(e.target.value)} aria-label={filter.label} className="sm:w-48"
                  options={[{ value: '', label: `All ${filter.label.toLowerCase()}` }, ...filterOptions.map((o) => ({ value: o, label: o }))]} />
              )}
              <Select value={visibility} onChange={(e) => setVisibility(e.target.value as any)} aria-label="Visibility" className="sm:w-40"
                options={[{ value: '', label: 'Any status' }, { value: 'shown', label: 'Published' }, { value: 'hidden', label: 'Hidden' }]} />
              {gridView && (
                <div className="flex rounded-xl border border-[#E0E7E5] bg-white p-0.5">
                  <button type="button" onClick={() => setView('grid')} className={cx('p-2 rounded-lg', view === 'grid' ? 'bg-[#168F88]/10 text-[#168F88]' : 'text-[#8A9496]')} aria-label="Grid view"><LayoutGrid className="w-4 h-4" /></button>
                  <button type="button" onClick={() => setView('list')} className={cx('p-2 rounded-lg', view === 'list' ? 'bg-[#168F88]/10 text-[#168F88]' : 'text-[#8A9496]')} aria-label="List view"><List className="w-4 h-4" /></button>
                </div>
              )}
              <Button icon={Plus} disabled={!canEdit} onClick={() => { setEditErrors({}); setEditing({ index: -1, draft: { ...newItem(), id: newId(idPrefix), visible: true }, isNew: true }); }}>Add {itemLabel.toLowerCase()}</Button>
            </div>
          </div>
          <div className="px-4 sm:px-5 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8A9496] border-b border-[#F2F5F4]">
            <span><b className="text-[#171B20]">{items?.length ?? 0}</b> total</span>
            <span><b className="text-emerald-600">{visibleCount}</b> published</span>
            <span><b className="text-[#5E696B]">{(items?.length ?? 0) - visibleCount}</b> hidden</span>
            {filtering ? <span className="text-amber-700">Clear search &amp; filters to reorder.</span> : <span className="hidden sm:inline">Drag or use the arrows to reorder – the website follows this order.</span>}
          </div>

          {/* Items */}
          {!items ? (
            <div className="p-5 space-y-3"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
          ) : shown.length === 0 ? (
            <EmptyState icon={Inbox} title={filtering ? 'Nothing matches your filters' : `No ${title.toLowerCase()} yet`} text={filtering ? 'Try a different search or clear the filters.' : `Add your first ${itemLabel.toLowerCase()}.`}
              action={filtering ? <Button variant="secondary" onClick={() => { setQ(''); setFilterVal(''); setVisibility(''); }}>Clear filters</Button> : undefined} />
          ) : view === 'grid' ? (
            <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {shown.map(({ item, index }) => (
                <div key={item.id} {...(!filtering && canEdit ? handlers(index) : {})}
                  className={cx('group relative rounded-2xl border bg-white overflow-hidden transition-all', overIndex === index && dragIndex !== index ? 'ring-2 ring-[#168F88]' : 'border-[#EDF2F1]', dragIndex === index && 'opacity-50', item.visible === false && 'opacity-70')}>
                  <button type="button" onClick={() => { setEditErrors({}); setEditing({ index, draft: structuredClone(item), isNew: false }); }} className="block w-full text-left">
                    <div className="relative aspect-[4/3]">
                      <MediaThumb refValue={imageKey ? item[imageKey] : undefined} className="w-full h-full" alt={item.alt} />
                      <span className="absolute top-2 left-2">{item.visible === false ? <Badge tone="slate">Hidden</Badge> : <Badge tone="green">Published</Badge>}</span>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold truncate">{itemTitle(item)}</p>
                      {itemSubtitle && <p className="text-xs text-[#8A9496] truncate">{itemSubtitle(item)}</p>}
                    </div>
                  </button>
                  <div className="flex items-center justify-between px-2 pb-2">
                    <div className="flex">
                      {!filtering && <span className="p-1.5 text-[#C2C9CB] cursor-grab hidden sm:block" aria-hidden><GripVertical className="w-4 h-4" /></span>}
                      <button type="button" disabled={!canEdit || filtering || index === 0} onClick={() => setItems(move(items, index, index - 1))} className="p-1.5 rounded-lg text-[#8A9496] hover:bg-slate-100 disabled:opacity-30 text-xs font-bold" aria-label="Move earlier">←</button>
                      <button type="button" disabled={!canEdit || filtering || index === items.length - 1} onClick={() => setItems(move(items, index, index + 1))} className="p-1.5 rounded-lg text-[#8A9496] hover:bg-slate-100 disabled:opacity-30 text-xs font-bold" aria-label="Move later">→</button>
                    </div>
                    <div className="flex">
                      <button type="button" disabled={!canEdit} onClick={() => toggleVisible(index)} className="p-1.5 rounded-lg text-[#8A9496] hover:bg-slate-100" aria-label={item.visible === false ? 'Publish' : 'Unpublish'} title={item.visible === false ? 'Publish' : 'Unpublish'}>{item.visible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      <button type="button" disabled={!canEdit} onClick={() => setToDelete(index)} className="p-1.5 rounded-lg text-[#8A9496] hover:text-[#E5484D] hover:bg-red-50" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-[#F2F5F4]">
              {shown.map(({ item, index }) => (
                <li key={item.id} {...(!filtering && canEdit ? handlers(index) : {})}
                  className={cx('flex items-center gap-3 px-3 sm:px-5 py-3 transition-colors', overIndex === index && dragIndex !== index && 'bg-[#168F88]/6', dragIndex === index && 'opacity-50')}>
                  {!filtering && canEdit && <span className="text-[#C2C9CB] cursor-grab hidden sm:block" aria-hidden><GripVertical className="w-4 h-4" /></span>}
                  {imageKey && <MediaThumb refValue={item[imageKey]} className="w-14 h-11 rounded-xl shrink-0" alt="" />}
                  <button type="button" className="flex-1 min-w-0 text-left" onClick={() => { setEditErrors({}); setEditing({ index, draft: structuredClone(item), isNew: false }); }}>
                    <p className={cx('text-sm font-semibold truncate', item.visible === false && 'text-[#8A9496]')}>{itemTitle(item) || <i>Untitled</i>}</p>
                    {itemSubtitle && <p className="text-xs text-[#8A9496] truncate">{itemSubtitle(item)}</p>}
                  </button>
                  <span className="hidden md:block">{item.visible === false ? <Badge tone="slate">Hidden</Badge> : <Badge tone="green">Published</Badge>}</span>
                  <div className="flex items-center shrink-0">
                    <button type="button" disabled={!canEdit || filtering || index === 0} onClick={() => setItems(move(items, index, index - 1))} className="p-1.5 rounded-lg text-[#8A9496] hover:bg-slate-100 disabled:opacity-30 hidden sm:block" aria-label="Move up">↑</button>
                    <button type="button" disabled={!canEdit || filtering || index === items.length - 1} onClick={() => setItems(move(items, index, index + 1))} className="p-1.5 rounded-lg text-[#8A9496] hover:bg-slate-100 disabled:opacity-30 hidden sm:block" aria-label="Move down">↓</button>
                    <button type="button" disabled={!canEdit} onClick={() => toggleVisible(index)} className="p-2 rounded-lg text-[#8A9496] hover:bg-slate-100" title={item.visible === false ? 'Publish' : 'Unpublish'} aria-label={item.visible === false ? 'Publish' : 'Unpublish'}>{item.visible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    <button type="button" onClick={() => { setEditErrors({}); setEditing({ index, draft: structuredClone(item), isNew: false }); }} className="p-2 rounded-lg text-[#8A9496] hover:bg-slate-100" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                    <button type="button" disabled={!canEdit} onClick={() => duplicate(index)} className="p-2 rounded-lg text-[#8A9496] hover:bg-slate-100 hidden sm:block" aria-label="Duplicate"><Copy className="w-4 h-4" /></button>
                    <button type="button" disabled={!canEdit} onClick={() => setToDelete(index)} className="p-2 rounded-lg text-[#8A9496] hover:text-[#E5484D] hover:bg-red-50" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        {showPreview && previewPath && items && (
          <div className="min-w-0 xl:sticky xl:top-24 self-start">
            <PreviewPanel path={previewPath} contentKey={contentKey} value={items} onClose={() => setShowPreview(false)} />
          </div>
        )}
      </div>

      {dirty && canEdit && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 flex items-center gap-2 p-2 rounded-2xl bg-[#171B20] text-white shadow-2xl">
          <span className="text-xs font-semibold pl-2 flex-1">Unsaved changes</span>
          <Button size="sm" variant="secondary" onClick={() => persist(false)} loading={busy === 'save'}>Save draft</Button>
          <Button size="sm" onClick={() => persist(true)} loading={busy === 'publish'}>Publish</Button>
        </div>
      )}

      <Drawer
        open={!!editing}
        onClose={closeEditor}
        title={editing?.isNew ? `New ${itemLabel.toLowerCase()}` : `Edit ${itemLabel.toLowerCase()}`}
        subtitle={editing && !editing.isNew ? itemTitle(editing.draft) : 'Fill in the details, then apply.'}
        footer={
          <>
            <Button variant="secondary" onClick={closeEditor}>Cancel</Button>
            <Button onClick={applyEdit} disabled={!canEdit}>{editing?.isNew ? `Add ${itemLabel.toLowerCase()}` : 'Apply changes'}</Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-2xl bg-[#F2F6F5] px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Visible on website</p>
                <p className="text-xs text-[#8A9496]">Hidden items stay saved here but don’t appear publicly.</p>
              </div>
              <button type="button" disabled={!canEdit} onClick={() => setEditing({ ...editing, draft: { ...editing.draft, visible: editing.draft.visible === false } })}
                className={cx('px-3 h-8 rounded-full text-xs font-bold', editing.draft.visible === false ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700')}>
                {editing.draft.visible === false ? 'Hidden' : 'Published'}
              </button>
            </div>
            <FieldsGrid fields={fields} value={editing.draft} onChange={(v) => setEditing({ ...editing, draft: v })} errors={editErrors} ctx={ctx} disabled={!canEdit} />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={toDelete !== null}
        onCancel={() => setToDelete(null)}
        onConfirm={() => { setItems((list) => list!.filter((_, i) => i !== toDelete)); setToDelete(null); toast.info(`${itemLabel} removed`, 'Save draft or publish to make it permanent.'); }}
        title={`Delete this ${itemLabel.toLowerCase()}?`}
        message={<>“<b>{toDelete !== null && items ? itemTitle(items[toDelete]) : ''}</b>” will be removed. Tip: hide it instead if you might need it again.</>}
      />
      <ConfirmDialog open={closeAsk} onCancel={() => setCloseAsk(false)} onConfirm={() => { setCloseAsk(false); setEditing(null); }} title="Discard these edits?" message="Changes in this panel haven’t been applied yet." confirmLabel="Discard" />
      <ConfirmDialog
        open={!!confirm}
        onCancel={() => setConfirm('')}
        onConfirm={doConfirm}
        loading={busy === 'discard' || busy === 'reset'}
        title={confirm === 'reset' ? 'Restore the original list?' : 'Discard draft?'}
        confirmLabel={confirm === 'reset' ? 'Restore original' : 'Discard draft'}
        message={confirm === 'reset' ? 'All added, edited and deleted items are reverted to the original built-in list, and the website goes back to it.' : 'The saved draft is deleted. The published list is unchanged.'}
      />
    </div>
  );
}
