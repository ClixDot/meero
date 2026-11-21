'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Compass, LayoutDashboard, MousePointerClick, RotateCcw, Send, X } from 'lucide-react';

/** First screen after sign-in. Brand-styled, keyboard friendly, always optional. */
export default function WelcomeModal({ name, stepCount, resumeAt, hideWelcome, onStart, onResume, onSkip }: {
  name: string;
  stepCount: number;
  resumeAt: number | null;
  hideWelcome: boolean;
  onStart: (hide: boolean) => void;
  onResume: (hide: boolean) => void;
  /** Close without touring; `hide` = don't show the welcome screen again. */
  onSkip: (hide: boolean) => void;
}) {
  const reduce = useReducedMotion();
  const [hide, setHide] = useState(hideWelcome);
  const primary = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const minutes = Math.max(1, Math.round(stepCount * 0.2));

  useEffect(() => {
    primary.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip(hide);
      // Keep keyboard focus inside the dialog.
      if (e.key === 'Tab' && dialog.current) {
        const f = dialog.current.querySelectorAll<HTMLElement>('button, input, [href]');
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; };
  }, [hide, onSkip]);

  const features = [
    { icon: LayoutDashboard, text: 'See applications, enquiries and vacancies at a glance' },
    { icon: MousePointerClick, text: 'Edit text, images and job listings – no code needed' },
    { icon: Send, text: 'Save drafts, preview, then publish when you’re ready' },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4" data-lenis-prevent>
      <motion.div className="absolute inset-0 bg-[#030027]/45 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => onSkip(hide)} />
      <motion.div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        aria-describedby="welcome-desc"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full sm:max-w-[520px] max-h-[94dvh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px] bg-white shadow-[0_40px_90px_-30px_rgba(3,0,39,0.55)] pb-[env(safe-area-inset-bottom)]"
      >
        {/* Brand header */}
        <div className="relative h-40 sm:h-44 overflow-hidden bg-gradient-to-br from-[#0E3B3A] via-[#127a74] to-[#1FA9A7]">
          <span aria-hidden className="absolute -left-16 -top-20 w-56 h-56 rounded-full bg-white/10" />
          <span aria-hidden className="absolute right-10 top-5 w-16 h-16 rounded-full bg-[#21B8C1]/40" />
          <span aria-hidden className="absolute -right-10 -bottom-16 w-44 h-44 rounded-full border-[14px] border-dashed border-white/15" />
          <div className="relative h-full flex items-center justify-center gap-3">
            <span className="w-16 h-16 rounded-[20px] bg-[#030027] flex items-center justify-center shadow-[0_12px_30px_-10px_rgba(0,0,0,0.6)] ring-1 ring-white/15">
              <img src="https://res.cloudinary.com/inu9dzib/image/upload/f_auto,q_auto:good,c_limit,w_1200/v1795254714/meero/images/meero-mark.png" alt="" className="w-11 h-11 object-contain" />
            </span>
            <span className="text-white">
              <span className="block text-2xl font-extrabold font-heading tracking-tight leading-none">MEERO</span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75 mt-1.5">Content Studio</span>
            </span>
          </div>
          <button type="button" onClick={() => onSkip(hide)} aria-label="Close welcome" className="absolute top-3.5 right-3.5 w-10 h-10 rounded-full bg-white/90 text-[#171B20] flex items-center justify-center shadow-md hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="px-6 sm:px-8 pt-6 pb-6 sm:pb-7">
          <span className="inline-flex items-center rounded-full bg-[#168F88]/10 text-[#127a74] text-xs font-bold px-3 py-1">Hi {name} 👋</span>
          <h2 id="welcome-title" className="mt-3 text-[22px] sm:text-[26px] leading-tight font-extrabold font-heading tracking-tight text-[#171B20]">Welcome to MEERO Admin Dashboard!</h2>
          <p id="welcome-desc" className="mt-2 text-sm sm:text-[15px] text-[#5E696B]">Manage your website and recruitment content effortlessly from one place.</p>

          <ul className="mt-5 space-y-2">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 rounded-2xl bg-[#F4F8F7] px-4 py-3 text-sm text-[#2B3134]">
                <Icon className="w-[18px] h-[18px] text-[#168F88] shrink-0" />
                {text}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs sm:text-[13px] text-[#8A9496] leading-relaxed">
            {resumeAt !== null
              ? <>You stopped at step {resumeAt + 1} of {stepCount}. Pick up where you left off, or start again.</>
              : <>A short {stepCount}-step tour shows you around. It takes about {minutes} minutes, and you can skip it at any time.</>}
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {resumeAt !== null ? (
              <>
                <button ref={primary} type="button" onClick={() => onResume(hide)} className="h-12 rounded-full bg-gradient-to-b from-[#1BA39B] to-[#168F88] text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-[0_10px_24px_-10px_rgba(22,143,136,0.8)] hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#168F88]/30">
                  <Compass className="w-4.5 h-4.5" /> Continue tour
                </button>
                <button type="button" onClick={() => onStart(hide)} className="h-12 rounded-full border border-[#E3EAE8] bg-white text-sm font-bold text-[#171B20] inline-flex items-center justify-center gap-2 hover:border-[#168F88]/40 hover:text-[#168F88] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#168F88]/20">
                  <RotateCcw className="w-4 h-4" /> Start over
                </button>
              </>
            ) : (
              <>
                <button ref={primary} type="button" onClick={() => onStart(hide)} className="h-12 rounded-full bg-gradient-to-b from-[#1BA39B] to-[#168F88] text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-[0_10px_24px_-10px_rgba(22,143,136,0.8)] hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#168F88]/30">
                  <Compass className="w-4.5 h-4.5" /> Start guided tour
                </button>
                <button type="button" onClick={() => onSkip(hide)} className="h-12 rounded-full border border-[#E3EAE8] bg-white text-sm font-bold text-[#171B20] hover:border-[#168F88]/40 hover:text-[#168F88] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#168F88]/20">
                  Skip &amp; explore dashboard
                </button>
              </>
            )}
          </div>
          {resumeAt !== null && (
            <button type="button" onClick={() => onSkip(hide)} className="mt-2.5 w-full h-10 rounded-full text-sm font-semibold text-[#5E696B] hover:text-[#168F88]">Skip &amp; explore dashboard</button>
          )}

          <label className="mt-4 flex items-center justify-center gap-2 text-xs text-[#7A8587] cursor-pointer select-none">
            <input type="checkbox" checked={hide} onChange={(e) => setHide(e.target.checked)} className="w-4 h-4 rounded accent-[#168F88]" />
            Don’t show this welcome again
          </label>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
