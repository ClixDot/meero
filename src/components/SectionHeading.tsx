'use client';

import React from 'react';

export default function SectionHeading({
  eyebrow,
  title,
  highlight,
  subtitle,
  align = 'center',
  light = false,
  className = ''
}) {
  const isCenter = align === 'center';

  return (
    <div className={`max-w-3xl ${isCenter ? 'mx-auto text-center' : 'text-left'} ${className}`}>
      {eyebrow && (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-3 ${
          light 
            ? 'bg-teal-900/60 text-[#21B8C1] border border-teal-500/30' 
            : 'bg-[#168F88]/10 text-[#168F88] border border-[#168F88]/20'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#168F88] animate-pulse" />
          {eyebrow}
        </div>
      )}

      {title && (
        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight font-heading leading-tight ${
          light ? 'text-white' : 'text-[#171B20]'
        }`}>
          {title}
          {highlight && (
            <span className="text-[#168F88] ml-2 relative inline-block">
              {highlight}
              <span className="absolute bottom-1 left-0 w-full h-1 bg-[#21B8C1]/30 rounded-full -z-0" />
            </span>
          )}
        </h2>
      )}

      {subtitle && (
        <p className={`mt-3.5 text-sm sm:text-base leading-relaxed ${
          light ? 'text-slate-300' : 'text-[#697477]'
        }`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

