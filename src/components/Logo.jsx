import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Meero Official Brand Logo Component
 * Uses the exact brand logo supplied by the user.
 */
export default function Logo({ 
  variant = 'dark', 
  size = 'md',
  showLink = true,
  className = ''
}) {
  const isLight = variant === 'light';
  
  // Height classes by size (responsively scaled for all screen sizes)
  const heightClass = {
    sm: 'h-7 sm:h-8',
    md: 'h-8 sm:h-10 md:h-12',
    lg: 'h-11 sm:h-14 md:h-16'
  }[size] || 'h-8 sm:h-10 md:h-12';

  // Use the transparent light-text version on dark backgrounds,
  // and the transparent dark-text version on light backgrounds.
  const logoSrc = isLight 
    ? '/images/meero-logo-light.png' 
    : '/images/meero-logo-dark.png';

  const Content = (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={logoSrc}
        alt="MEERO Overseas HR Consultancy"
        className={`${heightClass} w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]`}
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
