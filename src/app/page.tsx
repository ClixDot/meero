'use client';

import Home from '../views/Home';
import { useApp } from '../components/AppShell';

export default function HomeRoute() {
  const { openApplyModal, openJobDetails } = useApp();
  return <Home onOpenApplyModal={openApplyModal} onOpenJobDetails={openJobDetails} />;
}
