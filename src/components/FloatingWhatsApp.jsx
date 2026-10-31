import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { companyInfo } from '../data/companyInfo';

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-end gap-3 select-none">
      {/* Tooltip / Prompt */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white text-[#171B20] text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl border border-[#E5ECEA] animate-bounce duration-1000">
          <span>Need career advice? Chat on WhatsApp</span>
          <button 
            type="button" 
            onClick={() => setShowTooltip(false)}
            className="text-slate-400 hover:text-slate-600 ml-1"
            aria-label="Dismiss tooltip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        href={companyInfo.contact.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40 hover:scale-108 active:scale-95 transition-all duration-300 focus:outline-none"
        aria-label="Chat with Meero HR on WhatsApp"
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-emerald-500 border-2 border-white"></span>
        </span>
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:rotate-12" />
      </a>
    </div>
  );
}

