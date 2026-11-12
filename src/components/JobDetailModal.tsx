'use client';

import React from 'react';
import { X, MapPin, Briefcase, Clock, GraduationCap, CheckCircle2, ShieldCheck, ArrowRight, Image as ImageIcon } from 'lucide-react';
import Button from './Button';
import useScrollLock from '../hooks/useScrollLock';

export default function JobDetailModal({ job, isOpen, onClose, onApply, onViewPoster }) {
  useScrollLock(isOpen);

  if (!isOpen || !job) return null;

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
        {/* Top Header */}
        <div className="shrink-0 p-5 sm:p-7 bg-gradient-to-r from-[#F5FAF9] to-white border-b border-[#E5ECEA] relative pr-12">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-[#697477] hover:text-[#171B20] hover:bg-white shadow-xs transition-colors focus:outline-none"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#168F88]/15 text-[#168F88]">
              <Briefcase className="w-3.5 h-3.5" />
              {job.industry}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              {job.employmentType}
            </span>
          </div>

          <h2 className="text-lg sm:text-2xl font-extrabold text-[#171B20] font-heading leading-tight">
            {job.title}
          </h2>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#697477] mt-1.5">
            <MapPin className="w-4 h-4 text-[#168F88] shrink-0" />
            <span className="font-medium text-[#171B20]">{job.location}</span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div data-lenis-prevent="true" className="p-4 sm:p-7 overflow-y-auto flex-1 space-y-6 text-xs sm:text-sm">
          
          {/* Key Facts Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 sm:p-5 rounded-2xl bg-[#F5FAF9] border border-[#E5ECEA] divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Required Experience */}
            <div className="space-y-1.5 pt-3 first:pt-0 md:pt-0 md:px-3 first:md:pl-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#697477] block">
                Required Experience
              </span>
              <div className="flex items-start gap-2 text-[#171B20] font-bold text-xs sm:text-sm">
                <Clock className="w-4 h-4 text-[#168F88] shrink-0 mt-0.5" />
                <span className="leading-snug">{job.experience}</span>
              </div>
            </div>

            {/* Qualification */}
            <div className="space-y-1.5 pt-3 md:pt-0 md:px-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#697477] block">
                Qualification
              </span>
              <div className="flex items-start gap-2 text-[#171B20] font-bold text-xs sm:text-sm">
                <GraduationCap className="w-4 h-4 text-[#168F88] shrink-0 mt-0.5" />
                <span className="leading-snug">{job.qualification}</span>
              </div>
            </div>

            {/* Remuneration Note */}
            <div className="space-y-1.5 pt-3 md:pt-0 md:px-3 last:md:pr-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#697477] block">
                Remuneration Note
              </span>
              <div className="flex items-start gap-2 text-[#0f6c67] font-bold text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4 text-[#168F88] shrink-0 mt-0.5" />
                <span className="leading-snug">{job.salaryNote || "Competitive Package"}</span>
              </div>
            </div>
          </div>

          {/* Hiring Poster */}
          {job.poster && (
            <button
              type="button"
              onClick={() => onViewPoster && onViewPoster(job)}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl border border-[#E5ECEA] hover:border-[#168F88]/50 hover:bg-[#F5FAF9] transition-colors text-left"
            >
              <img
                src={job.poster}
                alt=""
                loading="lazy"
                className="w-12 h-15 object-cover rounded-lg bg-slate-100 shrink-0"
              />
              <span className="flex items-center gap-1.5 font-bold text-[#168F88]">
                <ImageIcon className="w-4 h-4 shrink-0" />
                View Hiring Poster
              </span>
            </button>
          )}

          {/* Job Overview */}
          <div>
            <h4 className="font-bold text-base text-[#171B20] font-heading mb-2">
              Role Overview
            </h4>
            <p className="text-[#697477] leading-relaxed">
              {job.description}
            </p>
          </div>

          {/* Key Responsibilities */}
          {job.responsibilities && (
            <div>
              <h4 className="font-bold text-base text-[#171B20] font-heading mb-2.5">
                Key Responsibilities
              </h4>
              <ul className="space-y-2">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2 text-[#171B20]">
                    <CheckCircle2 className="w-4 h-4 text-[#168F88] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Eligibility Requirements */}
          {job.requirements && (
            <div>
              <h4 className="font-bold text-base text-[#171B20] font-heading mb-2.5">
                Candidate Prerequisites & Requirements
              </h4>
              <ul className="space-y-2">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-[#171B20]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#21B8C1] shrink-0 mt-2" />
                    <span className="leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && (
            <div>
              <h4 className="font-bold text-base text-[#171B20] font-heading mb-2.5">
                Provided Overseas Benefits
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {job.benefits.map((ben, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-teal-50/50 border border-teal-100 text-xs font-medium text-teal-950 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#168F88] shrink-0" />
                    <span>{ben}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transparency Disclaimer */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#697477] leading-relaxed">
            <strong className="text-[#171B20]">Recruitment Policy:</strong> Meero Overseas HR Consultancy complies with all regulations mandated by the Ministry of External Affairs, Government of India. Candidate selection is purely based on client evaluations, employer demand letters, and destination country medical and visa eligibility.
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="shrink-0 p-4 sm:p-6 bg-slate-50 border-t border-[#E5ECEA] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#697477] hover:text-[#171B20] hover:bg-slate-200/60 transition-colors"
          >
            Close
          </button>

          <Button
            onClick={() => {
              onClose();
              if (onApply) onApply(job);
            }}
            variant="primary"
            size="md"
            icon={ArrowRight}
            className="shadow-md text-xs sm:text-sm"
          >
            Apply for Position
          </Button>
        </div>

      </div>
    </div>
  );
}

