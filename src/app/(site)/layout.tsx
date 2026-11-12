import AppShell from '../../components/AppShell';
import { SiteContentProvider } from '../../lib/cms/SiteContent';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteContentProvider>
      <AppShell>{children}</AppShell>
    </SiteContentProvider>
  );
}
