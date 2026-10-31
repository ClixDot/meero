import React from 'react';
import { ShieldCheck, Award } from 'lucide-react';

/**
 * Trust & Government Approval Badge
 * Reflects official Ministry of External Affairs, Government of India approval
 */
export default function TrustBadge({ variant = 'banner', className = '' }) {
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#168F88]/10 border border-[#168F88]/20 text-[#0f6c67] text-xs font-semibold ${className}`}>
        <ShieldCheck className="w-4 h-4 text-[#168F88] flex-shrink-0" />
        <span>Approved by Ministry of External Affairs, Govt. of India</span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-6 rounded-2xl bg-[#0B1528] text-white border border-slate-800 shadow-xl relative overflow-hidden ${className}`}>
        {/* Background glow & emblem watermark */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#168F88]/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          {/* Ashoka Lion Emblem Graphic */}
          <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center p-2 border border-white/20 flex-shrink-0">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white">
              {/* Simplified Ashoka Lion / Pillar Vector Motif */}
              <circle cx="50" cy="50" r="44" stroke="#21B8C1" strokeWidth="3" strokeDasharray="6 3"/>
              <path d="M40 78h20M43 78v-8h14v8M46 70v-16h8v16" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="50" cy="40" r="14" fill="#168F88" />
              <path d="M50 30v20M40 40h20M43 33l14 14M57 33L43 47" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-[#21B8C1] mb-1">
              <Award className="w-3.5 h-3.5" />
              Official Government Authorization
            </div>
            <h4 className="text-base font-bold text-white tracking-tight">
              Approved by Ministry of External Affairs
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Government of India · Emigration Division Certified
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Ensuring 100% legal, transparent, and verified recruitment overseas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default: Prominent Banner
  return (
    <div className={`w-full bg-gradient-to-r from-[#0F1E2E] via-[#091522] to-[#0A2624] text-white py-4 px-6 rounded-2xl border border-teal-900/40 shadow-lg relative overflow-hidden ${className}`}>
      {/* Subtle fingerprint overlay */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-10 pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-72 h-72">
          <circle cx="100" cy="100" r="90" stroke="#21B8C1" strokeWidth="4" strokeDasharray="20 10 30 10" fill="none"/>
          <circle cx="100" cy="100" r="70" stroke="#168F88" strokeWidth="4" strokeDasharray="15 8 25 8" fill="none"/>
          <circle cx="100" cy="100" r="50" stroke="#21B8C1" strokeWidth="4" strokeDasharray="10 6 20 6" fill="none"/>
        </svg>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4 text-center md:text-left flex-col sm:flex-row">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center p-2 border border-teal-500/30 flex-shrink-0">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <circle cx="50" cy="50" r="45" stroke="#21B8C1" strokeWidth="3" strokeDasharray="6 3"/>
              <path d="M35 80h30M40 80v-10h20v10M45 70v-18h10v18" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="50" cy="38" r="15" fill="#168F88" stroke="white" strokeWidth="2" />
              <path d="M50 26v24M38 38h24M42 30l16 16M58 30L42 46" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-[0.2em] text-[#21B8C1] uppercase">
              GOVERNMENT OF INDIA RECOGNITION
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
              Approved by Ministry of External Affairs (MEA), Government of India
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Operating under statutory compliance for safe, ethical overseas employment.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden lg:block">
            <div className="text-xs font-semibold text-teal-200">Emigration Compliance</div>
            <div className="text-[11px] text-slate-400">100% Verified Demands Only</div>
          </div>
          <div className="h-8 w-px bg-slate-700 hidden lg:block" />
          <div className="px-3.5 py-1.5 rounded-lg bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#21B8C1]" />
            Official Authorization
          </div>
        </div>
      </div>
    </div>
  );
}

