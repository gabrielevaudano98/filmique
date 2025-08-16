import React from 'react';

interface SegmentedControlProps {
  options: { label?: string; value: string; icon: React.ElementType }[];
  value: string;
  onChange: (value: string) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange }) => {
  const activeIndex = options.findIndex(opt => opt.value === value);

  return (
    <div 
      className="relative grid w-full p-1 bg-neutral-900/70 backdrop-blur-lg border border-neutral-800 rounded-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" 
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {/* Sliding Pill Background */}
      <div
        className="absolute top-1 bottom-1 h-auto rounded-lg bg-gradient-to-r from-brand-amber-start to-brand-amber-end shadow-lg shadow-brand-amber-start/20 transition-all duration-300 ease-spring-soft"
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
            className={`relative z-10 flex-1 text-sm font-bold text-center transition-colors duration-300 rounded-lg flex items-center justify-center
              ${hasLabel ? 'py-3 gap-2' : 'p-2.5'}
              ${isActive
                ? 'text-black'
                : 'text-gray-300 hover:text-white'
              }
            `}
          >
            {Icon && <Icon className="w-5 h-5" />}
            {hasLabel && <span>{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;