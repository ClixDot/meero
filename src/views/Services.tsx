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
import { useSite, useVisible } from '../lib/cms/SiteContent';

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
  const page = useSite('servicesPage');
  const servicesList = useVisible('services');
  return (
    <div className="min-h-screen bg-(--brand-dark)">
      
      {/* ========================================================
          DARK HERO BANNER
      ======================================================== */}
      <section className="relative pt-28 pb-32 md:pt-36 md:pb-40 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={page.hero.image}
            alt={page.hero.imageAlt}
            className="w-full h-full object-cover filter brightness-[0.35] contrast-[1.1]"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/75 to-black/65" />
        </div>

        <div className="max-w-[1560px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="max-w-3xl space-y-4">
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-heading leading-[1.1] sm:leading-tight break-words"
            >
              {page.hero.title} <br />
              <span className="text-(--brand-turq)">{page.hero.highlight}</span>
            </motion.h1>

          </div>
        </div>
      </section>

      {/* ========================================================
          OVERLAPPING WHITE SHEET
      ======================================================== */}
      <section className="relative z-20 px-2.5 sm:px-6 lg:px-10 -mt-20 md:-mt-28 pb-20">
        <div className="max-w-[1560px] 2xl:max-w-[1680px] w-full mx-auto rounded-[24px] sm:rounded-[36px] md:rounded-[48px] lg:rounded-[52px] bg-white text-(--brand-text) p-4 sm:p-8 md:p-12 lg:p-16 shadow-2xl shadow-black/30 border border-slate-100 space-y-12 sm:space-y-16">
          
          {/* Detailed Service Cards */}
          <div className="space-y-8 sm:space-y-12">
            {servicesList.map((service, index) => {
              const IconComp = iconMap[service.icon] || Building2;
              const isEven = index % 2 === 0;

              return (
                <div 
                  key={service.id}
                  id={service.id}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-(--brand-bg) border border-[#E5ECEA] hover:border-(--brand-teal)/40 transition-all"
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
                      <div className="absolute top-4 left-4 p-3 rounded-xl bg-white/95 text-(--brand-teal) shadow-md">
                        <IconComp className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className={`lg:col-span-7 space-y-4 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-(--brand-text) font-heading leading-tight">
                      {service.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#697477] leading-relaxed">
                      {service.description}
                    </p>

                    <div className="pt-1 space-y-1.5">
                      {service.highlights.map((hl, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-(--brand-text)">
                          <CheckCircle2 className="w-3.5 h-3.5 text-(--brand-teal) shrink-0" />
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
                        {page.cardPrimaryLabel}
                      </Button>
                      <Button
                        to="/contact"
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto justify-center"
                      >
                        {page.cardSecondaryLabel}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Enquiry Switcher */}
          {page.cta.visible && (
          <div className="pt-10 border-t border-slate-200">
            <div className="rounded-2xl sm:rounded-3xl bg-[#030027] text-white p-6 sm:p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 shadow-xl">
              <div className="space-y-3 text-center md:text-left">
                <span className="text-xs font-bold uppercase tracking-widest text-(--brand-turq)">
                  {page.cta.eyebrow}
                </span>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-heading">
                  {page.cta.heading}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  {page.cta.text}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
                <Button
                  onClick={onOpenApplyModal}
                  variant="white"
                  size="md"
                  className="w-full sm:w-auto justify-center font-bold"
                >
                  {page.cta.primaryLabel}
                </Button>
                <Button
                  to="/contact"
                  variant="outline"
                  size="md"
                  className="w-full sm:w-auto justify-center border-white text-white hover:bg-white/10"
                >
                  {page.cta.secondaryLabel}
                </Button>
              </div>
            </div>
          </div>
          )}

        </div>
      </section>

    </div>
  );
}
