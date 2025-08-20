import React from 'react';

interface LoadingIndicatorProps {
  size?: number;
  text?: string;
  className?: string;
  ariaLabel?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ size = 64, text, className = '', ariaLabel = 'Loading' }) => {
  const s = Math.max(44, size);
  const strokeWidth = Math.max(2, Math.round(s * 0.045));
  const cornerLen = s * 0.28; // length of corner strokes
  const inner = s * 0.42; // inner area for camera glyph

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      className={`camera-token-loader inline-flex items-center gap-3 ${className}`}
    >
      <svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="camera-token-svg"
      >
        <defs>
          <linearGradient id="loader-grad" x1="0" x2="1">
            <stop offset="0%" stopColor="rgba(246,174,85,0.95)" />
            <stop offset="60%" stopColor="rgba(233,138,67,0.9)" />
            <stop offset="100%" stopColor="rgba(124,106,254,0.85)" />
          </linearGradient>
          <filter id="loader-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={s * 0.02} result="b" />
            <feBlend in="SourceGraphic" in2="b" mode="screen" />
          </filter>
        </defs>

        {/* subtle glass background */}
        <rect
          x={strokeWidth}
          y={strokeWidth}
          width={s - strokeWidth * 2}
          height={s - strokeWidth * 2}
          rx={Math.round(s * 0.14)}
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.03)"
        />

        {/* Four corner stroke segments (bracket-like) */}
        {/* Top-left */}
        <path
          d={`M ${strokeWidth + cornerLen} ${strokeWidth} H ${strokeWidth + Math.min(cornerLen, s * 0.16)} A ${Math.max(4, s * 0.04)} ${Math.max(4, s * 0.04)} 0 0 0 ${strokeWidth} ${strokeWidth + Math.min(cornerLen, s * 0.16)} V ${strokeWidth + cornerLen}`}
          stroke="url(#loader-grad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="loader-corner loader-corner-1"
          fill="none"
        />
        {/* Top-right */}
        <path
          d={`M ${s - strokeWidth - cornerLen} ${strokeWidth} H ${s - strokeWidth - Math.min(cornerLen, s * 0.16)} A ${Math.max(4, s * 0.04)} ${Math.max(4, s * 0.04)} 0 0 1 ${s - strokeWidth} ${strokeWidth + Math.min(cornerLen, s * 0.16)} V ${strokeWidth + cornerLen}`}
          stroke="url(#loader-grad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="loader-corner loader-corner-2"
          fill="none"
        />
        {/* Bottom-right */}
        <path
          d={`M ${s - strokeWidth} ${s - strokeWidth - cornerLen} V ${s - strokeWidth - Math.min(cornerLen, s * 0.16)} A ${Math.max(4, s * 0.04)} ${Math.max(4, s * 0.04)} 0 0 1 ${s - strokeWidth - Math.min(cornerLen, s * 0.16)} ${s - strokeWidth} H ${s - strokeWidth - cornerLen}`}
          stroke="url(#loader-grad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="loader-corner loader-corner-3"
          fill="none"
        />
        {/* Bottom-left */}
        <path
          d={`M ${strokeWidth + cornerLen} ${s - strokeWidth} H ${strokeWidth + Math.min(cornerLen, s * 0.16)} A ${Math.max(4, s * 0.04)} ${Math.max(4, s * 0.04)} 0 0 0 ${strokeWidth} ${s - strokeWidth - Math.min(cornerLen, s * 0.16)} V ${s - strokeWidth - cornerLen}`}
          stroke="url(#loader-grad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="loader-corner loader-corner-4"
          fill="none"
        />

        {/* center camera glyph (rounded rectangle + lens) */}
        <g transform={`translate(${(s - inner) / 2}, ${(s - inner) / 2})`} filter="url(#loader-soft)">
          <rect
            x={0}
            y={0}
            width={inner}
            height={inner}
            rx={Math.round(inner * 0.18)}
            fill="rgba(12,12,14,0.52)"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={Math.max(1, Math.round(s * 0.01))}
          />
          {/* camera top hump */}
          <path
            d={`
              M ${inner * 0.12} ${inner * 0.28}
              h ${inner * 0.12}
              a ${inner * 0.06} ${inner * 0.06} 0 0 1 ${inner * 0.06} ${inner * 0.06}
              h ${inner * 0.28}
              a ${inner * 0.06} ${inner * 0.06} 0 0 1 ${inner * 0.06} -${inner * 0.06}
              h ${inner * 0.12}
            `}
            fill="rgba(255,255,255,0.02)"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={Math.max(1, Math.round(s * 0.01))}
            strokeLinecap="round"
          />
          {/* body rectangle */}
          <rect
            x={inner * 0.12}
            y={inner * 0.34}
            width={inner * 0.76}
            height={inner * 0.42}
            rx={Math.round(inner * 0.06)}
            fill="rgba(255,255,255,0.01)"
            stroke="rgba(255,255,255,0.06)"
          />
          {/* lens */}
          <circle
            cx={inner / 2}
            cy={inner * 0.55}
            r={inner * 0.14}
            fill="rgba(255,255,255,0.06)"
            className="loader-lens-core"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={Math.max(1, Math.round(s * 0.008))}
          />
          {/* small center bright dot */}
          <circle
            cx={inner / 2}
            cy={inner * 0.55}
            r={inner * 0.045}
            fill="rgba(255,255,255,0.9)"
            className="loader-lens-highlight"
          />
        </g>
      </svg>

      {text && <span className="text-sm text-gray-300 select-none">{text}</span>}
    </div>
  );
};

export default LoadingIndicator;