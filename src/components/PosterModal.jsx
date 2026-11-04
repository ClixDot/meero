import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ExternalLink, X } from 'lucide-react';
import Button from './Button';
import useScrollLock from '../hooks/useScrollLock';

// Full-view hiring poster. Can open on top of the job detail or application modal.
export default function PosterModal({ job, onClose, onApply }) {
  const closeButtonRef = useRef(null);
  const [hasError, setHasError] = useState(false);

  useScrollLock(true);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      data-lenis-prevent="true"
      className="fixed inset-0 z-[60] flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="poster-modal-title"
        className="w-full max-w-lg max-h-[94dvh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-[#E5ECEA]">
          <h2 id="poster-modal-title" className="text-sm font-bold text-[#171B20] font-heading truncate">
            {job.title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="shrink-0 p-2 rounded-full text-[#697477] hover:text-[#171B20] hover:bg-slate-100 transition-colors"
            aria-label="Close poster"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div data-lenis-prevent="true" className="flex-1 min-h-0 overflow-y-auto bg-slate-100">
          {hasError ? (
            <p className="p-10 text-center text-sm text-[#697477]">
              This poster could not be loaded. Please try again, or view the vacancy details instead.
            </p>
          ) : (
            <img
              src={job.poster}
              alt={`Hiring poster for ${job.title}`}
              className="w-full h-auto"
              onError={() => setHasError(true)}
            />
          )}
        </div>

        <div className="shrink-0 flex items-center justify-between gap-3 p-3 sm:p-4 border-t border-[#E5ECEA]">
          {!hasError && (
            <a
              href={job.poster}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168F88] hover:text-[#0f6c67]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open full size
            </a>
          )}
          <Button
            onClick={() => onApply(job)}
            variant="primary"
            size="sm"
            icon={ArrowRight}
            className="ml-auto text-xs"
          >
            Apply Now
          </Button>
        </div>
      </div>
    </div>
  );
}
