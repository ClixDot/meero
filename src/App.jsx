import React, { useCallback, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import ApplicationModal from './components/ApplicationModal';
import JobDetailModal from './components/JobDetailModal';
import PosterModal from './components/PosterModal';
import PolicyModal from './components/PolicyModal';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Careers from './pages/Careers';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';

import useLenis from './hooks/useLenis';

export default function App() {
  // Initialize smooth scrolling with reduced-motion support
  useLenis();

  // Application Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [activeJobForApplication, setActiveJobForApplication] = useState(null);

  // Job Details Modal state
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);
  const [activeJobForDetails, setActiveJobForDetails] = useState(null);

  // Hiring Poster Modal state (the job whose poster is showing)
  const [posterJob, setPosterJob] = useState(null);
  const closePoster = useCallback(() => setPosterJob(null), []);

  // Policy Modal state ('privacy' | 'terms' | null)
  const [policyModalType, setPolicyModalType] = useState(null);

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
    <div className="flex flex-col min-h-screen bg-white text-[#171B20]">
      <ScrollToTop />

      {/* Global Glass Header */}
      <Header onOpenApplyModal={() => handleOpenApplyModal(null)} />

      {/* Main Routed Page Content */}
      <main className="flex-grow">
        <Routes>
          <Route 
            path="/" 
            element={
              <Home 
                onOpenApplyModal={handleOpenApplyModal}
                onOpenJobDetails={handleOpenJobDetails}
              />
            } 
          />
          <Route 
            path="/about" 
            element={
              <About 
                onOpenApplyModal={() => handleOpenApplyModal(null)} 
              />
            } 
          />
          <Route 
            path="/services" 
            element={
              <Services 
                onOpenApplyModal={() => handleOpenApplyModal(null)} 
              />
            } 
          />
          <Route 
            path="/careers" 
            element={
              <Careers
                onOpenApplyModal={handleOpenApplyModal}
                onOpenJobDetails={handleOpenJobDetails}
                onViewPoster={setPosterJob}
              />
            } 
          />
          <Route 
            path="/contact" 
            element={<Contact />} 
          />
          
          <Route path="/gallery" element={<Gallery />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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
  );
}
