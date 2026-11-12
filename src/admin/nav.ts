import {
  LayoutDashboard, Home, Info, Briefcase, Users, Phone, Images, ClipboardList, FileUser, Inbox,
  FolderOpen, FileStack, Palette, Search, PanelsTopLeft, ShieldCheck, Settings,
} from 'lucide-react';
import type { AdminRole } from '../lib/services';

export type NavItem = { label: string; href: string; icon: React.ElementType; description: string; minRole?: AdminRole };

export const navGroups: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Workspace',
    items: [
      { label: 'Overview', href: '/admin', icon: LayoutDashboard, description: 'Dashboard and analytics' },
      { label: 'Home', href: '/admin/home', icon: Home, description: 'Hero, sections and home page copy' },
      { label: 'About', href: '/admin/about', icon: Info, description: 'Story, mission, vision and values' },
      { label: 'Services', href: '/admin/services', icon: Briefcase, description: 'Service categories and services page' },
      { label: 'Careers', href: '/admin/careers', icon: Users, description: 'Careers page copy and filters' },
      { label: 'Contact', href: '/admin/contact', icon: Phone, description: 'Phone, email, address and map' },
      { label: 'Gallery', href: '/admin/gallery', icon: Images, description: 'Photos and categories' },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Job Listings', href: '/admin/jobs', icon: ClipboardList, description: 'Create and publish vacancies' },
      { label: 'Applications', href: '/admin/applications', icon: FileUser, description: 'Candidate records and CVs' },
      { label: 'Enquiries', href: '/admin/enquiries', icon: Inbox, description: 'Contact form messages' },
      { label: 'Media Library', href: '/admin/media', icon: FolderOpen, description: 'Images, videos and documents' },
      { label: 'Content Manager', href: '/admin/content', icon: FileStack, description: 'Drafts, publishing, FAQs and steps' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'Design & Branding', href: '/admin/design', icon: Palette, description: 'Colours, fonts and headings' },
      { label: 'SEO', href: '/admin/seo', icon: Search, description: 'Meta titles, descriptions and OG images' },
      { label: 'Header & Footer', href: '/admin/header-footer', icon: PanelsTopLeft, description: 'Logo, navigation and footer' },
      { label: 'Admin Users', href: '/admin/users', icon: ShieldCheck, description: 'Team accounts and roles', minRole: 'owner' },
      { label: 'General Settings', href: '/admin/settings', icon: Settings, description: 'Announcements and data tools' },
    ],
  },
];

export const allNavItems = navGroups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.title })));

export function findNav(pathname: string) {
  return [...allNavItems].sort((a, b) => b.href.length - a.href.length).find((i) => pathname === i.href || (i.href !== '/admin' && pathname.startsWith(i.href)));
}

const rank: Record<AdminRole, number> = { viewer: 0, editor: 1, owner: 2 };
export const hasRole = (role: AdminRole | undefined, min: AdminRole) => !!role && rank[role] >= rank[min];
