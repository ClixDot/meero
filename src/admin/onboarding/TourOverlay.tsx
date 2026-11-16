'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import type { TourStep } from './steps';

type Rect = { top: number; left: number; width: number; height: number };

const PAD = 8;          // spotlight padding around the target
const GAP = 14;         // space between spotlight and card
const EDGE = 16;        // minimum distance from the viewport edge
const CARD_W = 360;
const FIND_TIMEOUT = 6000;

/** First visible element for any of the step's targets. */
function findTarget(targets: string[]): HTMLElement | null {
  for (const t of targets) {
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${t}"]`))) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none') return el;
    }
  }
  return null;
}

function toRect(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  // Clamp to the viewport so very tall targets still give a usable spotlight.
  const top = Math.max(r.top - PAD, 6);
  const left = Math.max(r.left - PAD, 6);
  const bottom = Math.min(r.bottom + PAD, window.innerHeight - 6);
  const right = Math.min(r.right + PAD, window.innerWidth - 6);
  return { top, left, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
}

/** Pick the side with room for the card; fall back to docking at the bottom of the screen. */
function placeCard(rect: Rect, cardH: number): { top: number; left: number } | null {
  const vw = window.innerWidth, vh = window.innerHeight;
  const w = Math.min(CARD_W, vw - EDGE * 2);
  const clampX = (x: number) => Math.min(Math.max(x, EDGE), vw - w - EDGE);
  const clampY = (y: number) => Math.min(Math.max(y, EDGE), vh - cardH - EDGE);
  const cx = rect.left + rect.width / 2 - w / 2;
  const cy = rect.top + rect.height / 2 - cardH / 2;
  if (rect.top + rect.height + GAP + cardH <= vh - EDGE) return { top: rect.top + rect.height + GAP, left: clampX(cx) };
  if (rect.top - GAP - cardH >= EDGE) return { top: rect.top - GAP - cardH, left: clampX(cx) };
  if (rect.left + rect.width + GAP + w <= vw - EDGE) return { top: clampY(cy), left: rect.left + rect.width + GAP };
  if (rect.left - GAP - w >= EDGE) return { top: clampY(cy), left: rect.left - GAP - w };
  return null;
}

export default function TourOverlay({ step, index, total, pathname, navigate, onNext, onPrev, onSkipStep, onSkipTour, onClose, onMissing }: {
  step: TourStep;
  index: number;
  total: number;
  pathname: string;
  navigate: (href: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onSkipStep: () => void;
  onSkipTour: () => void;
  onClose: () => void;
  onMissing: () => void;
}) {
  const reduce = useReducedMotion();
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [cardPos, setCardPos] = useState<{ top: number; left: number } | null>(null);
  const [mobile, setMobile] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const onRoute = pathname === step.route;
  const last = index === total - 1;
  const Icon = step.icon;

  // 1) Go to the step's page if needed.
  useEffect(() => {
    if (!onRoute) navigate(step.route);
  }, [onRoute, step.route, navigate]);

  // 2) Wait for the target to render (async pages, lazy data) – observed, not polled on a timer.
  useEffect(() => {
    if (!onRoute) return;
    setTarget(null);
    setRect(null);
    let done = false;
    const tryFind = () => {
      if (done) return;
      const el = findTarget(step.targets);
      if (el) { done = true; observer.disconnect(); clearTimeout(timer); setTarget(el); }
    };
    const observer = new MutationObserver(tryFind);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'data-tour'] });
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      observer.disconnect();
      if (process.env.NODE_ENV !== 'production') console.warn(`[tour] Step "${step.id}" skipped: no visible [data-tour="${step.targets.join('" | "')}"] on ${pathname}`);
      onMissing();
    }, FIND_TIMEOUT);
    tryFind();
    return () => { done = true; observer.disconnect(); clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRoute, step.id]);

  // 3) Bring the target into view, then track its position while the page scrolls or resizes.
  useEffect(() => {
    if (!target) return;
    const r = target.getBoundingClientRect();
    const fixed = getComputedStyle(target).position === 'fixed' || target.closest('aside.fixed, header.sticky');
    if (!fixed && (r.top < 90 || r.bottom > window.innerHeight - 40)) {
      const y = r.top + window.scrollY - Math.max(96, (window.innerHeight - Math.min(r.height, window.innerHeight * 0.6)) / 2 - 80);
      window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
    }
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setRect(toRect(target));
        setMobile(window.innerWidth < 640);
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(target);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [target, reduce]);

  // 4) Position the card once its height is known.
  useLayoutEffect(() => {
    if (!rect || !cardRef.current) return;
    setCardPos(mobile ? null : placeCard(rect, cardRef.current.offsetHeight));
  }, [rect, mobile]);

  // Move focus to the card on each step so screen readers announce it.
  useEffect(() => { if (rect) cardRef.current?.focus({ preventScroll: true }); }, [!!rect]); // eslint-disable-line react-hooks/exhaustive-deps

  const onKey = useCallback((e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); onNext(); }
    else if (e.key === 'ArrowLeft' && index > 0) { e.preventDefault(); onPrev(); }
  }, [onClose, onNext, onPrev, index]);

  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  const spring = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 380, damping: 36 };
  const docked = mobile || !cardPos;

  return createPortal(
    <>
      {/* Spotlight: dims the page around the target. Clicks pass through, so the dashboard stays usable. */}
      <AnimatePresence>
        {rect && (
          <motion.div
            aria-hidden
            className="fixed z-[85] pointer-events-none rounded-[18px]"
            initial={{ opacity: 0, ...rect }}
            animate={{ opacity: 1, ...rect }}
            exit={{ opacity: 0 }}
            transition={spring}
            style={{ boxShadow: '0 0 0 3px #21B8C1, 0 0 0 7px rgba(33,184,193,0.25), 0 0 0 9999px rgba(11,15,23,0.55)' }}
          />
        )}
      </AnimatePresence>
      {!rect && <div aria-hidden className="fixed inset-0 z-[85] pointer-events-none bg-[#0B0F17]/30" />}

      {/* Step card */}
      <motion.div
        ref={cardRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby={`tour-title-${step.id}`}
        aria-describedby={`tour-body-${step.id}`}
        tabIndex={-1}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: rect ? 1 : 0.98, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={
          docked
            ? 'fixed z-[86] left-3 right-3 bottom-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[380px] rounded-[22px] bg-white shadow-[0_30px_70px_-24px_rgba(11,15,23,0.55)] border border-white outline-none pb-[env(safe-area-inset-bottom)]'
            : 'fixed z-[86] rounded-[22px] bg-white shadow-[0_30px_70px_-24px_rgba(11,15,23,0.55)] border border-white outline-none'
        }
        style={docked ? undefined : { top: cardPos!.top, left: cardPos!.left, width: Math.min(CARD_W, window.innerWidth - EDGE * 2) }}
      >
        <div className="p-5">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[#168F88]/10 text-[#168F88] flex items-center justify-center shrink-0"><Icon className="w-[18px] h-[18px]" /></span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#168F88]" aria-live="polite">Step {index + 1} of {total}</p>
              <div className="mt-1.5 h-1 rounded-full bg-[#EDF2F1] overflow-hidden" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={index + 1} aria-label="Tour progress">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-[#168F88] to-[#21B8C1]" initial={false} animate={{ width: `${((index + 1) / total) * 100}%` }} transition={{ duration: reduce ? 0 : 0.35 }} />
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close tour (you can continue later)" title="Close – continue later" className="w-9 h-9 -mr-1 rounded-full text-[#8A9496] hover:bg-slate-100 hover:text-[#171B20] flex items-center justify-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#168F88]/50">
              <X className="w-4 h-4" />
            </button>
          </div>

          <h2 id={`tour-title-${step.id}`} className="mt-4 text-[17px] font-bold font-heading text-[#171B20] leading-snug">{step.title}</h2>
          <p id={`tour-body-${step.id}`} className="mt-1.5 text-sm text-[#5E696B] leading-relaxed">{step.body}</p>
          {!rect && <p className="mt-2 text-xs text-[#A3ACAE]">{onRoute ? 'Finding this on the page…' : 'Opening the page…'}</p>}

          <div className="mt-5 flex items-center gap-2">
            <button type="button" onClick={onSkipTour} className="text-xs font-semibold text-[#8A9496] hover:text-[#E5484D] px-1 py-2 focus:outline-none focus-visible:underline">Skip tour</button>
            <div className="flex-1" />
            {!last && <button type="button" onClick={onSkipStep} className="h-9 px-3 rounded-full text-xs font-semibold text-[#5E696B] hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#168F88]/40">Skip step</button>}
            <button type="button" onClick={onPrev} disabled={index === 0} aria-label="Previous step" className="w-9 h-9 rounded-full border border-[#E3EAE8] text-[#4B5759] flex items-center justify-center hover:border-[#168F88]/40 hover:text-[#168F88] disabled:opacity-35 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#168F88]/40">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button type="button" onClick={onNext} className="h-9 pl-4 pr-3.5 rounded-full bg-gradient-to-b from-[#1BA39B] to-[#168F88] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-[0_8px_18px_-8px_rgba(22,143,136,0.8)] hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#168F88]/30">
              {last ? <>Finish <Check className="w-3.5 h-3.5" /></> : <>Next <ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
          </div>
        </div>
      </motion.div>
    </>,
    document.body,
  );
}
