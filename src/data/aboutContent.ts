import { companyInfo } from './companyInfo';

// All copy for the About Us page lives here, so the client's final text can be
// dropped in without touching the layout in src/views/About.tsx.
// The text below is interim copy. To hide `pillars` or `values`, use an empty array.
export const aboutContent = {
  hero: {
    title: "People First.",
    highlight: "Opportunities Without Borders.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80",
    imageAlt: "International HR team"
  },
  story: {
    heading: "About Us",
    paragraphs: [
      "Meero HR Consultancy is a licensed overseas manpower recruitment consultancy under the Ministry of External Affairs, Government of India, specialising in connecting employers across the GCC region with skilled, semi-skilled and unskilled talent from India.",
      "With over 30 years of industry experience and excellence, under the leadership of our Founder, Mr. Abdul Latheef, we bring extensive recruitment expertise, strong industry knowledge and a deep understanding of international workforce requirements. We work closely with employers to identify the right talent, support their manpower requirements and build reliable, long-term recruitment partnerships. Our commitment to professionalism, quality and efficiency drives us to deliver dependable recruitment solutions across diverse industries."
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
