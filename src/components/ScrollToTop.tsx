'use client';

import { useEffect } from 'react';
import { useLocation } from '../lib/router';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // Disable native scroll restoration so browser doesn't retain old scroll position
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Jump to top instantly on route change, then let GSAP re-measure once layout settles.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const rafId = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(rafId);
  }, [pathname, search, hash]);

  return null;
}

