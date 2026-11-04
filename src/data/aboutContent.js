import { companyInfo } from './companyInfo';

// All copy for the About Us page lives here, so the client's final text can be
// dropped in without touching the layout in src/pages/About.jsx.
// The text below is interim copy. To hide `pillars` or `values`, use an empty array.
export const aboutContent = {
  hero: {
    title: "People First.",
    highlight: "Opportunities Without Borders.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80",
    imageAlt: "International HR team"
  },
  story: {
    heading: "Who We Are",
    paragraphs: [
      "MEERO Overseas HR Consultancy is a Govt of India approved recruiting agency in Ravipuram, Cochin, connecting Indian talent with verified employers across the GCC and Europe."
    ],
    image: "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Career consultation interview"
  },
  pillars: [
    { heading: "Our Mission", text: companyInfo.mission },
    { heading: "Our Vision", text: companyInfo.vision }
  ],
  values: {
    heading: "Our Values",
    items: companyInfo.values
  },
  closing: {
    heading: "Ready to Start Your Overseas Career?",
    text: "Register your profile for free, or speak with our team about current vacancies."
  }
};
