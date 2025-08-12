"use client";

import React from "react";

const BrandLogo: React.FC<{ compact?: boolean; className?: string }> = ({ compact = false, className }) => {
  return (
    <div className={`flex items-center space-x-3 ${className || ''}`}>
      {/* Monogram */}
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <defs>
          <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#EFA15A" />
            <stop offset="1" stopColor="#D46A2E" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="36" height="36" rx="8" fill="url(#g1)"/>
        <g transform="translate(6,6)" fill="#fff">
          {/* Simple three-blade aperture silhouette */}
          <path d="M6 0 L11 0 L9 6 Z" opacity="0.95" transform="rotate(0 8 8)" />
          <path d="M6 0 L11 0 L9 6 Z" opacity="0.9" transform="rotate(120 8 8)" />
          <path d="M6 0 L11 0 L9 6 Z" opacity="0.85" transform="rotate(240 8 8)" />
        </g>
      </svg>

      {!compact && (
        <div className="leading-none">
          <div className="text-sm font-semibold" style={{ letterSpacing: "-0.02em", color: "var(--text-100)" }}>
            <span style={{ color: "var(--brand-primary-1)" }}>Fil</span>mique
          </div>
          <div className="text-xs text-gray-400 -mt-0.5">Vintage roll & community</div>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;