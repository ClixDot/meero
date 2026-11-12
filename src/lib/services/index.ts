/**
 * Service registry. Swap the adapters here to move from local IndexedDB to
 * MongoDB / Cloudinary – nothing else in the app imports an adapter directly.
 */
import {
  localApplications,
  localAuth,
  localCareers,
  localContent,
  localEnquiries,
  localMedia,
  localSettings,
} from './local';
import type {
  ApplicationsService,
  AuthService,
  CareersService,
  ContentService,
  EnquiriesService,
  MediaService,
  SettingsService,
} from './types';

export const services: {
  auth: AuthService;
  content: ContentService;
  media: MediaService;
  careers: CareersService;
  applications: ApplicationsService;
  enquiries: EnquiriesService;
  settings: SettingsService;
} = {
  auth: localAuth,
  content: localContent,
  media: localMedia,
  careers: localCareers,
  applications: localApplications,
  enquiries: localEnquiries,
  settings: localSettings,
};

/** Human-readable name of the active persistence backend (shown in the admin). */
export const STORAGE_BACKEND = 'This browser (IndexedDB)';

export * from './types';
