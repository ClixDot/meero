'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Bell, ChevronRight, Compass, LifeBuoy, PlayCircle, ChevronsLeft, ChevronsRight, ExternalLink, FileUser, Inbox, KeyRound, LogOut, Menu, Search, X,
  ClipboardList, FolderOpen, CornerDownLeft,
} from 'lucide-react';
import { services, type AdminUser, type ActivityEntry } from '../lib/services';
import { subscribe } from '../lib/cms/idb';
import { AdminProvider, useAdmin } from './context';
import { ToastProvider } from './ui/toast';
import { Badge, cx, Spinner, timeAgo, useClickOutside, IconButton } from './ui/kit';
import { allNavItems, findNav, hasRole, navGroups } from './nav';
import { OnboardingProvider, useOnboarding } from './onboarding/OnboardingProvider';

/* ---------------------------------------------------------------- */
function Canvas({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root relative min-h-dvh bg-[#F2F6F5] text-[#171B20] font-sans overflow-x-clip">
      {/* Same soft glow as before, painted with gradients: no live blur filters to recompute on every frame. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(520px 520px at 8% 4%, rgba(33,184,193,0.13), transparent 70%), radial-gradient(600px 600px at 102% 45%, rgba(139,128,249,0.11), transparent 70%), radial-gradient(520px 520px at 45% 108%, rgba(22,143,136,0.09), transparent 70%)' }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/admin';
  const router = useRouter();
  const isLogin = pathname === '/admin/login';
  const [user, setUser] = useState<AdminUser | null | undefined>(undefined);
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  // Check the session when the shell mounts (or after leaving the login page) – not on every page switch.
  useEffect(() => {
    if (isLogin) return;
    let alive = true;
    services.auth.currentUser()
      .then((u) => {
        if (!alive) return;
        setUser(u);
        if (!u) router.replace(`/admin/login?next=${encodeURIComponent(pathRef.current)}`);
      })
      .catch(() => alive && setUser(null));
    return () => { alive = false; };
  }, [isLogin, router]);

  if (isLogin) {
    return <ToastProvider><Canvas><Suspense fallback={null}>{children}</Suspense></Canvas></ToastProvider>;
  }

  if (!user) {
    return (
      <Canvas>
        <div className="min-h-dvh flex flex-col items-center justify-center gap-3 text-sm text-[#7A8587]">
          <Spinner className="w-6 h-6" />
          {user === null ? 'Redirecting to sign in…' : 'Loading dashboard…'}
        </div>
      </Canvas>
    );
  }

  return (
    <ToastProvider>
      <AdminProvider user={user}>
        <Canvas>
          <OnboardingProvider>
            <Frame>{children}</Frame>
          </OnboardingProvider>
        </Canvas>
      </AdminProvider>
    </ToastProvider>
  );
}

/* ---------------------------------------------------------------- */
function Frame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/admin';
  const reduce = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try { setCollapsed(localStorage.getItem('meero-admin-collapsed') === '1'); } catch { /* ignore */ }
  }, []);

  // Preload every admin page once the dashboard is idle, so switching pages doesn't wait on the network.
  const router = useRouter();
  useEffect(() => {
    const run = () => allNavItems.forEach((i) => router.prefetch(i.href));
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(run, { timeout: 3000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(run, 1500);
    return () => clearTimeout(t);
  }, [router]);
  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try { localStorage.setItem('meero-admin-collapsed', c ? '0' : '1'); } catch { /* ignore */ }
      return !c;
    });
  };
  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <div className="flex min-h-dvh">
      {/* Desktop / tablet sidebar */}
      {/* Fixed (not sticky): html/body use overflow-x:hidden, which breaks position:sticky.
          The spacer keeps the sidebar's width in the flex layout. */}
      <div aria-hidden className={cx('hidden md:block shrink-0 transition-[width] duration-300', collapsed ? 'w-[92px]' : 'w-[92px] lg:w-[272px]')} />
      <aside className={cx('hidden md:block fixed left-0 top-0 z-40 h-dvh p-3 lg:p-4 transition-[width] duration-300', collapsed ? 'w-[92px]' : 'w-[92px] lg:w-[272px]')}>
        <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <motion.div className="absolute inset-0 bg-[#0E1416]/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.div
              className="absolute left-0 top-0 h-full w-[86%] max-w-[300px] p-3"
              initial={reduce ? { opacity: 0 } : { x: '-100%' }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: '-100%' }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            >
              <Sidebar collapsed={false} forceExpanded onClose={() => setMobileOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-12 pt-2 min-w-0">
          {/* Page transition: enter animation only, so route content is never rendered twice. */}
          <motion.div
            key={pathname}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[1480px] mx-auto"
          >
            <Suspense fallback={<div className="py-20 flex justify-center"><Spinner /></div>}>{children}</Suspense>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
function NavLink({ href, children, className, title, onClick }: { href: string; children: React.ReactNode; className?: string; title?: string; onClick?: () => void }) {
  const { navigate } = useAdmin();
  const router = useRouter();
  return (
    <a
      href={href}
      title={title}
      className={className}
      onMouseEnter={() => router.prefetch(href)}
      onFocus={() => router.prefetch(href)}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onClick?.();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}

function Sidebar({ collapsed, onToggle, onClose, forceExpanded }: { collapsed: boolean; onToggle?: () => void; onClose?: () => void; forceExpanded?: boolean }) {
  const pathname = usePathname() || '/admin';
  const { user, unread } = useAdmin();
  const active = findNav(pathname);
  // On tablet (md) the sidebar is always compact; on lg it follows the collapse toggle.
  const showLabels = forceExpanded || !collapsed;

  const badgeFor = (href: string) => href === '/admin/applications' ? unread.applications : href === '/admin/enquiries' ? unread.enquiries : 0;

  return (
    <div className={cx('h-full flex flex-col rounded-[26px] bg-white/85 border border-white shadow-[0_20px_50px_-28px_rgba(23,27,32,0.35)] overflow-hidden')}>
      {/* Brand */}
      <div className="flex items-center justify-between gap-2 px-4 pt-5 pb-4">
        <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
          <span className="w-10 h-10 rounded-2xl bg-[#0B0F17] flex items-center justify-center shrink-0 shadow-md">
            <img src="https://res.cloudinary.com/inu9dzib/image/upload/f_auto,q_auto/meero/images/meero-mark.png" alt="" className="w-7 h-7 object-contain" />
          </span>
          {showLabels && (
            <span className={cx('min-w-0', !forceExpanded && 'hidden lg:block')}>
              <span className="block text-[15px] font-extrabold font-heading tracking-tight leading-none">MEERO</span>
              <span className="block text-[11px] text-[#8A9496] font-medium mt-1">Content Studio</span>
            </span>
          )}
        </Link>
        {onClose && (
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-[#7A8587]" aria-label="Close menu"><X className="w-5 h-5" /></button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 pb-3 space-y-4" aria-label="Admin" data-tour="sidebar-navigation">
        {navGroups.map((group) => (
          <div key={group.title}>
            {showLabels ? (
              <div className={cx('px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#A3ACAE]', !forceExpanded && 'hidden lg:block')}>{group.title}</div>
            ) : null}
            {!forceExpanded && <div className={cx('mx-auto mb-2 w-6 border-t border-[#E6ECEB]', showLabels && 'lg:hidden')} />}
            <ul className="space-y-0.5">
              {group.items.filter((i) => !i.minRole || hasRole(user.role, i.minRole)).map((item) => {
                const isActive = active?.href === item.href;
                const Icon = item.icon;
                const badge = badgeFor(item.href);
                return (
                  <li key={item.href}>
                    <NavLink
                      href={item.href}
                      title={item.label}
                      onClick={onClose}
                      className={cx(
                        'group relative flex items-center gap-3 rounded-2xl text-[13px] font-semibold transition-colors',
                        showLabels ? cx('px-3 h-9', !forceExpanded && 'max-lg:justify-center max-lg:px-0') : 'justify-center h-11',
                        isActive ? 'text-white' : 'text-[#5E696B] hover:text-[#171B20] hover:bg-[#168F88]/6',
                      )}
                    >
                      {isActive && (
                        <motion.span layoutId={forceExpanded ? 'nav-active-m' : 'nav-active'} className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#168F88] to-[#1FA9A7] shadow-[0_8px_20px_-8px_rgba(22,143,136,0.7)]" transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }} />
                      )}
                      <Icon className="relative w-[18px] h-[18px] shrink-0" />
                      {showLabels && <span className={cx('relative truncate flex-1', !forceExpanded && 'hidden lg:block')}>{item.label}</span>}
                      {badge > 0 && (
                        showLabels ? (
                          <span className={cx('relative text-[10px] font-bold px-1.5 min-w-5 h-5 inline-flex items-center justify-center rounded-full', isActive ? 'bg-white/25 text-white' : 'bg-[#E5484D] text-white', !forceExpanded && 'hidden lg:inline-flex')}>{badge}</span>
                        ) : null
                      )}
                      {badge > 0 && (!showLabels || !forceExpanded) && (
                        <span className={cx('absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E5484D] ring-2 ring-white', showLabels && 'lg:hidden')} />
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer card */}
      {showLabels && (
        <div className={cx('p-3 [@media(max-height:940px)]:hidden', !forceExpanded && 'hidden lg:block')}>
          <div className="relative overflow-hidden rounded-[20px] bg-[#0B0F17] text-white p-4">
            <img src="https://res.cloudinary.com/inu9dzib/image/upload/f_auto,q_auto/meero/images/meero-mark.png" alt="" aria-hidden className="absolute -right-6 -bottom-6 w-24 opacity-15" />
            <p className="text-sm font-bold font-heading">View live website</p>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Published changes appear instantly.</p>
            <a href="/" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-[#21B8C1] text-[#0B0F17] text-xs font-bold hover:brightness-110">
              Open site <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="hidden lg:flex items-center justify-center gap-2 mx-3 mb-3 h-9 rounded-xl text-xs font-semibold text-[#7A8587] hover:bg-slate-100"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <><ChevronsLeft className="w-4 h-4" /> Collapse</>}
        </button>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname() || '/admin';
  const current = findNav(pathname);
  const crumbs = [{ label: 'Dashboard', href: '/admin' }, ...(current && current.href !== '/admin' ? [{ label: current.group, href: '' }, { label: current.label, href: current.href }] : [])];

  return (
    <header className="sticky top-0 z-40 px-4 sm:px-6 lg:px-8 pt-3 pb-3">
      <div className="max-w-[1480px] mx-auto flex items-center gap-3 rounded-[22px] bg-white/90 border border-white px-3 sm:px-4 h-16 shadow-[0_10px_30px_-22px_rgba(23,27,32,0.4)]">
        <IconButton icon={Menu} label="Open menu" data-tour="mobile-menu" onClick={onMenu} className="md:hidden shrink-0" />
        <nav aria-label="Breadcrumb" className="min-w-0 hidden sm:block">
          <ol className="flex items-center gap-1.5 text-xs text-[#8A9496] font-medium">
            {crumbs.map((c, i) => (
              <li key={i} className="flex items-center gap-1.5 min-w-0">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#C2C9CB]" />}
                {c.href && i < crumbs.length - 1 ? <Link href={c.href} className="hover:text-[#168F88] truncate">{c.label}</Link> : <span className={cx('truncate', i === crumbs.length - 1 && 'text-[#171B20] font-semibold')}>{c.label}</span>}
              </li>
            ))}
          </ol>
          <p className="text-[11px] text-[#A3ACAE] mt-0.5 hidden lg:block">{current?.description}</p>
        </nav>
        <span className="sm:hidden font-heading font-bold text-sm truncate">{current?.label ?? 'Dashboard'}</span>
        <div className="flex-1" />
        <GlobalSearch />
        <Notifications />
        <ProfileMenu />
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- */
type SearchHit = { group: string; label: string; sub?: string; href: string; icon: React.ElementType };

function GlobalSearch() {
  const { navigate } = useAdmin();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [index, setIndex] = useState<SearchHit[] | null>(null);
  const [cursor, setCursor] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useClickOutside(boxRef, () => setOpen(false), open);

  const buildIndex = useCallback(async () => {
    const [jobs, apps, enqs, media] = await Promise.all([
      services.careers.list(), services.applications.list(), services.enquiries.list(), services.media.list(),
    ]);
    setIndex([
      ...allNavItems.map((n) => ({ group: 'Pages', label: n.label, sub: n.description, href: n.href, icon: n.icon })),
      ...jobs.map((j) => ({ group: 'Job listings', label: j.title, sub: j.location, href: `/admin/jobs?edit=${j.id}`, icon: ClipboardList })),
      ...apps.map((a) => ({ group: 'Applications', label: a.fullName, sub: `${a.preferredJob || 'General pool'} · ${a.email}`, href: `/admin/applications?open=${a.id}`, icon: FileUser })),
      ...enqs.map((e) => ({ group: 'Enquiries', label: e.name, sub: e.message.slice(0, 70), href: `/admin/enquiries?open=${e.id}`, icon: Inbox })),
      ...media.map((m) => ({ group: 'Media', label: m.name, sub: m.folder, href: `/admin/media?open=${m.id}`, icon: FolderOpen })),
    ]);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => {
    if (!open) return;
    buildIndex().catch(() => setIndex([]));
    return subscribe(() => setIndex(null));
  }, [open, buildIndex]);

  const hits = useMemo(() => {
    if (!index) return [];
    const term = q.trim().toLowerCase();
    if (!term) return index.filter((h) => h.group === 'Pages').slice(0, 7);
    return index.filter((h) => `${h.label} ${h.sub ?? ''}`.toLowerCase().includes(term)).slice(0, 12);
  }, [index, q]);

  useEffect(() => setCursor(0), [q]);

  const go = (hit: SearchHit) => {
    setOpen(false);
    setQ('');
    inputRef.current?.blur();
    navigate(hit.href);
  };

  return (
    <div ref={boxRef} className="relative" data-tour="global-search">
      <div className={cx('flex items-center gap-2 h-10 rounded-full border bg-white/90 transition-all', open ? 'w-[min(78vw,380px)] border-[#168F88]/50 ring-4 ring-[#168F88]/10 px-3.5' : 'w-10 sm:w-[240px] border-[#E3EAE8] px-2.5 sm:px-3.5')}>
        <Search className="w-[18px] h-[18px] text-[#8A9496] shrink-0" onClick={() => { setOpen(true); inputRef.current?.focus(); }} />
        <input
          ref={inputRef}
          value={q}
          onFocus={() => setOpen(true)}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(hits.length - 1, c + 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(0, c - 1)); }
            if (e.key === 'Enter' && hits[cursor]) go(hits[cursor]);
            if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
          }}
          placeholder="Search anything…"
          aria-label="Search the admin"
          className={cx('flex-1 min-w-0 bg-transparent text-sm focus:outline-none placeholder:text-[#A3ACAE]', !open && 'hidden sm:block')}
        />
        {!open && <kbd className="hidden lg:inline text-[10px] font-semibold text-[#A3ACAE] border border-[#E3EAE8] rounded-md px-1.5 py-0.5">Ctrl K</kbd>}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-[min(88vw,420px)] max-h-[60vh] overflow-y-auto rounded-2xl bg-white border border-[#EDF2F1] shadow-[0_24px_60px_-20px_rgba(23,27,32,0.35)] p-2"
          >
            {!index ? (
              <div className="p-6 flex justify-center"><Spinner /></div>
            ) : hits.length === 0 ? (
              <p className="p-6 text-center text-sm text-[#8A9496]">No results for “{q}”.</p>
            ) : (
              hits.map((h, i) => {
                const Icon = h.icon;
                const showGroup = i === 0 || hits[i - 1].group !== h.group;
                return (
                  <React.Fragment key={`${h.href}-${i}`}>
                    {showGroup && <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#A3ACAE]">{h.group}</div>}
                    <button
                      type="button"
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => go(h)}
                      className={cx('w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left', cursor === i ? 'bg-[#168F88]/8' : 'hover:bg-slate-50')}
                    >
                      <span className="w-8 h-8 rounded-lg bg-[#F2F6F5] text-[#168F88] flex items-center justify-center shrink-0"><Icon className="w-4 h-4" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-[#171B20] truncate">{h.label}</span>
                        {h.sub && <span className="block text-xs text-[#8A9496] truncate">{h.sub}</span>}
                      </span>
                      {cursor === i && <CornerDownLeft className="w-3.5 h-3.5 text-[#A3ACAE] shrink-0" />}
                    </button>
                  </React.Fragment>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------------------------------------------------------- */
function Notifications() {
  const { unread, navigate, refreshUnread } = useAdmin();
  const [open, setOpen] = useState(false);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);
  const total = unread.applications + unread.enquiries;

  useEffect(() => {
    if (!open) return;
    services.settings.activity(12).then(setActivity).catch(() => setActivity([]));
  }, [open]);

  const markAllRead = async () => {
    const [apps, enqs] = await Promise.all([services.applications.list(), services.enquiries.list()]);
    await Promise.all([
      ...apps.filter((a) => !a.read).map((a) => services.applications.update(a.id, { read: true })),
      ...enqs.filter((e) => !e.read).map((e) => services.enquiries.update(e.id, { read: true })),
    ]);
    await refreshUnread();
  };

  return (
    <div ref={ref} className="relative">
      <IconButton icon={Bell} label="Notifications" badge={total} onClick={() => setOpen((o) => !o)} active={open} />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-[min(90vw,360px)] rounded-2xl bg-white border border-[#EDF2F1] shadow-[0_24px_60px_-20px_rgba(23,27,32,0.35)] overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#EDF2F1]">
              <p className="text-sm font-bold font-heading">Notifications</p>
              {total > 0 && <button type="button" onClick={markAllRead} className="text-xs font-semibold text-[#168F88] hover:underline">Mark all read</button>}
            </div>
            <div className="p-2 space-y-1">
              {[
                { n: unread.applications, label: 'unread applications', href: '/admin/applications', icon: FileUser },
                { n: unread.enquiries, label: 'unread enquiries', href: '/admin/enquiries', icon: Inbox },
              ].map((r) => (
                <button key={r.href} type="button" onClick={() => { setOpen(false); navigate(r.href); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-left">
                  <span className={cx('w-9 h-9 rounded-xl flex items-center justify-center', r.n ? 'bg-[#E5484D]/10 text-[#E5484D]' : 'bg-[#F2F6F5] text-[#8A9496]')}><r.icon className="w-4 h-4" /></span>
                  <span className="text-sm"><b className="font-bold">{r.n}</b> {r.label}</span>
                </button>
              ))}
            </div>
            <div className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#A3ACAE]">Recent activity</div>
            <ul className="max-h-64 overflow-y-auto px-2 pb-2">
              {activity.length === 0 && <li className="px-3 py-4 text-xs text-[#8A9496]">No activity yet.</li>}
              {activity.map((a) => (
                <li key={a.id}>
                  <button type="button" disabled={!a.href} onClick={() => { if (a.href) { setOpen(false); navigate(a.href); } }} className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 disabled:hover:bg-transparent">
                    <p className="text-xs text-[#2B3134] leading-snug"><b>{a.actor}</b> {a.action} <b>{a.target}</b></p>
                    <p className="text-[11px] text-[#A3ACAE] mt-0.5">{timeAgo(a.at)}</p>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------------------------------------------------------- */
function ProfileMenu() {
  const { user, navigate } = useAdmin();
  const tour = useOnboarding();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);
  const initials = user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  const signOut = async () => {
    await services.auth.logout();
    router.replace('/admin/login');
  };

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-2.5 h-10 pl-1 pr-1 sm:pr-3 rounded-full border border-[#E3EAE8] bg-white/90 hover:border-[#168F88]/40" aria-haspopup="menu" aria-expanded={open} data-tour="help-menu">
        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#168F88] to-[#8B80F9] text-white text-xs font-bold flex items-center justify-center">{initials}</span>
        <span className="hidden lg:block text-left leading-tight">
          <span className="block text-xs font-bold text-[#171B20] max-w-[120px] truncate">{user.name}</span>
          <span className="block text-[10px] text-[#8A9496] capitalize">{user.role}</span>
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#EDF2F1] shadow-[0_24px_60px_-20px_rgba(23,27,32,0.35)] p-2"
          >
            <div className="px-3 py-2.5">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-xs text-[#8A9496] truncate">{user.email}</p>
              <Badge tone="lavender" className="mt-2 capitalize">{user.role}</Badge>
            </div>
            <div className="h-px bg-[#EDF2F1] my-1" />
            <button role="menuitem" type="button" onClick={() => { setOpen(false); navigate('/admin/users?me=1'); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-slate-50"><KeyRound className="w-4 h-4 text-[#8A9496]" /> Change password</button>
            {tour && (
              <>
                <div className="h-px bg-[#EDF2F1] my-1" />
                <p className="px-3 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#A3ACAE]">Help &amp; support</p>
                <button role="menuitem" type="button" onClick={() => { setOpen(false); tour.startTour(); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-slate-50"><Compass className="w-4 h-4 text-[#168F88]" /> Take a dashboard tour</button>
                {tour.resumeIndex !== null && (
                  <button role="menuitem" type="button" onClick={() => { setOpen(false); tour.resumeTour(); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-slate-50"><PlayCircle className="w-4 h-4 text-[#8A9496]" /> Continue tour <span className="ml-auto text-[11px] text-[#A3ACAE]">{tour.resumeIndex + 1}/{tour.steps.length}</span></button>
                )}
                <button role="menuitem" type="button" onClick={() => { setOpen(false); tour.openWelcome(); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-slate-50"><LifeBuoy className="w-4 h-4 text-[#8A9496]" /> Show welcome guide</button>
                <div className="h-px bg-[#EDF2F1] my-1" />
              </>
            )}
            <a role="menuitem" href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-slate-50"><ExternalLink className="w-4 h-4 text-[#8A9496]" /> View website</a>
            <button role="menuitem" type="button" onClick={signOut} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#E5484D] hover:bg-red-50"><LogOut className="w-4 h-4" /> Sign out</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
