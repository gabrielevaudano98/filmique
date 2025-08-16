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
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange }) => {
  const activeIndex = options.findIndex(opt => opt.value === value);
  const activeOption = options[activeIndex];

  const gradientClass = activeOption ? `bg-gradient-to-r ${activeOption.colors.from} ${activeOption.colors.to}` : '';
  const shadowClass = activeOption ? `shadow-lg ${activeOption.colors.shadow}` : '';

  return (
    <div 
      className="relative grid w-full p-1.5 bg-neutral-800/60 backdrop-blur-lg border border-neutral-700/50 rounded-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] gap-2" 
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

        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 flex-1 text-sm font-bold text-center transition-all duration-300 rounded-lg flex items-center justify-center
              ${hasLabel ? 'py-3 gap-2' : 'p-2.5'}
              ${isActive
                ? 'text-white'
                // Inactive state with its own background and inset shadow
                : 'text-gray-300 hover:text-white bg-neutral-900/50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] hover:bg-white/10'
              }
            `}
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