/** Field schemas for every CMS document and collection. */
import type { Field } from './editor/fields';
import { newId } from './editor/fields';

const hero = (label = 'Hero banner'): Field => ({
  type: 'group', key: 'hero', label, description: 'Large banner at the top of the page.',
  fields: [
    { type: 'text', key: 'title', label: 'Heading (white line)', required: true, half: true, maxLength: 80 },
    { type: 'text', key: 'highlight', label: 'Heading (turquoise line)', half: true, maxLength: 80 },
    { type: 'image', key: 'image', label: 'Background image', required: true, altKey: 'imageAlt' },
  ],
});

export const homeSchema: Field[] = [
  {
    type: 'group', key: 'hero', label: 'Hero banner', description: 'The first screen visitors see.',
    fields: [
      { type: 'text', key: 'title', label: 'Heading (white line)', required: true, half: true, maxLength: 60 },
      { type: 'text', key: 'highlight', label: 'Heading (turquoise line)', half: true, maxLength: 60 },
      { type: 'image', key: 'image', label: 'Background image', required: true, altKey: 'imageAlt', help: 'Wide landscape photo, at least 1920 px wide.' },
      { type: 'toggle', key: 'showTrustBadge', label: 'Show government approval badge' },
      { type: 'text', key: 'primaryLabel', label: 'Main button label', required: true, half: true, help: 'Opens the application form.' },
      { type: 'text', key: 'secondaryLabel', label: 'Second button label', required: true, half: true },
      { type: 'link', key: 'secondaryLink', label: 'Second button link', required: true, help: 'e.g. /contact or https://…' },
    ],
  },
  {
    type: 'group', key: 'explorer', label: 'Specializations explorer', visibilityKey: 'visible', description: 'Service list with details and the dark “Global Career” card.',
    fields: [
      { type: 'text', key: 'label', label: 'Small label above the list', half: true },
      { type: 'text', key: 'exploreLabel', label: '“Explore” button label', half: true },
      { type: 'link', key: 'exploreLink', label: '“Explore” button link', required: true },
      { type: 'text', key: 'cardTitle', label: 'Card heading', half: true },
      { type: 'text', key: 'cardHighlight', label: 'Card heading (turquoise)', half: true },
      { type: 'textarea', key: 'cardText', label: 'Card text', rows: 2, maxLength: 200 },
      { type: 'text', key: 'cardButtonLabel', label: 'Card button label', help: 'Opens the application form.' },
    ],
  },
  {
    type: 'group', key: 'opportunities', label: 'Featured opportunities', visibilityKey: 'visible', description: 'Photo cards that open a job’s details.',
    fields: [
      { type: 'text', key: 'heading', label: 'Section heading', required: true },
      { type: 'text', key: 'buttonLabel', label: 'Button label', half: true },
      { type: 'link', key: 'buttonLink', label: 'Button link', half: true },
      {
        type: 'list', key: 'cards', label: 'Cards', itemLabel: 'Card', itemTitle: (c) => c.title,
        newItem: () => ({ id: newId('card'), jobId: '', title: '', destination: '', sector: '', image: '' }),
        fields: [
          { type: 'select', key: 'jobId', label: 'Linked job listing', help: 'Clicking the card opens this job.', options: (ctx) => (ctx.jobs ?? []).map((j: any) => ({ value: j.id, label: j.title })) },
          { type: 'text', key: 'title', label: 'Card title', required: true, half: true },
          { type: 'text', key: 'sector', label: 'Sector tag', half: true },
          { type: 'text', key: 'destination', label: 'Destination' },
          { type: 'image', key: 'image', label: 'Photo', required: true },
        ],
      },
    ],
  },
  {
    type: 'group', key: 'guarantees', label: 'Trust guarantees', visibilityKey: 'visible',
    fields: [
      { type: 'text', key: 'heading', label: 'Heading', required: true },
      { type: 'textarea', key: 'subheading', label: 'Sub-heading', rows: 2 },
      {
        type: 'list', key: 'items', label: 'Guarantee cards', itemLabel: 'Card', itemTitle: (c) => c.title,
        newItem: () => ({ title: '', desc: '' }),
        fields: [
          { type: 'text', key: 'title', label: 'Title', required: true },
          { type: 'textarea', key: 'desc', label: 'Description', rows: 2, required: true },
        ],
      },
    ],
  },
  {
    type: 'group', key: 'process', label: 'Recruitment process', visibilityKey: 'visible', description: 'Steps themselves are edited in Content Manager → Recruitment steps.',
    fields: [
      { type: 'text', key: 'heading', label: 'Heading', required: true },
      { type: 'textarea', key: 'subheading', label: 'Sub-heading', rows: 2 },
    ],
  },
  {
    type: 'group', key: 'faq', label: 'FAQ section', visibilityKey: 'visible', description: 'Questions are edited in Content Manager → FAQs.',
    fields: [
      { type: 'text', key: 'heading', label: 'Heading', required: true },
      { type: 'textarea', key: 'subheading', label: 'Sub-heading', rows: 2 },
    ],
  },
  {
    type: 'group', key: 'careerDesk', label: 'Career desk banner', visibilityKey: 'visible', description: 'Dark banner with WhatsApp and call buttons (numbers come from Contact).',
    fields: [
      { type: 'text', key: 'title', label: 'Heading (white)', required: true, half: true },
      { type: 'text', key: 'highlight', label: 'Heading (turquoise)', half: true },
    ],
  },
  {
    type: 'group', key: 'location', label: 'Location strip', visibilityKey: 'visible', description: 'Address comes from Contact.',
    fields: [
      { type: 'text', key: 'heading', label: 'Heading', required: true },
      { type: 'text', key: 'primaryLabel', label: 'Main button label', half: true },
      { type: 'text', key: 'secondaryLabel', label: 'Second button label', half: true },
    ],
  },
];

export const aboutSchema: Field[] = [
  hero(),
  {
    type: 'group', key: 'story', label: 'Company story', visibilityKey: 'visible',
    fields: [
      { type: 'text', key: 'heading', label: 'Heading', required: true },
      { type: 'strings', key: 'paragraphs', label: 'Paragraphs', itemLabel: 'Paragraph', multiline: true, required: true },
      { type: 'image', key: 'image', label: 'Image', altKey: 'imageAlt' },
    ],
  },
  {
    type: 'group', key: 'pillars', label: 'Mission & vision', visibilityKey: 'visible',
    fields: [
      {
        type: 'list', key: 'items', label: 'Cards', itemLabel: 'Card', itemTitle: (c) => c.heading,
        newItem: () => ({ heading: '', text: '' }),
        fields: [
          { type: 'text', key: 'heading', label: 'Heading', required: true },
          { type: 'textarea', key: 'text', label: 'Text', rows: 3, required: true },
        ],
      },
    ],
  },
  {
    type: 'group', key: 'values', label: 'Values', visibilityKey: 'visible',
    fields: [
      { type: 'text', key: 'heading', label: 'Section heading', required: true },
      {
        type: 'list', key: 'items', label: 'Values', itemLabel: 'Value', itemTitle: (c) => c.title,
        newItem: () => ({ title: '', description: '' }),
        fields: [
          { type: 'text', key: 'title', label: 'Value', required: true },
          { type: 'textarea', key: 'description', label: 'Description', rows: 2, required: true },
        ],
      },
    ],
  },
  {
    type: 'group', key: 'closing', label: 'Closing call to action', visibilityKey: 'visible',
    fields: [
      { type: 'text', key: 'heading', label: 'Heading', required: true },
      { type: 'textarea', key: 'text', label: 'Text', rows: 2 },
      { type: 'text', key: 'primaryLabel', label: 'Main button label', half: true },
      { type: 'text', key: 'secondaryLabel', label: 'Second button label', half: true },
    ],
  },
];

export const serviceIcons = ['Truck', 'PackageOpen', 'Store', 'UtensilsCrossed', 'Building2', 'HardHat', 'Fuel', 'Stethoscope', 'Factory'];

export const servicesPageSchema: Field[] = [
  hero(),
  { type: 'text', key: 'cardPrimaryLabel', label: 'Service card – first button', half: true },
  { type: 'text', key: 'cardSecondaryLabel', label: 'Service card – second button', half: true },
  {
    type: 'group', key: 'cta', label: 'Bottom call to action', visibilityKey: 'visible',
    fields: [
      { type: 'text', key: 'eyebrow', label: 'Small label', half: true },
      { type: 'text', key: 'heading', label: 'Heading', required: true, half: true },
      { type: 'textarea', key: 'text', label: 'Text', rows: 2 },
      { type: 'text', key: 'primaryLabel', label: 'Main button label', half: true },
      { type: 'text', key: 'secondaryLabel', label: 'Second button label', half: true },
    ],
  },
];

export const serviceFields: Field[] = [
  { type: 'text', key: 'title', label: 'Service name', required: true, maxLength: 60 },
  { type: 'textarea', key: 'description', label: 'Description', rows: 3, required: true, maxLength: 320 },
  { type: 'select', key: 'icon', label: 'Icon', required: true, options: serviceIcons, iconOptions: true, half: true },
  { type: 'text', key: 'id', label: 'Anchor ID', help: 'Used in links like /services#logistics-transport. Letters, numbers and dashes.', half: true, required: true },
  { type: 'image', key: 'image', label: 'Image', required: true },
  { type: 'strings', key: 'highlights', label: 'Highlights', itemLabel: 'Highlight' },
];

export const careersPageSchema: Field[] = [
  hero(),
  { type: 'text', key: 'searchPlaceholder', label: 'Search box placeholder' },
  { type: 'strings', key: 'countries', label: 'Destination country filter', itemLabel: 'Country', help: 'Must match the “Destination country” of job listings exactly.' },
  { type: 'strings', key: 'employmentTypes', label: 'Employment types', itemLabel: 'Type', help: 'Choices offered when editing a job listing.' },
  { type: 'text', key: 'emptyTitle', label: 'No results – heading', half: true },
  { type: 'text', key: 'emptyText', label: 'No results – text', half: true },
  {
    type: 'group', key: 'drives', label: 'Upcoming drives banner', visibilityKey: 'visible',
    fields: [
      { type: 'text', key: 'heading', label: 'Heading', required: true },
      { type: 'textarea', key: 'text', label: 'Text', rows: 2 },
      { type: 'text', key: 'channelLabel', label: 'Button label (when WhatsApp channel set)', half: true },
      { type: 'text', key: 'chatLabel', label: 'Button label (WhatsApp chat)', half: true },
      { type: 'textarea', key: 'chatMessage', label: 'Pre-filled WhatsApp message', rows: 2 },
      { type: 'text', key: 'registerLabel', label: 'Register button label' },
    ],
  },
];

export const jobFields: Field[] = [
  { type: 'text', key: 'title', label: 'Job title', required: true, maxLength: 100 },
  { type: 'select', key: 'industry', label: 'Industry', required: true, half: true, options: (ctx) => ['Healthcare', 'Construction', ...(ctx.services ?? []).map((s: any) => s.title)].filter((v, i, a) => a.indexOf(v) === i) },
  { type: 'select', key: 'employmentType', label: 'Employment type', required: true, half: true, options: (ctx) => ctx.employmentTypes ?? ['Full-Time'] },
  { type: 'select', key: 'destinationCountry', label: 'Destination country', required: true, half: true, options: (ctx) => ctx.countries ?? [] },
  { type: 'text', key: 'location', label: 'City / location', required: true, half: true },
  { type: 'text', key: 'flagEmoji', label: 'Flag emoji', half: true, placeholder: '🇦🇪' },
  { type: 'text', key: 'countryCode', label: 'Country code', half: true, placeholder: 'AE' },
  { type: 'text', key: 'salaryNote', label: 'Salary & package', required: true },
  { type: 'text', key: 'experience', label: 'Experience required', half: true, required: true },
  { type: 'number', key: 'minExperienceYears', label: 'Minimum years (for sorting)', half: true, min: 0, max: 40 },
  { type: 'text', key: 'qualification', label: 'Qualification', required: true },
  { type: 'text', key: 'licensing', label: 'Licensing / certification' },
  { type: 'text', key: 'deadline', label: 'Deadline / drive', half: true, help: 'e.g. “Interviews 25 Nov” or a date.' },
  { type: 'text', key: 'postedDate', label: 'Posted date', half: true, placeholder: 'YYYY-MM-DD', help: 'Used for “Newest first”.' },
  { type: 'textarea', key: 'description', label: 'Description', rows: 4, required: true },
  { type: 'strings', key: 'responsibilities', label: 'Responsibilities', itemLabel: 'Responsibility' },
  { type: 'strings', key: 'requirements', label: 'Requirements', itemLabel: 'Requirement' },
  { type: 'strings', key: 'benefits', label: 'Benefits', itemLabel: 'Benefit' },
  { type: 'image', key: 'poster', label: 'Hiring poster', help: 'Optional. Shows a “View poster” button on the job card.' },
];

export const newJob = () => ({
  title: '', industry: '', employmentType: 'Full-Time', destinationCountry: '', location: '', flagEmoji: '', countryCode: '',
  salaryNote: '', experience: '', minExperienceYears: 0, qualification: '', licensing: '', deadline: '',
  postedDate: new Date().toISOString().slice(0, 10), description: '', responsibilities: [], requirements: [], benefits: [], poster: '', isSample: false,
});

export const companySchema: Field[] = [
  {
    type: 'group', key: 'contact', label: 'Phone, email & WhatsApp',
    fields: [
      { type: 'text', key: 'officeMobile', label: 'Office mobile (display)', required: true, half: true },
      { type: 'text', key: 'cleanOfficeMobile', label: 'Office mobile (digits only, with country code)', required: true, half: true, help: 'Used for tap-to-call, e.g. 919846555198' },
      { type: 'text', key: 'telephone', label: 'Landline (display)', half: true },
      { type: 'text', key: 'cleanTelephone', label: 'Landline (digits only)', half: true },
      { type: 'email', key: 'email', label: 'Email', required: true, half: true },
      { type: 'text', key: 'displayWebsite', label: 'Website (display)', half: true },
      { type: 'text', key: 'whatsappNumber', label: 'WhatsApp number (digits only)', required: true, half: true },
      { type: 'url', key: 'whatsappUrl', label: 'WhatsApp chat link', required: true, half: true, help: 'https://wa.me/<number>?text=…' },
      { type: 'url', key: 'whatsappChannelUrl', label: 'WhatsApp channel link', help: 'Optional. Used on the Careers page.' },
      { type: 'url', key: 'instagramUrl', label: 'Instagram profile', help: 'Leave empty to hide Instagram buttons.' },
    ],
  },
  {
    type: 'group', key: 'address', label: 'Office address & map',
    fields: [
      { type: 'text', key: 'floor', label: 'Floor', half: true },
      { type: 'text', key: 'building', label: 'Building', half: true },
      { type: 'text', key: 'landmark', label: 'Landmark', half: true },
      { type: 'text', key: 'city', label: 'City', required: true, half: true },
      { type: 'text', key: 'postalCode', label: 'Postal code', half: true },
      { type: 'text', key: 'state', label: 'State', half: true },
      { type: 'text', key: 'country', label: 'Country', half: true },
      { type: 'textarea', key: 'fullAddress', label: 'Full address (one line)', rows: 2 },
      { type: 'url', key: 'googleMapsEmbedUrl', label: 'Google Maps embed URL', help: 'Google Maps → Share → Embed a map → copy the src="…" link.' },
    ],
  },
  {
    type: 'group', key: 'credentials', label: 'Government approval',
    fields: [
      { type: 'text', key: 'governmentApproval', label: 'Approval tagline', required: true },
      { type: 'image', key: 'approvalLogo', label: 'Approval logo (white)', altKey: 'approvalLogoAlt' },
    ],
  },
];

export const contactPageSchema: Field[] = [
  hero(),
  { type: 'text', key: 'introHeading', label: 'Intro heading', half: true },
  { type: 'text', key: 'formHeading', label: 'Form heading', half: true },
  { type: 'textarea', key: 'introText', label: 'Intro text', rows: 2 },
  { type: 'text', key: 'hoursText', label: 'Consultation hours' },
  {
    type: 'group', key: 'map', label: 'Map section', visibilityKey: 'visible',
    fields: [
      { type: 'text', key: 'heading', label: 'Heading', half: true },
      { type: 'text', key: 'linkLabel', label: 'Link label', half: true },
      { type: 'text', key: 'text', label: 'Address line' },
      { type: 'url', key: 'link', label: '“Open in Google Maps” link' },
    ],
  },
];

export const galleryPageSchema: Field[] = [
  hero(),
  { type: 'strings', key: 'categories', label: 'Photo categories', itemLabel: 'Category', help: 'Each photo is assigned one of these.' },
  { type: 'text', key: 'emptyText', label: 'Text when there are no photos' },
];

export const galleryFields: Field[] = [
  { type: 'text', key: 'title', label: 'Caption', required: true, maxLength: 80 },
  { type: 'select', key: 'category', label: 'Category', required: true, half: true, options: (ctx) => ctx.categories ?? [] },
  { type: 'text', key: 'location', label: 'Location / date badge', half: true },
  { type: 'image', key: 'image', label: 'Photo', required: true, altKey: 'alt' },
  { type: 'image', key: 'thumbnail', label: 'Smaller thumbnail (optional)', help: 'Faster grid loading. Leave empty to use the main photo.' },
];

export const faqFields: Field[] = [
  { type: 'text', key: 'question', label: 'Question', required: true },
  { type: 'textarea', key: 'answer', label: 'Answer', rows: 5, required: true },
];

export const stepFields: Field[] = [
  { type: 'text', key: 'step', label: 'Number label', required: true, half: true, placeholder: '01' },
  { type: 'text', key: 'title', label: 'Title', required: true, half: true },
  { type: 'textarea', key: 'description', label: 'Description', rows: 3, required: true },
];

export const headerFooterSchema: Field[] = [
  { type: 'image', key: 'logo', label: 'Website logo', required: true, altKey: 'logoAlt', help: 'Shown in the header and footer. Use a white/light logo (PNG with transparency).' },
  { type: 'text', key: 'headerCtaLabel', label: 'Header button label', half: true, required: true },
  { type: 'toggle', key: 'showWhatsappPill', label: 'Show WhatsApp pill in header (large screens)' },
  {
    type: 'group', key: 'footer', label: 'Footer',
    fields: [
      { type: 'textarea', key: 'description', label: 'About text', rows: 3 },
      { type: 'toggle', key: 'showTrustBadge', label: 'Show government approval badge' },
      { type: 'text', key: 'exploreHeading', label: 'Pages column heading', half: true },
      { type: 'text', key: 'sectorsHeading', label: 'Sectors column heading', half: true },
      { type: 'text', key: 'officeHeading', label: 'Office column heading', half: true },
      { type: 'text', key: 'copyright', label: 'Copyright text', half: true, help: '“© <year>” is added automatically.' },
      { type: 'toggle', key: 'poweredByVisible', label: 'Show “Powered by” credit' },
      { type: 'text', key: 'poweredByLabel', label: 'Credit name', half: true },
      { type: 'url', key: 'poweredByUrl', label: 'Credit link', half: true },
    ],
  },
  {
    type: 'group', key: 'social', label: 'Social links', description: 'Shown as round buttons in the footer when filled in. Instagram & WhatsApp are set under Contact.',
    fields: [
      { type: 'url', key: 'facebook', label: 'Facebook', half: true },
      { type: 'url', key: 'linkedin', label: 'LinkedIn', half: true },
      { type: 'url', key: 'youtube', label: 'YouTube', half: true },
      { type: 'url', key: 'x', label: 'X (Twitter)', half: true },
    ],
  },
];

export const seoSchema: Field[] = [
  { type: 'text', key: 'siteName', label: 'Site name', required: true, half: true },
  { type: 'url', key: 'canonicalBase', label: 'Canonical domain', required: true, half: true, help: 'e.g. https://www.meerohr.com' },
  { type: 'image', key: 'defaultOgImage', label: 'Default social share image (OG)', help: '1200 × 630 px recommended. Use a site path or public URL – social networks cannot read files stored only in this browser.' },
  {
    type: 'list', key: 'pages', label: 'Pages', itemLabel: 'Page', itemTitle: (p) => `${p.path}  ·  ${p.title}`,
    newItem: () => ({ id: newId('seo'), path: '/', title: '', description: '', keywords: '', ogImage: '', canonical: '' }),
    fields: [
      { type: 'text', key: 'path', label: 'Page path', required: true, half: true },
      { type: 'url', key: 'canonical', label: 'Canonical URL override', half: true },
      { type: 'text', key: 'title', label: 'Meta title', required: true, maxLength: 70, help: 'Aim for 50–60 characters.' },
      { type: 'textarea', key: 'description', label: 'Meta description', rows: 2, required: true, maxLength: 170, help: 'Aim for 140–160 characters.' },
      { type: 'text', key: 'keywords', label: 'Keywords', help: 'Comma separated.' },
      { type: 'image', key: 'ogImage', label: 'Social share image override' },
    ],
  },
];

export const fontOptions = ['Outfit', 'Plus Jakarta Sans', 'Inter', 'Poppins', 'Manrope', 'DM Sans', 'Montserrat', 'Sora', 'Urbanist', 'Lexend', 'Nunito Sans', 'Work Sans', 'Raleway', 'Playfair Display'];

export const designSchema: Field[] = [
  {
    type: 'group', key: 'colors', label: 'Brand colours', description: 'Applied across buttons, highlights, icons and headings on the website.',
    fields: [
      { type: 'color', key: 'teal', label: 'Primary (teal)', required: true, half: true },
      { type: 'color', key: 'turquoise', label: 'Accent (turquoise)', required: true, half: true },
      { type: 'color', key: 'text', label: 'Heading & text', required: true, half: true },
      { type: 'color', key: 'background', label: 'Soft section background', required: true, half: true },
      { type: 'color', key: 'lavender', label: 'Lavender accent', required: true, half: true },
    ],
  },
  { type: 'select', key: 'headingFont', label: 'Heading font', options: fontOptions, required: true, half: true },
  { type: 'select', key: 'bodyFont', label: 'Body font', options: fontOptions, required: true, half: true },
  { type: 'range', key: 'headingScale', label: 'Heading size', min: 80, max: 120, step: 5, suffix: '%', help: 'Scales all website headings.' },
  { type: 'color', key: 'pageBackground', label: 'Page background', required: true, half: true },
  { type: 'color', key: 'darkBackground', label: 'Dark sections & hero background', required: true, half: true },
];

export const generalSchema: Field[] = [
  {
    type: 'group', key: 'announcement', label: 'Announcement bar', visibilityKey: 'visible', description: 'Small pill shown at the top of every page.',
    fields: [
      { type: 'text', key: 'text', label: 'Message', required: true, maxLength: 120 },
      { type: 'link', key: 'link', label: 'Link (optional)' },
    ],
  },
  {
    type: 'group', key: 'floatingWhatsapp', label: 'Floating WhatsApp button', visibilityKey: 'visible',
    fields: [{ type: 'text', key: 'tooltip', label: 'Tooltip text' }],
  },
  { type: 'email', key: 'notificationEmail', label: 'Notification email', half: true, help: 'Stored for the email-alert integration (phase 2). No emails are sent yet.' },
  { type: 'text', key: 'timezone', label: 'Timezone', half: true },
];
