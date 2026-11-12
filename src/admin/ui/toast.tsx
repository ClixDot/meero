'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';

type ToastTone = 'success' | 'error' | 'info';
type Toast = { id: number; tone: ToastTone; title: string; text?: string };

const ToastCtx = createContext<(t: Omit<Toast, 'id'>) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list.slice(-3), { ...t, id }]);
    setTimeout(() => dismiss(id), t.tone === 'error' ? 7000 : 4000);
  }, [dismiss]);

  const icons = { success: CheckCircle2, error: XCircle, info: Info };
  const colors = { success: 'text-emerald-600', error: 'text-[#E5484D]', info: 'text-[#168F88]' };

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed z-[100] bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 flex flex-col gap-2 sm:w-[360px] pointer-events-none" aria-live="polite">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = icons[t.tone];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-auto flex items-start gap-3 p-3.5 pr-2.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-white shadow-[0_16px_40px_-12px_rgba(23,27,32,0.28)]"
                role={t.tone === 'error' ? 'alert' : 'status'}
              >
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${colors[t.tone]}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#171B20]">{t.title}</p>
                  {t.text && <p className="text-xs text-[#6B7678] mt-0.5 break-words">{t.text}</p>}
                </div>
                <button type="button" onClick={() => dismiss(t.id)} className="p-1 rounded-full text-[#9AA3A5] hover:bg-slate-100" aria-label="Dismiss">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const push = useContext(ToastCtx);
  return {
    success: (title: string, text?: string) => push({ tone: 'success', title, text }),
    error: (title: string, err?: unknown) => push({ tone: 'error', title, text: err instanceof Error ? err.message : typeof err === 'string' ? err : undefined }),
    info: (title: string, text?: string) => push({ tone: 'info', title, text }),
  };
}
