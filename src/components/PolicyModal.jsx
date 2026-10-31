import React, { useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import Button from './Button';

export default function PolicyModal({ isOpen, onClose, type = 'privacy' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.__lenis?.stop();
    } else {
      document.body.style.overflow = 'unset';
      window.__lenis?.start();
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.__lenis?.start();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isPrivacy = type === 'privacy';

  return (
    <div 
      data-lenis-prevent="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div 
        data-lenis-prevent="true"
        className="relative w-full max-w-2xl max-h-[92dvh] flex flex-col bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E5ECEA] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 p-5 sm:p-7 bg-gradient-to-r from-[#F5FAF9] to-white border-b border-[#E5ECEA] relative pr-12">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-[#697477] hover:text-[#171B20] hover:bg-white shadow-xs transition-colors focus:outline-none"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-[#168F88]/10 text-[#168F88] mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Statutory Legal Information
          </div>

          <h2 className="text-lg sm:text-2xl font-extrabold text-[#171B20] font-heading leading-tight">
            {isPrivacy ? 'Privacy Policy' : 'Terms & Conditions of Service'}
          </h2>
          <p className="text-xs text-[#697477] mt-1">
            MEERO Overseas HR Consultancy · Cochin, Kerala, India
          </p>
        </div>

        <div data-lenis-prevent="true" className="p-4 sm:p-7 overflow-y-auto flex-1 text-xs sm:text-sm text-[#171B20] space-y-4 leading-relaxed">
          {isPrivacy ? (
            <>
              <p>
                MEERO Overseas HR Consultancy (&quot;Meero&quot;, &quot;we&quot;, &quot;us&quot;) is committed to protecting candidate and client privacy. This policy explains how we collect, store, and utilize personal data provided through our website and Cochin office.
              </p>
              <h4 className="font-bold text-[#171B20] pt-2">1. Information We Collect</h4>
              <p>
                We collect information provided directly by candidates, including full names, contact numbers, email addresses, educational credentials, work histories, passport information, and uploaded curriculum vitae (CVs).
              </p>
              <h4 className="font-bold text-[#171B20] pt-2">2. Purpose of Processing</h4>
              <p>
                Personal and professional data is processed strictly for assessing eligibility against verified overseas vacancies, coordinating client interviews, processing required documentation (such as GAMCA medicals, visa endorsements, and flight clearances), and ensuring compliance with the Indian Emigration Act and receiving country regulations.
              </p>
              <h4 className="font-bold text-[#171B20] pt-2">3. Data Sharing & Security</h4>
              <p>
                We do not sell, rent, or commercialize candidate data to third-party marketing firms. Data is disclosed only to verified prospective employers, credential-evaluating authorities (e.g. Dataflow, Prometric boards), and competent government emigration authorities.
              </p>
              <h4 className="font-bold text-[#171B20] pt-2">4. Candidate Rights</h4>
              <p>
                Candidates retain the right to request updates, corrections, or complete deletion of their resume from our candidate registry at any time by emailing hrmeero@gmail.com.
              </p>
            </>
          ) : (
            <>
              <p>
                By accessing this website and utilizing recruitment services provided by MEERO Overseas HR Consultancy, candidates and employers agree to abide by the following operational terms.
              </p>
              <h4 className="font-bold text-[#171B20] pt-2">1. Statutory Compliance</h4>
              <p>
                MEERO Overseas HR Consultancy operates with authorization from the Ministry of External Affairs (MEA), Government of India. All overseas placements are executed through approved foreign demand letters and verified employment visas.
              </p>
              <h4 className="font-bold text-[#171B20] pt-2">2. Ethical Recruitment Standards</h4>
              <p>
                Meero adheres strictly to ethical recruitment guidelines. We do not demand unlawful fees from candidates for non-existent vacancies. Initial listings displayed on this site represent sample profiles illustrating categories of overseas demands and are validated before final deployment.
              </p>
              <h4 className="font-bold text-[#171B20] pt-2">3. Candidate Eligibility & Selection</h4>
              <p>
                Final employment offers, salary determinations, and visa approvals are strictly at the discretion of the recruiting overseas employer and host country immigration authorities, subject to medical fitness, trade tests, and document verification.
              </p>
              <h4 className="font-bold text-[#171B20] pt-2">4. Jurisdiction</h4>
              <p>
                Any legal matters or disputes arising from recruitment activities shall be subject to the exclusive jurisdiction of the competent courts in Ernakulam/Cochin, Kerala, India.
              </p>
            </>
          )}
        </div>

        <div className="shrink-0 p-4 sm:p-6 bg-slate-50 border-t border-[#E5ECEA] flex justify-end">
          <Button onClick={onClose} variant="primary" size="md" className="w-full sm:w-auto text-xs sm:text-sm">
            Understood &amp; Close
          </Button>
        </div>
      </div>
    </div>
  );
}

