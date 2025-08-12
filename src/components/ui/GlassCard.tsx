"use client";

import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", header }) => {
  return (
    <div className={`backdrop-blur-[var(--glass-blur)] bg-[rgba(255,255,255,var(--glass-alpha))] border border-[rgba(255,255,255,0.04)] rounded-lg shadow-brand-elev-1 overflow-hidden ${className}`}>
      {header && <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.03)]">{header}</div>}
      <div className="p-4">{children}</div>
    </div>
  );
};

export default GlassCard;