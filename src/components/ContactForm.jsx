import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from './Button';

export default function ContactForm({ initialEnquiryType = 'Candidate Job Enquiry' }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    enquiryType: initialEnquiryType,
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please provide your full name';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address';
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      newErrors.phone = 'Please provide a valid phone number';
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Please enter a message (at least 10 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const apiEndpoint = import.meta.env.VITE_CONTACT_API_ENDPOINT || null;
      await new Promise(resolve => setTimeout(resolve, 1200));

      if (apiEndpoint) {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!response.ok) {
          throw new Error('API server returned error during message dispatch.');
        }
      }

      // Store in local inquiries registry
      const storedInquiries = JSON.parse(localStorage.getItem('meero_inquiries') || '[]');
      storedInquiries.push({
        ...formData,
        id: `INQ-${Date.now()}`,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('meero_inquiries', JSON.stringify(storedInquiries));

      setIsSubmitted(true);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to dispatch enquiry. Please contact us directly via telephone or WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="p-8 sm:p-10 rounded-3xl bg-[#F5FAF9] border border-[#E5ECEA] text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-[#171B20] font-heading">
          Message Successfully Sent
        </h3>
        <p className="text-sm text-[#697477] max-w-md mx-auto">
          Thank you, <strong className="text-[#171B20]">{formData.name}</strong>. Your enquiry regarding <strong className="text-[#168F88]">{formData.enquiryType}</strong> has been directed to our Cochin desk.
        </p>
        <p className="text-xs text-[#697477]">
          We typically respond within 1 business day. For urgent matters, feel free to call our office at <span className="font-semibold text-[#171B20]">+91 484 2356 123</span> or chat on WhatsApp.
        </p>
        <button
          type="button"
          onClick={() => {
            setIsSubmitted(false);
            setFormData({
              name: '',
              email: '',
              phone: '',
              enquiryType: 'Candidate Job Enquiry',
              subject: '',
              message: ''
            });
          }}
          className="mt-4 px-6 py-2.5 rounded-xl bg-white border border-[#E5ECEA] text-xs font-semibold text-[#168F88] hover:bg-slate-50 transition-colors"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl bg-white border border-[#E5ECEA] shadow-lg shadow-black/5 space-y-4">
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="text-xs leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Enquiry Type Selector Tabs */}
      <div>
        <label className="block text-xs font-semibold text-[#697477] mb-2">
          I am reaching out as:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {['Candidate Job Enquiry', 'Employer Recruitment Requirements'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFormData(p => ({ ...p, enquiryType: type }))}
              className={`p-3 rounded-xl text-xs font-semibold text-left transition-all ${
                formData.enquiryType === type 
                  ? 'bg-[#168F88] text-white shadow-sm' 
                  : 'bg-[#F5FAF9] text-[#171B20] hover:bg-slate-100 border border-[#E5ECEA]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Name & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#171B20] mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            className={`w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border ${
              errors.name ? 'border-red-500 bg-red-50/20' : 'border-[#E5ECEA]'
            } focus:outline-none focus:ring-2 focus:ring-[#168F88] transition-all`}
          />
          {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#171B20] mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@domain.com"
            className={`w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border ${
              errors.email ? 'border-red-500 bg-red-50/20' : 'border-[#E5ECEA]'
            } focus:outline-none focus:ring-2 focus:ring-[#168F88] transition-all`}
          />
          {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
        </div>
      </div>

      {/* Phone & Subject */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#171B20] mb-1">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 99..."
            className={`w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border ${
              errors.phone ? 'border-red-500 bg-red-50/20' : 'border-[#E5ECEA]'
            } focus:outline-none focus:ring-2 focus:ring-[#168F88] transition-all`}
          />
          {errors.phone && <p className="text-red-500 text-[11px] mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#171B20] mb-1">
            Subject / Area of Interest
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="e.g. Nursing vacancies in UAE or Manpower demand"
            className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-[#E5ECEA] focus:outline-none focus:ring-2 focus:ring-[#168F88] transition-all"
          />
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-semibold text-[#171B20] mb-1">
          Detailed Message <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          placeholder="Please describe your career background, target country, or corporate manpower requirements..."
          className={`w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border ${
            errors.message ? 'border-red-500 bg-red-50/20' : 'border-[#E5ECEA]'
          } focus:outline-none focus:ring-2 focus:ring-[#168F88] transition-all resize-y`}
        />
        {errors.message && <p className="text-red-500 text-[11px] mt-1">{errors.message}</p>}
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          icon={Send}
          className="w-full justify-center shadow-md shadow-[#168F88]/20"
        >
          Send Message
        </Button>
      </div>

      <p className="text-[11px] text-center text-[#697477]">
        We respect your privacy. Inquiries are handled with confidentiality in accordance with MEA emigration standards.
      </p>
    </form>
  );
}

