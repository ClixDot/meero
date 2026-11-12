'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

import Header from './Header';
import Footer from './Footer';
import FloatingWhatsApp from './FloatingWhatsApp';
import ApplicationModal from './ApplicationModal';
import JobDetailModal from './JobDetailModal';
import PosterModal from './PosterModal';
import PolicyModal from './PolicyModal';
import ScrollToTop from './ScrollToTop';


import useLenis from '../hooks/useLenis';

interface AppContextValue {
  openApplyModal: (job?: any) => void;
  openJobDetails: (job: any) => void;
  viewPoster: (job: any) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppShell>');
  return ctx;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  // Initialize smooth scrolling with reduced-motion support
  useLenis();

  // Application Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [activeJobForApplication, setActiveJobForApplication] = useState<any>(null);

  // Job Details Modal state
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);
  const [activeJobForDetails, setActiveJobForDetails] = useState<any>(null);

  // Hiring Poster Modal state (the job whose poster is showing)
  const [posterJob, setPosterJob] = useState<any>(null);
  const closePoster = useCallback(() => setPosterJob(null), []);

  // Policy Modal state ('privacy' | 'terms' | null)
  const [policyModalType, setPolicyModalType] = useState<any>(null);

  // Open apply modal for a specific job or general
  const handleOpenApplyModal = (job = null) => {
    setActiveJobForApplication(job);
    setIsApplyModalOpen(true);
  };

  // Open job detail modal
  const handleOpenJobDetails = (job) => {
    setActiveJobForDetails(job);
    setIsJobDetailOpen(true);
  };

  // Transition from Job Detail Modal directly into Application Modal
  const handleApplyFromDetail = (job) => {
    setIsJobDetailOpen(false);
    handleOpenApplyModal(job);
  };

  // Apply from the poster, which may be open on top of the Job Detail Modal
  const handleApplyFromPoster = (job) => {
    closePoster();
    handleApplyFromDetail(job);
  };

  return (
    <AppContext.Provider value={{ openApplyModal: handleOpenApplyModal, openJobDetails: handleOpenJobDetails, viewPoster: setPosterJob }}>
    <div className="flex flex-col min-h-screen bg-white text-[#171B20]">
      <ScrollToTop />

      {/* Global Glass Header */}
      <Header onOpenApplyModal={() => handleOpenApplyModal(null)} />

      {/* Main Routed Page Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Global Footer */}
      <Footer 
        onOpenPrivacy={() => setPolicyModalType('privacy')}
        onOpenTerms={() => setPolicyModalType('terms')}
      />

      {/* Floating WhatsApp Action Widget */}
      <FloatingWhatsApp />

      {/* Global Interactive Candidate Application Modal */}
      <ApplicationModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        preselectedJob={activeJobForApplication}
        onViewPoster={setPosterJob}
      />

      {/* Global Job Detail Specifications Modal */}
      <JobDetailModal
        isOpen={isJobDetailOpen}
        onClose={() => setIsJobDetailOpen(false)}
        job={activeJobForDetails}
        onApply={handleApplyFromDetail}
        onViewPoster={setPosterJob}
      />

      {/* Hiring Poster Modal */}
      {posterJob && (
        <PosterModal
          key={posterJob.id}
          job={posterJob}
          onClose={closePoster}
          onApply={handleApplyFromPoster}
        />
      )}

      {/* Privacy Policy & Terms Modal */}
      <PolicyModal
        isOpen={!!policyModalType}
        onClose={() => setPolicyModalType(null)}
        type={policyModalType || 'privacy'}
      />
    </div>
    </AppContext.Provider>
  );
}
