'use client';

import { Suspense } from 'react';
import Careers from '../../views/Careers';
import { useApp } from '../../components/AppShell';

export default function CareersRoute() {
  const { openApplyModal, openJobDetails, viewPoster } = useApp();
  return (
    <Suspense fallback={null}>
      <Careers onOpenApplyModal={openApplyModal} onOpenJobDetails={openJobDetails} onViewPoster={viewPoster} />
    </Suspense>
  );
}
