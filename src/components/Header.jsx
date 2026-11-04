import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import Logo from './Logo';
import { companyInfo } from '../data/companyInfo';

export default function Header({ onOpenApplyModal }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change & unlock scroll
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      if (window.__lenis) window.__lenis.stop();
      document.body.style.overflow = 'hidden';
    } else {
      if (window.__lenis) window.__lenis.start();
      document.body.style.overflow = '';
    }
    return () => {
      if (window.__lenis) window.__lenis.start();
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Careers', path: '/careers' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      {/* Floating Seamless Transparent / Glass Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#0B0F17]/90 backdrop-blur-md py-3.5 border-b border-white/10 shadow-2xl' 
            : 'bg-transparent py-5 sm:py-6 border-b border-transparent'
        }`}
      >
        <div className="max-w-[1560px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between">
          
          {/* Brand Logo in Light Mode (for dark hero backdrop) */}
          <Logo variant="light" size="md" />

          {/* Desktop Navigation (Floating Pill) */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-white/10 border-none px-3.5 py-1.5 rounded-full backdrop-blur-md">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-[#0B0F17] shadow-sm font-bold'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Header Action CTA Button (sleek white pill button) */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={companyInfo.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-300 bg-black/30 hover:bg-black/50 rounded-full border border-emerald-500/30 backdrop-blur-md transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              WhatsApp
            </a>

            <button
              type="button"
              onClick={onOpenApplyModal || (() => window.location.assign('/careers'))}
              className="px-5 py-2 rounded-full text-xs font-bold bg-white text-[#0B0F17] hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/20 flex items-center gap-1.5"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={onOpenApplyModal || (() => window.location.assign('/careers'))}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-[#0B0F17] sm:hidden"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative w-10 h-10 rounded-xl text-white hover:bg-white/10 active:scale-90 transition-all flex items-center justify-center focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0, scale: 0.75 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.75 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="flex items-center justify-center"
                  >
                    <X className="w-6 h-6 text-[#21B8C1]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0, scale: 0.75 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -90, opacity: 0, scale: 0.75 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="flex items-center justify-center"
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer with Smooth AnimatePresence */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden border-t border-white/10 bg-[#0B0F17]/98 backdrop-blur-2xl px-4 pt-4 pb-6 shadow-2xl max-h-[calc(100dvh-70px)] overflow-y-auto"
            >
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: { transition: { staggerChildren: 0.04, delayChildren: 0.04 } },
                  closed: { transition: { staggerChildren: 0.02, staggerDirection: -1 } }
                }}
                className="flex flex-col gap-1.5"
              >
                {navLinks.map((item) => (
                  <motion.div
                    key={item.path}
                    variants={{
                      open: { opacity: 1, x: 0 },
                      closed: { opacity: 0, x: -10 }
                    }}
                    transition={{ duration: 0.18 }}
                  >
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `px-4 py-3 rounded-xl text-sm font-semibold transition-all block ${
                          isActive
                            ? 'bg-[#168F88] text-white font-bold shadow-md shadow-[#168F88]/30'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="mt-5 pt-4 border-t border-white/10 flex flex-col gap-3"
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onOpenApplyModal) onOpenApplyModal();
                    else window.location.assign('/careers');
                  }}
                  className="w-full py-3 px-4 rounded-full text-xs sm:text-sm font-bold bg-white text-[#0B0F17] hover:bg-slate-100 active:scale-98 transition-all shadow-md justify-center flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <span>Apply for Overseas Jobs</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                <a
                  href={companyInfo.contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs font-semibold bg-[#25D366] text-white shadow-sm hover:bg-[#20ba5a] active:scale-98 transition-all whitespace-nowrap"
                >
                  <span className="truncate">Chat on WhatsApp ({companyInfo.contact.officeMobile})</span>
                </a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
