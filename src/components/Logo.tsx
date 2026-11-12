'use client';

import React from 'react';
import { Link } from '../lib/router';
const meeroLogo = '/images/meero.png';

/**
 * Meero Official Brand Logo Component
 * Uses the exact brand logo supplied by the user (src/assets/meero.png).
 */
export default function Logo({ 
  variant: _variant = 'dark', 
  size = 'md',
  showLink = true,
  className = '',
  imgClassName = ''
}) {
  
  // Height classes by size (responsively scaled for all screen sizes)
  const sizeMap = {
    sm: 'h-8 sm:h-9 md:h-10',
    md: 'h-11 sm:h-13 md:h-16 lg:h-18',
    lg: 'h-13 sm:h-16 md:h-20 lg:h-24',
    xl: 'h-16 sm:h-20 md:h-24 lg:h-28'
  };

  const heightClass = sizeMap[size] || size;

  // Use the official meero.png logo
  const logoSrc = meeroLogo;

  const Content = (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={logoSrc}
        alt="MEERO Overseas HR Consultancy"
        className={`${heightClass} ${imgClassName} w-auto object-contain transition-all duration-300 ease-in-out group-hover:scale-[1.02]`}
        loading="eager"
      />
    </div>
  );

  if (showLink) {
    return (
      <Link 
        to="/" 
        className="group inline-flex items-center focus:outline-none" 
        aria-label="MEERO Overseas HR Consultancy - Home"
      >
        {Content}
      </Link>
    );
  }

  return Content;
}
