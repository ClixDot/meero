'use client';

import Services from '../../views/Services';
import { useApp } from '../../components/AppShell';

export default function ServicesRoute() {
  const { openApplyModal } = useApp();
  return <Services onOpenApplyModal={() => openApplyModal(null)} />;
}
