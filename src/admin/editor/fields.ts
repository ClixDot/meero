/** Declarative field definitions for the reusable CMS form engine. */
export type Option = string | { value: string; label: string };

type Base = { key: string; label: string; help?: string; required?: boolean; half?: boolean };

export type Field =
  | (Base & { type: 'text' | 'url' | 'email' | 'link'; placeholder?: string; maxLength?: number })
  | (Base & { type: 'textarea'; rows?: number; placeholder?: string; maxLength?: number })
  | (Base & { type: 'number'; min?: number; max?: number; step?: number; suffix?: string })
  | (Base & { type: 'range'; min: number; max: number; step?: number; suffix?: string })
  | (Base & { type: 'color' })
  | (Base & { type: 'toggle'; description?: string })
  | (Base & { type: 'select'; options: Option[] | ((ctx: FormContext) => Option[]); /** Options are Lucide icon names: show each icon. */ iconOptions?: boolean })
  | (Base & { type: 'image' | 'video' | 'file'; altKey?: string })
  | (Base & { type: 'strings'; itemLabel?: string; placeholder?: string; multiline?: boolean })
  | (Base & { type: 'list'; itemLabel: string; itemTitle: (item: any, index: number) => string; fields: Field[]; newItem: () => any; minItems?: number })
  | (Base & { type: 'group'; fields: Field[]; description?: string; visibilityKey?: string; collapsible?: boolean });

/** Extra data that dynamic options (e.g. gallery categories, job list) can read. */
export type FormContext = Record<string, any>;

export type Errors = Record<string, string>;

const URL_RE = /^(https?:\/\/|\/|mailto:|tel:|#)/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getIn(obj: any, path: string) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

export function setIn<T>(obj: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split('.');
  const copy: any = Array.isArray(obj) ? [...(obj as any)] : { ...(obj as any) };
  copy[head] = rest.length ? setIn((obj as any)?.[head] ?? {}, rest.join('.'), value) : value;
  return copy;
}

/** Validate a value against a field list. Paths are dot-joined (list items use their index). */
export function validate(fields: Field[], value: any, prefix = ''): Errors {
  const errors: Errors = {};
  for (const f of fields) {
    const path = prefix ? `${prefix}.${f.key}` : f.key;
    const v = getIn(value, f.key);
    if (f.type === 'group') {
      if (f.visibilityKey && v?.[f.visibilityKey] === false) continue;
      Object.assign(errors, validate(f.fields, v ?? {}, path));
      continue;
    }
    if (f.type === 'list') {
      const arr = Array.isArray(v) ? v : [];
      if (f.minItems && arr.length < f.minItems) errors[path] = `Add at least ${f.minItems} ${f.itemLabel.toLowerCase()}${f.minItems > 1 ? 's' : ''}.`;
      arr.forEach((item: any, i: number) => Object.assign(errors, validate(f.fields, item, `${path}.${i}`)));
      continue;
    }
    if (f.type === 'strings') {
      if (f.required && (!Array.isArray(v) || v.filter((s: string) => s.trim()).length === 0)) errors[path] = 'Add at least one item.';
      continue;
    }
    const empty = v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
    if (f.required && empty) { errors[path] = `${f.label} is required.`; continue; }
    if (empty) continue;
    if ((f.type === 'url' || f.type === 'link') && !URL_RE.test(String(v).trim())) errors[path] = 'Enter a full URL (https://…) or a site path starting with /.';
    if (f.type === 'email' && !EMAIL_RE.test(String(v).trim())) errors[path] = 'Enter a valid email address.';
    if (f.type === 'color' && !/^#[0-9a-fA-F]{6}$/.test(String(v))) errors[path] = 'Use a 6-digit hex colour like #168F88.';
    if ((f.type === 'number' || f.type === 'range') && Number.isNaN(Number(v))) errors[path] = 'Enter a number.';
    if ((f.type === 'number' || f.type === 'range') && f.min !== undefined && Number(v) < f.min) errors[path] = `Minimum is ${f.min}.`;
    if ((f.type === 'number' || f.type === 'range') && f.max !== undefined && Number(v) > f.max) errors[path] = `Maximum is ${f.max}.`;
    if ((f.type === 'text' || f.type === 'textarea') && f.maxLength && String(v).length > f.maxLength) errors[path] = `Keep this under ${f.maxLength} characters.`;
  }
  return errors;
}

export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
