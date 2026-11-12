'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, ChevronDown, Copy, Eye, EyeOff, GripVertical, ImageIcon, Plus, Trash2, Film, FileText, X } from 'lucide-react';
import { Button, Card, cx, FieldShell, Input, Select, Textarea, Toggle, Badge } from '../ui/kit';
import { MediaPicker, MediaThumb } from './media';
import { getIn, setIn, type Errors, type Field, type FormContext, newId } from './fields';

/* ---------------- Sorting helpers (drag & drop + buttons) ---------------- */
export function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function useDragSort<T>(list: T[], onChange: (next: T[]) => void) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const handlers = (i: number) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => { setDragIndex(i); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)); },
    onDragOver: (e: React.DragEvent) => { if (dragIndex === null) return; e.preventDefault(); setOverIndex(i); },
    onDrop: (e: React.DragEvent) => { e.preventDefault(); if (dragIndex !== null) onChange(move(list, dragIndex, i)); setDragIndex(null); setOverIndex(null); },
    onDragEnd: () => { setDragIndex(null); setOverIndex(null); },
  });
  return { handlers, dragIndex, overIndex };
}

function OrderButtons({ index, length, onMove, label }: { index: number; length: number; onMove: (to: number) => void; label: string }) {
  return (
    <div className="flex items-center">
      <button type="button" disabled={index === 0} onClick={() => onMove(index - 1)} className="p-1.5 rounded-lg text-[#8A9496] hover:bg-slate-100 disabled:opacity-30" aria-label={`Move ${label} up`}><ArrowUp className="w-3.5 h-3.5" /></button>
      <button type="button" disabled={index === length - 1} onClick={() => onMove(index + 1)} className="p-1.5 rounded-lg text-[#8A9496] hover:bg-slate-100 disabled:opacity-30" aria-label={`Move ${label} down`}><ArrowDown className="w-3.5 h-3.5" /></button>
    </div>
  );
}

/* ---------------- Media field ---------------- */
function MediaField({ field, value, onChange, alt, onAltChange, error, disabled }: {
  field: Extract<Field, { type: 'image' | 'video' | 'file' }>; value: string; onChange: (v: string) => void; alt?: string; onAltChange?: (v: string) => void; error?: string; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const Icon = field.type === 'video' ? Film : field.type === 'file' ? FileText : ImageIcon;
  return (
    <FieldShell label={field.label} help={field.help} error={error} required={field.required}>
      <div className={cx('flex flex-col sm:flex-row gap-3 p-3 rounded-2xl border bg-white', error ? 'border-[#E5484D]' : 'border-[#E0E7E5]')}>
        <button type="button" disabled={disabled} onClick={() => setOpen(true)} className="relative w-full sm:w-40 aspect-[16/10] rounded-xl overflow-hidden shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#168F88]">
          <MediaThumb refValue={value} kind={field.type === 'file' ? undefined : field.type} className="w-full h-full" alt={alt} />
          <span className="absolute inset-0 bg-black/45 text-white text-xs font-semibold flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Icon className="w-4 h-4" /> {value ? 'Replace' : 'Choose'}
          </span>
        </button>
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-xs text-[#8A9496] truncate" title={value}>{value ? (value.startsWith('media:') ? 'Media library file' : value) : 'Nothing selected'}</p>
          {onAltChange && field.type === 'image' && (
            <Input value={alt ?? ''} onChange={(e) => onAltChange(e.target.value)} placeholder="Alt text – describe the image for screen readers & SEO" disabled={disabled} />
          )}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="soft" icon={Icon} onClick={() => setOpen(true)} disabled={disabled}>{value ? 'Replace' : `Choose ${field.type}`}</Button>
            {value && !field.required && <Button size="sm" variant="ghost" icon={X} onClick={() => onChange('')} disabled={disabled}>Remove</Button>}
          </div>
        </div>
      </div>
      <MediaPicker open={open} onClose={() => setOpen(false)} kind={field.type} current={value} onSelect={(ref, item) => { onChange(ref); if (item?.alt && onAltChange && !alt) onAltChange(item.alt); }} />
    </FieldShell>
  );
}

/* ---------------- Strings list ---------------- */
function StringsField({ field, value, onChange, error, disabled }: { field: Extract<Field, { type: 'strings' }>; value: string[]; onChange: (v: string[]) => void; error?: string; disabled?: boolean }) {
  const list = Array.isArray(value) ? value : [];
  const { handlers, overIndex } = useDragSort(list, onChange);
  return (
    <FieldShell label={field.label} help={field.help} error={error} required={field.required}>
      <div className="space-y-2">
        {list.map((s, i) => (
          <div key={i} {...(disabled ? {} : handlers(i))} className={cx('flex items-start gap-1.5 rounded-xl', overIndex === i && 'ring-2 ring-[#168F88]/40')}>
            <span className="mt-2.5 text-[#C2C9CB] cursor-grab hidden sm:block" aria-hidden><GripVertical className="w-4 h-4" /></span>
            {field.multiline ? (
              <Textarea rows={3} value={s} disabled={disabled} placeholder={field.placeholder} onChange={(e) => onChange(list.map((x, j) => (j === i ? e.target.value : x)))} />
            ) : (
              <Input value={s} disabled={disabled} placeholder={field.placeholder} onChange={(e) => onChange(list.map((x, j) => (j === i ? e.target.value : x)))} />
            )}
            <OrderButtons index={i} length={list.length} onMove={(to) => onChange(move(list, i, to))} label={field.itemLabel ?? 'item'} />
            <button type="button" disabled={disabled} onClick={() => onChange(list.filter((_, j) => j !== i))} className="p-2 rounded-lg text-[#8A9496] hover:text-[#E5484D] hover:bg-red-50" aria-label="Remove"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        <Button size="sm" variant="secondary" icon={Plus} disabled={disabled} onClick={() => onChange([...list, ''])}>Add {field.itemLabel?.toLowerCase() ?? 'item'}</Button>
      </div>
    </FieldShell>
  );
}

/* ---------------- Object list ---------------- */
function ListField({ field, value, onChange, errors, path, ctx, disabled }: {
  field: Extract<Field, { type: 'list' }>; value: any[]; onChange: (v: any[]) => void; errors: Errors; path: string; ctx: FormContext; disabled?: boolean;
}) {
  const list = Array.isArray(value) ? value : [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { handlers, overIndex } = useDragSort(list, onChange);
  const listError = errors[path];
  return (
    <FieldShell label={field.label} help={field.help} error={listError}>
      <div className="space-y-2">
        {list.map((item, i) => {
          const itemPath = `${path}.${i}`;
          const hasError = Object.keys(errors).some((k) => k.startsWith(`${itemPath}.`));
          const open = openIndex === i || hasError;
          return (
            <div key={item?.id ?? i} {...(disabled ? {} : handlers(i))} className={cx('rounded-2xl border bg-white transition-shadow', hasError ? 'border-[#E5484D]/60' : 'border-[#E6ECEB]', overIndex === i && 'ring-2 ring-[#168F88]/40', open && 'shadow-sm')}>
              <div className="flex items-center gap-1 pl-2 pr-1.5 py-1.5">
                <span className="text-[#C2C9CB] cursor-grab hidden sm:block" aria-hidden><GripVertical className="w-4 h-4" /></span>
                <button type="button" onClick={() => setOpenIndex(open ? null : i)} className="flex-1 min-w-0 flex items-center gap-2 text-left px-1.5 py-1.5 rounded-lg hover:bg-slate-50">
                  <ChevronDown className={cx('w-4 h-4 text-[#8A9496] transition-transform shrink-0', open && 'rotate-180')} />
                  <span className="text-sm font-semibold truncate">{field.itemTitle(item, i) || `${field.itemLabel} ${i + 1}`}</span>
                  {item?.visible === false && <Badge tone="slate">Hidden</Badge>}
                  {hasError && <Badge tone="red">Needs attention</Badge>}
                </button>
                {'visible' in (item ?? {}) && (
                  <button type="button" disabled={disabled} onClick={() => onChange(list.map((x, j) => (j === i ? { ...x, visible: x.visible === false } : x)))} className="p-1.5 rounded-lg text-[#8A9496] hover:bg-slate-100" aria-label={item.visible === false ? 'Show' : 'Hide'} title={item.visible === false ? 'Show on website' : 'Hide from website'}>
                    {item.visible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                )}
                <OrderButtons index={i} length={list.length} onMove={(to) => { onChange(move(list, i, to)); setOpenIndex(null); }} label={field.itemLabel} />
                <button type="button" disabled={disabled} onClick={() => onChange([...list.slice(0, i + 1), { ...structuredClone(item), id: item?.id ? newId('item') : undefined }, ...list.slice(i + 1)])} className="p-1.5 rounded-lg text-[#8A9496] hover:bg-slate-100 hidden sm:block" aria-label="Duplicate"><Copy className="w-3.5 h-3.5" /></button>
                <button type="button" disabled={disabled || (field.minItems ? list.length <= field.minItems : false)} onClick={() => { onChange(list.filter((_, j) => j !== i)); setOpenIndex(null); }} className="p-1.5 rounded-lg text-[#8A9496] hover:text-[#E5484D] hover:bg-red-50 disabled:opacity-30" aria-label="Remove"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2 border-t border-[#F0F4F3]">
                      <FieldsGrid fields={field.fields} value={item} onChange={(v) => onChange(list.map((x, j) => (j === i ? v : x)))} errors={errors} prefix={itemPath} ctx={ctx} disabled={disabled} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        <Button size="sm" variant="secondary" icon={Plus} disabled={disabled} onClick={() => { onChange([...list, field.newItem()]); setOpenIndex(list.length); }}>Add {field.itemLabel.toLowerCase()}</Button>
      </div>
    </FieldShell>
  );
}

/* ---------------- Grid of fields ---------------- */
export function FieldsGrid({ fields, value, onChange, errors, prefix = '', ctx = {}, disabled }: {
  fields: Field[]; value: any; onChange: (v: any) => void; errors: Errors; prefix?: string; ctx?: FormContext; disabled?: boolean;
}) {
  const p = (k: string) => (prefix ? `${prefix}.${k}` : k);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
      {fields.map((f) => {
        const v = getIn(value, f.key);
        const set = (nv: unknown) => onChange(setIn(value ?? {}, f.key, nv));
        const err = errors[p(f.key)];
        const span = f.half ? '' : 'sm:col-span-2';
        const id = `f-${p(f.key)}`;
        switch (f.type) {
          case 'group':
            return (
              <div key={f.key} className="sm:col-span-2">
                <GroupSection field={f} value={v ?? {}} onChange={set} errors={errors} prefix={p(f.key)} ctx={ctx} disabled={disabled} nested />
              </div>
            );
          case 'list':
            return <div key={f.key} className={span}><ListField field={f} value={v} onChange={set} errors={errors} path={p(f.key)} ctx={ctx} disabled={disabled} /></div>;
          case 'strings':
            return <div key={f.key} className={span}><StringsField field={f} value={v} onChange={set} error={err} disabled={disabled} /></div>;
          case 'image': case 'video': case 'file':
            return (
              <div key={f.key} className={span}>
                <MediaField field={f} value={v ?? ''} onChange={set} error={err} disabled={disabled}
                  alt={f.altKey ? getIn(value, f.altKey) : undefined}
                  onAltChange={f.altKey ? (a) => onChange(setIn(setIn(value ?? {}, f.key, v), f.altKey!, a)) : undefined} />
              </div>
            );
          case 'toggle':
            return <div key={f.key} className={cx(span, 'pt-1')}><Toggle checked={v !== false && !!v} onChange={set} label={f.label} description={f.description ?? f.help} disabled={disabled} /></div>;
          case 'select': {
            const opts = typeof f.options === 'function' ? f.options(ctx) : f.options;
            const values = opts.map((o) => (typeof o === 'string' ? o : o.value));
            const all = v && !values.includes(v) ? [...opts, { value: v, label: `${v} (not in list)` }] : opts;
            return (
              <FieldShell key={f.key} className={span} label={f.label} help={f.help} error={err} required={f.required} htmlFor={id}>
                <Select id={id} value={v ?? ''} onChange={(e) => set(e.target.value)} invalid={!!err} disabled={disabled} options={[...(f.required ? [] : [{ value: '', label: '— None —' }]), ...all]} />
              </FieldShell>
            );
          }
          case 'textarea':
            return (
              <FieldShell key={f.key} className={span} label={f.label} help={f.help} error={err} required={f.required} htmlFor={id}
                aside={f.maxLength ? <span className={cx('text-[11px]', String(v ?? '').length > f.maxLength ? 'text-[#E5484D]' : 'text-[#A3ACAE]')}>{String(v ?? '').length}/{f.maxLength}</span> : undefined}>
                <Textarea id={id} rows={f.rows ?? 3} value={v ?? ''} onChange={(e) => set(e.target.value)} invalid={!!err} placeholder={f.placeholder} disabled={disabled} />
              </FieldShell>
            );
          case 'color':
            return (
              <FieldShell key={f.key} className={span} label={f.label} help={f.help} error={err} required={f.required} htmlFor={id}>
                <div className="flex items-center gap-2">
                  <input type="color" aria-label={`${f.label} picker`} value={/^#[0-9a-fA-F]{6}$/.test(v ?? '') ? v : '#000000'} onChange={(e) => set(e.target.value.toUpperCase())} disabled={disabled} className="w-10 h-10 rounded-xl border border-[#E0E7E5] bg-white p-1 cursor-pointer" />
                  <Input id={id} value={v ?? ''} onChange={(e) => set(e.target.value)} invalid={!!err} className="font-mono uppercase" disabled={disabled} />
                </div>
              </FieldShell>
            );
          case 'range':
            return (
              <FieldShell key={f.key} className={span} label={f.label} help={f.help} error={err} htmlFor={id} aside={<span className="text-xs font-bold text-[#168F88]">{v}{f.suffix}</span>}>
                <input id={id} type="range" min={f.min} max={f.max} step={f.step ?? 1} value={Number(v ?? f.min)} onChange={(e) => set(Number(e.target.value))} disabled={disabled} className="w-full accent-[#168F88]" />
              </FieldShell>
            );
          case 'number':
            return (
              <FieldShell key={f.key} className={span} label={f.label} help={f.help} error={err} required={f.required} htmlFor={id}>
                <Input id={id} type="number" min={f.min} max={f.max} step={f.step} value={v ?? ''} onChange={(e) => set(e.target.value === '' ? '' : Number(e.target.value))} invalid={!!err} disabled={disabled} />
              </FieldShell>
            );
          default:
            return (
              <FieldShell key={f.key} className={span} label={f.label} help={f.help} error={err} required={f.required} htmlFor={id}
                aside={'maxLength' in f && f.maxLength ? <span className={cx('text-[11px]', String(v ?? '').length > f.maxLength ? 'text-[#E5484D]' : 'text-[#A3ACAE]')}>{String(v ?? '').length}/{f.maxLength}</span> : undefined}>
                <Input id={id} type={f.type === 'email' ? 'email' : 'text'} value={v ?? ''} onChange={(e) => set(e.target.value)} invalid={!!err} placeholder={'placeholder' in f ? f.placeholder : undefined} disabled={disabled} />
              </FieldShell>
            );
        }
      })}
    </div>
  );
}

/* ---------------- Section card ---------------- */
export function GroupSection({ field, value, onChange, errors, prefix, ctx, disabled, nested }: {
  field: Extract<Field, { type: 'group' }>; value: any; onChange: (v: any) => void; errors: Errors; prefix: string; ctx: FormContext; disabled?: boolean; nested?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const vk = field.visibilityKey;
  const hidden = vk ? value?.[vk] === false : false;
  const fields = vk ? field.fields.filter((f) => f.key !== vk) : field.fields;
  const hasError = Object.keys(errors).some((k) => k.startsWith(`${prefix}.`));
  const Wrapper: React.ElementType = nested ? 'div' : Card;
  return (
    <Wrapper id={`section-${prefix}`} className={cx(nested ? 'rounded-2xl border border-[#E6ECEB] bg-[#FBFDFD]' : '', 'scroll-mt-28')}>
      <div className={cx('flex flex-wrap items-center justify-between gap-3', nested ? 'px-4 pt-3.5' : 'px-5 sm:px-6 pt-5')}>
        <button type="button" onClick={() => setCollapsed((c) => !c)} className="flex items-center gap-2 min-w-0 text-left" aria-expanded={!collapsed}>
          <ChevronDown className={cx('w-4 h-4 text-[#8A9496] transition-transform', collapsed && '-rotate-90')} />
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className={cx('font-bold font-heading text-[#171B20]', nested ? 'text-sm' : 'text-[15px]')}>{field.label}</span>
              {hidden && <Badge tone="slate">Hidden on site</Badge>}
              {hasError && <Badge tone="red">Fix errors</Badge>}
            </span>
            {field.description && <span className="block text-xs text-[#8A9496] mt-0.5">{field.description}</span>}
          </span>
        </button>
        {vk && <Toggle size="sm" checked={!hidden} onChange={(on) => onChange({ ...value, [vk]: on })} label="Show on website" disabled={disabled} />}
      </div>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className={cx(nested ? 'px-4 pb-4 pt-3' : 'px-5 sm:px-6 pb-6 pt-4', hidden && 'opacity-60')}>
              <FieldsGrid fields={fields} value={value} onChange={onChange} errors={errors} prefix={prefix} ctx={ctx} disabled={disabled} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Wrapper>
  );
}
