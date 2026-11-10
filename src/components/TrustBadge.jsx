import React from 'react';
import { companyInfo } from '../data/companyInfo';

const heights = {
  md: 'h-20 sm:h-24',
  lg: 'h-24 sm:h-32 md:h-40'
};

// Government approval logo (Ministry of External Affairs, Government of India).
// White artwork on a transparent background, for the site's dark sections.
export default function TrustBadge({ size = 'md', className = '' }) {
  const { approvalLogo, approvalLogoAlt } = companyInfo.credentials;

  return (
    <img
      src={approvalLogo}
      alt={approvalLogoAlt}
      className={`w-auto ${heights[size]} ${className}`}
    />
  );
}
