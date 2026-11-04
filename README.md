# MEERO Overseas HR Consultancy — Official Website

A premium, modern, dynamic 5-page web platform for **MEERO Overseas HR Consultancy**, a **Govt of India approved recruiting agency** based in Cochin, Kerala, India.

---

## 🌟 Brand Identity & Color Palette

- **Primary Background:** `#FFFFFF`
- **Secondary Background:** `#F5FAF9`
- **Primary Brand Teal:** `#168F88`
- **Secondary Turquoise:** `#21B8C1`
- **Main Heading Text:** `#171B20`
- **Secondary Text:** `#697477`
- **Subtle Borders:** `#E5ECEA`
- **Brand Motifs:** Fingerprint circular concentric loop inspired by the Meero brand identity, with floating degree indicator and the State Emblem of India beside the approval tagline.

---

## 🚀 Key Features

1. **Exactly 5 Distinct Pages with React Router Navigation:**
   - **Page 1: Home (`/`)**: Hero section with international career visual, trust introduction, 3 feature cards, 9 recruitment specializations, 4-step recruitment journey, 4 pillars of excellence, dynamic featured vacancies, and final CTA.
   - **Page 2: About Us (`/about`)**: Story, mission & vision, values, and closing call to action. All copy lives in `src/data/aboutContent.js`.
   - **Page 3: Services (`/services`)**: The 9 specializations in order: Logistics and transport, FMCG, Retail, Hospitality, Facility management, Construction, Oil and gas, Healthcare, Manufacturing. Edit them in `src/data/services.js`.
   - **Page 4: Careers (`/careers`)**: Searchable and filterable job board with keyword search, destination country filter, industry filter, employment type filter, sorting, interactive Job Detail modal, hiring poster modal, WhatsApp channel link (`whatsappChannelUrl` in `src/data/companyInfo.js`), and complete candidate application modal with drag-and-drop resume upload and validation.
   - **Page 5: Contact Us (`/contact`)**: Contact desk info, click-to-call, email, WhatsApp, and Instagram (`instagramUrl` in `src/data/companyInfo.js`) links, validated contact form, Google Maps embed for Ravipuram, office hours, and Managing Director details.

2. **Verified Company Details (Zero Fabrication):**
   - **Managing Director:** Abdul Latheef (Direct: `+91 99 4733 4733`)
   - **Office Mobile:** `+91 98 4655 5198`
   - **Telephone:** `+91 484 2356 123`
   - **Email:** `hrmeero@gmail.com`
   - **Website:** `www.meerohr.com`
   - **Office Address:** 2nd Floor, Krishnanjali Building, Near Sree Krishna Temple, Ravipuram, Cochin – 682016, Kerala, India
   - **Regulatory Approval:** Govt of India approved recruiting agency

3. **Production Tech Stack:**
   - React 19 + Vite 8
   - Tailwind CSS v4 (`@tailwindcss/vite`)
   - React Router DOM v7
   - Framer Motion for smooth animations and micro-interactions
   - Lenis smooth scrolling with `prefers-reduced-motion` accessibility
   - Lucide React icons
   - Modular chunking & high performance

---

## 🛠️ Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 🔌 Configurable Backend API Endpoints

Create a `.env` file in the root directory to connect your custom backend API or CMS:

```env
# Optional API Endpoint for Candidate CV Applications (multipart/form-data)
VITE_API_ENDPOINT=https://api.meerohr.com/api/v1/applications

# Optional API Endpoint for Contact Form Enquiries (application/json)
VITE_CONTACT_API_ENDPOINT=https://api.meerohr.com/api/v1/inquiries
```

*When no backend is configured, the forms validate inputs and safely log submissions locally with unique tracking reference IDs.*
