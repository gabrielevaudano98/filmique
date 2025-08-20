import React from 'react';

interface LoadingIndicatorProps {
  size?: number;
  text?: string;
  className?: string;
  ariaLabel?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ size = 48, text, className = '', ariaLabel = 'Loading' }) => {
  const svgSize = Math.max(40, size);
  const partSize = svgSize * 0.32; // size for each quadrant piece

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      className={`camera-loader-container inline-flex items-center gap-3 ${className}`}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="camera-loader-svg"
      >
        {/* soft glass background circle */}
        <defs>
          <linearGradient id="cg-grad" x1="0" x2="1">
            <stop offset="0%" stopColor="rgba(246,174,85,0.12)" />
            <stop offset="100%" stopColor="rgba(124,106,254,0.08)" />
          </linearGradient>
          <filter id="cg-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feBlend in="SourceGraphic" in2="b" mode="screen" />
          </filter>
        </defs>

        {/* outer glass ring */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={svgSize * 0.48}
          fill="url(#cg-grad)"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={2}
          className="camera-loader-glass"
        />

        {/* four animated panels positioned around center (TL, TR, BR, BL) */}
        <g transform={`translate(${(svgSize - partSize) / 2}, ${(svgSize - partSize) / 2})`}>
          {/* top-left */}
          <rect
            x={-partSize * 0.6}
            y={-partSize * 0.6}
            rx={Math.max(2, partSize * 0.12)}
            width={partSize}
            height={partSize}
            className="camera-loader-part camera-loader-part-1"
            fill="rgba(255,255,255,0.06)"
          />
          {/* top-right */}
          <rect
            x={partSize * 0.6}
            y={-partSize * 0.6}
            rx={Math.max(2, partSize * 0.12)}
            width={partSize}
            height={partSize}
            className="camera-loader-part camera-loader-part-2"
            fill="rgba(255,255,255,0.06)"
          />
          {/* bottom-right */}
          <rect
            x={partSize * 0.6}
            y={partSize * 0.6}
            rx={Math.max(2, partSize * 0.12)}
            width={partSize}
            height={partSize}
            className="camera-loader-part camera-loader-part-3"
            fill="rgba(255,255,255,0.06)"
          />
          {/* bottom-left */}
          <rect
            x={-partSize * 0.6}
            y={partSize * 0.6}
            rx={Math.max(2, partSize * 0.12)}
            width={partSize}
            height={partSize}
            className="camera-loader-part camera-loader-part-4"
            fill="rgba(255,255,255,0.06)"
          />
        </g>

        {/* center lens glow */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={svgSize * 0.14}
          fill="rgba(255,255,255,0.12)"
          className="camera-loader-lens"
        />
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={svgSize * 0.06}
          fill="rgba(255,255,255,0.92)"
          className="camera-loader-lens-core"
        />
      </svg>

      {text && <span className="text-sm text-gray-300 select-none">{text}</span>}
    </div>
  );
};

export default LoadingIndicator;