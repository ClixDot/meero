'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Factory,
  Fuel,
  HardHat,
  PackageOpen,
  Stethoscope,
  Store,
  Truck,
  UtensilsCrossed
} from 'lucide-react';

import Button from '../components/Button';
import { servicesList } from '../data/services';

const iconMap = {
  Truck,
  PackageOpen,
  Store,
  UtensilsCrossed,
  Building2,
  HardHat,
  Fuel,
  Stethoscope,
  Factory,
};

export default function Services({ onOpenApplyModal }) {
  return (
    <div className="min-h-screen bg-[#0B0F17]">
      
      {/* ========================================================
          DARK HERO BANNER
      ======================================================== */}
      <section className="relative pt-28 pb-32 md:pt-36 md:pb-40 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=80"
            alt="International Business Skyscraper"
            className="w-full h-full object-cover filter brightness-[0.35] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F17]/95 via-[#0B0F17]/75 to-[#0B0F17]/50" />
        </div>

        <div className="max-w-[1560px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="max-w-3xl space-y-4">
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-heading leading-[1.1] sm:leading-tight break-words"
            >
              Comprehensive <br />
              <span className="text-[#21B8C1]">Recruitment Solutions.</span>
            </motion.h1>

          </div>
        </div>
      </section>

      {/* ========================================================
          OVERLAPPING WHITE SHEET
      ======================================================== */}
      <section className="relative z-20 px-2.5 sm:px-6 lg:px-10 -mt-20 md:-mt-28 pb-20">
        <div className="max-w-[1560px] 2xl:max-w-[1680px] w-full mx-auto rounded-[24px] sm:rounded-[36px] md:rounded-[48px] lg:rounded-[52px] bg-white text-[#171B20] p-4 sm:p-8 md:p-12 lg:p-16 shadow-2xl shadow-black/30 border border-slate-100 space-y-12 sm:space-y-16">
          
          {/* Detailed Service Cards */}
          <div className="space-y-8 sm:space-y-12">
            {servicesList.map((service, index) => {
              const IconComp = iconMap[service.icon];
              const isEven = index % 2 === 0;

              return (
                <div 
                  key={service.id}
                  id={service.id}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-[#F5FAF9] border border-[#E5ECEA] hover:border-[#168F88]/40 transition-all"
                >
                  <div className={`lg:col-span-5 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 group shadow-md">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4 p-3 rounded-xl bg-white/95 text-[#168F88] shadow-md">
                        <IconComp className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className={`lg:col-span-7 space-y-4 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#171B20] font-heading leading-tight">
                      {service.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#697477] leading-relaxed">
                      {service.description}
                    </p>

                    <div className="pt-1 space-y-1.5">
                      {service.highlights.map((hl, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-[#171B20]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#168F88] shrink-0" />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <Button
                        to="/careers"
                        variant="primary"
                        size="sm"
                        icon={ArrowRight}
                        className="w-full sm:w-auto justify-center"
                      >
                        View Openings
                      </Button>
                      <Button
                        to="/contact"
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto justify-center"
                      >
                        Enquire for this Sector
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Enquiry Switcher */}
          <div className="pt-10 border-t border-slate-200">
            <div className="rounded-2xl sm:rounded-3xl bg-[#0D151E] text-white p-6 sm:p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 shadow-xl">
              <div className="space-y-3 text-center md:text-left">
                <span className="text-xs font-bold uppercase tracking-widest text-[#21B8C1]">
                  Direct Manpower &amp; Career Consultation
                </span>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-heading">
                  Ready to Discuss Your Requirements?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  Whether you are an aspiring candidate or a corporate recruiter looking to hire from India, our team is ready to support your process.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
                <Button
                  onClick={onOpenApplyModal}
                  variant="white"
                  size="md"
                  className="w-full sm:w-auto justify-center font-bold"
                >
                  Submit Resume
                </Button>
                <Button
                  to="/contact"
                  variant="outline"
                  size="md"
                  className="w-full sm:w-auto justify-center border-white text-white hover:bg-white/10"
                >
                  Contact Desk
                </Button>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
