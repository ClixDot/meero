/**
 * Sample candidate and enquiry records so the dashboard is usable before real
 * submissions arrive. Every record is flagged `sample: true`, shows a "Sample"
 * badge in the admin, and can be removed from Settings → General.
 */
import type { Application, ApplicationStatus, Enquiry, EnquiryStatus } from './types';
import { sampleJobs } from '../../data/jobs';

const daysAgo = (d: number, h = 10) => {
  const t = new Date();
  t.setDate(t.getDate() - d);
  t.setHours(h, (d * 7) % 60, 0, 0);
  return t.toISOString();
};

const people: Array<[string, string, string, string, string, number, ApplicationStatus]> = [
  ['Anjali Menon', 'anjali.menon@example.com', '+91 94470 11223', 'B.Sc Nursing', '4', 2, 'new'],
  ['Rahul Krishnan', 'rahul.k@example.com', '+91 98950 44120', 'B.Tech Mechanical', '7', 4, 'reviewing'],
  ['Mohammed Shafeeq', 'shafeeq.m@example.com', '+91 97456 88213', 'Diploma Civil Engineering', '5', 9, 'shortlisted'],
  ['Sneha Thomas', 'sneha.thomas@example.com', '+91 90372 55418', 'Hotel Management Degree', '6', 15, 'interview'],
  ['Arjun Nair', 'arjun.nair@example.com', '+91 81290 66741', 'ITI Electrician', '3', 22, 'selected'],
  ['Fathima Rasheed', 'fathima.r@example.com', '+91 95620 31907', 'GNM Nursing', '2', 30, 'rejected'],
  ['Vishnu Prasad', 'vishnu.p@example.com', '+91 99610 74532', 'B.Com', '4', 41, 'reviewing'],
  ['Deepa Joseph', 'deepa.j@example.com', '+91 70250 18836', 'B.Sc Nursing', '5', 52, 'selected'],
  ['Nikhil Raj', 'nikhil.raj@example.com', '+91 85470 92310', 'Diploma Mechanical', '8', 63, 'interview'],
  ['Ayesha Beevi', 'ayesha.b@example.com', '+91 94950 26671', 'MBA Hospitality', '6', 77, 'shortlisted'],
  ['Sajan Varghese', 'sajan.v@example.com', '+91 97440 50982', 'ITI Welder (6G)', '9', 95, 'selected'],
  ['Lakshmi Pillai', 'lakshmi.p@example.com', '+91 90610 47123', 'B.Pharm', '3', 118, 'rejected'],
  ['Joel Mathew', 'joel.m@example.com', '+91 86060 33418', 'Diploma HVAC', '5', 140, 'interview'],
  ['Hiba Fathima', 'hiba.f@example.com', '+91 79070 21564', 'B.Sc Nursing', '3', 160, 'selected'],
];

export function sampleApplications(): Application[] {
  return people.map(([fullName, email, phone, qualification, experienceYears, d, status], i) => {
    const job = sampleJobs[i % sampleJobs.length];
    return {
      id: `sample-app-${i + 1}`,
      code: `MEERO-APP-${(415203 + i * 3779).toString().slice(0, 6)}`,
      fullName, email, phone, qualification, experienceYears,
      preferredJob: job.title,
      hasCv: false,
      status,
      notes: status === 'new' ? [] : [{ id: `sample-note-${i}`, text: 'Sample record – profile screened by phone.', at: daysAgo(d - 1 < 0 ? 0 : d - 1), by: 'MEERO Admin' }],
      read: status !== 'new',
      sample: true,
      submittedAt: daysAgo(d, 9 + (i % 8)),
      updatedAt: daysAgo(Math.max(0, d - 1)),
    };
  });
}

const enquiryPeople: Array<[string, string, string, string, number, EnquiryStatus]> = [
  ['Gulf Facilities LLC (HR)', 'hr@gulf-facilities.example', '+971 50 123 4567', 'We are hiring 40 housekeeping staff and 10 HVAC technicians for Dubai. Please share your process and timelines.', 1, 'new'],
  ['Biju Abraham', 'biju.a@example.com', '+91 94471 22908', 'Is there any fee for registering my son for welding jobs in Qatar?', 3, 'new'],
  ['Shameer K', 'shameer.k@example.com', '+91 98475 61209', 'I have 5 years of Gulf driving experience. Any openings in Saudi Arabia?', 6, 'in-progress'],
  ['Al Noor Hospital', 'recruit@alnoor.example', '+968 9 123 4455', 'Requirement for 15 ICU nurses with DataFlow ready. Kindly call our recruitment manager.', 12, 'in-progress'],
  ['Reshma Paul', 'reshma.p@example.com', '+91 70120 98345', 'Can you help with the DHA exam guidance?', 20, 'resolved'],
  ['Thomas George', 'thomas.g@example.com', '+91 99460 13277', 'Do you have hospitality openings in Oman for chefs?', 34, 'resolved'],
];

export function sampleEnquiries(): Enquiry[] {
  return enquiryPeople.map(([name, email, phone, message, d, status], i) => ({
    id: `sample-enq-${i + 1}`,
    name, email, phone, message, status,
    notes: [],
    read: status !== 'new',
    sample: true,
    createdAt: daysAgo(d, 11 + i),
    updatedAt: daysAgo(d, 11 + i),
  }));
}
