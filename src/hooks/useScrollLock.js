import { useEffect } from 'react';

// Shared across modals, so the page only unlocks once the last open one closes.
let activeLocks = 0;

export default function useScrollLock(isActive) {
  useEffect(() => {
    if (!isActive) return undefined;

    activeLocks += 1;
    if (activeLocks === 1) {
      document.body.style.overflow = 'hidden';
      window.__lenis?.stop();
    }

    return () => {
      activeLocks -= 1;
      if (activeLocks === 0) {
        document.body.style.overflow = 'unset';
        window.__lenis?.start();
      }
    };
  }, [isActive]);
}
