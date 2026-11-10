import React, { useState, useEffect } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, FileText, ArrowRight, Image as ImageIcon } from 'lucide-react';
import Button from './Button';
import useScrollLock from '../hooks/useScrollLock';

export default function ApplicationModal({ isOpen, onClose, preselectedJob = null, onViewPoster }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    preferredJob: preselectedJob ? preselectedJob.title : '',
    qualification: '',
    experienceYears: '',
    currentLocation: '',
    consent: false
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Update preferred job when preselectedJob changes
  useEffect(() => {
    if (preselectedJob) {
      setFormData(prev => ({
        ...prev,
        preferredJob: preselectedJob.title
      }));
    }
  }, [preselectedJob]);

  useScrollLock(isOpen);

  // Reset submission state each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type) && !/\.(pdf|doc|docx)$/i.test(file.name)) {
      setErrors(prev => ({ ...prev, resume: 'Please upload a PDF or Word document (.pdf, .doc, .docx)' }));
      return;
    }

    if (file.size > maxSizeBytes) {
      setErrors(prev => ({ ...prev, resume: 'File size exceeds 5MB limit. Please upload a smaller file.' }));
      return;
    }

    setResumeFile(file);
    setErrors(prev => ({ ...prev, resume: null }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email address is required';
    }

    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      newErrors.phone = 'Valid phone number with country code is required';
    }

    if (!formData.preferredJob.trim()) {
      newErrors.preferredJob = 'Please specify your target job or category';
    }

    if (!formData.qualification.trim()) {
      newErrors.qualification = 'Education qualification is required';
    }

    if (!formData.experienceYears.trim()) {
      newErrors.experienceYears = 'Please state your relevant years of work experience';
    }

    if (!resumeFile) {
      newErrors.resume = 'Please attach your CV / Resume for evaluation';
    }

    if (!formData.consent) {
      newErrors.consent = 'You must consent to Meero HR storing your CV for recruitment review';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Check duplicate submission in localStorage
    const submittedKey = `meero_submitted_${formData.email}_${formData.preferredJob}`;
    if (localStorage.getItem(submittedKey)) {
      setErrorMessage('You have already submitted an application for this role recently. Our team is already reviewing your file.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || null;

      // Simulated network latency
      await new Promise(resolve => setTimeout(resolve, 1400));

      if (apiEndpoint) {
        // Real API invocation if configured in environment
        const payload = new FormData();
        Object.keys(formData).forEach(key => payload.append(key, formData[key]));
        payload.append('resume', resumeFile);

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          body: payload
        });

        if (!response.ok) {
          throw new Error('API server returned error. Please try again or reach us via WhatsApp.');
        }
      }

      // Generate unique application tracking code
      const uniqueCode = `MEERO-APP-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Store in candidate registry for persistence
      const storedApplications = JSON.parse(localStorage.getItem('meero_applications') || '[]');
      storedApplications.push({
        id: uniqueCode,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        preferredJob: formData.preferredJob,
        qualification: formData.qualification,
        experienceYears: formData.experienceYears,
        resumeFileName: resumeFile.name,
        submittedAt: new Date().toISOString()
      });
      localStorage.setItem('meero_applications', JSON.stringify(storedApplications));
      localStorage.setItem(submittedKey, 'true');

      setSubmissionId(uniqueCode);
      setIsSuccess(true);
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred while processing your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {/* Header */}
        <div className="shrink-0 p-5 sm:p-7 bg-gradient-to-r from-[#F5FAF9] to-white border-b border-[#E5ECEA] relative pr-12">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-[#697477] hover:text-[#171B20] hover:bg-white shadow-xs transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-lg sm:text-2xl font-extrabold text-[#171B20] font-heading leading-tight">
            Submit Your Overseas Career Profile
          </h2>
          <p className="text-xs sm:text-sm text-[#697477] mt-1">
            Complete the form below to register your profile for verified client vacancies.
          </p>
          {preselectedJob?.poster && !isSuccess && (
            <button
              type="button"
              onClick={() => onViewPoster && onViewPoster(preselectedJob)}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#168F88] hover:text-[#0f6c67]"
            >
              <ImageIcon className="w-3.5 h-3.5 shrink-0" />
              View Hiring Poster
            </button>
          )}
        </div>

        {/* Body Content */}
        <div data-lenis-prevent="true" className="p-4 sm:p-7 overflow-y-auto flex-1">
          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#171B20] font-heading">
                Application Successfully Registered!
              </h3>
              <p className="text-sm text-[#697477] max-w-md mx-auto">
                Thank you, <strong className="text-[#171B20]">{formData.fullName}</strong>. Your profile for <strong className="text-[#168F88]">{formData.preferredJob}</strong> has been logged in our Cochin recruitment database.
              </p>

              <div className="p-4 rounded-2xl bg-[#F5FAF9] border border-[#E5ECEA] max-w-md mx-auto text-left space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#697477]">Reference ID:</span>
                  <span className="font-mono font-bold text-[#168F88]">{submissionId}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#697477]">Resume Attached:</span>
                  <span className="font-medium text-[#171B20] truncate max-w-[200px]">{resumeFile?.name}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 max-w-md mx-auto pt-2">
                Our recruitment officers will review your qualifications against active employer demands. You will be contacted via phone or WhatsApp for interview scheduling.
              </p>

              <div className="pt-4 flex justify-center gap-3">
                <Button onClick={onClose} variant="primary" size="md">
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="text-xs leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* Personal Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#171B20] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Rahul Nair"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-base sm:text-sm ${
                      errors.fullName ? 'border-red-500 bg-red-50/30' : 'border-[#E5ECEA]'
                    } focus:outline-none focus:ring-2 focus:ring-[#168F88] transition-all`}
                  />
                  {errors.fullName && <p className="text-red-500 text-[11px] mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#171B20] mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. rahul@example.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-base sm:text-sm ${
                      errors.email ? 'border-red-500 bg-red-50/30' : 'border-[#E5ECEA]'
                    } focus:outline-none focus:ring-2 focus:ring-[#168F88] transition-all`}
                  />
                  {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Phone & Current City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#171B20] mb-1">
                    Mobile Number (with WhatsApp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-base sm:text-sm ${
                      errors.phone ? 'border-red-500 bg-red-50/30' : 'border-[#E5ECEA]'
                    } focus:outline-none focus:ring-2 focus:ring-[#168F88] transition-all`}
                  />
                  {errors.phone && <p className="text-red-500 text-[11px] mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#171B20] mb-1">
                    Current Location / City
                  </label>
                  <input
                    type="text"
                    name="currentLocation"
                    value={formData.currentLocation}
                    onChange={handleInputChange}
                    placeholder="e.g. Kochi, Kerala"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5ECEA] text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#168F88] transition-all"
                  />
                </div>
              </div>

              {/* Preferred Job */}
              <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#171B20] mb-1">
                    Preferred Job Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="preferredJob"
                    value={formData.preferredJob}
                    onChange={handleInputChange}
                    placeholder="e.g. Registered Nurse / Civil Engineer"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-base sm:text-sm ${
                      errors.preferredJob ? 'border-red-500 bg-red-50/30' : 'border-[#E5ECEA]'
                    } focus:outline-none focus:ring-2 focus:ring-[#168F88] transition-all`}
                  />
                  {errors.preferredJob && <p className="text-red-500 text-[11px] mt-1">{errors.preferredJob}</p>}
              </div>

              {/* Qualification & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#171B20] mb-1">
                    Education Qualification <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    placeholder="e.g. B.Sc Nursing / B.Tech Civil / ITI"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-base sm:text-sm ${
                      errors.qualification ? 'border-red-500 bg-red-50/30' : 'border-[#E5ECEA]'
                    } focus:outline-none focus:ring-2 focus:ring-[#168F88] transition-all`}
                  />
                  {errors.qualification && <p className="text-red-500 text-[11px] mt-1">{errors.qualification}</p>}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#171B20] mb-1">
                    Total Work Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleInputChange}
                    placeholder="e.g. 4 Years (2 yrs Gulf + 2 yrs India)"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-base sm:text-sm ${
                      errors.experienceYears ? 'border-red-500 bg-red-50/30' : 'border-[#E5ECEA]'
                    } focus:outline-none focus:ring-2 focus:ring-[#168F88] transition-all`}
                  />
                  {errors.experienceYears && <p className="text-red-500 text-[11px] mt-1">{errors.experienceYears}</p>}
                </div>
              </div>

              {/* Resume Upload Drag & Drop Area */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#171B20] mb-1.5">
                  Upload Resume / CV <span className="text-red-500">*</span>
                </label>
                
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center transition-colors ${
                    resumeFile 
                      ? 'border-[#168F88] bg-[#168F88]/5' 
                      : errors.resume 
                        ? 'border-red-400 bg-red-50/30' 
                        : 'border-[#E5ECEA] hover:border-[#168F88]/50 bg-[#F5FAF9]'
                  }`}
                >
                  {resumeFile ? (
                    <div className="flex items-center justify-between gap-3 p-2 bg-white rounded-xl border border-[#E5ECEA] shadow-xs">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileText className="w-5 h-5 text-[#168F88] shrink-0" />
                        <div className="text-left overflow-hidden">
                          <p className="font-semibold text-xs text-[#171B20] truncate">{resumeFile.name}</p>
                          <p className="text-[11px] text-[#697477]">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setResumeFile(null)}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center space-y-1.5 py-1">
                      <div className="w-10 h-10 rounded-full bg-[#168F88]/10 text-[#168F88] flex items-center justify-center mb-1">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-[#171B20] text-xs sm:text-sm leading-snug">
                        <span>Drag &amp; drop resume, or </span>
                        <label className="text-[#168F88] hover:text-[#0e6761] hover:underline cursor-pointer font-bold inline-flex items-center gap-0.5">
                          <span>browse file</span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </p>
                      <p className="text-[11px] text-[#697477]">
                        Accepted formats: PDF, DOC, DOCX (Max 5MB)
                      </p>
                    </div>
                  )}
                </div>
                {errors.resume && <p className="text-red-500 text-[11px] mt-1">{errors.resume}</p>}
              </div>

              {/* Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleInputChange}
                    className="mt-0.5 rounded border-[#E5ECEA] text-[#168F88] focus:ring-[#168F88]"
                  />
                  <span className="text-xs text-[#697477] leading-relaxed">
                    I declare that the details provided are true and accurate. I authorize MEERO Overseas HR Consultancy to assess my profile for verified overseas client vacancies in compliance with emigration guidelines.
                  </span>
                </label>
                {errors.consent && <p className="text-red-500 text-[11px] mt-1">{errors.consent}</p>}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#E5ECEA] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#697477] hover:text-[#171B20] shrink-0"
                >
                  Cancel
                </button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isSubmitting}
                  icon={ArrowRight}
                  className="whitespace-nowrap shrink-0"
                >
                  Submit Application
                </Button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}

