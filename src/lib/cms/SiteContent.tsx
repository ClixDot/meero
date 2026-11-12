'use client';

/**
 * Public-site content provider.
 *
 * First render uses the built-in defaults (identical to the static build, so no
 * hydration mismatch). It then loads published CMS content from the content
 * service, resolves media references, and re-renders. Changes published in the
 * admin arrive live through the BroadcastChannel subscription.
 *
 * `?cmsPreview=1` on any public URL renders unpublished drafts (used by the
 * admin live-preview iframe).
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { contentKeys, defaultContent, getDefault, type ContentKey, type ContentMap } from './defaults';
import { subscribe } from './idb';
import { services } from '../services';

type SiteData = ContentMap;

const SiteContext = createContext<SiteData>(defaultContent);

async function resolveDeep<T>(value: T): Promise<T> {
  if (typeof value === 'string') {
    return (value.startsWith('media:') ? await services.media.resolve(value) : value) as T;
  }
  if (Array.isArray(value)) return (await Promise.all(value.map(resolveDeep))) as T;
  if (value && typeof value === 'object') {
    const entries = await Promise.all(Object.entries(value).map(async ([k, v]) => [k, await resolveDeep(v)] as const));
    return Object.fromEntries(entries) as T;
  }
  return value;
}

const isPreview = () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('cmsPreview');

const SAFE_FONT = /^[A-Za-z0-9 ]{2,40}$/;
const SAFE_COLOR = /^#[0-9a-fA-F]{3,8}$/;

function applyDesign(design: SiteData['design']) {
  const root = document.documentElement;
  const c = design.colors;
  const set = (name: string, v: string) => SAFE_COLOR.test(v) && root.style.setProperty(name, v);
  set('--brand-teal', c.teal);
  set('--brand-turq', c.turquoise);
  set('--brand-text', c.text);
  set('--brand-bg', c.background);
  set('--brand-lavender', c.lavender);
  set('--brand-page', design.pageBackground);
  set('--brand-dark', design.darkBackground);

  const fonts = [design.headingFont, design.bodyFont].filter((f) => SAFE_FONT.test(f));
  const builtIn = ['Outfit', 'Plus Jakarta Sans'];
  const toLoad = fonts.filter((f) => !builtIn.includes(f));
  let link = document.getElementById('cms-fonts') as HTMLLinkElement | null;
  if (toLoad.length) {
    const href = `https://fonts.googleapis.com/css2?${toLoad.map((f) => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700;800`).join('&')}&display=swap`;
    if (!link) {
      link = document.createElement('link');
      link.id = 'cms-fonts';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    if (link.href !== href) link.href = href;
  } else link?.remove();

  const stack = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  if (SAFE_FONT.test(design.headingFont)) root.style.setProperty('--font-heading', `'${design.headingFont}', ${stack}`);
  if (SAFE_FONT.test(design.bodyFont)) root.style.setProperty('--font-sans', `'${design.bodyFont}', ${stack}`);

  const scale = Math.min(140, Math.max(70, Number(design.headingScale) || 100));
  root.style.setProperty('--cms-heading-zoom', String(scale / 100));
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!content) return;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function applySeo(seo: SiteData['seo'], pathname: string) {
  const page = seo.pages.find((p) => p.path === pathname);
  if (!page) return;
  if (page.title) document.title = page.title;
  setMeta('name', 'description', page.description);
  setMeta('name', 'keywords', page.keywords);
  setMeta('property', 'og:title', page.title);
  setMeta('property', 'og:description', page.description);
  const og = page.ogImage || seo.defaultOgImage;
  if (og && !og.startsWith('blob:')) setMeta('property', 'og:image', og);
  const canonical = page.canonical || (seo.canonicalBase ? seo.canonicalBase.replace(/\/$/, '') + pathname : '');
  if (canonical) {
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;
  }
}

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SiteData>(defaultContent);
  const pathname = usePathname() || '/';

  useEffect(() => {
    let cancelled = false;
    const preview = isPreview();

    const load = async (keys: ContentKey[] = contentKeys) => {
      try {
        const loaded = await Promise.all(keys.map(async (k) => [k, await resolveDeep(await services.content.getLive(k, preview))] as const));
        if (cancelled) return;
        setData((prev) => ({ ...prev, ...Object.fromEntries(loaded) }));
      } catch (err) {
        // Local storage unavailable (private mode / blocked): keep built-in content.
        console.warn('[cms] Using built-in content:', err);
      }
    };

    load();

    // Admin live preview: receive unsaved edits from the editor that embeds this page.
    const onMessage = async (e: MessageEvent) => {
      if (!preview || e.origin !== window.location.origin || e.data?.source !== 'meero-cms-preview') return;
      const key = e.data.key as ContentKey;
      if (!contentKeys.includes(key)) return;
      const resolved = await resolveDeep(e.data.value);
      if (!cancelled) setData((prev) => ({ ...prev, [key]: resolved }));
    };
    window.addEventListener('message', onMessage);

    const unsub = subscribe((e) => {
      if (e.type === 'content') load(e.key ? [e.key as ContentKey] : contentKeys);
      if (e.type === 'media') load();
    });
    return () => {
      cancelled = true;
      window.removeEventListener('message', onMessage);
      unsub();
    };
  }, []);

  useEffect(() => applyDesign(data.design), [data.design]);
  useEffect(() => applySeo(data.seo, pathname), [data.seo, pathname]);

  return <SiteContext.Provider value={data}>{children}</SiteContext.Provider>;
}

export function useSite<K extends ContentKey>(key: K): ContentMap[K] {
  return useContext(SiteContext)[key];
}

/** Items of a collection that are published (visible). */
export function useVisible<K extends 'services' | 'jobs' | 'gallery' | 'faqs' | 'steps'>(key: K): ContentMap[K] {
  const list = useSite(key) as Array<{ visible?: boolean }>;
  return useMemo(() => list.filter((i) => i.visible !== false), [list]) as ContentMap[K];
}

export { getDefault };
