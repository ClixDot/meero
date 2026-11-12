'use client';

import Careers from '../../../views/Careers';
import { useApp } from '../../../components/AppShell';

export default function CareersRoute() {
  const { openApplyModal, openJobDetails, viewPoster } = useApp();
  return <Careers onOpenApplyModal={openApplyModal} onOpenJobDetails={openJobDetails} onViewPoster={viewPoster} />;
}
