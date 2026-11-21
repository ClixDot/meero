/**
 * Default CMS content. Built from the original src/data files and the copy that
 * was previously hard-coded in the views, so the public site renders exactly as
 * before until an admin publishes a change.
 */
import { companyInfo } from '../../data/companyInfo';
import { aboutContent } from '../../data/aboutContent';
import { servicesList, recruitmentSteps } from '../../data/services';
import { sampleJobs, destinationCountries, employmentTypesList } from '../../data/jobs';
import { galleryItems, galleryCategories } from '../../data/galleryData';
import { faqList } from '../../data/destinations';

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export const defaultContent = {
  home: {
    hero: {
      image: 'https://res.cloudinary.com/inu9dzib/image/upload/f_auto,q_auto/meero/images/hero-bg.jpg',
      imageAlt: 'International HR team collaboration and talent recruitment',
      showTrustBadge: true,
      title: 'Your Global Career',
      highlight: 'Starts Here.',
      primaryLabel: 'Free Profile Registration',
      secondaryLabel: 'Contact Desk',
      secondaryLink: '/contact',
    },
    explorer: {
      visible: true,
      label: 'Specializations',
      exploreLabel: 'Explore Services',
      exploreLink: '/services',
      cardTitle: "Let's build your",
      cardHighlight: 'Global Career!',
      cardText: 'Free profile registration, verified client demand letters, and dedicated career guidance across the GCC & Europe.',
      cardButtonLabel: 'Talk with Recruiter',
    },
    opportunities: {
      visible: true,
      heading: 'Active Overseas Opportunities',
      buttonLabel: 'Browse All Vacancies',
      buttonLink: '/careers',
      cards: [
        { id: 'card-1', jobId: 'job-001', title: 'Registered Staff Nurse', destination: 'Abu Dhabi / Dubai, UAE', sector: 'Healthcare (DHA/HAAD)', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80' },
        { id: 'card-2', jobId: 'job-002', title: 'Senior MEP Project Engineer', destination: 'Riyadh, Saudi Arabia', sector: 'Engineering & EPC', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80' },
        { id: 'card-3', jobId: 'job-003', title: 'Civil QA/QC Inspector', destination: 'Doha, Qatar', sector: 'Civil Infrastructure', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80' },
        { id: 'card-4', jobId: 'job-004', title: 'Executive Sous Chef', destination: 'Muscat, Oman', sector: '5-Star Hospitality', image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80' },
        { id: 'card-5', jobId: 'job-007', title: 'European Healthcare Nurse', destination: 'Bavaria, Germany', sector: 'Germany (Fast-Track)', image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80' },
      ],
    },
    guarantees: {
      visible: true,
      heading: 'The Recruiter That Values Your Trust',
      subheading: 'Honest guidance, transparent fee policies, and legal protection under Indian Emigration Act standards.',
      items: clone(companyInfo.guarantees),
    },
    process: {
      visible: true,
      heading: 'Our Recruitment Process',
      subheading: 'Every candidate is kept fully informed and supported throughout every milestone.',
    },
    faq: {
      visible: true,
      heading: 'Frequently Asked Questions',
      subheading: 'Clear answers regarding profile registration, licensing, trade tests, and legal deployment.',
    },
    careerDesk: {
      visible: true,
      title: 'Discuss Your Overseas Career',
      highlight: 'Directly with Our Experts.',
    },
    location: {
      visible: true,
      heading: 'Our Location',
      primaryLabel: 'Submit Candidate Profile',
      secondaryLabel: 'Contact Us',
    },
  },

  about: {
    hero: { ...clone(aboutContent.hero) },
    story: { visible: true, ...clone(aboutContent.story) },
    pillars: { visible: true, items: clone(aboutContent.pillars) },
    values: { visible: true, heading: aboutContent.values.heading, items: clone(aboutContent.values.items) },
    closing: { visible: true, ...clone(aboutContent.closing), primaryLabel: 'Submit Resume', secondaryLabel: 'Contact Desk' },
  },

  servicesPage: {
    hero: {
      title: 'Comprehensive',
      highlight: 'Recruitment Solutions.',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=75',
      imageAlt: 'International Business Skyscraper',
    },
    cardPrimaryLabel: 'View Openings',
    cardSecondaryLabel: 'Enquire for this Sector',
    cta: {
      visible: true,
      eyebrow: 'Direct Manpower & Career Consultation',
      heading: 'Ready to Discuss Your Requirements?',
      text: 'Whether you are an aspiring candidate or a corporate recruiter looking to hire from India, our team is ready to support your process.',
      primaryLabel: 'Submit Resume',
      secondaryLabel: 'Contact Desk',
    },
  },

  careersPage: {
    hero: {
      title: 'Find the Opportunity',
      highlight: 'That Moves You Forward.',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1600&q=75',
      imageAlt: 'International Career Strategy',
    },
    searchPlaceholder: 'Search vacancies by title, keyword, specialty, or qualification...',
    countries: destinationCountries.filter((c) => c !== 'All Countries'),
    employmentTypes: employmentTypesList.filter((c) => c !== 'All Types'),
    emptyTitle: 'No matching vacancies found',
    emptyText: 'Try adjusting your search criteria, or register your profile in our general candidate pool.',
    drives: {
      visible: true,
      heading: 'Looking for Upcoming Overseas Drives?',
      text: 'Client delegations visit our recruitment center regularly. Follow new drives on WhatsApp, or submit your profile to be pre-screened for upcoming vacancies.',
      channelLabel: 'Join Our WhatsApp Channel',
      chatLabel: 'Get Drive Updates on WhatsApp',
      chatMessage: 'Hello Meero HR Consultancy, please share updates on upcoming overseas drives.',
      registerLabel: 'Register Candidate Profile',
    },
  },

  contactPage: {
    hero: {
      title: "Let's Talk About",
      highlight: 'Your Next Opportunity.',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=75',
      imageAlt: 'Corporate Office',
    },
    introHeading: 'Connect with Our Team',
    introText: 'Reach out via phone, email, WhatsApp, or visit our Ravipuram office during working hours.',
    hoursText: 'Mon – Sat: 9:30 AM – 6:00 PM IST (Sunday Closed)',
    formHeading: 'Send Us a Direct Message',
    map: {
      visible: true,
      heading: 'Office Location Map',
      text: 'Ravipuram Road, Near Sree Krishna Temple, Kochi, Keralam 682016',
      link: 'https://maps.google.com/?q=Ravipuram+Sree+Krishna+Temple+Cochin+Kerala',
      linkLabel: 'Open in Google Maps',
    },
  },

  galleryPage: {
    hero: {
      title: 'Our Recruitment Drives',
      highlight: '& Events',
      image: 'https://res.cloudinary.com/inu9dzib/image/upload/f_auto,q_auto,c_limit,w_1800/v1795256385/meero/images/gallery-hero.jpg',
      imageAlt: 'HR consultant interviewing a candidate',
    },
    categories: clone(galleryCategories),
    emptyText: 'No photos yet.',
  },

  company: clone(companyInfo),

  services: servicesList.map((s) => ({ ...clone(s), visible: true })),
  jobs: sampleJobs.map((j) => ({ ...clone(j), visible: true })),
  gallery: galleryItems.map((g) => ({ ...clone(g), visible: true })),
  faqs: faqList.map((f) => ({ ...clone(f), visible: true })),
  steps: recruitmentSteps.map((s) => ({ ...clone(s), id: `step-${s.step}`, visible: true })),

  headerFooter: {
    logo: 'https://res.cloudinary.com/inu9dzib/image/upload/f_auto,q_auto:best,c_limit,w_1600/v1795250185/meero/images/meero.png',
    logoAlt: 'MEERO Overseas HR Consultancy',
    nav: [
      { id: 'nav-home', name: 'Home', path: '/', visible: true },
      { id: 'nav-about', name: 'About Us', path: '/about', visible: true },
      { id: 'nav-services', name: 'Services', path: '/services', visible: true },
      { id: 'nav-careers', name: 'Careers', path: '/careers', visible: true },
      { id: 'nav-gallery', name: 'Gallery', path: '/gallery', visible: true },
      { id: 'nav-contact', name: 'Contact', path: '/contact', visible: true },
    ],
    headerCtaLabel: 'Apply Now',
    showWhatsappPill: true,
    footer: {
      description: 'Connecting ambition with international opportunities. Meero Overseas HR Consultancy provides trusted recruitment and personalized career guidance from Keralam.',
      showTrustBadge: true,
      exploreHeading: 'Explore Pages',
      sectorsHeading: 'Recruitment Sectors',
      officeHeading: 'From Our Office',
      copyright: 'MEERO Overseas HR Consultancy. All rights reserved.',
      poweredByVisible: true,
      poweredByLabel: 'Clixdot',
      poweredByUrl: 'https://clixdot.com',
    },
    social: { facebook: '', linkedin: '', youtube: '', x: '' },
  },

  seo: {
    siteName: 'MEERO Overseas HR Consultancy',
    canonicalBase: 'https://www.meerohr.com',
    defaultOgImage: 'https://res.cloudinary.com/inu9dzib/image/upload/meero/images/meero-badge.jpg',
    pages: [
      { id: 'seo-home', path: '/', title: 'MEERO Overseas HR Consultancy | Trusted Global Recruitment & Career Guidance', description: 'Connecting talent with international career opportunities. Govt of India approved recruiting agency based in Cochin, Kerala.', keywords: 'Meero Overseas HR Consultancy, overseas recruitment Kerala, Kochi recruitment agency, Gulf jobs', ogImage: '', canonical: '' },
      { id: 'seo-about', path: '/about', title: 'About Us | MEERO Overseas HR Consultancy', description: 'Licensed overseas manpower recruitment consultancy under the Ministry of External Affairs, Government of India.', keywords: 'about Meero HR, licensed recruitment agency Kerala', ogImage: '', canonical: '' },
      { id: 'seo-services', path: '/services', title: 'Recruitment Services | MEERO Overseas HR Consultancy', description: 'Recruitment across logistics, FMCG, retail, hospitality, facility management, construction, oil & gas, healthcare and manufacturing.', keywords: 'overseas recruitment services, GCC manpower', ogImage: '', canonical: '' },
      { id: 'seo-careers', path: '/careers', title: 'Overseas Vacancies | MEERO Overseas HR Consultancy', description: 'Verified overseas job openings across the GCC and Europe.', keywords: 'Gulf jobs, overseas vacancies, jobs abroad from Kerala', ogImage: '', canonical: '' },
      { id: 'seo-gallery', path: '/gallery', title: 'Gallery | MEERO Overseas HR Consultancy', description: 'Recruitment drives, interviews and overseas delegations.', keywords: 'recruitment drives Kochi', ogImage: '', canonical: '' },
      { id: 'seo-contact', path: '/contact', title: 'Contact | MEERO Overseas HR Consultancy', description: 'Visit our Ravipuram, Kochi office or reach us by phone, email or WhatsApp.', keywords: 'contact Meero HR, recruitment agency Kochi', ogImage: '', canonical: '' },
    ],
  },

  design: {
    colors: {
      teal: '#168F88',
      turquoise: '#21B8C1',
      text: '#171B20',
      background: '#F5FAF9',
      lavender: '#8B80F9',
    },
    headingFont: 'Outfit',
    bodyFont: 'Plus Jakarta Sans',
    headingScale: 100,
    pageBackground: '#FFFFFF',
    darkBackground: '#030027',
  },

  general: {
    announcement: { visible: false, text: 'New overseas recruitment drive this month — register your profile today.', link: '/careers' },
    floatingWhatsapp: { visible: true, tooltip: 'Need career advice? Chat on WhatsApp' },
    timezone: 'Asia/Kolkata',
    notificationEmail: 'hrmeero@gmail.com',
  },
};

export type ContentMap = typeof defaultContent;
export type ContentKey = keyof ContentMap;
export const contentKeys = Object.keys(defaultContent) as ContentKey[];

export const contentLabels: Record<ContentKey, string> = {
  home: 'Home page',
  about: 'About page',
  servicesPage: 'Services page',
  careersPage: 'Careers page',
  contactPage: 'Contact page',
  galleryPage: 'Gallery page',
  company: 'Company & contact details',
  services: 'Service categories',
  jobs: 'Job listings',
  gallery: 'Gallery photos',
  faqs: 'FAQs',
  steps: 'Recruitment steps',
  headerFooter: 'Header & footer',
  seo: 'SEO',
  design: 'Design & branding',
  general: 'General settings',
};

export function getDefault<K extends ContentKey>(key: K): ContentMap[K] {
  return clone(defaultContent[key]);
}

/** Deep-merge stored values over defaults so new default fields appear for old saved docs. Arrays are replaced, not merged. */
export function mergeWithDefault<T>(def: T, value: unknown): T {
  if (value === undefined || value === null) return def;
  if (Array.isArray(def) || Array.isArray(value)) return value as T;
  if (typeof def === 'object' && def !== null && typeof value === 'object') {
    const out: Record<string, unknown> = { ...(def as Record<string, unknown>) };
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = k in out ? mergeWithDefault(out[k], v) : v;
    }
    return out as T;
  }
  return value as T;
}
