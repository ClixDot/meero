'use client';

import React from 'react';
import { companyInfo } from '../data/companyInfo';

const heights = {
  sm: 'h-8 sm:h-9 md:h-10',
  md: 'h-10 sm:h-12 md:h-14',
  lg: 'h-18 sm:h-22 md:h-28 lg:h-32'
};

const boxedHeights = {
  sm: 'h-7 sm:h-8',
  md: 'h-8 sm:h-9 md:h-10',
  lg: 'h-9 sm:h-10 md:h-11 lg:h-12 scale-[1.7] sm:scale-[1.85]'
};

/**
 * Government approval logo & trust badge (Ministry of External Affairs, Government of India).
 * Supports standard logo display and the signature "APPROVED BY" premium brand card container (matching user reference).
 */
export default function TrustBadge({ 
  size = 'md', 
  boxed = false,
  badgeText = 'APPROVED BY',
  showTagline = false,
  taglineText,
  className = '' 
}: any) {
  const { approvalLogo, approvalLogoAlt, governmentApproval } = companyInfo.credentials;
  const heightClass = (boxed ? boxedHeights[size] : heights[size]) || heights[size] || size;
  const label = taglineText || governmentApproval || 'Govt. of India Approved Recruiting Agency';

  const logoImg = (
    <img
      src={approvalLogo}
      alt={approvalLogoAlt}
      className={`w-auto ${heightClass} object-contain`}
    />
  );

  // Compact Premium Boxed Card (Reference: Image 2 style with brand border)
  if (boxed) {
    return (
      <div className={`relative inline-flex flex-col items-center pt-2.5 ${className}`}>
        {/* Top Floating Pill Badge sitting on the border */}
        {badgeText && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 px-3 py-0.5 rounded-full bg-white text-[#0B0F17] text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-md shadow-black/20 whitespace-nowrap">
            {badgeText}
          </div>
        )}

        {/* Compact Brand Card Container with Transparent Background */}
        <div className="relative rounded-xl sm:rounded-2xl border-2 border-[#21B8C1]/80 hover:border-[#21B8C1] bg-transparent px-3.5 sm:px-5 pt-3 sm:pt-3.5 pb-2 sm:pb-2.5 transition-all flex flex-col items-center text-center gap-1.5 sm:gap-2">
          {logoImg}

          {showTagline && (
            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 rounded-full bg-transparent text-white/95 border border-[#21B8C1]/40 text-[10px] sm:text-[11px] font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#21B8C1] animate-pulse shrink-0" />
              <span>{label}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!showTagline) {
    return (
      <div className={`inline-block ${className}`}>
        {logoImg}
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-start gap-2.5 sm:gap-3 ${className}`}>
      {logoImg}
      <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#21B8C1]/10 text-white/95 border border-[#21B8C1]/30 backdrop-blur-sm text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-[#21B8C1] animate-pulse shrink-0" />
        <span>{label}</span>
      </div>
    </div>
  );
}
