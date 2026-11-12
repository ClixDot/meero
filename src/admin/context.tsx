'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { services, type AdminUser } from '../lib/services';
import { subscribe } from '../lib/cms/idb';
import { ConfirmDialog } from './ui/kit';
import { hasRole } from './nav';

type AdminCtx = {
  user: AdminUser;
  refreshUser: () => Promise<void>;
  canEdit: boolean;
  isOwner: boolean;
  /** Editors register unsaved changes here so navigation can warn. */
  setDirty: (key: string, dirty: boolean) => void;
  isDirty: boolean;
  /** Navigate, asking first if there are unsaved changes. */
  navigate: (href: string) => void;
  unread: { applications: number; enquiries: number };
  refreshUnread: () => Promise<void>;
};

const Ctx = createContext<AdminCtx | null>(null);

export function useAdmin() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAdmin must be used inside the admin shell');
  return c;
}

export function AdminProvider({ user: initialUser, children }: { user: AdminUser; children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const dirtyKeys = useRef(new Set<string>());
  const [isDirty, setIsDirty] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [unread, setUnread] = useState({ applications: 0, enquiries: 0 });

  const refreshUser = useCallback(async () => {
    const u = await services.auth.currentUser();
    if (u) setUser(u);
    else router.replace('/admin/login');
  }, [router]);

  const setDirty = useCallback((key: string, dirty: boolean) => {
    if (dirty) dirtyKeys.current.add(key);
    else dirtyKeys.current.delete(key);
    setIsDirty(dirtyKeys.current.size > 0);
  }, []);

  const navigate = useCallback((href: string) => {
    if (dirtyKeys.current.size > 0) setPendingHref(href);
    else router.push(href);
  }, [router]);

  const refreshUnread = useCallback(async () => {
    try {
      const [apps, enqs] = await Promise.all([services.applications.list(), services.enquiries.list()]);
      setUnread({ applications: apps.filter((a) => !a.read).length, enquiries: enqs.filter((e) => !e.read).length });
    } catch { /* storage unavailable */ }
  }, []);

  useEffect(() => {
    refreshUnread();
    return subscribe((e) => { if (e.type === 'records') refreshUnread(); });
  }, [refreshUnread]);

  useEffect(() => {
    if (!isDirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [isDirty]);

  return (
    <Ctx.Provider value={{
      user, refreshUser, setDirty, isDirty, navigate, unread, refreshUnread,
      canEdit: hasRole(user.role, 'editor'), isOwner: hasRole(user.role, 'owner'),
    }}>
      {children}
      <ConfirmDialog
        open={!!pendingHref}
        title="Leave without saving?"
        message="You have unsaved changes on this page. If you leave now, those changes will be lost."
        confirmLabel="Discard changes"
        onCancel={() => setPendingHref(null)}
        onConfirm={() => {
          const href = pendingHref!;
          dirtyKeys.current.clear();
          setIsDirty(false);
          setPendingHref(null);
          router.push(href);
        }}
      />
    </Ctx.Provider>
  );
}

/** Register a component's unsaved state with the shell. */
export function useDirtyGuard(key: string, dirty: boolean) {
  const { setDirty } = useAdmin();
  useEffect(() => {
    setDirty(key, dirty);
    return () => setDirty(key, false);
  }, [key, dirty, setDirty]);
}
