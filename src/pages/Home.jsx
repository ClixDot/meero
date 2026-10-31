import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import { 
  ArrowRight, 
  ShieldCheck, 
  Globe2, 
  Users, 
  Compass, 
  CheckCircle2, 
  MapPin, 
  Briefcase, 
  FileText, 
  Building2, 
  PhoneCall, 
  Sparkles,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Award,
  Stethoscope,
  Cpu,
  Wrench,
  UtensilsCrossed,
  FileBadge,
  HelpCircle,
  MessageCircle,
  Phone
} from 'lucide-react';

import Button from '../components/Button';
import FingerprintGraphic from '../components/FingerprintGraphic';

import { companyInfo } from '../data/companyInfo';
import { servicesList, recruitmentSteps, recruitmentSectors } from '../data/services';
import { sampleJobs } from '../data/jobs';
import { faqList, destinationMarkets } from '../data/destinations';

export default function Home({ onOpenApplyModal, onOpenJobDetails }) {
  // GSAP animation container and element refs
  const mainRef = useRef(null);
  const heroImageRef = useRef(null);
  const heroContentRef = useRef(null);

  // Active selected service in the 3-column explorer
  const [activeServiceId, setActiveServiceId] = useState(servicesList[0].id); // default: medical-healthcare

  // Active accordion FAQ item
  const [openFaqId, setOpenFaqId] = useState('faq-1');

  const toggleFaq = (id) => {
    setOpenFaqId(prev => prev === id ? null : id);
  };

  const activeService = servicesList.find(s => s.id === activeServiceId) || servicesList[0];

  useEffect(() => {
    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Hero Background Parallax & Content Fade on Scroll
      if (heroImageRef.current) {
        gsap.to(heroImageRef.current, {
          yPercent: 18,
          scale: 1.05,
          ease: 'none',
          scrollTrigger: {
            trigger: heroImageRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true
          }
        });
      }

      if (heroContentRef.current) {
        gsap.to(heroContentRef.current, {
          opacity: 0.2,
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: heroContentRef.current,
            start: 'top 20%',
            end: 'bottom top',
            scrub: true
          }
        });
      }

      // 2. Active GCC & European Vacancies Gallery Cards
      const galleryCards = gsap.utils.toArray('.gsap-gallery-card');
      if (galleryCards.length > 0) {
        gsap.fromTo(galleryCards,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.07,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.gsap-gallery-grid',
              start: 'top 85%',
              once: true
            },
            onComplete: () => {
              gsap.set(galleryCards, { clearProps: 'all' });
            }
          }
        );
      }

      // 3. Strategic Recruitment Divisions (Healthcare & Technical)
      const divisionCards = gsap.utils.toArray('.gsap-division-card');
      if (divisionCards.length > 0) {
        gsap.fromTo(divisionCards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.gsap-division-grid',
              start: 'top 85%',
              once: true
            },
            onComplete: () => {
              gsap.set(divisionCards, { clearProps: 'all' });
            }
          }
        );
      }

      // 4. Primary Destination Markets Grid
      const destCards = gsap.utils.toArray('.gsap-dest-card');
      if (destCards.length > 0) {
        gsap.fromTo(destCards,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.05,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.gsap-dest-grid',
              start: 'top 85%',
              once: true
            },
            onComplete: () => {
              gsap.set(destCards, { clearProps: 'all' });
            }
          }
        );
      }

      // 5. Recruitment Safeguards & Compliance
      const guaranteeCards = gsap.utils.toArray('.gsap-guarantee-card');
      if (guaranteeCards.length > 0) {
        gsap.fromTo(guaranteeCards,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.06,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.gsap-guarantee-grid',
              start: 'top 85%',
              once: true
            },
            onComplete: () => {
              gsap.set(guaranteeCards, { clearProps: 'all' });
            }
          }
        );
      }

      // 6. 4-Step Deployment Framework
      const stepCards = gsap.utils.toArray('.gsap-step-card');
      if (stepCards.length > 0) {
        gsap.fromTo(stepCards,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.07,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.gsap-step-grid',
              start: 'top 85%',
              once: true
            },
            onComplete: () => {
              gsap.set(stepCards, { clearProps: 'all' });
            }
          }
        );
      }

      // 7. Frequently Asked Questions
      const faqItems = gsap.utils.toArray('.gsap-faq-item');
      if (faqItems.length > 0) {
        gsap.fromTo(faqItems,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.04,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.gsap-faq-container',
              start: 'top 85%',
              once: true
            },
            onComplete: () => {
              gsap.set(faqItems, { clearProps: 'all' });
            }
          }
        );
      }

      // 8. Cochin Career Desk CTA Banner
      const deskBanner = document.querySelector('.gsap-desk-banner');
      if (deskBanner) {
        gsap.fromTo(deskBanner,
          { opacity: 0, y: 25, scale: 0.99 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: deskBanner,
              start: 'top 85%',
              once: true
            },
            onComplete: () => {
              gsap.set(deskBanner, { clearProps: 'all' });
            }
          }
        );
      }

      // Ensure ScrollTrigger accurately calculates document height
      ScrollTrigger.refresh();

    }, mainRef);

    // Refresh triggers once layout and images stabilize
    const refreshTimer1 = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    const refreshTimer2 = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 400);

    return () => {
      clearTimeout(refreshTimer1);
      clearTimeout(refreshTimer2);
      ctx.revert();
    };
  }, []);

  // 5 Featured photographic roles for the cards gallery
  const galleryRoles = [
    {
      id: "job-001",
      title: "Registered Staff Nurse",
      destination: "Abu Dhabi / Dubai, UAE",
      sector: "Healthcare (DHA/HAAD)",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80",
      jobRef: sampleJobs[0]
    },
    {
      id: "job-002",
      title: "Senior MEP Project Engineer",
      destination: "Riyadh, Saudi Arabia",
      sector: "Engineering & EPC",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
      jobRef: sampleJobs[1]
    },
    {
      id: "job-003",
      title: "Civil QA/QC Inspector",
      destination: "Doha, Qatar",
      sector: "Civil Infrastructure",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
      jobRef: sampleJobs[2]
    },
    {
      id: "job-004",
      title: "Executive Sous Chef",
      destination: "Muscat, Oman",
      sector: "5-Star Hospitality",
      image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80",
      jobRef: sampleJobs[3]
    },
    {
      id: "job-007",
      title: "European Healthcare Nurse",
      destination: "Bavaria, Germany",
      sector: "Germany (Fast-Track)",
      image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80",
      jobRef: sampleJobs[6]
    }
  ];

  return (
    <div ref={mainRef} className="min-h-screen bg-[#0B0F17]">
      
      {/* ========================================================
          DARK HERO SECTION (MATCHING THE REFERENCE IMAGE)
      ======================================================== */}
      <section className="relative min-h-[110vh] md:min-h-[115vh] flex items-center pt-28 pb-44 md:pt-36 md:pb-56 overflow-hidden">
        
        {/* Full-width High-end Photography Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            ref={heroImageRef}
            src="/images/hero-bg.jpg"
            alt="International HR team collaboration and talent recruitment"
            className="w-full h-full object-cover object-center filter brightness-[0.48] contrast-[1.05]"
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F17]/95 via-[#0B0F17]/70 to-[#0B0F17]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-black/30" />
        </div>

        {/* Hero Content Container */}
        <div className="max-w-[1560px] 2xl:max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-10 relative z-10 my-auto">
          <div ref={heroContentRef} className="max-w-3xl space-y-6">
            
            {/* Huge Clean Bold Headline (Style: "Digital Marketing Services") */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-heading leading-[1.1] sm:leading-[1.08] break-words"
            >
              Your Global Career <br />
              <span className="text-white">Starts Here.</span>
            </motion.h1>

            {/* Pill Tag / Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#168F88]/30 border border-[#21B8C1]/40 text-[#21B8C1] text-xs sm:text-sm font-semibold backdrop-blur-md whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#21B8C1] shrink-0" />
              <span>
                <span className="sm:hidden">MEA Approved · Govt. of India</span>
                <span className="hidden sm:inline">Approved by Ministry of External Affairs · Govt. of India</span>
              </span>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto"
            >
              <button
                type="button"
                onClick={() => onOpenApplyModal && onOpenApplyModal()}
                className="w-full sm:w-auto justify-center px-6 py-3 rounded-full text-xs sm:text-sm font-bold bg-white text-[#0B0F17] hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10 flex items-center gap-2"
              >
                <span>Free Profile Registration</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/contact"
                className="w-full sm:w-auto text-center justify-center px-6 py-3 rounded-full text-xs sm:text-sm font-semibold bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all"
              >
                Contact Cochin Desk
              </Link>
            </motion.div>

          </div>
        </div>

      </section>

      {/* ========================================================
          SIGNATURE FLOATING WHITE SHEET (MATCHING THE REFERENCE IMAGE)
      ======================================================== */}
      <section className="relative z-20 px-2.5 sm:px-6 lg:px-10 -mt-24 md:-mt-36 pb-20">
        <div className="max-w-[1560px] 2xl:max-w-[1680px] w-full mx-auto rounded-[24px] sm:rounded-[36px] md:rounded-[48px] lg:rounded-[52px] bg-white text-[#171B20] p-4 sm:p-8 md:p-12 lg:p-16 shadow-2xl shadow-black/30 border border-slate-100">
          
          {/* ----------------------------------------------------
              SECTION 1: THE 3-COLUMN SERVICE EXPLORER
          ---------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-stretch pb-14 border-b border-slate-200">
            
            {/* Col 1: Vertical List of Services (Left) */}
            <div className="lg:col-span-3 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-widest text-[#697477] mb-3">
                Specializations
              </div>
              
              <div className="space-y-1">
                {servicesList.map((service) => {
                  const isActive = service.id === activeServiceId;
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setActiveServiceId(service.id)}
                      onMouseEnter={() => setActiveServiceId(service.id)}
                      className={`w-full text-left px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between group ${
                        isActive 
                          ? 'bg-[#F5FAF9] text-[#168F88] font-bold border-l-4 border-[#168F88]' 
                          : 'text-[#697477] hover:text-[#171B20] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#168F88]' : 'bg-slate-300 group-hover:bg-slate-400'}`} />
                        <span className="truncate">{service.shortTitle || service.title}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'translate-x-0.5 text-[#168F88]' : 'opacity-0 group-hover:opacity-100 text-slate-400'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Col 2: Active Service Details (Middle) */}
            <div className="lg:col-span-5 flex flex-col justify-between p-5 sm:p-7 rounded-3xl bg-[#F5FAF9]/80 border border-[#E5ECEA]">
              <div className="space-y-3.5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeService.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#171B20] font-heading leading-snug">
                      {activeService.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#697477] leading-relaxed">
                      {activeService.simpleDesc || activeService.shortDescription}
                    </p>

                    {/* Concise Highlights */}
                    <div className="pt-1.5 space-y-1.5">
                      {(activeService.simpleHighlights || activeService.keyHighlights.slice(0, 2)).map((hl, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-[#171B20]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#168F88] shrink-0" />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="pt-5">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold bg-[#171B20] text-white hover:bg-[#168F88] transition-colors shadow-sm"
                >
                  <span>Explore Services</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Col 3: High-Contrast Dark Feature Card (Right) */}
            <div className="lg:col-span-4 rounded-3xl bg-[#0D151E] text-white p-6 sm:p-7 flex flex-col justify-between shadow-xl relative overflow-hidden group">
              
              {/* Background watermark */}
              <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none group-hover:scale-105 transition-transform duration-500">
                <FingerprintGraphic className="w-48 h-48" color="#21B8C1" />
              </div>

              <div className="relative z-10 space-y-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#21B8C1]">
                  <Sparkles className="w-4 h-4" />
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-white leading-tight">
                  Let&apos;s build your <br />
                  <span className="text-[#21B8C1]">Global Career!</span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  Free profile registration, verified client demand letters, and dedicated career guidance across the GCC &amp; Europe.
                </p>
              </div>

              <div className="relative z-10 pt-5">
                <button
                  type="button"
                  onClick={() => onOpenApplyModal && onOpenApplyModal()}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-white text-[#0D151E] hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span>Talk with Recruiter</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>

            </div>

          </div>

          {/* ----------------------------------------------------
              SECTION 2: FEATURED OPPORTUNITIES (5 PHOTOGRAPHIC CARDS)
          ---------------------------------------------------- */}
          <div className="pt-14 pb-14 border-b border-slate-200">
            
            {/* Gallery Section Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#171B20] font-heading">
                Active GCC &amp; European Vacancies
              </h3>

              <Link
                to="/careers"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#171B20] text-white hover:bg-[#168F88] hover:scale-105 active:scale-95 transition-all shadow-sm group"
              >
                <span>Browse All Vacancies</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* 5-Column Photographic Job Cards Grid (responsive: 1 col on mobile, 2 on small tablet, 3 on tablet/laptop, 5 on wide screens) */}
            <div className="gsap-gallery-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {galleryRoles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => onOpenJobDetails && onOpenJobDetails(role.jobRef)}
                  className="gsap-gallery-card group bg-white rounded-2xl border border-slate-200 hover:border-[#168F88]/50 hover:shadow-xl transition-all duration-300 p-3 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Rounded Photo Header */}
                    <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 mb-3">
                      <img
                        src={role.image}
                        alt={role.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-white truncate max-w-[90%]">
                        {role.sector}
                      </span>
                    </div>

                    {/* Job Title & Location */}
                    <h4 className="text-sm font-bold text-[#171B20] font-heading group-hover:text-[#168F88] transition-colors leading-snug line-clamp-2">
                      {role.title}
                    </h4>

                    <div className="flex items-center gap-1 text-[11px] text-[#697477] mt-1">
                      <MapPin className="w-3 h-3 text-[#168F88] shrink-0" />
                      <span className="truncate">{role.destination}</span>
                    </div>
                  </div>

                  {/* Card Bottom Row */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-[#168F88] font-semibold">View Details</span>
                    <div className="w-6 h-6 rounded-full bg-[#F5FAF9] group-hover:bg-[#168F88] group-hover:text-white flex items-center justify-center transition-colors">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* ----------------------------------------------------
              SECTION: MEDICAL & TECHNICAL DIVISIONS (INSPIRED BY ROOHI)
          ---------------------------------------------------- */}
          <div className="pt-14 pb-14 border-b border-slate-200">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#171B20] font-heading">
                Medical &amp; Technical Recruitment Divisions
              </h3>
              <p className="text-xs sm:text-sm text-[#697477] mt-2">
                Dedicated recruitment pathways tailored to the stringent credentialing, licensing exams, and trade testing of each discipline.
              </p>
            </div>

            <div className="gsap-division-grid grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Division 1: Healthcare & Medical */}
              <div className="gsap-division-card rounded-3xl bg-[#F5FAF9] border border-[#D5E5E2] p-6 sm:p-8 flex flex-col justify-between hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#168F88] text-white flex items-center justify-center shadow-md shadow-[#168F88]/20">
                    <Stethoscope className="w-6 h-6" />
                  </div>

                  <div>
                    <h4 className="text-xl font-extrabold text-[#171B20] font-heading">
                      Healthcare &amp; Medical Division
                    </h4>
                    <p className="text-xs sm:text-sm text-[#697477] mt-1.5 leading-relaxed">
                      Placing qualified Indian doctors, registered staff nurses, and allied healthcare professionals in accredited government and private hospitals across the GCC and Europe.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-start gap-2.5 text-xs text-[#171B20]">
                      <CheckCircle2 className="w-4 h-4 text-[#168F88] shrink-0 mt-0.5" />
                      <span><strong>Licensing guidance:</strong> DHA, DOH (HAAD), SCFHS (Mumaris+), OMSB, QCHP, and German B2 adaptation.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-[#171B20]">
                      <CheckCircle2 className="w-4 h-4 text-[#168F88] shrink-0 mt-0.5" />
                      <span><strong>DataFlow (PSV) verification:</strong> Primary source credential verification handled end-to-end.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-[#171B20]">
                      <CheckCircle2 className="w-4 h-4 text-[#168F88] shrink-0 mt-0.5" />
                      <span><strong>Specialist clinical roles:</strong> ICU, CCU, NICU, OT, Emergency, Dialysis, and Pediatric nursing.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#D5E5E2]/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenApplyModal && onOpenApplyModal()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#168F88] text-white hover:bg-[#0e6761] transition-colors shadow-sm whitespace-nowrap shrink-0"
                  >
                    <span>Register for Healthcare Roles</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                  <Link
                    to="/services"
                    className="text-xs font-semibold text-[#168F88] hover:text-[#0e6761] flex items-center justify-center gap-1 py-1 whitespace-nowrap shrink-0"
                  >
                    <span>Learn More</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Division 2: Technical, Engineering & Skilled Trades */}
              <div className="gsap-division-card rounded-3xl bg-[#0D151E] text-white p-6 sm:p-8 flex flex-col justify-between hover:shadow-xl transition-shadow relative overflow-hidden group">
                
                {/* Subtle background decoration */}
                <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none group-hover:scale-105 transition-transform duration-500">
                  <FingerprintGraphic className="w-56 h-56" color="#21B8C1" />
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#21B8C1] border border-white/10 flex items-center justify-center">
                    <Wrench className="w-6 h-6" />
                  </div>

                  <div>
                    <h4 className="text-xl font-extrabold text-white font-heading">
                      Technical, Engineering &amp; Skilled Trades
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed font-light">
                      Sourcing specialized talent for mega infrastructure, refinery EPC turnarounds, commercial MEP networks, and premier 5-star hospitality chains abroad.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-[#21B8C1] shrink-0 mt-0.5" />
                      <span><strong>Certified trade testing:</strong> 6G TIG/ARC welding, electrical, HVAC, and plumbing tests in Kerala.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-[#21B8C1] shrink-0 mt-0.5" />
                      <span><strong>Client delegations:</strong> Direct face-to-face and technical interviews with Gulf project managers.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-[#21B8C1] shrink-0 mt-0.5" />
                      <span><strong>Contract transparency:</strong> Verified offer letters detailing salary, overtime, housing, and flights.</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenApplyModal && onOpenApplyModal()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#21B8C1] text-[#0B0F17] hover:bg-[#1ba3ab] transition-colors shadow-sm whitespace-nowrap shrink-0"
                  >
                    <span>Register for Technical Roles</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                  <Link
                    to="/services"
                    className="text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1 py-1 whitespace-nowrap shrink-0"
                  >
                    <span>Learn More</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>

            </div>
          </div>

          {/* ----------------------------------------------------
              SECTION: PRIMARY DESTINATION COUNTRIES (INSPIRED BY ROOHI)
          ---------------------------------------------------- */}
          <div className="pt-14 pb-14 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#171B20] font-heading">
                  Global Placement Destinations
                </h3>
                <p className="text-xs sm:text-sm text-[#697477] mt-1">
                  Direct hiring channels across prime international markets throughout the Middle East and Europe.
                </p>
              </div>

              <Link
                to="/careers"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#171B20] text-white hover:bg-[#168F88] hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0 group"
              >
                <span>View Jobs by Country</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="gsap-dest-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {destinationMarkets.map((dest, i) => (
                <Link
                  key={i}
                  to={`/careers?country=${encodeURIComponent(dest.shortName)}`}
                  className="gsap-dest-card group p-5 rounded-2xl bg-[#F5FAF9] hover:bg-white border border-[#E5ECEA] hover:border-[#168F88]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-7 rounded overflow-hidden shadow-xs border border-slate-200 shrink-0 bg-white">
                        <img 
                          src={dest.flagUrl} 
                          alt={dest.country} 
                          className="w-full h-full object-cover" 
                          loading="lazy"
                        />
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white group-hover:bg-[#168F88] group-hover:text-white text-[#168F88] flex items-center justify-center transition-colors shadow-2xs">
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-[#171B20] font-heading group-hover:text-[#168F88] transition-colors">
                        {dest.country}
                      </h4>
                      <p className="text-xs text-[#697477] mt-0.5">
                        {dest.keyCities}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {dest.sectors.map((sec, sIdx) => (
                        <span 
                          key={sIdx}
                          className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-[#171B20]"
                        >
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-[#168F88]">
                    <span>View Vacancies</span>
                    <span className="text-[11px] text-[#697477] font-normal group-hover:text-[#168F88]">Explore →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ----------------------------------------------------
              SECTION 3: ETHICAL RECRUITMENT GUARANTEES (INSPIRED BY ROOHI)
          ---------------------------------------------------- */}
          <div className="pt-14 pb-14 border-b border-slate-200">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#171B20] font-heading">
                The Recruiter That Values Your Trust
              </h3>
              <p className="text-xs sm:text-sm text-[#697477] mt-2">
                Honest guidance, transparent fee policies, and legal protection under Indian Emigration Act standards.
              </p>
            </div>

            <div className="gsap-guarantee-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {companyInfo.guarantees.map((item, idx) => (
                <div key={idx} className="gsap-guarantee-card p-6 rounded-2xl bg-[#F5FAF9] border border-[#E5ECEA] flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-white text-[#168F88] flex items-center justify-center font-bold text-sm shadow-xs mb-4">
                      0{idx + 1}
                    </div>
                    <h4 className="text-base font-bold text-[#171B20] font-heading mb-2">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#697477] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ----------------------------------------------------
              SECTION 4: HOW IT WORKS (4-STEP TIMELINE)
          ---------------------------------------------------- */}
          <div className="pt-14 pb-14 border-b border-slate-200">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#171B20] font-heading">
                Our Recruitment Process
              </h3>
              <p className="text-xs sm:text-sm text-[#697477] mt-2">
                Every candidate is kept fully informed and supported throughout every milestone.
              </p>
            </div>

            <div className="gsap-step-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recruitmentSteps.map((step) => (
                <div key={step.step} className="gsap-step-card p-6 rounded-2xl bg-[#F5FAF9] border border-[#E5ECEA] flex flex-col justify-between">
                  <div>
                    <div className="mb-4">
                      <span className="text-3xl font-black font-heading text-[#168F88]">
                        {step.step}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-[#171B20] font-heading mb-2">
                      {step.title}
                    </h4>
                    <p className="text-xs text-[#697477] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ----------------------------------------------------
              SECTION: FREQUENTLY ASKED QUESTIONS (FAQ) (INSPIRED BY ROOHI)
          ---------------------------------------------------- */}
          <div className="pt-14 pb-14 border-b border-slate-200">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#171B20] font-heading">
                Frequently Asked Questions
              </h3>
              <p className="text-xs sm:text-sm text-[#697477] mt-2">
                Clear answers regarding profile registration, licensing, trade tests, and legal deployment.
              </p>
            </div>

            <div className="gsap-faq-container max-w-4xl mx-auto space-y-3">
              {faqList.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`gsap-faq-item rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isOpen 
                        ? 'bg-[#F5FAF9] border-[#168F88]/40 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full text-left px-5 sm:px-6 py-4 flex items-center justify-between gap-4"
                    >
                      <span className="text-sm sm:text-base font-bold text-[#171B20] font-heading">
                        {faq.question}
                      </span>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen ? 'bg-[#168F88] text-white rotate-180' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-[#697477] leading-relaxed border-t border-slate-200/60">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ----------------------------------------------------
              SECTION: COCHIN CAREER DESK
          ---------------------------------------------------- */}
          <div className="pt-14 pb-14 border-b border-slate-200">
            <div className="gsap-desk-banner rounded-2xl sm:rounded-3xl bg-[#0D151E] text-white p-6 sm:p-10 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 relative overflow-hidden">
              
              {/* Subtle background decoration */}
              <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                <FingerprintGraphic className="w-72 h-72" color="#21B8C1" />
              </div>

              {/* Left Column: Heading & Simple Subtitle */}
              <div className="relative z-10 max-w-xl space-y-3 text-center lg:text-left">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-heading leading-tight break-words">
                  Discuss Your Overseas Career <br className="hidden sm:inline" />
                  <span className="text-[#21B8C1]">Directly with Our Experts.</span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  Free consultation on licensing exams, DataFlow verification, trade tests, and verified Gulf vacancies from our Cochin office.
                </p>
              </div>

              {/* Right Column: Clean, Direct Action Buttons */}
              <div className="relative z-10 flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto shrink-0">
                <a
                  href="https://wa.me/919947334733"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-4 sm:px-6 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold bg-[#168F88] text-white hover:bg-[#137d77] hover:scale-105 active:scale-95 transition-all shadow-md text-center whitespace-nowrap shrink-0"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">WhatsApp: +91 99 4733 4733</span>
                </a>

                <a
                  href="tel:+919946555198"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-4 sm:px-6 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-semibold bg-white/10 text-white hover:bg-white/20 border border-white/15 hover:scale-105 active:scale-95 transition-all text-center whitespace-nowrap shrink-0"
                >
                  <Phone className="w-4 h-4 text-[#21B8C1] shrink-0" />
                  <span className="whitespace-nowrap">Call: +91 99 4655 5198</span>
                </a>
              </div>

            </div>
          </div>

          {/* ----------------------------------------------------
              SECTION 5: VERIFIED CREDENTIALS & COCHIN OFFICE
          ---------------------------------------------------- */}
          <div className="pt-10 sm:pt-14">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 bg-gradient-to-r from-[#F5FAF9] to-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#E5ECEA] overflow-hidden w-full max-w-full">
              <div className="w-full min-w-0 space-y-3 text-center lg:text-left flex flex-col items-center lg:items-start">
                <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold whitespace-nowrap">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                  <span>
                    <span className="sm:hidden">MEA Approved · Govt. of India</span>
                    <span className="hidden sm:inline">Ministry of External Affairs Approved · Govt. of India</span>
                  </span>
                </div>
                <h4 className="text-xl sm:text-2xl font-bold text-[#171B20] font-heading break-words">
                  Headquartered in Ravipuram, Cochin, Kerala
                </h4>
                <p className="text-xs sm:text-sm text-[#697477] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Led by Managing Director <strong>Abdul Latheef</strong>. Hosting direct client interview delegations, technical trade tests, and pre-departure briefings.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
                <Button
                  onClick={() => onOpenApplyModal && onOpenApplyModal()}
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto justify-center"
                >
                  Submit Candidate Profile
                </Button>
                <Button
                  to="/contact"
                  variant="outline"
                  size="md"
                  className="w-full sm:w-auto justify-center"
                >
                  Visit Cochin Office
                </Button>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
