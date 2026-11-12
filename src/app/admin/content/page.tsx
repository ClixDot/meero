'use client';

import { useSearchParams } from 'next/navigation';
import { ContentManager } from '../../../admin/pages/manage-pages';

export default function Page() {
  const tab = useSearchParams()?.get('tab') ?? undefined;
  return <ContentManager key={tab} initialTab={tab} />;
}
