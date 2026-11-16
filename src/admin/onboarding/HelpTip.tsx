'use client';

import React, { useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { useClickOutside } from '../ui/kit';

/** Small "?" button with a short explanation. Opens on click, hover or keyboard focus. */
export function HelpTip({ label, children, align = 'right' }: { label: string; children: React.ReactNode; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();
  useClickOutside(ref, () => setOpen(false), open);
  return (
    <span ref={ref} className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
        className="w-8 h-8 inline-flex items-center justify-center rounded-full text-[#8A9496] hover:text-[#168F88] hover:bg-[#168F88]/8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#168F88]/50"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className={`absolute top-full mt-2 z-50 w-64 rounded-xl bg-[#171B20] text-white text-xs leading-relaxed px-3.5 py-2.5 shadow-xl ${align === 'right' ? 'right-0' : 'left-0'}`}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
