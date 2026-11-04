import React from 'react';
import { MapPin, Briefcase, Clock, ArrowRight, Image as ImageIcon } from 'lucide-react';
import Button from './Button';

export default function JobCard({ job, onViewDetails, onApply, onViewPoster }) {
  // Extract short experience (e.g. "5 - 8 Years") to avoid wrapping or squashing the industry tag
  const shortExperience = job.experience
    ? job.experience.split('(')[0].trim()
    : `${job.minExperienceYears || 2}+ Yrs`;

  return (
    <div className="group bg-white rounded-2xl border border-[#E5ECEA] hover:border-[#168F88]/40 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      
      {/* Top Header */}
      <div className="p-4 sm:p-5 pb-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-[#168F88]/10 text-[#168F88] min-w-0 max-w-[62%]">
            <Briefcase className="w-3 h-3 text-[#168F88] shrink-0" />
            <span className="truncate">{job.industry}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#168F88] shrink-0 whitespace-nowrap">
            <Clock className="w-3 h-3 text-[#168F88] shrink-0" />
            <span>{shortExperience}</span>
          </span>
        </div>

        {/* Job Title */}
        <h3 className="text-base sm:text-lg font-bold text-[#171B20] font-heading group-hover:text-[#168F88] transition-colors leading-snug line-clamp-2 min-h-[2.75rem] flex items-center">
          {job.title}
        </h3>

        {/* Destination Location & Employment Type */}
        <div className="flex items-center justify-between gap-2 text-xs text-[#697477]">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#168F88] shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
            {job.employmentType || "Full-Time"}
          </span>
        </div>
      </div>

      {/* Salary & Perk Note */}
      <div className="px-4 sm:px-5 py-2.5 bg-[#F5FAF9]/70 border-t border-slate-100 flex items-center justify-between text-xs text-[#697477]">
        <span className="truncate font-medium text-[#171B20]">
          {job.salaryNote || "Competitive Tax-Free Salary"}
        </span>
      </div>

      {/* Hiring Poster */}
      {job.poster && (
        <button
          type="button"
          onClick={() => onViewPoster && onViewPoster(job)}
          className="px-4 sm:px-5 py-2.5 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-[#168F88] hover:text-[#0f6c67] hover:bg-[#F5FAF9] transition-colors text-left"
        >
          <ImageIcon className="w-3.5 h-3.5 shrink-0" />
          View Hiring Poster
        </button>
      )}

      {/* Card Footer Actions */}
      <div className="p-4 sm:p-5 pt-3.5 flex items-center justify-between gap-3 bg-white border-t border-slate-100">
        <button
          type="button"
          onClick={() => onViewDetails && onViewDetails(job)}
          className="text-xs font-bold text-[#168F88] hover:text-[#0f6c67] flex items-center gap-1 transition-colors"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </button>

        <Button
          onClick={() => onApply && onApply(job)}
          variant="primary"
          size="sm"
          className="text-xs shadow-xs"
        >
          Apply Now
        </Button>
      </div>

    </div>
  );
}

