import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function useLenis() {
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      prevent: (node) => node.hasAttribute('data-lenis-prevent') || !!node.closest?.('[data-lenis-prevent]')
    });

    // Expose lenis instance globally for modal scroll-lock control
    window.__lenis = lenis;

    // Synchronize Lenis scroll position with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Official GSAP ticker synchronization
    function updateTicker(time) {
      lenis.raf(time * 1000);
    }

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    // Refresh ScrollTrigger positions after initialization
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(updateTicker);
      window.__lenis = null;
      lenis.destroy();
    };
  }, []);
}

