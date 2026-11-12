import type { Metadata } from 'next';
import AdminShell from '../../admin/AdminShell';

export const metadata: Metadata = {
  title: 'MEERO Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
