'use client';

import React from 'react';
import { Link } from '../lib/router';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import Logo from './Logo';
import InstagramIcon from './InstagramIcon';
import TrustBadge from './TrustBadge';
import { useSite, useVisible } from '../lib/cms/SiteContent';

export default function Footer({ onOpenPrivacy, onOpenTerms }) {
  const currentYear = new Date().getFullYear();
  const companyInfo = useSite('company');
  const servicesList = useVisible('services');
  const headerFooter = useSite('headerFooter');
  const { footer, social } = headerFooter;
  const navLinks = headerFooter.nav.filter((item) => item.visible !== false);

  return (
    <footer className="bg-(--brand-dark) text-white pt-16 pb-12 border-t border-white/10 relative overflow-hidden">
      
      {/* Decorative subtle fingerprint background watermark */}
      <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-1/4 translate-y-1/4">
        <svg viewBox="0 0 400 400" className="w-[500px] h-[500px]">
          <circle cx="200" cy="200" r="180" stroke="#21B8C1" strokeWidth="6" strokeDasharray="30 15 45 15" fill="none"/>
          <circle cx="200" cy="200" r="130" stroke="#168F88" strokeWidth="6" strokeDasharray="25 12 35 12" fill="none"/>
          <circle cx="200" cy="200" r="80" stroke="#21B8C1" strokeWidth="5" strokeDasharray="20 10 30 10" fill="none"/>
        </svg>
      </div>

      <div className="max-w-[1560px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        
        {/* Main Grid Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 pb-12 border-b border-white/10">
          
          {/* Col 1: Brand & Overview (Col span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <Logo variant="light" size="md" src={headerFooter.logo} alt={headerFooter.logoAlt} />
            
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm pt-2">
              {footer.description}
            </p>

            {footer.showTrustBadge && <TrustBadge size="h-14 sm:h-16 md:h-20" showTagline className="pt-2" />}
          </div>

          {/* Col 2: Navigation (Col span 2) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white font-heading mb-4">
              {footer.exploreHeading}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {navLinks.map((item) => (
                <li key={item.id}>
                  <Link to={item.path} className="text-slate-400 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Proposed Services (Col span 3) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white font-heading mb-4">
              {footer.sectorsHeading}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {servicesList.map((srv) => (
                <li key={srv.id}>
                  <Link 
                    to="/services" 
                    className="text-slate-400 hover:text-(--brand-turq) transition-colors truncate block"
                  >
                    {srv.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Office (Col span 3) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white font-heading mb-4">
              {footer.officeHeading}
            </h4>
            <div className="space-y-4 text-xs sm:text-sm text-slate-400">
              {/* Location Block */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
                  <MapPin className="w-4 h-4 text-(--brand-turq) shrink-0" />
                  <span>Our Location</span>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed space-y-0.5 pl-6">
                  <p>{companyInfo.address.floor}, {companyInfo.address.building}</p>
                  <p>{companyInfo.address.landmark}</p>
                  <p>Ravipuram, {companyInfo.address.city} – {companyInfo.address.postalCode}</p>
                  <p>{companyInfo.address.state}, {companyInfo.address.country}</p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-(--brand-turq) shrink-0" />
                  <div className="text-xs">
                    <a href={`tel:+${companyInfo.contact.cleanOfficeMobile}`} className="hover:text-white text-slate-300">
                      {companyInfo.contact.officeMobile}
                    </a> (Office) · 
                    <a href={`tel:${companyInfo.contact.cleanTelephone}`} className="hover:text-white text-slate-300 ml-1">
                      {companyInfo.contact.telephone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-(--brand-turq) shrink-0" />
                  <a href={`mailto:${companyInfo.contact.email}`} className="text-xs hover:text-white text-slate-300">
                    {companyInfo.contact.email}
                  </a>
                </div>

                {companyInfo.contact.instagramUrl && (
                  <div className="flex items-center gap-2.5">
                    <InstagramIcon className="w-4 h-4 text-(--brand-turq) shrink-0" />
                    <a
                      href={companyInfo.contact.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs hover:text-white text-slate-300"
                    >
                      Follow us on Instagram
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Circular Action Buttons & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-xs text-slate-400 text-center sm:text-left">
          
          <div className="flex items-center gap-3">
            <a
              href={companyInfo.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#25D366] text-white flex items-center justify-center transition-colors"
              title="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            {companyInfo.contact.instagramUrl && (
              <a
                href={companyInfo.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E1306C] text-white flex items-center justify-center transition-colors"
                title="Instagram"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            )}
            {(['facebook', 'linkedin', 'youtube', 'x'] as const).filter((k) => social[k]).map((k) => (
              <a
                key={k}
                href={social[k]}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-(--brand-teal) text-white flex items-center justify-center transition-colors text-[11px] font-bold uppercase"
                title={k === 'x' ? 'X (Twitter)' : k[0].toUpperCase() + k.slice(1)}
                aria-label={k}
              >
                {{ facebook: 'f', linkedin: 'in', youtube: 'yt', x: 'x' }[k]}
              </a>
            ))}
            <a
              href={`mailto:${companyInfo.contact.email}`}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-(--brand-teal) text-white flex items-center justify-center transition-colors"
              title="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
            <a
              href={`tel:+${companyInfo.contact.cleanOfficeMobile}`}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-(--brand-turq) text-white flex items-center justify-center transition-colors"
              title="Call"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 sm:gap-x-4 text-xs">
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-slate-600">·</span>
            <button
              type="button"
              onClick={onOpenTerms}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms &amp; Conditions
            </button>
            {footer.poweredByVisible && <span className="text-slate-600">·</span>}
            {footer.poweredByVisible && (
              <a
                href={footer.poweredByUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-(--brand-turq) transition-colors inline-flex items-center gap-1 group"
              >
                <span>Powered by</span>
                <span className="font-semibold text-slate-300 group-hover:text-(--brand-turq) transition-colors underline decoration-dotted underline-offset-2">
                  {footer.poweredByLabel}
                </span>
              </a>
            )}
          </div>

          <div className="text-[11px] sm:text-xs">
            © {currentYear} {footer.copyright}
          </div>

        </div>

      </div>
    </footer>
  );
}
