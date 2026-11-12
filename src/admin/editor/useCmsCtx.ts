'use client';

import { useEffect, useState } from 'react';
import { services } from '../../lib/services';
import { subscribe } from '../../lib/cms/idb';
import type { FormContext } from './fields';

/** Shared lookups for dynamic select options (jobs, services, countries, categories). */
export function useCmsCtx(): FormContext {
  const [ctx, setCtx] = useState<FormContext>({});
  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [jobs, svc, careers, gallery] = await Promise.all([
        services.content.getEditable('jobs'),
        services.content.getEditable('services'),
        services.content.getEditable('careersPage'),
        services.content.getEditable('galleryPage'),
      ]);
      if (!alive) return;
      setCtx({
        jobs: jobs.value,
        services: svc.value,
        countries: careers.value.countries,
        employmentTypes: careers.value.employmentTypes,
        categories: gallery.value.categories,
      });
    };
    load().catch(() => {});
    const unsub = subscribe((e) => e.type === 'content' && load().catch(() => {}));
    return () => { alive = false; unsub(); };
  }, []);
  return ctx;
}
