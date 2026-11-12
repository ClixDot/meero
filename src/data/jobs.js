import { servicesList } from "./services.js";

// To change a hiring poster: add the image to public/images/posters/ and update
// the job's `poster` path. Remove the field to hide the poster option for that job.
export const sampleJobs = [
  {
    id: "job-001",
    poster: "/images/posters/job-001.jpg",
    title: "Registered Staff Nurse (ICU / Emergency / CCU)",
    destinationCountry: "United Arab Emirates",
    location: "Abu Dhabi / Dubai, UAE",
    countryCode: "AE",
    flagEmoji: "🇦🇪",
    industry: "Healthcare",
    employmentType: "Full-Time",
    experience: "3 - 5 Years (Minimum 2 yrs bedside ICU)",
    minExperienceYears: 3,
    qualification: "B.Sc Nursing / Post Basic B.Sc Nursing",
    licensing: "DHA / DOH (HAAD) Exam Pass or DataFlow Ready (Assistance Provided)",
    salaryNote: "AED 7,500 - 9,500 (Tax-Free) + Housing & Health Insurance",
    deadline: "Upcoming Client Selection Drive",
    postedDate: "2026-10-15",
    isSample: true,
    description: "Accredited multi-specialty tertiary care hospital network in the UAE invites applications from experienced Indian registered nurses for critical care units. MEERO provides end-to-end guidance with DataFlow PSV and DHA/DOH license endorsement.",
    responsibilities: [
      "Deliver advanced hemodynamic monitoring and critical care nursing to acute patients",
      "Administer IV medications, infusions, and emergency cardiac life support protocols",
      "Collaborate seamlessly with multi-disciplinary physicians, intensivists, and surgical panels",
      "Maintain documentation compliant with JCI quality benchmarks and UAE Department of Health standards"
    ],
    requirements: [
      "B.Sc Nursing degree from an INC-recognized institution with valid state council registration",
      "Minimum 3 continuous years of bedside clinical experience in a 100+ bed hospital ICU/CCU",
      "DHA or DOH/HAAD exam pass certificate or DataFlow positive report preferred (guidance provided)",
      "Good command of clinical English; basic conversational Arabic is an added advantage"
    ],
    benefits: [
      "Tax-free monthly salary package with shift differentials",
      "Furnished family/bachelor accommodation or generous housing allowance",
      "Annual return airfare to India with 30 calendar days paid leave",
      "Comprehensive medical insurance coverage and end-of-service gratuity as per UAE Labor Law"
    ]
  },
  {
    id: "job-002",
    poster: "/images/posters/job-002.jpg",
    title: "Senior MEP Project Engineer (High-Rise & Infrastructure)",
    destinationCountry: "Kingdom of Saudi Arabia",
    location: "Riyadh & Dammam, Saudi Arabia",
    countryCode: "SA",
    flagEmoji: "🇸🇦",
    industry: "Construction",
    employmentType: "Full-Time Contract",
    experience: "6 - 10 Years (Minimum 3 yrs GCC experience)",
    minExperienceYears: 6,
    qualification: "B.E. / B.Tech in Mechanical or Electrical Engineering",
    licensing: "Saudi Council of Engineers (SCE) Membership Assistance Provided",
    salaryNote: "SAR 11,000 - 14,000 + Site Allowance + Furnished Accom.",
    deadline: "Direct Delegation Interview Drive",
    postedDate: "2026-10-18",
    isSample: true,
    description: "Leading Tier-1 EPC contractor operating landmark commercial and healthcare high-rises under Saudi Vision 2030 seeks Senior MEP Engineers to supervise site mechanical, electrical, and plumbing execution.",
    responsibilities: [
      "Direct daily MEP construction, testing, and balancing activities on high-rise developments",
      "Review composite MEP coordinated shop drawings, BIM models, and material submittals",
      "Liaise with client project management consultants, main civil contractors, and municipal authorities",
      "Ensure stringent zero-compromise adherence to site HSE and Saudi Building Code (SBC)"
    ],
    requirements: [
      "Degree in Mechanical or Electrical Engineering from a recognized university",
      "Minimum 3 years prior Gulf experience in large-scale commercial or hospitality towers",
      "Hands-on proficiency in AutoCAD, Revit MEP, and MS Project schedules",
      "Valid passport with minimum 1-year validity and clear medical fitness (GAMCA/Wafid)"
    ],
    benefits: [
      "Attractive basic salary with site performance bonuses",
      "Company-provided executive bachelor accommodation and private commute",
      "30 calendar days annual paid vacation with company-provided return air tickets",
      "Saudi labor law compliant gratuity and medical insurance"
    ]
  },
  {
    id: "job-003",
    poster: "/images/posters/job-003.jpg",
    title: "Civil Infrastructure QA/QC Inspector",
    destinationCountry: "Qatar",
    location: "Doha, Qatar",
    countryCode: "QA",
    flagEmoji: "🇶🇦",
    industry: "Construction",
    employmentType: "Full-Time",
    experience: "4 - 7 Years",
    minExperienceYears: 4,
    qualification: "Diploma / Degree in Civil Engineering",
    licensing: "Ashghal Qatar Standard Familiarity Preferred",
    salaryNote: "QAR 6,500 - 8,000 + Site Camp Allowance",
    deadline: "CV Shortlisting Underway",
    postedDate: "2026-10-20",
    isSample: true,
    description: "Civil Quality Control Inspectors needed for arterial highway expansion, drainage networks, and bridge infrastructure projects in greater Doha.",
    responsibilities: [
      "Perform concrete slump tests, earthwork compaction, and asphalt sampling inspections",
      "Inspect incoming structural materials against approved material submittals and BS/ASTM codes",
      "Log Non-Conformance Reports (NCR) and verify corrective actions with site subcontractors",
      "Compile comprehensive daily QA/QC inspection dossiers for client consultant sign-off"
    ],
    requirements: [
      "Diploma or Degree in Civil Engineering",
      "At least 4 years documented QA/QC experience on road, bridge, or civil drainage networks",
      "Working familiarity with Ashghal quality benchmarks",
      "Medically fit and ready for immediate deployment following visa endorsement"
    ],
    benefits: [
      "Competitive monthly salary package",
      "Furnished company bachelor accommodation and site commute",
      "Overtime allowances where applicable",
      "Standard repatriation air travel and Qatar health card coverage"
    ]
  },
  {
    id: "job-004",
    poster: "/images/posters/job-004.jpg",
    title: "Executive Sous Chef (Continental & Mediterranean)",
    destinationCountry: "Oman",
    location: "Muscat, Oman",
    countryCode: "OM",
    flagEmoji: "🇴🇲",
    industry: "Hospitality",
    employmentType: "Full-Time",
    experience: "5 - 8 Years (Upscale Hotel / Fine Dining)",
    minExperienceYears: 5,
    qualification: "Degree / Diploma in Hotel Management & Culinary Arts",
    licensing: "HACCP Food Safety Certification",
    salaryNote: "OMR 650 - 850 (Tax-Free) + Full Board & Lodging",
    deadline: "Direct Food Tasting & Interview Drive",
    postedDate: "2026-10-22",
    isSample: true,
    description: "Premier 5-star beachfront resort in Muscat invites passionate culinary professionals skilled in European and Mediterranean dining to manage kitchen brigades across signature dining outlets.",
    responsibilities: [
      "Supervise daily kitchen operations, mise-en-place, and artistic culinary presentation",
      "Enforce rigorous international HACCP hygiene standards and cold-chain food safety",
      "Curate seasonal menus, banquet dining packages, and manage food cost efficiency",
      "Mentor line chefs, commis, and kitchen stewards in modern cooking techniques"
    ],
    requirements: [
      "Formal culinary qualification with at least 5 years upscale hotel or cruise experience",
      "Proven command over contemporary Continental, Italian, or Mediterranean recipes",
      "Demonstrated team leadership under high-volume banquet service pressure",
      "Clean GAMCA/Wafid medical fitness record and valid passport"
    ],
    benefits: [
      "Tax-free salary package with annual performance incentives",
      "Full board: free air-conditioned accommodation and all meals provided",
      "30 days annual paid leave with round-trip airfare",
      "Oman Ministry of Manpower regulated benefits and healthcare"
    ]
  },
  {
    id: "job-005",
    poster: "/images/posters/job-005.jpg",
    title: "Certified 6G TIG & ARC Welders (Refinery Project)",
    destinationCountry: "Kingdom of Saudi Arabia",
    location: "Jubail / Yanbu, Saudi Arabia",
    countryCode: "SA",
    flagEmoji: "🇸🇦",
    industry: "Oil and gas",
    employmentType: "Full-Time Contract",
    experience: "3 - 6 Years (Aramco / Oil & Gas)",
    minExperienceYears: 3,
    qualification: "ITI in Welding / Valid 6G Trade Test Certificate",
    licensing: "Practical Radiography (X-Ray) Trade Test",
    salaryNote: "SAR 2,800 - 3,800 + Substantial Overtime + Free Food & Camp",
    deadline: "Technical Trade Test Drive",
    postedDate: "2026-10-24",
    isSample: true,
    description: "High-priority recruitment for oil refinery petrochemical expansion. Candidates must clear a 6G position radiography weld test witnessed by client inspectors.",
    responsibilities: [
      "Execute TIG (GTAW) and SMAW welding on heavy carbon steel and alloy piping systems",
      "Weld in 6G fixed positions to satisfy 100% radiographic examination standards",
      "Strictly adhere to Welding Procedure Specifications (WPS) and plant safety directives",
      "Operate pipe beveling machines, pre-heat monitoring torches, and welding generators"
    ],
    requirements: [
      "ITI certificate or minimum 3 years documented pipe welding background",
      "Proven ability to produce defect-free welds under X-Ray inspection",
      "Previous Gulf refinery experience preferred; domestic candidates with top skills welcome",
      "Clean GAMCA medical fitness certificate"
    ],
    benefits: [
      "Attractive basic salary with substantial overtime allowance (1.5x / 2x)",
      "Free company-provided food and comfortable camp accommodation",
      "Complete visa processing, medical, and flight expenses borne by employer",
      "2-year renewable contract with round-trip flight ticket"
    ]
  },
  {
    id: "job-006",
    poster: "/images/posters/job-006.jpg",
    title: "Warehouse Logistics Operations Supervisor",
    destinationCountry: "Kuwait",
    location: "Shuwaikh / Al Ahmadi, Kuwait",
    countryCode: "KW",
    flagEmoji: "🇰🇼",
    industry: "Logistics and transport",
    employmentType: "Full-Time",
    experience: "3 - 6 Years",
    minExperienceYears: 3,
    qualification: "Bachelor's Degree / Diploma in Logistics & Supply Chain",
    licensing: "WMS / ERP Experience (SAP or Oracle)",
    salaryNote: "KWD 350 - 450 + Accommodation & Commute",
    deadline: "Shortlisting Underway",
    postedDate: "2026-10-25",
    isSample: true,
    description: "Regional FMCG and cold-chain distributor in Kuwait seeks an Operations Supervisor to lead warehouse fulfillment, cycle counts, and cross-dock fleet dispatch.",
    responsibilities: [
      "Coordinate receiving, bin allocation, order picking, and refrigerated dispatch",
      "Supervise warehouse crews, reach truck operators, and inventory audit teams",
      "Operate WMS software to ensure 99.8% inventory accuracy and track shelf-life expiry",
      "Ensure adherence to industrial safety and temperature logs for perishable goods"
    ],
    requirements: [
      "Degree or diploma with at least 3 years warehouse operations experience",
      "Familiarity with modern WMS tools, RF barcode scanners, and inventory metrics",
      "Strong leadership and problem-solving mindset",
      "Good English communication; Arabic conversational ability is an advantage"
    ],
    benefits: [
      "Competitive salary in Kuwaiti Dinar (KWD)",
      "Furnished bachelor accommodation and transportation provided",
      "Annual paid leave and medical insurance",
      "Long-term career progression and contract renewals"
    ]
  },
  {
    id: "job-007",
    poster: "/images/posters/job-007.jpg",
    title: "Registered Nurses - European Pathway (Germany)",
    destinationCountry: "Germany",
    location: "Bavaria & North Rhine-Westphalia, Germany",
    countryCode: "DE",
    flagEmoji: "🇩🇪",
    industry: "Healthcare",
    employmentType: "Full-Time Permanent",
    experience: "2 - 5 Years Clinical Bedside Experience",
    minExperienceYears: 2,
    qualification: "B.Sc Nursing / GNM with State Nursing Council Registration",
    licensing: "German Language B2 Training + Professional Recognition (Anerkennung)",
    salaryNote: "€2,900 - €3,600 / month (Post Recognition) + Shift Bonuses",
    deadline: "Interview Drive for New Language Batch",
    postedDate: "2026-10-26",
    isSample: true,
    description: "German hospital consortium offers structured clinical employment pathways for Indian nurses with guided German language training, Defizitbescheid document processing, and arrival support in Germany.",
    responsibilities: [
      "Deliver compassionate inpatient nursing care across acute, medical, or surgical wards",
      "Document patient care plans compliant with German healthcare quality standards",
      "Participate in adaptation nursing clinical courses (Anpassungslehrgang)",
      "Collaborate with international medical teams in state-of-the-art hospitals"
    ],
    requirements: [
      "B.Sc Nursing or GNM with active state nursing council registration in India",
      "Minimum 2 years hospital bedside nursing experience",
      "Commitment to achieve German B2 language proficiency (guidance provided)",
      "Genuine intent for long-term career growth in the European Union"
    ],
    benefits: [
      "Standard German collective bargaining salary with overtime and night premiums",
      "Subsidized arrival housing and relocation allowance",
      "Permanent employment contract upon license equivalence",
      "Clear legal pathway to German permanent residency (PR)"
    ]
  },
  {
    id: "job-008",
    poster: "/images/posters/job-008.jpg",
    title: "HVAC Commissioning & Maintenance Technicians",
    destinationCountry: "United Arab Emirates",
    location: "Dubai & Sharjah, UAE",
    countryCode: "AE",
    flagEmoji: "🇦🇪",
    industry: "Facility management",
    employmentType: "Full-Time",
    experience: "3 - 5 Years",
    minExperienceYears: 3,
    qualification: "ITI / Diploma in RAC (Refrigeration & Air Conditioning)",
    licensing: "UAE Driving License is an Advantage",
    salaryNote: "AED 2,800 - 3,600 + Free Accommodation & Transport",
    deadline: "Immediate Candidate Screening",
    postedDate: "2026-10-27",
    isSample: true,
    description: "Leading facility management major servicing commercial towers and shopping malls in Dubai seeks skilled HVAC technicians proficient with central chilled water plants, AHUs, and FCUs.",
    responsibilities: [
      "Carry out scheduled preventive and reactive maintenance on central chilled water systems",
      "Troubleshoot compressors, fan coil units (FCU), and air handling units (AHU)",
      "Perform refrigerant leak checks, vacuuming, and pressure recharging",
      "Maintain logs of maintenance activities and parts replacement"
    ],
    requirements: [
      "ITI / Diploma in RAC or Mechanical engineering trade",
      "Minimum 3 years hands-on experience with central HVAC installations",
      "Prior Gulf experience is preferred; domestic candidates with strong skills welcome",
      "Ability to read electrical schematic diagrams and refrigerant circuit maps"
    ],
    benefits: [
      "Attractive monthly salary package",
      "Free shared accommodation with amenities",
      "Daily company commute to project sites",
      "UAE health insurance and labor card provided"
    ]
  }
];

export const destinationCountries = [
  "All Countries",
  "United Arab Emirates",
  "Kingdom of Saudi Arabia",
  "Qatar",
  "Oman",
  "Kuwait",
  "Germany"
];

export const industriesList = [
  "All Industries",
  ...servicesList.map((service) => service.title)
];

export const employmentTypesList = [
  "All Types",
  "Full-Time",
  "Full-Time Contract",
  "Full-Time Permanent"
];
