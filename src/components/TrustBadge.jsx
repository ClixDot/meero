import React from 'react';
import { companyInfo } from '../data/companyInfo';

const tones = {
  dark: 'bg-[#168F88]/30 border-[#21B8C1]/40 text-white backdrop-blur-md',
  light: 'bg-emerald-50 border-emerald-200 text-emerald-800'
};

const sizes = {
  md: {
    pill: 'gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 text-xs sm:text-sm',
    emblem: 'h-6 sm:h-7'
  },
  lg: {
    pill: 'gap-2 sm:gap-2.5 px-3.5 sm:px-5 py-1.5 text-[13px] sm:text-base',
    emblem: 'h-8 sm:h-10'
  }
};

// Government approval emblem and tagline.
export default function TrustBadge({ tone = 'dark', size = 'md', className = '' }) {
  const { governmentApproval, approvalLogo, approvalLogoAlt } = companyInfo.credentials;

  return (
    <div className={`inline-flex items-center rounded-full border font-semibold ${sizes[size].pill} ${tones[tone]} ${className}`}>
      <img
        src={approvalLogo}
        alt={approvalLogoAlt}
        className={`w-auto shrink-0 ${sizes[size].emblem}`}
      />
      <span>{governmentApproval}</span>
    </div>
  );
}
