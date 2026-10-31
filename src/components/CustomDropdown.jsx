import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomDropdown({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  size = 'md'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options to { value, label } format
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return { value: opt.value, label: opt.label ?? opt.value };
    }
    return { value: opt, label: opt };
  });

  // Find currently selected option object
  const currentOption = normalizedOptions.find((opt) => opt.value === value);
  const displayLabel = currentOption ? currentOption.label : placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-3.5 py-2.5 text-xs sm:text-sm',
    lg: 'px-4 py-3 text-sm sm:text-base'
  }[size] || 'px-3.5 py-2.5 text-xs sm:text-sm';

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isOpen ? 'z-40' : 'z-10'} ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full rounded-xl bg-white border font-semibold text-left transition-all duration-200 flex items-center justify-between gap-2.5 select-none ${sizeClasses} ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
            : isOpen
            ? 'border-[#168F88] ring-2 ring-[#168F88]/15 shadow-sm'
            : 'border-[#E5ECEA] hover:border-slate-300 hover:bg-slate-50/50'
        }`}
      >
        <span className={`truncate ${currentOption ? 'text-[#171B20]' : 'text-slate-400'}`}>
          {displayLabel}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#168F88]' : 'text-[#697477]'
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#E5ECEA] rounded-xl shadow-xl shadow-slate-200/80 p-1 max-h-60 overflow-y-auto focus:outline-none"
            style={{ scrollbarWidth: 'thin' }}
          >
            {normalizedOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400 text-center">
                No options available
              </div>
            ) : (
              normalizedOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between gap-2 transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-[#168F88]/10 text-[#168F88] font-bold'
                        : 'text-[#171B20] hover:bg-[#F5FAF9] hover:text-[#168F88]'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#168F88] shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

