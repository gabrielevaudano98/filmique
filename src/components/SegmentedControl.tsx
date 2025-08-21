import React from 'react';

interface SegmentedControlProps {
  options: { 
    label?: string; 
    value: string; 
    icon: React.ElementType;
    colors: { from: string; to: string; shadow: string; };
    description?: string;
  }[];
  value: string;
  onChange: (value: string) => void;
  theme?: 'light' | 'dark';
  hideLabels?: boolean;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  theme = 'dark',
  hideLabels,
}) => {
  const activeIndex = options.findIndex(opt => opt.value === value);
  const isLight = theme === 'light' || (typeof window !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light');

  // More glassy, premium, and spaced
  const indicatorClass = isLight
    ? "bg-white/80 border border-white/60 backdrop-blur-[18px]"
    : "bg-neutral-800/80 border border-white/10 backdrop-blur-[18px]";
  const wrapperClass = isLight
    ? "relative grid w-full px-2 py-2 bg-white/50 border border-white/40 rounded-full backdrop-blur-[18px]"
    : "relative grid w-full px-2 py-2 bg-neutral-800/50 border border-white/10 rounded-full backdrop-blur-[18px]";

  return (
    <div
      className={wrapperClass}
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {/* Sliding Pill Indicator */}
      <div
        className={`absolute top-1 left-0 bottom-1 w-full h-auto rounded-full transition-all duration-300 ease-[cubic-bezier(0.2,1,0.35,1)] ${indicatorClass}`}
        style={{
          gridColumn: `${activeIndex + 1}`,
          zIndex: 1,
          boxShadow: isLight
            ? '0 1.5px 8px rgba(0,0,0,0.04)'
            : '0 1.5px 8px rgba(0,0,0,0.10)',
          filter: 'blur(0.5px)',
        }}
      />
      {options.map((opt, idx) => {
        const Icon = opt.icon;
        const isActive = value === opt.value;
        const shouldShowLabel = !hideLabels && opt.label && opt.label.length > 0;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 flex-1 text-base font-bold text-center transition-colors duration-200 rounded-full flex items-center justify-center
              ${shouldShowLabel ? 'py-2 gap-2' : 'p-2'}
              ${isActive
                ? isLight
                  ? 'text-black'
                  : 'text-white'
                : isLight
                  ? 'text-neutral-500 hover:text-black'
                  : 'text-gray-300 hover:text-white'
              }`}
            style={{
              background: 'none',
              boxShadow: 'none',
              fontWeight: isActive ? 700 : 500,
              minHeight: '44px',
              minWidth: shouldShowLabel ? '90px' : '44px',
              letterSpacing: '0.01em',
            }}
            aria-label={opt.label || opt.description || opt.value}
          >
            {Icon && <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />}
            {shouldShowLabel && <span>{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;