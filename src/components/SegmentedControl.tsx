import React from 'react';

interface SegmentedControlProps {
  options: { 
    label?: string; 
    value: string; 
    icon: React.ElementType;
    colors: { from: string; to: string; shadow: string; };
  }[];
  value: string;
  onChange: (value: string) => void;
  theme?: 'light' | 'dark';
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange, theme = 'dark' }) => {
  const activeIndex = options.findIndex(opt => opt.value === value);
  const activeOption = options[activeIndex];
  const isLight = theme === 'light';

  const gradientClass = activeOption ? `bg-gradient-to-r ${activeOption.colors.from} ${activeOption.colors.to}` : '';
  const shadowClass = activeOption ? `shadow-lg ${activeOption.colors.shadow}` : '';

  const wrapperClasses = isLight
    ? "relative grid w-full p-1.5 bg-neutral-200/80 backdrop-blur-lg border border-neutral-300/50 rounded-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] gap-2"
    : "relative grid w-full p-1.5 bg-neutral-800/60 backdrop-blur-lg border border-neutral-700/50 rounded-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] gap-2";

  return (
    <div 
      className={wrapperClasses}
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {/* Sliding Pill Background */}
      <div
        className={`absolute top-1.5 bottom-1.5 h-auto rounded-lg ${gradientClass} ${shadowClass} shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] border border-white/20 transition-all duration-500 ease-[cubic-bezier(0.2,1,0.35,1)]`}
        style={{
          gridColumn: `${activeIndex + 1}`,
        }}
      />
      
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = value === opt.value;
        const hasLabel = opt.label && opt.label.length > 0;

        const buttonClasses = `relative z-10 flex-1 text-sm font-bold text-center transition-all duration-300 rounded-lg flex items-center justify-center
          ${hasLabel ? 'py-3 gap-2' : 'p-2.5'}
          ${isActive
            ? 'text-white'
            : isLight
            ? 'text-neutral-800 hover:text-black bg-white/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] hover:bg-white/70'
            : 'text-gray-300 hover:text-white bg-neutral-900/50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] hover:bg-white/10'
          }`;

        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={buttonClasses}
          >
            {Icon && <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />}
            {hasLabel && <span>{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;