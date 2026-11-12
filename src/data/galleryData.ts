/*
 * GALLERY CONTENT
 * Everything shown on the Gallery page comes from this file. No other code needs to change.
 *
 * The current photos are Unsplash stock images and the titles and locations are samples.
 * Replace all of them with real photos and event details before the site goes live.
 *
 * TO REPLACE A PHOTO WITH A LOCAL FILE
 *   1. Copy the photo into public/images/gallery/ (create the folder if needed).
 *      Use a simple file name with no spaces, e.g. kochi-drive-2026.jpg
 *   2. Point `image` at it. Paths start from inside `public`:
 *        image: "/images/gallery/kochi-drive-2026.jpg",
 *   3. Delete the `thumbnail` line, or point it at a smaller copy of the photo.
 *   4. Update `title`, `location`, `category` and `alt` to match the photo.
 *
 * TO USE A PHOTO HOSTED ELSEWHERE
 *   Paste its full web address into `image`.
 *
 * TO ADD A PHOTO
 *   Copy a whole { ... } block, give it a new unique `id`, and edit the fields.
 *
 * TO REMOVE A PHOTO
 *   Delete its whole { ... } block. Photos appear on the page in the order listed here.
 *
 * FIELDS
 *   id         Unique name for this photo. Never shown on the page.
 *   title      Short caption shown on the card and in the full-screen view.
 *   category   Must exactly match one of the galleryCategories below.
 *   location   Badge on the card. Can be a place or a date, e.g. "Kochi" or "March 2026".
 *   image      The full-size photo.
 *   thumbnail  Optional smaller copy for the grid, so the page loads faster.
 *   alt        Describes the photo for screen readers and search engines.
 */

// The filter tabs. "All" is added automatically by the page.
export const galleryCategories = [
  "Recruitment Drives",
  "Interviews & Venue",
  "Overseas Delegations"
];

export const galleryItems = [
  {
    id: "gcc-hospitality-drive",
    title: "GCC Hospitality Drive - Kochi",
    category: "Recruitment Drives",
    location: "Kochi",
    image: "https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=1800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=800&q=75",
    alt: "Large crowd of candidates gathered at a hiring event"
  },
  {
    id: "oil-gas-interviews",
    title: "Oil & Gas Technical Interviews",
    category: "Interviews & Venue",
    location: "Kochi",
    image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=1800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=800&q=75",
    alt: "Candidate speaking with an interviewer at a small table"
  },
  {
    id: "employer-delegation-welcome",
    title: "Employer Delegation Welcome",
    category: "Overseas Delegations",
    location: "Kochi",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=75",
    alt: "Two business professionals shaking hands"
  },
  {
    id: "healthcare-candidate-briefing",
    title: "Healthcare Candidate Briefing",
    category: "Recruitment Drives",
    location: "Kozhikode",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=75",
    alt: "Seated audience attending a briefing session"
  },
  {
    id: "interview-venue-setup",
    title: "Interview Venue Setup",
    category: "Interviews & Venue",
    location: "Kochi",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=75",
    alt: "Conference hall arranged with tables and projector screens"
  },
  {
    id: "gcc-employer-panel",
    title: "GCC Employer Panel Meeting",
    category: "Overseas Delegations",
    location: "Mumbai",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=75",
    alt: "Panel seated around a boardroom table with laptops"
  },
  {
    id: "overseas-career-session",
    title: "Overseas Career Awareness Session",
    category: "Recruitment Drives",
    location: "Chennai",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=75",
    alt: "Presenter on stage in front of a large screen and audience"
  },
  {
    id: "document-verification-desk",
    title: "Document Verification Desk",
    category: "Interviews & Venue",
    location: "Kochi",
    image: "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?auto=format&fit=crop&w=1800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?auto=format&fit=crop&w=800&q=75",
    alt: "Two people reviewing paperwork across a desk"
  },
  {
    id: "client-requirements-briefing",
    title: "Client Requirements Briefing",
    category: "Overseas Delegations",
    location: "Kochi",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=75",
    alt: "People taking notes around a long wooden meeting table"
  },
  {
    id: "candidate-orientation",
    title: "Candidate Orientation Session",
    category: "Recruitment Drives",
    location: "Thrissur",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=75",
    alt: "Group of candidates seated together during an orientation"
  },
  {
    id: "candidate-profile-screening",
    title: "Candidate Profile Screening",
    category: "Interviews & Venue",
    location: "Kochi",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=75",
    alt: "Recruiters reviewing notes beside laptops"
  },
  {
    id: "delegation-selection-meeting",
    title: "Delegation Selection Meeting",
    category: "Overseas Delegations",
    location: "Kochi",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=75",
    alt: "Two colleagues celebrating with a high five at a desk"
  }
];
