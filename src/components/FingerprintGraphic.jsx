import React from 'react';

/**
 * High-precision Fingerprint SVG graphic inspired by the Meero brand identity.
 * Rendered with concentric, organic, multi-path ridges in signature teal.
 */
export default function FingerprintGraphic({ 
  className = "w-32 h-32", 
  color = "#168F88", 
  secondaryColor = "#21B8C1",
  opacity = 1,
  showDegree = true 
}) {
  return (
    <div className={`relative inline-block select-none ${className}`} style={{ opacity }}>
      <svg 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="fpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={secondaryColor} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>

        {/* Outer Ring Ridge 1 */}
        <path 
          d="M 100 15 C 145 15, 185 55, 185 100 C 185 130, 168 158, 145 174" 
          stroke="url(#fpGradient)" 
          strokeWidth="6" 
          strokeLinecap="round" 
        />
        <path 
          d="M 125 182 C 117 184, 108 185, 100 185 C 53 185, 15 147, 15 100 C 15 65, 36 35, 68 22" 
          stroke={color} 
          strokeWidth="6" 
          strokeLinecap="round" 
        />

        {/* Ridge 2 */}
        <path 
          d="M 100 30 C 137 30, 170 62, 170 100 C 170 125, 155 148, 134 162" 
          stroke={secondaryColor} 
          strokeWidth="5.5" 
          strokeLinecap="round" 
        />
        <path 
          d="M 115 170 C 110 171, 105 172, 100 172 C 60 172, 28 140, 28 100 C 28 72, 45 47, 72 36" 
          stroke="url(#fpGradient)" 
          strokeWidth="5.5" 
          strokeLinecap="round" 
        />

        {/* Ridge 3 */}
        <path 
          d="M 100 45 C 129 45, 154 70, 154 100 C 154 120, 142 138, 125 150" 
          stroke={color} 
          strokeWidth="5.5" 
          strokeLinecap="round" 
        />
        <path 
          d="M 105 158 C 103 159, 101 159, 100 159 C 68 159, 41 132, 41 100 C 41 78, 55 58, 76 50" 
          stroke={secondaryColor} 
          strokeWidth="5" 
          strokeLinecap="round" 
        />

        {/* Ridge 4 */}
        <path 
          d="M 100 60 C 122 60, 139 78, 139 100 C 139 116, 128 130, 114 138" 
          stroke="url(#fpGradient)" 
          strokeWidth="5" 
          strokeLinecap="round" 
        />
        <path 
          d="M 96 145 C 75 145, 55 125, 55 100 C 55 84, 66 70, 81 64" 
          stroke={color} 
          strokeWidth="5" 
          strokeLinecap="round" 
        />

        {/* Ridge 5 - Core Inner Loop */}
        <path 
          d="M 100 75 C 114 75, 124 86, 124 100 C 124 112, 115 122, 103 125" 
          stroke={secondaryColor} 
          strokeWidth="4.5" 
          strokeLinecap="round" 
        />
        <path 
          d="M 88 131 C 78 126, 70 114, 70 100 C 70 89, 78 79, 89 76" 
          stroke="url(#fpGradient)" 
          strokeWidth="4.5" 
          strokeLinecap="round" 
        />

        {/* Central Core Whirl */}
        <path 
          d="M 100 90 C 106 90, 110 94, 110 100 C 110 107, 102 112, 95 110 C 90 108, 86 103, 86 98" 
          stroke={color} 
          strokeWidth="4" 
          strokeLinecap="round" 
        />
      </svg>

      {/* Floating Degree Orb */}
      {showDegree && (
        <div 
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-[3px] border-[#21B8C1] bg-white shadow-sm"
          style={{ borderColor: secondaryColor }}
        />
      )}
    </div>
  );
}

