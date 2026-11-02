import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  RotateCcw, 
  AlertCircle, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

import Button from '../components/Button';
import JobCard from '../components/JobCard';
import CustomDropdown from '../components/CustomDropdown';

import { 
  sampleJobs, 
  destinationCountries, 
  industriesList, 
  employmentTypesList 
} from '../data/jobs';

export default function Careers({ onOpenApplyModal, onOpenJobDetails }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries');
  const [selectedType, setSelectedType] = useState('All Types');
  const [sortBy, setSortBy] = useState('latest');

  // Filter & Search Logic
  const filteredJobs = useMemo(() => {
    return sampleJobs.filter((job) => {
      const matchesSearch = 
        searchTerm.trim() === '' ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.qualification.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCountry = 
        selectedCountry === 'All Countries' ||
        job.destinationCountry.toLowerCase() === selectedCountry.toLowerCase();

      const matchesIndustry = 
        selectedIndustry === 'All Industries' ||
        job.industry.toLowerCase() === selectedIndustry.toLowerCase();

      const matchesType = 
        selectedType === 'All Types' ||
        job.employmentType.toLowerCase().includes(selectedType.toLowerCase());

      return matchesSearch && matchesCountry && matchesIndustry && matchesType;
    }).sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.postedDate) - new Date(a.postedDate);
      }
      if (sortBy === 'exp-asc') {
        return a.minExperienceYears - b.minExperienceYears;
      }
      if (sortBy === 'exp-desc') {
        return b.minExperienceYears - a.minExperienceYears;
      }
      return 0;
    });
  }, [searchTerm, selectedCountry, selectedIndustry, selectedType, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCountry('All Countries');
    setSelectedIndustry('All Industries');
    setSelectedType('All Types');
    setSortBy('latest');
  };

  return (
    <div className="min-h-screen bg-[#0B0F17]">
      
      {/* ========================================================
          DARK HERO BANNER
      ======================================================== */}
      <section className="relative pt-28 pb-32 md:pt-36 md:pb-40 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=2000&q=80"
            alt="International Career Strategy"
            className="w-full h-full object-cover filter brightness-[0.35] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F17]/95 via-[#0B0F17]/75 to-[#0B0F17]/50" />
        </div>

        <div className="max-w-[1560px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="max-w-3xl space-y-4">
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-heading leading-[1.1] sm:leading-tight break-words"
            >
              Find the Opportunity <br />
              <span className="text-[#21B8C1]">That Moves You Forward.</span>
            </motion.h1>

          </div>
        </div>
      </section>

      {/* ========================================================
          OVERLAPPING WHITE SHEET
      ======================================================== */}
      <section className="relative z-20 px-2.5 sm:px-6 lg:px-10 -mt-20 md:-mt-28 pb-20">
        <div className="max-w-[1560px] 2xl:max-w-[1680px] w-full mx-auto rounded-[24px] sm:rounded-[36px] md:rounded-[48px] lg:rounded-[52px] bg-white text-[#171B20] p-4 sm:p-8 md:p-12 lg:p-16 shadow-2xl shadow-black/30 border border-slate-100 space-y-8">
          
          {/* Search & Filter Controls */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#F5FAF9] border border-[#E5ECEA] space-y-4">
            
            <div className="relative">
              <Search className="w-5 h-5 text-[#697477] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vacancies by title, keyword, specialty, or qualification..."
                className="w-full pl-11 sm:pl-12 pr-12 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white border border-[#E5ECEA] text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#168F88] shadow-xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#697477] hover:text-[#171B20]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#697477] mb-1">
                  Destination Country
                </label>
                <CustomDropdown
                  value={selectedCountry}
                  onChange={setSelectedCountry}
                  options={destinationCountries}
                  size="sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#697477] mb-1">
                  Industry / Sector
                </label>
                <CustomDropdown
                  value={selectedIndustry}
                  onChange={setSelectedIndustry}
                  options={industriesList}
                  size="sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#697477] mb-1">
                  Employment Type
                </label>
                <CustomDropdown
                  value={selectedType}
                  onChange={setSelectedType}
                  options={employmentTypesList}
                  size="sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#697477] mb-1">
                  Sort Order
                </label>
                <CustomDropdown
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { value: 'latest', label: 'Newest First' },
                    { value: 'exp-asc', label: 'Experience: Low to High' },
                    { value: 'exp-desc', label: 'Experience: High to Low' }
                  ]}
                  size="sm"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-[#697477] border-t border-[#E5ECEA]">
              <div>
                Showing <strong className="text-[#171B20]">{filteredJobs.length}</strong> available openings
              </div>
              {(searchTerm || selectedCountry !== 'All Countries' || selectedIndustry !== 'All Industries' || selectedType !== 'All Types') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168F88] hover:text-[#0f6c67] self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset all filters
                </button>
              )}
            </div>

          </div>

          {/* Job Listings Grid */}
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-4">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onViewDetails={onOpenJobDetails}
                  onApply={onOpenApplyModal}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl bg-[#F5FAF9] border border-[#E5ECEA] max-w-2xl mx-auto space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-[#171B20]">No matching vacancies found</h3>
              <p className="text-xs sm:text-sm text-[#697477]">
                Try adjusting your search criteria, or register your profile in our general candidate pool.
              </p>
              <Button onClick={handleResetFilters} variant="outline" size="sm">
                Clear Filters
              </Button>
            </div>
          )}

          {/* Talent Pool Banner */}
          <div className="pt-8 border-t border-slate-200">
            <div className="rounded-2xl sm:rounded-3xl bg-[#0D151E] text-white p-6 sm:p-10 text-center space-y-3 shadow-xl">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-heading">
                Looking for Upcoming Overseas Drives?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                Client delegations visit our Cochin center regularly. Submit your profile to be pre-screened for upcoming vacancies.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onOpenApplyModal && onOpenApplyModal()}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-white text-[#0D151E] hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all shadow-md"
                >
                  Register Candidate Profile
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
