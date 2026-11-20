'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, FileText, Loader2, Lock, Send, UploadCloud, type LucideIcon } from 'lucide-react';
import { services } from '../../lib/services';
import { cx } from '../ui/kit';

const CDN = 'https://res.cloudinary.com/inu9dzib/image/upload/f_auto,q_auto/meero/images';

const SLIDES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Send, title: 'Save, preview, then publish', text: 'Drafts stay private until you publish. Every published version can be restored.' },
  { icon: FileText, title: 'Vacancies and candidates, together', text: 'Publish job listings, review applications and move candidates through every stage.' },
  { icon: UploadCloud, title: 'Your media, safely in the cloud', text: 'Images and documents are stored securely and update across the live website instantly.' },
];

/** Floating tiles behind the glass card (positions follow the 685 × 805 brand panel). Decoration only. */
const SHAPES = [
  { cls: 'left-[14%] -top-[4%] w-[50%] h-[28%] rotate-[17deg] from-[#1E7F8A]/75 to-[#0F4F55]/25', d: 0 },
  { cls: 'left-[56%] top-[19%] w-[52%] h-[40%] -rotate-[13deg] from-[#21B8C1]/85 to-[#8B80F9]/45', d: 1.2 },
  { cls: '-left-[4%] top-[29%] w-[22%] h-[21%] -rotate-[6deg] from-[#2A6FA3]/80 to-[#12304F]/25', d: 0.6 },
  { cls: '-left-[2%] top-[62%] w-[38%] h-[40%] rotate-[19deg] from-[#2477B0]/85 to-[#0B2038]/20', d: 1.8 },
  { cls: 'left-[54%] top-[64%] w-[39%] h-[31%] rotate-[31deg] from-[#8B80F9]/75 to-[#21B8C1]/35', d: 0.9 },
];

export default function Login() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = () => {
    const n = new URLSearchParams(window.location.search).get('next');
    return n && n.startsWith('/admin') && !n.startsWith('/admin/login') ? n : '/admin';
  };

  useEffect(() => {
    services.auth.currentUser().then((u) => { if (u) router.replace(next()); }).catch(() => {});
  }, [router]);

  useEffect(() => {
    if (reduce || paused) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, [reduce, paused]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!email.trim() || !password) { setError('Enter your email and password.'); return; }
    setBusy(true);
    setError('');
    try {
      await services.auth.login(email, password, true);
      router.replace(next());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
      setBusy(false);
    }
  };

  const active = SLIDES[slide];

  // Measured from the reference: fields 475 × 68, 8px apart, 20px radius, label column 153px.
  const row = 'flex items-center h-[60px] rounded-[18px] bg-white px-[21px] shadow-[0_1px_2px_rgba(23,27,32,0.04),0_10px_26px_-14px_rgba(23,27,32,0.14)] transition focus-within:ring-2 focus-within:ring-[#168F88]/45';
  const label = 'w-[104px] sm:w-[132px] shrink-0 text-[13.5px] text-[#7A8587]';
  const field = 'flex-1 min-w-0 bg-transparent text-[16px] text-[#0F2A2D] outline-none placeholder:text-[#B4BCBE]';

  return (
    <div className="min-h-dvh bg-[#E4E3DF] flex items-center justify-center p-3 sm:p-6">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[1180px] rounded-[36px] bg-[#F0EFEB] p-2.5 shadow-[0_50px_90px_-45px_rgba(23,27,32,0.3)] ring-1 ring-white/70 lg:h-[min(700px,calc(100dvh-48px))]"
      >
        <div className="grid h-full gap-2.5 lg:grid-cols-2">
          {/* ---------------- Form side (685 wide) ---------------- */}
          <div className="flex min-h-[600px] lg:min-h-0 flex-col rounded-[28px] bg-[#F7F5F2] px-6 pt-8 pb-7 sm:px-[40px] sm:pt-[30px] sm:pb-[30px]">
            <a href="/" aria-label="MEERO – back to website" className="inline-block self-start">
              <img src={`${CDN}/meero-logo-dark.png`} alt="MEERO HR Consultancy" className="h-[54px] w-auto" />
            </a>

            <div className="flex flex-1 items-center justify-center">
              <div className="w-full max-w-[475px]">
                <div className="flex items-end justify-between gap-4">
                  <h1 className="text-[36px] sm:text-[38px] leading-none font-extrabold font-heading tracking-[-0.03em] text-[#0F2A2D]">Admin sign in</h1>
                  <span className="hidden sm:block pb-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-[#168F88]">Dashboard</span>
                </div>
                <p className="mt-3 text-[15px] text-[#7A8587]">Manage your website and business content.</p>

                <form onSubmit={submit} noValidate className="mt-7 space-y-2">
                  {error && <div role="alert" className="mb-2 rounded-2xl bg-red-50 border border-red-100 text-[#c23b40] text-sm px-4 py-3">{error}</div>}

                  <label className={row}>
                    <span className={label}>Email address</span>
                    <input id="login-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@meerohr.com" className={field} autoFocus />
                  </label>

                  <label className={row}>
                    <span className={label}>Password</span>
                    <input id="login-password" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={field} />
                    <button type="button" onClick={() => setShow((s) => !s)} className="p-1.5 -mr-1 rounded-lg text-[#0F2A2D] hover:bg-slate-100 transition" aria-label={show ? 'Hide password' : 'Show password'}>
                      {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </label>

                  <div className="flex items-center justify-end gap-4 pt-[16px]">
                    <button
                      type="submit"
                      disabled={busy}
                      className="inline-flex items-center justify-center gap-2.5 h-[54px] w-[144px] rounded-[16px] bg-[#0F2A2D] text-white text-[16px] font-bold shadow-[0_18px_30px_-14px_rgba(15,42,45,0.55)] transition hover:bg-[#143a3e] active:scale-[0.98] disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#168F88]"
                    >
                      {busy ? <Loader2 className="w-[18px] h-[18px] animate-spin text-[#21B8C1]" /> : <Lock className="w-[18px] h-[18px] text-[#21B8C1]" />}
                      Sign in
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 text-[13px] text-[#8A9496]">
              <span>© 2026 MEERO Overseas HR Consultancy</span>
              <a
                href="/"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-[#D5DAD9] bg-white text-[13px] font-semibold text-[#2B3D40] shadow-[0_1px_2px_rgba(23,27,32,0.05)] transition hover:border-[#168F88] hover:text-[#168F88] hover:bg-[#168F88]/5 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#168F88]"
              >
                <ArrowLeft className="w-4 h-4" /> Back to website
              </a>
            </div>
          </div>

          {/* ---------------- Brand side (685 wide) ---------------- */}
          <div
            className="hidden lg:block relative overflow-hidden rounded-[28px] bg-[#08131B]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_20%_0%,#0E3B45_0%,#08131B_55%,#050A10_100%)]" />
            {SHAPES.map((s, i) => (
              <motion.div
                key={i}
                aria-hidden
                className={cx('absolute rounded-[48px] bg-gradient-to-br', s.cls)}
                animate={reduce ? undefined : { y: [0, -14, 0] }}
                transition={{ duration: 9 + i, repeat: Infinity, ease: 'easeInOut', delay: s.d }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050A10]/55 via-transparent to-transparent" />

            {/* Glass card: 375 wide, centred */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[336px] rounded-[26px] border border-white/15 bg-white/[0.07] backdrop-blur-2xl px-[24px] pt-[26px] pb-[20px] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
                <div className="min-h-[184px]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={slide}
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      aria-live="polite"
                    >
                      <span className="inline-flex w-12 h-12 items-center justify-center rounded-2xl bg-white/10 text-[#5FD6DC]"><active.icon className="w-5 h-5" /></span>
                      <h2 className="mt-[22px] text-[20px] leading-tight font-bold font-heading tracking-[-0.01em] text-white">{active.title}</h2>
                      <p className="mt-3 text-[14.5px] leading-[24px] text-slate-300">{active.text}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="mt-[14px] pt-[16px] border-t border-white/10 flex items-center gap-3">
                  <span className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
                    <img src={`${CDN}/meero-mark.png`} alt="" aria-hidden className="w-8 h-8 object-contain" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold text-white leading-tight">MEERO Admin</p>
                    <p className="text-[13px] text-slate-300 mt-0.5 truncate">Overseas HR consultancy & recruitment</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-[22px] inset-x-0 flex justify-center items-center gap-2" role="tablist" aria-label="Highlights">
              {SLIDES.map((s, i) => (
                <button
                  key={s.title}
                  type="button"
                  role="tab"
                  aria-selected={i === slide}
                  aria-label={s.title}
                  onClick={() => setSlide(i)}
                  className={cx('h-[9px] rounded-full transition-all duration-300', i === slide ? 'w-[26px] bg-[#21B8C1]' : 'w-[9px] bg-white/35 hover:bg-white/60')}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
