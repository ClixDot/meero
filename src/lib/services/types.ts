/**
 * Service contracts for the MEERO CMS.
 *
 * The admin UI and the public site only talk to these interfaces (see ./index.ts).
 * Phase 1 ships local IndexedDB adapters (./local). Phase 2 swaps in MongoDB
 * (content, careers, applications, enquiries, settings, auth) and Cloudinary
 * (media) adapters that implement the same contracts – no UI changes required.
 */
import type { ContentKey, ContentMap } from '../cms/defaults';

/* ---------- Auth ---------- */
export type AdminRole = 'owner' | 'editor' | 'viewer';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
  usingDefaultPassword?: boolean;
}

export interface AuthService {
  login(email: string, password: string, remember: boolean): Promise<AdminUser>;
  logout(): Promise<void>;
  currentUser(): Promise<AdminUser | null>;
  /** Development only: whether to show the starter credentials on the sign-in page. */
  defaultLoginHint(): Promise<boolean>;
  listUsers(): Promise<AdminUser[]>;
  createUser(input: { name: string; email: string; role: AdminRole; password: string }): Promise<AdminUser>;
  updateUser(id: string, patch: Partial<Pick<AdminUser, 'name' | 'email' | 'role' | 'active'>>): Promise<AdminUser>;
  setPassword(id: string, password: string): Promise<void>;
  deleteUser(id: string): Promise<void>;
}

/* ---------- Content ---------- */
export type ContentStatus = 'default' | 'published' | 'draft';

export interface ContentDocMeta {
  key: ContentKey;
  status: ContentStatus;
  hasDraft: boolean;
  updatedAt?: string;
  updatedBy?: string;
  publishedAt?: string;
  publishedBy?: string;
}

export interface ContentService {
  /** Value an editor should see: draft if one exists, else published, else default. */
  getEditable<K extends ContentKey>(key: K): Promise<{ value: ContentMap[K]; meta: ContentDocMeta }>;
  /** Value the public site renders (published or default). Pass preview=true to include drafts. */
  getLive<K extends ContentKey>(key: K, preview?: boolean): Promise<ContentMap[K]>;
  saveDraft<K extends ContentKey>(key: K, value: ContentMap[K]): Promise<ContentDocMeta>;
  publish<K extends ContentKey>(key: K, value?: ContentMap[K]): Promise<ContentDocMeta>;
  discardDraft(key: ContentKey): Promise<ContentDocMeta>;
  resetToDefault(key: ContentKey): Promise<ContentDocMeta>;
  listMeta(): Promise<ContentDocMeta[]>;
}

/* ---------- Media ---------- */
export type MediaKind = 'image' | 'video' | 'document';

export interface MediaItem {
  id: string;
  name: string;
  kind: MediaKind;
  mime: string;
  size: number;
  alt: string;
  folder: string;
  /** 'upload' = file stored by the adapter. 'linked' = existing site asset or external URL. */
  source: 'upload' | 'linked';
  /** Public URL (Cloudinary for uploads; path or URL for linked items). Absent only on legacy browser-stored uploads. */
  url?: string;
  /** Cloudinary asset id, for uploads stored in the cloud. */
  publicId?: string;
  resourceType?: 'image' | 'video' | 'raw';
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MediaUsage {
  key: ContentKey;
  label: string;
  path: string;
}

export interface MediaService {
  list(): Promise<MediaItem[]>;
  upload(file: File, opts?: { alt?: string; folder?: string; onProgress?: (pct: number) => void }): Promise<MediaItem>;
  addLink(url: string, opts?: { name?: string; alt?: string; kind?: MediaKind }): Promise<MediaItem>;
  replace(id: string, file: File, opts?: { onProgress?: (pct: number) => void }): Promise<MediaItem>;
  update(id: string, patch: Partial<Pick<MediaItem, 'name' | 'alt' | 'folder'>>): Promise<MediaItem>;
  remove(id: string): Promise<void>;
  /** Resolve a stored reference (`media:<id>`, a path or a URL) to something an <img>/<video> can load. */
  resolve(ref: string): Promise<string>;
  usage(id: string): Promise<MediaUsage[]>;
  refFor(item: MediaItem): string;
}

/* ---------- Careers ---------- */
export type Job = ContentMap['jobs'][number];

export interface CareersService {
  list(): Promise<Job[]>;
  save(jobs: Job[], publish: boolean): Promise<void>;
}

/* ---------- Applications ---------- */
export type ApplicationStatus = 'new' | 'reviewing' | 'shortlisted' | 'interview' | 'selected' | 'rejected';

export interface Note {
  id: string;
  text: string;
  at: string;
  by: string;
}

export interface Application {
  id: string;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  preferredJob: string;
  qualification: string;
  experienceYears: string;
  currentLocation?: string;
  cvFileName?: string;
  cvSize?: number;
  hasCv: boolean;
  status: ApplicationStatus;
  notes: Note[];
  read: boolean;
  sample?: boolean;
  submittedAt: string;
  updatedAt: string;
}

export interface ApplicationsService {
  list(): Promise<Application[]>;
  create(input: Omit<Application, 'id' | 'code' | 'status' | 'notes' | 'read' | 'submittedAt' | 'updatedAt' | 'hasCv'>, cv?: File | null): Promise<Application>;
  update(id: string, patch: Partial<Pick<Application, 'status' | 'read' | 'preferredJob'>>): Promise<Application>;
  addNote(id: string, text: string): Promise<Application>;
  remove(id: string): Promise<void>;
  cvUrl(id: string): Promise<string | null>;
  isDuplicate(email: string, preferredJob: string): Promise<boolean>;
}

/* ---------- Enquiries ---------- */
export type EnquiryStatus = 'new' | 'in-progress' | 'resolved';

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
  status: EnquiryStatus;
  notes: Note[];
  read: boolean;
  sample?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiriesService {
  list(): Promise<Enquiry[]>;
  create(input: Pick<Enquiry, 'name' | 'email' | 'phone' | 'message' | 'subject'>): Promise<Enquiry>;
  update(id: string, patch: Partial<Pick<Enquiry, 'status' | 'read'>>): Promise<Enquiry>;
  addNote(id: string, text: string): Promise<Enquiry>;
  remove(id: string): Promise<void>;
}

/* ---------- Settings / activity ---------- */
export interface ActivityEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  href?: string;
}

/* ---------------- Onboarding ---------------- */
export type OnboardingStatus = 'not_started' | 'in_progress' | 'paused' | 'completed' | 'skipped';

/** Per-admin onboarding record. Always scoped to the signed-in admin. */
export interface OnboardingState {
  userId: string;
  /** Tour version the record belongs to; a newer version can offer an updated tour. */
  version: string;
  status: OnboardingStatus;
  /** Id of the step to resume from (not an index, so reordering steps is safe). */
  currentStepId: string | null;
  completedSteps: string[];
  /** "Don't show the welcome screen again". */
  hideWelcome: boolean;
  /** Login timestamp the welcome screen was last shown for – shows once per sign-in. */
  welcomeSeenForLogin: string | null;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string | null;
}

export interface OnboardingService {
  /** Record for the signed-in admin (a fresh default when none exists). */
  get(): Promise<OnboardingState>;
  /** Merge changes into the signed-in admin's record. Never writes another admin's record. */
  update(patch: Partial<Omit<OnboardingState, 'userId'>>): Promise<OnboardingState>;
}

export interface SettingsService {
  activity(limit?: number): Promise<ActivityEntry[]>;
  log(action: string, target: string, href?: string): Promise<void>;
  seedSampleData(): Promise<void>;
  clearSampleData(): Promise<number>;
  exportAll(): Promise<Record<string, unknown>>;
  resetEverything(): Promise<void>;
  storageEstimate(): Promise<{ usage: number; quota: number } | null>;
}
