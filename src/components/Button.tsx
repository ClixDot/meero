'use client';

import React from 'react';
import { Link } from '../lib/router';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  icon: Icon,
  iconPosition = 'right',
  type = 'button',
  ...rest
}: any) {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.98] whitespace-nowrap shrink-0";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5 shadow-sm"
  }[size] || "px-5 py-2.5 text-sm gap-2";

  const variantStyles = {
    primary: "bg-(--brand-teal) hover:bg-[#0f6c67] text-white shadow-md shadow-(--brand-teal)/20 focus:ring-(--brand-teal)",
    secondary: "bg-(--brand-turq) hover:bg-[#1aa4ac] text-white shadow-md shadow-(--brand-turq)/20 focus:ring-(--brand-turq)",
    outline: "border-2 border-(--brand-teal) text-(--brand-teal) hover:bg-(--brand-teal)/10 focus:ring-(--brand-teal)",
    ghost: "text-(--brand-text) hover:bg-(--brand-bg) hover:text-(--brand-teal) focus:ring-slate-200",
    white: "bg-white text-(--brand-teal) hover:bg-slate-50 shadow-md focus:ring-white",
    whatsapp: "bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-md shadow-[#25D366]/25 focus:ring-[#25D366]"
  }[variant] || "bg-(--brand-teal) text-white";

  const content = (
    <>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          <span className="whitespace-nowrap">{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </>
  );

  const combinedClass = `${baseStyles} ${sizeStyles} ${variantStyles} ${className}`;

  if (to) {
    return (
      <Link 
        to={to} 
        className={combinedClass} 
        onClick={(e) => {
          if (onClick) onClick(e);
          if (window.__lenis) {
            window.__lenis.scrollTo(0, { immediate: true, force: true });
          }
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }}
        {...rest}
      >
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedClass} target="_blank" rel="noopener noreferrer" {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled || loading} 
      className={combinedClass} 
      {...rest}
    >
      {content}
    </button>
  );
}

