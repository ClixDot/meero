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

    const resetScroll = () => {
      // 1. Lenis smooth scroll engine reset
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true, force: true });
      }

      // 2. Standard browser DOM scroll reset
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Execute immediately on route change
    resetScroll();

    // Re-run in animation frame to ensure new page layout respects top position
    const rafId = requestAnimationFrame(() => {
      resetScroll();
    });

    // Re-run after short DOM settle & refresh GSAP ScrollTrigger
    const timer = setTimeout(() => {
      resetScroll();
      ScrollTrigger.refresh();
    }, 50);

    const timer2 = setTimeout(() => {
      resetScroll();
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [pathname, search, hash]);

  return null;
}

