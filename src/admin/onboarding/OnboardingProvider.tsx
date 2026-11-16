'use client';

import React, { createContext, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { services, type OnboardingState } from '../../lib/services';
import { useAdmin } from '../context';
import { hasRole } from '../nav';
import { TOUR_STEPS, type TourStep } from './steps';

// Loaded on demand: the dashboard never waits for onboarding UI.
const WelcomeModal = React.lazy(() => import('./WelcomeModal'));
const TourOverlay = React.lazy(() => import('./TourOverlay'));

type OnboardingCtx = {
  state: OnboardingState | null;
  steps: TourStep[];
  /** Step index to resume from, or null when there is nothing to resume. */
  resumeIndex: number | null;
  startTour: (hideWelcome?: boolean) => void;
  resumeTour: (hideWelcome?: boolean) => void;
  openWelcome: () => void;
};

const Ctx = createContext<OnboardingCtx | null>(null);

/** Safe outside the provider: returns null instead of throwing. */
export function useOnboarding() {
  return useContext(Ctx);
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user, navigate } = useAdmin();
  const pathname = usePathname() || '/admin';
  const steps = useMemo(() => TOUR_STEPS.filter((s) => !s.minRole || hasRole(user.role, s.minRole)), [user.role]);
  const [state, setState] = useState<OnboardingState | null>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const direction = useRef<1 | -1>(1);
  const loginKey = user.lastLoginAt ?? 'session';

  const persist = useCallback((patch: Partial<Omit<OnboardingState, 'userId'>>) => {
    setState((s) => (s ? { ...s, ...patch } : s));
    services.onboarding.update(patch).then(setState).catch(() => { /* progress is best-effort; never block the dashboard */ });
  }, []);

  // Load this admin's record; show the welcome screen once per sign-in unless they opted out.
  useEffect(() => {
    let alive = true;
    services.onboarding.get()
      .then((s) => {
        if (!alive) return;
        setState(s);
        if (!s.hideWelcome && s.welcomeSeenForLogin !== loginKey) setWelcomeOpen(true);
      })
      .catch(() => { /* onboarding unavailable: dashboard works as normal */ });
    return () => { alive = false; };
  }, [user.id, loginKey]);

  const resumeIndex = useMemo(() => {
    if (!state || !['in_progress', 'paused'].includes(state.status) || !state.currentStepId) return null;
    const i = steps.findIndex((s) => s.id === state.currentStepId);
    return i >= 0 ? i : null;
  }, [state, steps]);

  const goTo = useCallback((i: number) => {
    setActive(i);
    persist({ status: 'in_progress', currentStepId: steps[i].id });
  }, [persist, steps]);

  const closeWelcome = useCallback((hide: boolean) => {
    setWelcomeOpen(false);
    persist({ welcomeSeenForLogin: loginKey, hideWelcome: hide });
  }, [persist, loginKey]);

  const startTour = useCallback((hideWelcome?: boolean) => {
    setWelcomeOpen(false);
    direction.current = 1;
    persist({ welcomeSeenForLogin: loginKey, ...(hideWelcome !== undefined ? { hideWelcome } : {}), status: 'in_progress', completedSteps: [], currentStepId: steps[0].id, startedAt: new Date().toISOString(), completedAt: null });
    setActive(0);
  }, [persist, steps, loginKey]);

  const resumeTour = useCallback((hideWelcome?: boolean) => {
    setWelcomeOpen(false);
    direction.current = 1;
    persist({ welcomeSeenForLogin: loginKey, ...(hideWelcome !== undefined ? { hideWelcome } : {}) });
    goTo(resumeIndex ?? 0);
  }, [goTo, resumeIndex, persist, loginKey]);

  const completed = state?.completedSteps;
  const withDone = useCallback((id: string) => Array.from(new Set([...(completed ?? []), id])), [completed]);

  const finish = useCallback(() => {
    setActive(null);
    persist({ status: 'completed', currentStepId: null, completedAt: new Date().toISOString(), completedSteps: withDone(steps[steps.length - 1].id) });
  }, [persist, withDone, steps]);

  const next = useCallback(() => {
    if (active === null) return;
    direction.current = 1;
    if (active >= steps.length - 1) { finish(); return; }
    setActive(active + 1);
    persist({ status: 'in_progress', currentStepId: steps[active + 1].id, completedSteps: withDone(steps[active].id) });
  }, [active, steps, finish, persist, withDone]);

  const prev = useCallback(() => {
    if (active === null || active === 0) return;
    direction.current = -1;
    goTo(active - 1);
  }, [active, goTo]);

  const skipStep = useCallback(() => {
    if (active === null) return;
    direction.current = 1;
    if (active >= steps.length - 1) finish();
    else goTo(active + 1);
  }, [active, steps.length, finish, goTo]);

  const skipTour = useCallback(() => {
    setActive(null);
    persist({ status: 'skipped', currentStepId: null });
  }, [persist]);

  /** Close midway: keeps the place so the tour can be continued later. */
  const pause = useCallback(() => {
    setActive(null);
    persist({ status: 'paused' });
  }, [persist]);

  /** Target never appeared: keep moving in the same direction, or stop at the ends. */
  const onMissing = useCallback(() => {
    if (active === null) return;
    const to = active + direction.current;
    if (to < 0) { goTo(0); return; }
    if (to >= steps.length) { finish(); return; }
    setActive(to);
    persist({ currentStepId: steps[to].id });
  }, [active, steps, goTo, finish, persist]);

  const value = useMemo<OnboardingCtx>(() => ({
    state, steps, resumeIndex, startTour, resumeTour, openWelcome: () => setWelcomeOpen(true),
  }), [state, steps, resumeIndex, startTour, resumeTour]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <Suspense fallback={null}>
        {welcomeOpen && (
          <WelcomeModal
            name={user.name.split(' ')[0]}
            stepCount={steps.length}
            resumeAt={resumeIndex}
            hideWelcome={!!state?.hideWelcome}
            onStart={startTour}
            onResume={resumeTour}
            onSkip={closeWelcome}
          />
        )}
        {active !== null && steps[active] && (
          <TourOverlay
            key={steps[active].id}
            step={steps[active]}
            index={active}
            total={steps.length}
            pathname={pathname}
            navigate={navigate}
            onNext={next}
            onPrev={prev}
            onSkipStep={skipStep}
            onSkipTour={skipTour}
            onClose={pause}
            onMissing={onMissing}
          />
        )}
      </Suspense>
    </Ctx.Provider>
  );
}
