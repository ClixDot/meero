'use client';

import About from '../../views/About';
import { useApp } from '../../components/AppShell';

export default function AboutRoute() {
  const { openApplyModal } = useApp();
  return <About onOpenApplyModal={() => openApplyModal(null)} />;
}
