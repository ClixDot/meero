'use client';

import React from 'react';
import { motion } from 'framer-motion';

import Button from '../components/Button';
import { aboutContent } from '../data/aboutContent';

export default function About({ onOpenApplyModal }) {
  const { hero, story, pillars, values, closing } = aboutContent;

  return (
    <div className="min-h-screen bg-[#0B0F17]">

      {/* ========================================================
          DARK HERO BANNER
      ======================================================== */}
      <section className="relative pt-28 pb-32 md:pt-36 md:pb-40 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={hero.image}
            alt={hero.imageAlt}
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
              {hero.title} <br />
              <span className="text-[#21B8C1]">{hero.highlight}</span>
            </motion.h1>
          </div>
        </div>
      </section>

      {/* ========================================================
          OVERLAPPING WHITE SHEET
      ======================================================== */}
      <section className="relative z-20 px-2.5 sm:px-6 lg:px-10 -mt-20 md:-mt-28 pb-20">
        <div className="max-w-[1560px] 2xl:max-w-[1680px] w-full mx-auto rounded-[24px] sm:rounded-[36px] md:rounded-[48px] lg:rounded-[52px] bg-white text-[#171B20] p-4 sm:p-8 md:p-12 lg:p-16 shadow-2xl shadow-black/30 border border-slate-100 space-y-12 sm:space-y-16">

          {/* Story */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading text-[#171B20] leading-tight">
                {story.heading}
              </h2>
              {story.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm sm:text-base text-[#697477] leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden shadow-xl aspect-[4/3] bg-slate-100">
                <img
                  src={story.image}
                  alt={story.imageAlt}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Mission & Vision */}
          {pillars.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-8 border-t border-slate-200">
              {pillars.map((pillar) => (
                <div key={pillar.heading} className="p-6 sm:p-8 rounded-3xl bg-[#F5FAF9] border border-[#E5ECEA] space-y-3">
                  <h3 className="text-xl font-bold font-heading text-[#171B20]">{pillar.heading}</h3>
                  <p className="text-sm text-[#697477] leading-relaxed">{pillar.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Values */}
          {values.items.length > 0 && (
            <div className="pt-8 border-t border-slate-200">
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#171B20] text-center mb-10">
                {values.heading}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {values.items.map((value) => (
                  <div key={value.title} className="p-4 sm:p-5 rounded-2xl bg-[#F5FAF9] border border-[#E5ECEA]">
                    <h4 className="text-base font-bold text-[#171B20] font-heading mb-1.5">{value.title}</h4>
                    <p className="text-xs text-[#697477] leading-relaxed">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Closing call to action */}
          <div className="pt-8 border-t border-slate-200">
            <div className="rounded-2xl sm:rounded-3xl bg-[#0D151E] text-white p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-extrabold font-heading">{closing.heading}</h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">{closing.text}</p>
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
