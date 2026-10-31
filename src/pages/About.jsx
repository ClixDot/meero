import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Target, 
  Eye, 
  CheckCircle2, 
  Users, 
  Building2, 
  ArrowRight, 
  Phone, 
  Mail, 
  Award,
  Sparkles,
  HeartHandshake,
  FileCheck2
} from 'lucide-react';

import Button from '../components/Button';
import { companyInfo } from '../data/companyInfo';

export default function About({ onOpenApplyModal }) {
  return (
    <div className="min-h-screen bg-[#0B0F17]">
      
      {/* ========================================================
          DARK HERO BANNER
      ======================================================== */}
      <section className="relative pt-28 pb-32 md:pt-36 md:pb-40 overflow-hidden">
        
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80"
            alt="International HR Team"
            className="w-full h-full object-cover filter brightness-[0.4] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F17]/95 via-[#0B0F17]/70 to-[#0B0F17]/50" />
        </div>

        <div className="max-w-[1560px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="max-w-3xl space-y-4">
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-heading leading-[1.1] sm:leading-tight break-words"
            >
              People First. <br />
              <span className="text-[#21B8C1]">Opportunities Without Borders.</span>
            </motion.h1>

            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#168F88]/30 border border-[#21B8C1]/40 text-[#21B8C1] text-xs sm:text-sm font-semibold backdrop-blur-md whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#21B8C1] shrink-0" />
              <span>
                <span className="sm:hidden">MEA Approved · Govt. of India</span>
                <span className="hidden sm:inline">Ministry of External Affairs Approved · Govt. of India</span>
              </span>
            </div>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed font-light">
              Kerala-rooted, MEA-approved, and dedicated to ethical overseas careers. Sourcing India&apos;s best medical, engineering, technical, and hospitality professionals for certified employers across the GCC and Europe.
            </p>

          </div>
        </div>
      </section>

      {/* ========================================================
          OVERLAPPING WHITE SHEET
      ======================================================== */}
      <section className="relative z-20 px-2.5 sm:px-6 lg:px-10 -mt-20 md:-mt-28 pb-20">
        <div className="max-w-[1560px] 2xl:max-w-[1680px] w-full mx-auto rounded-[24px] sm:rounded-[36px] md:rounded-[48px] lg:rounded-[52px] bg-white text-[#171B20] p-4 sm:p-8 md:p-12 lg:p-16 shadow-2xl shadow-black/30 border border-slate-100 space-y-12 sm:space-y-16">
          
          {/* Who We Are & Story Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading text-[#171B20] leading-tight">
                Ethical Overseas Recruitment, Built on Trust.
              </h2>

              <p className="text-sm sm:text-base text-[#697477] leading-relaxed">
                Headquartered in Ravipuram, Cochin, <strong>MEERO Overseas HR Consultancy</strong> is approved by the Ministry of External Affairs (MEA), Government of India. We connect ambitious Indian talent with verified employers across the GCC and Europe with complete transparency.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-[#F5FAF9] border border-[#E5ECEA]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#171B20]">
                    <ShieldCheck className="w-4 h-4 text-[#168F88]" />
                    <span>Free Profile Registration</span>
                  </div>
                  <p className="text-xs text-[#697477] mt-1">
                    Zero upfront fees for profile submission.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F5FAF9] border border-[#E5ECEA]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#171B20]">
                    <FileCheck2 className="w-4 h-4 text-[#168F88]" />
                    <span>100% Genuine Work Visas</span>
                  </div>
                  <p className="text-xs text-[#697477] mt-1">
                    Verified foreign employer demand letters only.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden shadow-xl aspect-[4/3] bg-slate-100 relative">
                <img
                  src="https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?auto=format&fit=crop&w=1000&q=80"
                  alt="Career consultation interview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white text-xs">
                  <div className="font-bold">Cochin Recruitment Center</div>
                  <div className="text-slate-300 text-[11px]">Ravipuram Road, Cochin – 682016, Kerala</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission & Vision Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-200">
            <div className="p-8 rounded-3xl bg-[#F5FAF9] border border-[#E5ECEA] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#168F88]/10 text-[#168F88] flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-heading text-[#171B20]">Responsible Global Placements</h3>
              <p className="text-sm text-[#697477] italic leading-relaxed border-l-2 border-[#168F88] pl-3">
                &ldquo;{companyInfo.mission}&rdquo;
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#F5FAF9] border border-[#E5ECEA] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#21B8C1]/10 text-[#21B8C1] flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-heading text-[#171B20]">Preferred International Partner</h3>
              <p className="text-sm text-[#697477] italic leading-relaxed border-l-2 border-[#21B8C1] pl-3">
                &ldquo;{companyInfo.vision}&rdquo;
              </p>
            </div>
          </div>

          {/* 5 Core Values */}
          <div className="pt-8 border-t border-slate-200">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#171B20]">Principles Guiding Every Placement</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {companyInfo.values.map((val, idx) => (
                <div key={val.title} className="p-4 sm:p-5 rounded-2xl bg-[#F5FAF9] border border-[#E5ECEA] flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#168F88] block mb-2">0{idx + 1}</span>
                    <h4 className="text-base font-bold text-[#171B20] font-heading mb-1.5">{val.title}</h4>
                    <p className="text-xs text-[#697477] leading-relaxed">{val.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Candidate & Employer Support Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-8 border-t border-slate-200">
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#F5FAF9] border border-[#E5ECEA] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#168F88]/10 text-[#168F88] flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#171B20] font-heading">
                  For Job Seekers
                </h3>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm text-[#171B20]">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#168F88] shrink-0" />
                  <span>100% Free Profile Registration</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#168F88] shrink-0" />
                  <span>DHA, Prometric &amp; DataFlow Guidance</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#168F88] shrink-0" />
                  <span>GAMCA Medicals &amp; Pre-Departure Briefing</span>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#F5FAF9] border border-[#E5ECEA] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#21B8C1]/10 text-[#21B8C1] flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#171B20] font-heading">
                  For Employers
                </h3>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm text-[#171B20]">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#21B8C1] shrink-0" />
                  <span>Pre-Screened &amp; Trade-Tested Talent</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#21B8C1] shrink-0" />
                  <span>Cochin Interview Delegation Suites</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#21B8C1] shrink-0" />
                  <span>Fast-Track e-Migrate &amp; Visa Deployment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leadership Spotlight */}
          <div className="pt-8 border-t border-slate-200">
            <div className="rounded-2xl sm:rounded-3xl bg-[#0D151E] text-white p-5 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="w-14 h-14 rounded-2xl bg-[#168F88] text-white flex items-center justify-center font-bold text-lg shrink-0">
                  AL
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading text-white">
                    {companyInfo.managingDirector.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {companyInfo.managingDirector.title} · Cochin Desk
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 w-full md:w-auto">
                <a
                  href={`tel:${companyInfo.managingDirector.cleanDirectMobile}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all text-center"
                >
                  <Phone className="w-3.5 h-3.5 text-[#21B8C1] shrink-0" />
                  <span>{companyInfo.managingDirector.directMobile}</span>
                </a>
                <a
                  href={`mailto:${companyInfo.contact.email}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all text-center"
                >
                  <Mail className="w-3.5 h-3.5 text-[#21B8C1] shrink-0" />
                  <span className="truncate">{companyInfo.contact.email}</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
