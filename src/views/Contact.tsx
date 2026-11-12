'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  ArrowRight,
  ArrowUpRight 
} from 'lucide-react';

import ContactForm from '../components/ContactForm';
import InstagramIcon from '../components/InstagramIcon';
import { useSite } from '../lib/cms/SiteContent';

export default function Contact() {
  const page = useSite('contactPage');
  const companyInfo = useSite('company');
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
          />
          <div className="absolute inset-0 bg-gradient-to-r from-(--brand-dark)/95 via-(--brand-dark)/75 to-(--brand-dark)/50" />
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
        <div className="max-w-[1560px] 2xl:max-w-[1680px] w-full mx-auto rounded-[24px] sm:rounded-[36px] md:rounded-[48px] lg:rounded-[52px] bg-white text-(--brand-text) p-4 sm:p-8 md:p-12 lg:p-16 shadow-2xl shadow-black/30 border border-slate-100 space-y-8 sm:space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            
            {/* Left Column: Unified Office Details */}
            <div className="lg:col-span-5 space-y-6">
              
              <div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-(--brand-text) font-heading">
                  {page.introHeading}
                </h3>
                <p className="text-xs sm:text-sm text-[#697477] mt-1.5 leading-relaxed">
                  {page.introText}
                </p>
              </div>

              {/* Single Unified Contact Card */}
              <div className="p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-(--brand-bg) border border-[#E5ECEA] space-y-5">
                
                {/* Office Location */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white text-(--brand-teal) flex items-center justify-center shrink-0 shadow-2xs">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-(--brand-text) font-heading">
                      Our Location
                    </h4>
                    <p className="text-xs text-[#697477] mt-1 leading-relaxed">
                      {companyInfo.address.floor}, {companyInfo.address.building}<br />
                      {companyInfo.address.landmark}<br />
                      Ravipuram, {companyInfo.address.city} – {companyInfo.address.postalCode}<br />
                      {companyInfo.address.state}, {companyInfo.address.country}
                    </p>
                  </div>
                </div>

                {/* Direct Phone Numbers */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white text-(--brand-teal) flex items-center justify-center shrink-0 shadow-2xs">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <h4 className="text-sm font-bold text-(--brand-text) font-heading">
                      Telephone &amp; Mobile
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 pt-0.5 font-semibold text-(--brand-text)">
                      <a href={`tel:+${companyInfo.contact.cleanOfficeMobile}`} className="hover:text-(--brand-teal)">
                        {companyInfo.contact.officeMobile}
                      </a>
                      <span className="text-slate-300">·</span>
                      <a href={`tel:${companyInfo.contact.cleanTelephone}`} className="hover:text-(--brand-teal)">
                        {companyInfo.contact.telephone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Consultation Hours */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white text-(--brand-teal) flex items-center justify-center shrink-0 shadow-2xs">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-[#697477]">
                    <h4 className="text-sm font-bold text-(--brand-text) font-heading">
                      Consultation Hours
                    </h4>
                    <p className="mt-1">{page.hoursText}</p>
                  </div>
                </div>

                {/* WhatsApp, Instagram & Email Actions */}
                <div className="pt-3 border-t border-[#E5ECEA] flex flex-col gap-2.5">
                  <a
                    href={companyInfo.contact.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-(--brand-teal) hover:bg-[#137d77] text-white transition-all shadow-sm group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MessageCircle className="w-5 h-5 shrink-0 text-white" />
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-xs font-bold text-white leading-tight">
                          WhatsApp Consultation
                        </span>
                        <span className="text-[11px] text-emerald-100 font-medium leading-tight mt-0.5">
                          {companyInfo.contact.officeMobile}
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white whitespace-nowrap shrink-0 group-hover:translate-x-0.5 transition-transform">
                      <span>Chat</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </a>

                  {companyInfo.contact.instagramUrl && (
                    <a
                      href={companyInfo.contact.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-[#E5ECEA] hover:border-(--brand-teal)/50 text-(--brand-text) transition-all"
                    >
                      <InstagramIcon className="w-5 h-5 shrink-0 text-(--brand-teal)" />
                      <span className="text-xs font-bold">Follow us on Instagram</span>
                      <ArrowUpRight className="w-3.5 h-3.5 ml-auto shrink-0 text-(--brand-teal)" />
                    </a>
                  )}

                  <a
                    href={`mailto:${companyInfo.contact.email}`}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-[#E5ECEA] hover:border-(--brand-teal)/50 text-(--brand-text) transition-all min-w-0"
                  >
                    <Mail className="w-5 h-5 shrink-0 text-(--brand-teal)" />
                    <span className="text-xs font-bold truncate">{companyInfo.contact.email}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 ml-auto shrink-0 text-(--brand-teal)" />
                  </a>
                </div>

              </div>

            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <div className="mb-4">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-(--brand-text) font-heading">
                  {page.formHeading}
                </h3>
              </div>

              <ContactForm />
            </div>

          </div>

          {/* Map Embed Section */}
          {page.map.visible && (
          <div className="pt-8 border-t border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-base sm:text-lg font-bold font-heading text-(--brand-text)">
                  {page.map.heading}
                </h4>
                <p className="text-xs text-[#697477]">
                  {page.map.text}
                </p>
              </div>

              <a
                href={page.map.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-(--brand-teal) hover:underline flex items-center gap-1"
              >
                {page.map.linkLabel}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-[#E5ECEA] h-[260px] sm:h-[350px] bg-slate-200">
              <iframe
                title="Meero Office Location"
                src={companyInfo.address.googleMapsEmbedUrl}
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
          )}

        </div>
      </section>

    </div>
  );
}
