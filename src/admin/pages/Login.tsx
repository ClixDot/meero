'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { services } from '../../lib/services';
import { DEFAULT_ADMIN } from '../../lib/services/local';
import { Button, FieldShell, Input } from '../ui/kit';

export default function Login() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showDefault, setShowDefault] = useState(false);

  const next = () => {
    const n = new URLSearchParams(window.location.search).get('next');
    return n && n.startsWith('/admin') && !n.startsWith('/admin/login') ? n : '/admin';
  };

  useEffect(() => {
    services.auth.currentUser().then((u) => { if (u) router.replace(next()); }).catch(() => {});
    services.auth.listUsers()
      .then((users) => setShowDefault(users.some((u) => u.email === DEFAULT_ADMIN.email && u.usingDefaultPassword)))
      .catch((e) => setError(e instanceof Error ? e.message : 'Local storage is unavailable in this browser.'));
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) { setError('Enter your email and password.'); return; }
    setBusy(true);
    setError('');
    try {
      await services.auth.login(email, password, remember);
      router.replace(next());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div className="hidden lg:flex relative overflow-hidden m-4 rounded-[32px] bg-[#0B0F17] text-white p-12 flex-col justify-between">
        <img src="/images/hero-bg.jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F17] via-[#0B0F17]/85 to-[#168F88]/40" />
        <img src="/images/meero-mark.png" alt="" aria-hidden className="absolute -right-24 -bottom-24 w-[420px] opacity-20" />
        <div className="relative">
          <img src="/images/meero.png" alt="MEERO Overseas HR Consultancy" className="h-16 w-auto" />
        </div>
        <div className="relative max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#21B8C1]">Content Studio</p>
          <h1 className="text-4xl font-extrabold font-heading leading-tight mt-3">Manage every page, vacancy and candidate in one place.</h1>
          <p className="text-sm text-slate-300 mt-4 leading-relaxed">Edit content, publish job listings, review applications and keep the website on-brand – without touching code.</p>
        </div>
        <div className="relative flex items-center gap-3 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-[#21B8C1]" /> Govt. of India Approved Recruiting Agency
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-[420px]">
          <div className="lg:hidden flex justify-center mb-8">
            <span className="inline-flex items-center gap-3 rounded-2xl bg-[#0B0F17] px-5 py-3"><img src="/images/meero.png" alt="MEERO" className="h-9 w-auto" /></span>
          </div>
          <div className="rounded-[28px] bg-white/85 backdrop-blur-xl border border-white shadow-[0_30px_60px_-30px_rgba(23,27,32,0.35)] p-6 sm:p-8">
            <h2 className="text-2xl font-extrabold font-heading tracking-tight">Welcome back</h2>
            <p className="text-sm text-[#7A8587] mt-1">Sign in to the MEERO admin dashboard.</p>
            <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
              {error && <div role="alert" className="rounded-xl bg-red-50 border border-red-100 text-[#c23b40] text-sm px-3.5 py-2.5">{error}</div>}
              <FieldShell label="Email" htmlFor="login-email">
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A3ACAE] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input id="login-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-11" placeholder="you@meerohr.com" autoFocus />
                </div>
              </FieldShell>
              <FieldShell label="Password" htmlFor="login-password">
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A3ACAE] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input id="login-password" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-11 h-11" />
                  <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#8A9496] hover:bg-slate-100" aria-label={show ? 'Hide password' : 'Show password'}>
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </FieldShell>
              <label className="flex items-center gap-2 text-sm text-[#4B5759] select-none cursor-pointer">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 rounded accent-[#168F88]" />
                Keep me signed in for 30 days
              </label>
              <Button type="submit" size="lg" className="w-full" loading={busy}>Sign in <ArrowRight className="w-4 h-4" /></Button>
            </form>
            {showDefault && (
              <div className="mt-6 rounded-2xl bg-[#168F88]/8 border border-[#168F88]/15 px-4 py-3 text-xs text-[#2B3134]">
                <p className="font-bold text-[#127a74]">First sign-in</p>
                <p className="mt-1">Email <code className="font-semibold">{DEFAULT_ADMIN.email}</code> · Password <code className="font-semibold">{DEFAULT_ADMIN.password}</code></p>
                <p className="mt-1 text-[#6B7678]">Change this password right after signing in. This hint disappears once you do.</p>
                <button type="button" className="mt-2 font-semibold text-[#168F88] hover:underline" onClick={() => { setEmail(DEFAULT_ADMIN.email); setPassword(DEFAULT_ADMIN.password); }}>Fill in for me</button>
              </div>
            )}
          </div>
          <p className="text-center text-xs text-[#A3ACAE] mt-6"><a href="/" className="hover:text-[#168F88]">← Back to website</a></p>
        </motion.div>
      </div>
    </div>
  );
}
