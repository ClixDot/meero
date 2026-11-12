'use client';

import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

import GalleryLightbox from '../components/GalleryLightbox';
import { galleryItems } from '../data/galleryData';

export default function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState<any>(null);
  const visibleItems = galleryItems;

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  return (
    <div className="min-h-screen bg-[#0B0F17]">

      {/* ========================================================
          DARK HERO BANNER
      ======================================================== */}
      <section className="relative pt-28 pb-32 md:pt-36 md:pb-40 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=2000&q=80"
            alt=""
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
              Our Recruitment Drives <span className="text-[#21B8C1]">&amp; Events</span>
            </motion.h1>
          </div>
        </div>
      </section>

      {/* ========================================================
          OVERLAPPING WHITE SHEET
      ======================================================== */}
      <section className="relative z-20 px-2.5 sm:px-6 lg:px-10 -mt-20 md:-mt-28 pb-20">
        <div className="max-w-[1560px] 2xl:max-w-[1680px] w-full mx-auto rounded-[24px] sm:rounded-[36px] md:rounded-[48px] lg:rounded-[52px] bg-white text-[#171B20] p-4 sm:p-8 md:p-12 lg:p-16 shadow-2xl shadow-black/30 border border-slate-100 space-y-8">

          {/* Photo Grid */}
          {visibleItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {visibleItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  aria-label={`View photo: ${item.title}`}
                  className="group text-left bg-white rounded-2xl border border-[#E5ECEA] hover:border-[#168F88]/40 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#168F88]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={item.thumbnail || item.image}
                      alt={item.alt}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 max-w-[90%] px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[11px] font-semibold text-white">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </span>
                  </div>
                  <div className="p-3.5 sm:p-4">
                    <h3 className="text-sm font-bold text-[#171B20] font-heading group-hover:text-[#168F88] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#697477] mt-1">
                      {item.category}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl bg-[#F5FAF9] border border-[#E5ECEA] max-w-2xl mx-auto">
              <p className="text-sm text-[#697477]">No photos yet.</p>
            </div>
          )}

        </div>
      </section>

      {lightboxIndex !== null && (
        <GalleryLightbox
          items={visibleItems}
          activeIndex={lightboxIndex}
          onChangeIndex={setLightboxIndex}
          onClose={closeLightbox}
        />
      )}

    </div>
  );
}
