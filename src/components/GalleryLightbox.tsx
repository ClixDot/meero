'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, X } from 'lucide-react';
import useScrollLock from '../hooks/useScrollLock';

const SWIPE_DISTANCE_PX = 50;

// Full-screen photo viewer. Next and previous wrap around the list it is given.
export default function GalleryLightbox({ items, activeIndex, onChangeIndex, onClose }) {
  const closeButtonRef = useRef<any>(null);
  const touchStartX = useRef<any>(null);
  const [failedId, setFailedId] = useState<any>(null);

  useScrollLock(true);

  const item = items[activeIndex];
  const hasMultiple = items.length > 1;
  const nextIndex = (activeIndex + 1) % items.length;
  const previousIndex = (activeIndex - 1 + items.length) % items.length;

  const showNext = () => onChangeIndex(nextIndex);
  const showPrevious = () => onChangeIndex(previousIndex);

  // Move focus into the viewer, and back to the clicked card on close
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    closeButtonRef.current?.focus();
    return () => (previouslyFocused as HTMLElement | null)?.focus?.();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (!hasMultiple) return;
      if (e.key === 'ArrowRight') onChangeIndex(nextIndex);
      if (e.key === 'ArrowLeft') onChangeIndex(previousIndex);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasMultiple, nextIndex, previousIndex, onChangeIndex, onClose]);

  // Load the neighbouring photos early so next and previous feel instant
  useEffect(() => {
    [items[nextIndex], items[previousIndex]].forEach((neighbour) => {
      new Image().src = neighbour.image;
    });
  }, [items, nextIndex, previousIndex]);

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || !hasMultiple) return;
    const distance = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (distance <= -SWIPE_DISTANCE_PX) showNext();
    if (distance >= SWIPE_DISTANCE_PX) showPrevious();
  };

  const navButtonClass = 'absolute top-1/2 -translate-y-1/2 z-10 p-2.5 sm:p-3 rounded-full bg-black/50 hover:bg-white/20 text-white border border-white/15 transition-colors';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      data-lenis-prevent="true"
      className="fixed inset-0 z-[60] flex flex-col bg-black"
      onClick={onClose}
    >
      <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 text-white">
        <span className="text-xs sm:text-sm font-semibold text-slate-300" aria-live="polite">
          {activeIndex + 1} / {items.length}
        </span>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close photo viewer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div
        className="relative flex-1 min-h-0 flex items-center justify-center px-2 sm:px-20"
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={handleTouchEnd}
      >
        {hasMultiple && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); showPrevious(); }}
            className={`${navButtonClass} left-2 sm:left-5`}
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {failedId === item.id ? (
          <p className="text-sm text-slate-300 text-center px-14">This photo could not be loaded.</p>
        ) : (
          <img
            key={item.id}
            src={item.image}
            alt={item.alt}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
            onError={() => setFailedId(item.id)}
          />
        )}

        {hasMultiple && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); showNext(); }}
            className={`${navButtonClass} right-2 sm:right-5`}
            aria-label="Next photo"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
      </div>

      <div className="shrink-0 px-4 py-4 text-center text-white">
        <h2 className="text-sm sm:text-base font-bold font-heading">{item.title}</h2>
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-[#21B8C1] shrink-0" />
          {item.location}
        </p>
      </div>
    </div>
  );
}
