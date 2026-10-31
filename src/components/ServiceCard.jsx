import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe2, 
  Stethoscope, 
  Cpu, 
  Wrench, 
  Users2, 
  FileCheck, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';

const iconMap = {
  Globe2,
  Stethoscope,
  Cpu,
  Wrench,
  Users2,
  FileCheck,
};

export default function ServiceCard({ service, onEnquire }) {
  const IconComponent = iconMap[service.icon] || Globe2;

  return (
    <div className="group bg-white rounded-2xl border border-[#E5ECEA] hover:border-[#168F88]/40 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Image Preview with Teal Badge */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Service Icon Badge */}
        <div className="absolute top-4 left-4 w-11 h-11 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center text-[#168F88] shadow-md group-hover:bg-[#168F88] group-hover:text-white transition-colors">
          <IconComponent className="w-5 h-5" />
        </div>

        {/* Proposed Service Badge */}
        {service.isProposed && (
          <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-semibold tracking-wide uppercase border border-white/20">
            Proposed Service
          </div>
        )}

        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-lg font-bold text-white font-heading leading-snug drop-shadow-sm">
            {service.title}
          </h3>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-sm text-[#697477] leading-relaxed mb-4">
            {service.shortDescription}
          </p>

          {/* Key highlights */}
          {service.keyHighlights && service.keyHighlights.length > 0 && (
            <div className="space-y-2 mb-6">
              {service.keyHighlights.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-[#171B20]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#168F88] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card Actions */}
        <div className="pt-4 border-t border-[#E5ECEA] flex items-center justify-between gap-3">
          <Link
            to="/services"
            className="text-xs font-bold text-[#168F88] hover:text-[#0f6c67] flex items-center gap-1 group-hover:underline"
          >
            Learn More
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>

          <button
            type="button"
            onClick={() => onEnquire && onEnquire(service)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F5FAF9] hover:bg-[#168F88] hover:text-white text-[#171B20] border border-[#E5ECEA] transition-colors"
          >
            Enquire Now
          </button>
        </div>
      </div>
    </div>
  );
}

