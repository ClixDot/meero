'use client';

import React from 'react';
import { MapPin, Briefcase, Clock, ArrowRight, Image as ImageIcon, Wallet } from 'lucide-react';
import Button from './Button';

/**
 * Job listing card.
 * Every row has a fixed rhythm (title always reserves two lines, salary two lines, footer pinned to the bottom),
 * so cards in the same grid row line up exactly whatever the content length.
 */
export default function JobCard({ job, onViewDetails, onApply, onViewPoster }) {
  // Short experience ("3 - 5 Years") – long qualifiers live in the details modal.
  const shortExperience = job.experience
    ? job.experience.split('(')[0].trim()
    : `${job.minExperienceYears || 2}+ Yrs`;
  const experienceShort = shortExperience.replace(/\byears?\b.*$/i, 'Years').trim();

  return (
    <article className="group h-full flex flex-col bg-white rounded-[20px] border border-(--brand-teal)/45 shadow-[0_16px_36px_-18px_rgba(22,143,136,0.5)] hover:border-(--brand-teal)/60 hover:shadow-[0_22px_44px_-18px_rgba(22,143,136,0.55)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">

      {/* Header: sector + experience */}
      <div className="px-5 pt-5 flex items-center justify-between gap-3 min-w-0">
        <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-semibold bg-(--brand-teal)/10 text-(--brand-teal) min-w-0 max-w-[65%]" title={job.industry}>
          <Briefcase className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{job.industry}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--brand-teal) shrink-0 whitespace-nowrap" title={job.experience || shortExperience}>
          <Clock className="w-3.5 h-3.5 shrink-0" />
          {experienceShort}
        </span>
      </div>

      {/* Title (always two lines tall) */}
      <h3 className="px-5 pt-3.5 text-[17px] sm:text-lg font-bold text-(--brand-text) font-heading leading-[1.35] line-clamp-2 min-h-[calc(2*1.35em+0.875rem)] group-hover:text-(--brand-teal) transition-colors">
        {job.title}
      </h3>

      {/* Location + employment type */}
      <div className="px-5 pt-1 flex items-center justify-between gap-3 text-[13px] text-[#697477] min-w-0">
        <span className="flex items-center gap-1.5 min-w-0" title={job.location}>
          <MapPin className="w-4 h-4 text-(--brand-teal) shrink-0" />
          <span className="truncate">{job.location}</span>
        </span>
        <span className="shrink-0 h-6 inline-flex items-center px-2.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-600 whitespace-nowrap max-w-[45%] truncate">
          {job.employmentType || 'Full-Time'}
        </span>
      </div>

      {/* Salary panel (two lines tall) */}
      <div className="mx-5 mt-4 rounded-xl bg-(--brand-bg) border border-(--brand-teal)/10 px-3.5 py-2.5 flex items-start gap-3">
        <span className="mt-0.5 w-8 h-8 rounded-lg bg-white text-(--brand-teal) flex items-center justify-center shrink-0 shadow-xs">
          <Wallet className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8A9496]">Salary &amp; benefits</p>
          <p className="text-[13px] font-semibold text-(--brand-text) leading-snug line-clamp-2 min-h-[2.6em]" title={job.salaryNote}>
            {job.salaryNote || 'Competitive Tax-Free Salary'}
          </p>
        </div>
      </div>

      {/* Footer pinned to the bottom of the card */}
      <div className="mt-auto pt-4">
        {job.poster && (
          <button
            type="button"
            onClick={() => onViewPoster && onViewPoster(job)}
            className="w-full px-5 h-11 border-t border-slate-100 flex items-center gap-2 text-[13px] font-semibold text-(--brand-teal) hover:text-[#0f6c67] hover:bg-(--brand-bg) transition-colors text-left"
          >
            <ImageIcon className="w-4 h-4 shrink-0" />
            View Hiring Poster
          </button>
        )}
        <div className="px-5 h-[68px] border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onViewDetails && onViewDetails(job)}
            className="text-[13px] font-bold text-(--brand-teal) hover:text-[#0f6c67] inline-flex items-center gap-1.5 transition-colors"
          >
            View Details
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <Button
            onClick={() => onApply && onApply(job)}
            variant="primary"
            size="sm"
            className="text-[13px] shadow-xs"
          >
            Apply Now
          </Button>
        </div>
      </div>
    </article>
  );
}
