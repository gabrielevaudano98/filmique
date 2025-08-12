"use client";

import React from "react";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'ghost';
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, className = "", loading = false, variant = 'primary', ...props }) => {
  const common = "inline-flex items-center justify-center font-semibold rounded-pill px-4 py-2 min-h-[44px] transition-transform duration-[120ms] focus:outline-none";
  if (variant === 'ghost') {
    return (
      <button
        {...props}
        className={`${common} bg-transparent border border-white/6 text-white hover:bg-white/5 ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      {...props}
      aria-busy={loading}
      className={`${common} bg-gradient-to-br from-[var(--brand-primary-1)] to-[var(--brand-primary-2)] shadow-brand-elev-1 text-[var(--text-100)] transform active:scale-[0.985] ${className}`}
      disabled={loading || props.disabled}
    >
      {loading ? <svg className="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"></circle></svg> : null}
      <span>{children}</span>
    </button>
  );
};

export default PrimaryButton;