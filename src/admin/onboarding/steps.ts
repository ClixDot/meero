import {
  BarChart3, Briefcase, Compass, FileUser, FolderOpen, Inbox, LayoutGrid, LifeBuoy, PanelsTopLeft, Search, ShieldCheck, UploadCloud,
} from 'lucide-react';
import type { AdminRole } from '../../lib/services';

/**
 * Guided-tour steps. Each one points at a real feature through a stable `data-tour` attribute.
 * `targets` are tried in order and the first *visible* match is used (e.g. the sidebar on
 * desktop, the menu button on mobile). A step whose target never appears is skipped.
 */
export type TourStep = {
  id: string;
  /** Admin route the target lives on. */
  route: string;
  targets: string[];
  title: string;
  body: string;
  icon: React.ElementType;
  /** Lowest role that can use the feature; the step is hidden from lower roles. */
  minRole?: AdminRole;
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard-stats', route: '/admin', targets: ['dashboard-stats'], icon: LayoutGrid,
    title: 'Your dashboard at a glance',
    body: 'Applications, open vacancies, unread enquiries and selected candidates. Click any card to open that list.',
  },
  {
    id: 'dashboard-trend', route: '/admin', targets: ['dashboard-trend'], icon: BarChart3,
    title: 'Track hiring over time',
    body: 'Compare applications received with candidates selected. Hover a month for the numbers, or switch between 6 and 12 months.',
  },
  {
    id: 'sidebar-navigation', route: '/admin', targets: ['sidebar-navigation', 'mobile-menu'], icon: Compass,
    title: 'Everything lives in the menu',
    body: 'Website pages are under Workspace, recruitment records under Management, and site-wide options under Settings.',
  },
  {
    id: 'global-search', route: '/admin', targets: ['global-search'], icon: Search,
    title: 'Find anything fast',
    body: 'Search pages, job listings, applicants, enquiries and media. Press Ctrl + K from any page.',
  },
  {
    id: 'page-editor', route: '/admin/home', targets: ['page-sections', 'page-editor'], icon: PanelsTopLeft,
    title: 'Edit your website pages',
    body: 'Each page is split into sections. Pick one to change its text, images and buttons, or switch it off to hide it from visitors.',
  },
  {
    id: 'publish-actions', route: '/admin/home', targets: ['publish-actions'], icon: UploadCloud, minRole: 'editor',
    title: 'Save, preview, then publish',
    body: 'Save draft keeps changes private. Live preview shows them before anyone else sees them. Publish puts them on the website.',
  },
  {
    id: 'job-listings', route: '/admin/jobs', targets: ['collection-list'], icon: Briefcase,
    title: 'Manage job listings',
    body: 'Add, edit, reorder and hide vacancies, and attach a hiring poster. The Careers page shows them in this order.',
  },
  {
    id: 'applications', route: '/admin/applications', targets: ['applications-list'], icon: FileUser,
    title: 'Review applications',
    body: 'Every application from the website lands here. Open one to read the CV, add notes and move the candidate through each status.',
  },
  {
    id: 'enquiries', route: '/admin/enquiries', targets: ['enquiries-list'], icon: Inbox,
    title: 'Answer enquiries',
    body: 'Messages from the Contact form. Mark them read, reply, and track each one until it is resolved.',
  },
  {
    id: 'media-library', route: '/admin/media', targets: ['media-library'], icon: FolderOpen,
    title: 'Your media library',
    body: 'Upload images, videos and documents once, then reuse them anywhere on the website.',
  },
  {
    id: 'admin-users', route: '/admin/users', targets: ['admin-users'], icon: ShieldCheck, minRole: 'owner',
    title: 'Invite your team',
    body: 'Add teammates and choose what they can do: Viewer, Editor or Owner.',
  },
  {
    id: 'help-menu', route: '/admin', targets: ['help-menu'], icon: LifeBuoy,
    title: 'Replay this tour anytime',
    body: 'Open your profile menu and choose “Take a dashboard tour”. You can also continue a tour you stopped halfway.',
  },
];
