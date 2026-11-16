'use client';

/**
 * MEERO admin design system – small, composable primitives.
 * Visual language: soft mint canvas, frosted white cards, teal primary,
 * subtle lavender accents, generous radii, quiet shadows.
 */
import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, Check, ChevronDown, Loader2, X } from 'lucide-react';

export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

/* ---------------- Button ---------------- */
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft' | 'dark';
type BtnSize = 'sm' | 'md' | 'lg';

const btnBase = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#168F88]/60 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] whitespace-nowrap';
const btnVariants: Record<BtnVariant, string> = {
  primary: 'bg-gradient-to-b from-[#1BA39B] to-[#168F88] text-white shadow-[0_6px_16px_-6px_rgba(22,143,136,0.6)] hover:brightness-110',
  secondary: 'bg-white text-[#171B20] border border-[#E3EAE8] hover:border-[#168F88]/40 hover:text-[#168F88] shadow-xs',
  ghost: 'text-[#4B5759] hover:bg-[#168F88]/8 hover:text-[#168F88]',
  danger: 'bg-[#E5484D] text-white hover:bg-[#d93d42] shadow-[0_6px_16px_-6px_rgba(229,72,77,0.55)]',
  soft: 'bg-[#168F88]/10 text-[#127a74] hover:bg-[#168F88]/15',
  dark: 'bg-[#171B20] text-white hover:bg-[#2a3036]',
};
const btnSizes: Record<BtnSize, string> = {
  sm: 'h-8 px-3.5 text-xs',
  md: 'h-10 px-4.5 text-sm',
  lg: 'h-12 px-6 text-sm',
};

export function Button({
  variant = 'primary', size = 'md', loading, icon: Icon, className, children, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: BtnSize; loading?: boolean; icon?: React.ElementType }) {
  return (
    <button type="button" className={cx(btnBase, btnVariants[variant], btnSizes[size], className)} disabled={loading || rest.disabled} {...rest}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon ? <Icon className="w-4 h-4 shrink-0" /> : null}
      {children}
    </button>
  );
}

export function IconButton({
  icon: Icon, label, className, active, badge, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon: React.ElementType; label: string; active?: boolean; badge?: number }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        'relative inline-flex items-center justify-center w-10 h-10 rounded-full border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#168F88]/60 disabled:opacity-40',
        active ? 'bg-[#168F88] text-white border-[#168F88]' : 'bg-white/80 text-[#4B5759] border-[#E3EAE8] hover:text-[#168F88] hover:border-[#168F88]/40',
        className,
      )}
      {...rest}
    >
      <Icon className="w-[18px] h-[18px]" />
      {!!badge && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E5484D] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

/* ---------------- Surfaces ---------------- */
export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx('soft-card rounded-[22px]', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon }: { title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 sm:px-6 pt-5 sm:pt-6">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-[#168F88]/10 text-[#168F88] flex items-center justify-center shrink-0">
            <Icon className="w-[18px] h-[18px]" />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold text-[#171B20] font-heading leading-tight">{title}</h3>
          {subtitle && <p className="text-xs text-[#7A8587] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, description, actions, badge }: { title: string; description?: string; actions?: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-[#171B20] font-heading">{title}</h1>
          {badge}
        </div>
        {description && <p className="text-sm text-[#7A8587] mt-1 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------------- Badge ---------------- */
type Tone = 'teal' | 'lavender' | 'amber' | 'red' | 'green' | 'slate' | 'blue';
const tones: Record<Tone, string> = {
  teal: 'bg-[#168F88]/10 text-[#127a74] ring-[#168F88]/20',
  lavender: 'bg-[#8B80F9]/12 text-[#5d52d6] ring-[#8B80F9]/25',
  amber: 'bg-amber-100/80 text-amber-800 ring-amber-300/50',
  red: 'bg-red-100/80 text-red-700 ring-red-300/50',
  green: 'bg-emerald-100/80 text-emerald-700 ring-emerald-300/50',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
  blue: 'bg-sky-100/80 text-sky-700 ring-sky-300/50',
};
export function Badge({ tone = 'slate', children, dot, className }: { tone?: Tone; children: React.ReactNode; dot?: boolean; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap', tones[tone], className)}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/* ---------------- Form controls ---------------- */
const inputBase = 'w-full rounded-xl bg-white border text-sm text-[#171B20] placeholder:text-[#A3ACAE] transition-colors focus:outline-none focus:ring-4 focus:ring-[#168F88]/12 focus:border-[#168F88] disabled:bg-slate-50 disabled:text-slate-500';

export function FieldShell({ label, help, error, required, htmlFor, children, className, aside }: {
  label?: React.ReactNode; help?: React.ReactNode; error?: string; required?: boolean; htmlFor?: string; children: React.ReactNode; className?: string; aside?: React.ReactNode;
}) {
  // Associate the label with a direct Input/Textarea/Select child automatically.
  const autoId = useId();
  let control = children;
  let forId = htmlFor;
  if (!forId && React.isValidElement(children) && [Input, Textarea, Select].includes(children.type as any)) {
    const props = children.props as { id?: string };
    forId = props.id ?? autoId;
    if (!props.id) control = React.cloneElement(children as React.ReactElement<any>, { id: autoId });
  }
  return (
    <div className={cx('space-y-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={forId} className="text-[13px] font-semibold text-[#2B3134]">
            {label}{required && <span className="text-[#E5484D] ml-0.5">*</span>}
          </label>
          {aside}
        </div>
      )}
      {control}
      {error ? <p className="text-xs text-[#E5484D] font-medium" role="alert">{error}</p> : help ? <p className="text-xs text-[#8A9496]">{help}</p> : null}
    </div>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function Input({ className, invalid, ...rest }, ref) {
    return <input ref={ref} className={cx(inputBase, 'h-10 px-3.5', invalid ? 'border-[#E5484D]' : 'border-[#E0E7E5]', className)} {...rest} />;
  },
);

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  function Textarea({ className, invalid, rows = 3, ...rest }, ref) {
    return <textarea ref={ref} rows={rows} className={cx(inputBase, 'px-3.5 py-2.5 leading-relaxed resize-y', invalid ? 'border-[#E5484D]' : 'border-[#E0E7E5]', className)} {...rest} />;
  },
);

/* ---------------- Select (branded listbox) ---------------- */
export type SelectOption = string | { value: string; label: string; icon?: React.ReactNode; hint?: string };

/**
 * Drop-in replacement for a native <select>: same `value` / `onChange(e.target.value)` contract,
 * but a branded popover list. The list is portalled so cards with overflow-hidden never clip it.
 */
export function Select({ id, value, onChange, options, invalid, disabled, className, placeholder = 'Select…', size = 'md', 'aria-label': ariaLabel }: {
  id?: string;
  value?: string | number | null;
  onChange?: (e: { target: { value: string } }) => void;
  options: SelectOption[];
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  size?: 'sm' | 'md';
  'aria-label'?: string;
}) {
  const opts = React.useMemo(() => options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o)) as Array<{ value: string; label: string; icon?: React.ReactNode; hint?: string }>, [options]);
  const current = String(value ?? '');
  const selected = opts.find((o) => o.value === current);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [query, setQuery] = React.useState('');
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number; up: boolean; maxH: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ text: '', at: 0 });
  const listId = useId();
  const searchable = opts.length > 10;

  const shown = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? opts.filter((o) => o.label.toLowerCase().includes(q)) : opts;
  }, [opts, query]);

  const place = React.useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const below = window.innerHeight - r.bottom - 12;
    const above = r.top - 12;
    const up = below < 240 && above > below;
    setPos({ top: up ? r.top - 6 : r.bottom + 6, left: r.left, width: r.width, up, maxH: Math.min(320, Math.max(160, up ? above : below)) });
  }, []);

  const openList = () => {
    if (disabled) return;
    place();
    setQuery('');
    setActive(Math.max(0, opts.findIndex((o) => o.value === current)));
    setOpen(true);
  };
  const close = (focusTrigger = true) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  };
  const choose = (v: string) => {
    if (v !== current) onChange?.({ target: { value: v } });
    close();
  };

  // Keep the panel attached while the page or a parent scrolls; close on outside press.
  useEffect(() => {
    if (!open) return;
    const onMove = () => place();
    const onDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      close(false);
    };
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => {
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, place]);

  // Keep the highlighted option in view.
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); openList(); }
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
    if (e.key === 'Tab') { close(false); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(shown.length - 1, a + 1)); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); return; }
    if (e.key === 'Home') { e.preventDefault(); setActive(0); return; }
    if (e.key === 'End') { e.preventDefault(); setActive(shown.length - 1); return; }
    if (e.key === 'Enter') { e.preventDefault(); const o = shown[active]; if (o) choose(o.value); return; }
    // Type-to-jump when there is no search box.
    if (!searchable && e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
      const now = Date.now();
      const t = typeahead.current;
      t.text = now - t.at > 700 ? e.key.toLowerCase() : t.text + e.key.toLowerCase();
      t.at = now;
      const i = shown.findIndex((o) => o.label.toLowerCase().startsWith(t.text));
      if (i >= 0) setActive(i);
    }
  };

  const h = size === 'sm' ? 'h-9 text-[13px]' : 'h-10 text-sm';

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        className={cx(
          'group w-full flex items-center gap-2.5 rounded-xl bg-white border pl-3.5 pr-2.5 text-left text-[#171B20] transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[#168F88]/12 focus-visible:border-[#168F88] disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
          h,
          invalid ? 'border-[#E5484D]' : open ? 'border-[#168F88] ring-4 ring-[#168F88]/12' : 'border-[#E0E7E5] hover:border-[#168F88]/45',
          className,
        )}
      >
        {selected?.icon && <span className="shrink-0 text-[#168F88] [&>svg]:w-4 [&>svg]:h-4">{selected.icon}</span>}
        <span className={cx('flex-1 min-w-0 truncate', !selected && 'text-[#A3ACAE]')}>{selected ? selected.label : current || placeholder}</span>
        <span className={cx('shrink-0 w-6 h-6 rounded-lg inline-flex items-center justify-center transition-colors', open ? 'bg-[#168F88]/10 text-[#168F88]' : 'text-[#7A8587] group-hover:text-[#168F88]')}>
          <ChevronDown className={cx('w-4 h-4 transition-transform duration-200', open && 'rotate-180')} />
        </span>
      </button>
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && pos && (
            <motion.div
              ref={panelRef}
              data-lenis-prevent
              initial={{ opacity: 0, y: pos.up ? 4 : -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: pos.up ? 4 : -4, scale: 0.98 }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: 'fixed', left: pos.left, width: Math.max(pos.width, 180), ...(pos.up ? { bottom: window.innerHeight - pos.top } : { top: pos.top }), transformOrigin: pos.up ? 'bottom' : 'top' }}
              className="z-[120] rounded-2xl bg-white border border-[#E3EAE8] shadow-[0_24px_48px_-20px_rgba(23,27,32,0.35),0_2px_6px_-2px_rgba(23,27,32,0.08)] overflow-hidden"
            >
              {searchable && (
                <div className="p-2 border-b border-[#EEF3F2]">
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setActive(0); }}
                    onKeyDown={onKeyDown}
                    placeholder="Search…"
                    aria-label="Search options"
                    className="w-full h-9 px-3 rounded-xl bg-[#F4F8F7] text-sm placeholder:text-[#A3ACAE] focus:outline-none focus:ring-2 focus:ring-[#168F88]/25"
                  />
                </div>
              )}
              <ul ref={listRef} id={listId} role="listbox" tabIndex={-1} onKeyDown={onKeyDown} className="p-1.5 overflow-y-auto overscroll-contain" style={{ maxHeight: pos.maxH - (searchable ? 54 : 0) }}>
                {shown.length === 0 && <li className="px-3 py-6 text-center text-xs text-[#8A9496]">No matches</li>}
                {shown.map((o, i) => {
                  const isSel = o.value === current;
                  const isAct = i === active;
                  return (
                    <li
                      key={o.value || `__empty-${i}`}
                      data-index={i}
                      role="option"
                      aria-selected={isSel}
                      onMouseEnter={() => setActive(i)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => choose(o.value)}
                      className={cx(
                        'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm cursor-pointer select-none transition-colors',
                        isAct ? 'bg-[#168F88]/8' : '',
                        isSel ? 'text-[#127a74] font-semibold' : 'text-[#2B3134]',
                        !o.value && !isSel && 'text-[#8A9496]',
                      )}
                    >
                      {o.icon && (
                        <span className={cx('w-7 h-7 rounded-lg inline-flex items-center justify-center shrink-0 [&>svg]:w-4 [&>svg]:h-4', isSel ? 'bg-[#168F88] text-white' : 'bg-[#168F88]/10 text-[#168F88]')}>{o.icon}</span>
                      )}
                      <span className="flex-1 min-w-0">
                        <span className="block truncate">{o.label}</span>
                        {o.hint && <span className="block text-[11px] text-[#8A9496] truncate font-normal">{o.hint}</span>}
                      </span>
                      {isSel && <Check className="w-4 h-4 text-[#168F88] shrink-0" />}
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

export function Toggle({ checked, onChange, label, description, disabled, size = 'md' }: { checked: boolean; onChange: (v: boolean) => void; label?: React.ReactNode; description?: React.ReactNode; disabled?: boolean; size?: 'sm' | 'md' }) {
  const id = useId();
  const w = size === 'sm' ? 'w-8 h-[18px]' : 'w-10 h-6';
  const k = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  const tx = size === 'sm' ? 'translate-x-[14px]' : 'translate-x-4';
  return (
    <label htmlFor={id} className={cx('inline-flex items-start gap-3 cursor-pointer select-none', disabled && 'opacity-50 cursor-not-allowed')}>
      <span className="relative inline-flex shrink-0 mt-0.5">
        <input id={id} type="checkbox" role="switch" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
        <span className={cx(w, 'rounded-full transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-[#168F88]/20', checked ? 'bg-[#168F88]' : 'bg-[#D5DCDB]')} />
        <span className={cx(k, 'absolute top-0.5 left-0.5 rounded-full bg-white shadow transition-transform', checked && tx)} />
      </span>
      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="block text-[13px] font-semibold text-[#2B3134] leading-5">{label}</span>}
          {description && <span className="block text-xs text-[#8A9496]">{description}</span>}
        </span>
      )}
    </label>
  );
}

/* ---------------- Tabs ---------------- */
export function Tabs<T extends string>({ tabs, value, onChange, className }: { tabs: Array<{ value: T; label: string; count?: number }>; value: T; onChange: (v: NoInfer<T>) => void; className?: string }) {
  return (
    <div role="tablist" className={cx('inline-flex max-w-full overflow-x-auto no-scrollbar p-1 rounded-full bg-white/70 border border-white shadow-xs', className)}>
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          type="button"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={cx(
            'relative px-3.5 sm:px-4 h-8 rounded-full text-xs sm:text-[13px] font-semibold transition-colors whitespace-nowrap',
            value === t.value ? 'text-white' : 'text-[#5E696B] hover:text-[#171B20]',
          )}
        >
          {value === t.value && <motion.span layoutId={`tab-${tabs.map((x) => x.value).join()}`} className="absolute inset-0 rounded-full bg-[#171B20]" transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }} />}
          <span className="relative inline-flex items-center gap-1.5">
            {t.label}
            {t.count !== undefined && <span className={cx('text-[10px] px-1.5 rounded-full', value === t.value ? 'bg-white/20' : 'bg-[#168F88]/10 text-[#168F88]')}>{t.count}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ---------------- Overlays ---------------- */
function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
}

function usePortal() {
  const [el, setEl] = React.useState<HTMLElement | null>(null);
  useEffect(() => setEl(document.body), []);
  return el;
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: {
  open: boolean; onClose: () => void; title: React.ReactNode; description?: React.ReactNode; children?: React.ReactNode; footer?: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  useEscape(open, onClose);
  const reduce = useReducedMotion();
  const portal = usePortal();
  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' };
  const titleId = useId();
  if (!portal) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4" data-lenis-prevent>
          <motion.div className="absolute inset-0 bg-[#0E1416]/40 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cx('relative w-full bg-white sm:rounded-[26px] rounded-t-[26px] shadow-2xl flex flex-col max-h-[92dvh]', widths[size])}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 pb-3">
              <div className="min-w-0">
                <h2 id={titleId} className="text-lg font-bold font-heading text-[#171B20]">{title}</h2>
                {description && <p className="text-sm text-[#7A8587] mt-0.5">{description}</p>}
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="p-2 -mr-2 rounded-full text-[#7A8587] hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            {children && <div className="px-5 sm:px-6 pb-5 overflow-y-auto">{children}</div>}
            {footer && <div className="px-5 sm:px-6 py-4 border-t border-[#EDF2F1] flex flex-wrap justify-end gap-2 bg-[#FAFCFC] sm:rounded-b-[26px]">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    portal,
  );
}

export function Drawer({ open, onClose, title, subtitle, children, footer, width = 'max-w-2xl' }: {
  open: boolean; onClose: () => void; title: React.ReactNode; subtitle?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; width?: string;
}) {
  useEscape(open, onClose);
  const reduce = useReducedMotion();
  const portal = usePortal();
  const titleId = useId();
  if (!portal) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]" data-lenis-prevent>
          <motion.div className="absolute inset-0 bg-[#0E1416]/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cx('absolute right-0 top-0 h-full w-full bg-[#FBFDFD] shadow-2xl flex flex-col sm:rounded-l-[28px]', width)}
            initial={reduce ? { opacity: 0 } : { x: '100%' }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-start justify-between gap-4 px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-[#EDF2F1]">
              <div className="min-w-0">
                <h2 id={titleId} className="text-lg font-bold font-heading text-[#171B20] truncate">{title}</h2>
                {subtitle && <div className="text-sm text-[#7A8587] mt-0.5">{subtitle}</div>}
              </div>
              <button type="button" onClick={onClose} aria-label="Close panel" className="p-2 -mr-2 rounded-full text-[#7A8587] hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5">{children}</div>
            {footer && <div className="px-5 sm:px-7 py-4 border-t border-[#EDF2F1] flex flex-wrap justify-end gap-2 bg-white sm:rounded-bl-[28px]">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    portal,
  );
}

export function ConfirmDialog({ open, onCancel, onConfirm, title, message, confirmLabel = 'Delete', tone = 'danger', loading, requireText }: {
  open: boolean; onCancel: () => void; onConfirm: () => void; title: string; message: React.ReactNode; confirmLabel?: string; tone?: 'danger' | 'primary'; loading?: boolean; requireText?: string;
}) {
  const [typed, setTyped] = React.useState('');
  useEffect(() => { if (!open) setTyped(''); }, [open]);
  const blocked = !!requireText && typed !== requireText;
  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      title={
        <span className="flex items-center gap-2.5">
          <span className={cx('w-8 h-8 rounded-full flex items-center justify-center', tone === 'danger' ? 'bg-red-100 text-[#E5484D]' : 'bg-[#168F88]/10 text-[#168F88]')}>
            <AlertTriangle className="w-4 h-4" />
          </span>
          {title}
        </span>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading} disabled={blocked}>{confirmLabel}</Button>
        </>
      }
    >
      <div className="text-sm text-[#4B5759] leading-relaxed space-y-3">
        <div>{message}</div>
        {requireText && (
          <FieldShell label={<>Type <code className="px-1 rounded bg-slate-100">{requireText}</code> to confirm</>}>
            <Input value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus />
          </FieldShell>
        )}
      </div>
    </Modal>
  );
}

/* ---------------- Feedback ---------------- */
export function EmptyState({ icon: Icon, title, text, action }: { icon: React.ElementType; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-14">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#168F88]/12 to-[#8B80F9]/12 text-[#168F88] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[#171B20] font-heading">{title}</h3>
      {text && <p className="text-sm text-[#7A8587] mt-1 max-w-sm">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('animate-pulse rounded-xl bg-gradient-to-r from-[#EDF2F1] via-[#F6F9F8] to-[#EDF2F1]', className)} />;
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cx('w-5 h-5 animate-spin text-[#168F88]', className)} />;
}

/* ---------------- Utilities ---------------- */
export function formatBytes(n: number) {
  if (!n) return '—';
  const u = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(u.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  return `${(n / 1024 ** i).toFixed(i ? 1 : 0)} ${u[i]}`;
}

export function timeAgo(iso?: string) {
  if (!iso) return '—';
  const s = Math.round((Date.now() - Date.parse(iso)) / 1000);
  if (s < 45) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDate(iso?: string, withTime = false) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}) });
}

export function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void, active = true) {
  const cb = useRef(onOutside);
  cb.current = onOutside;
  useEffect(() => {
    if (!active) return;
    const h = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb.current();
    };
    document.addEventListener('mousedown', h);
    document.addEventListener('touchstart', h);
    return () => {
      document.removeEventListener('mousedown', h);
      document.removeEventListener('touchstart', h);
    };
  }, [ref, active]);
}

export function downloadFile(name: string, content: BlobPart, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
