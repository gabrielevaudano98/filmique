import React from 'react';

interface SegmentedControlProps {
  options: { label: string; value: string; icon?: React.ElementType }[];
  value: string;
  onChange: (value: string) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange }) => {
  const activeIndex = options.findIndex(opt => opt.value === value);

  return (
    <div className="relative grid w-full p-1 bg-neutral-800/60 backdrop-blur-lg border border-white/10 rounded-xl" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {/* Sliding Pill Background */}
      <div
        className="absolute top-1 bottom-1 h-auto rounded-lg bg-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] transition-all duration-300 ease-spring-soft"
        style={{
          gridColumn: `${activeIndex + 1}`,
        }}
      />
      
      {options.map((opt) => {
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 flex-1 py-3 text-sm font-bold text-center transition-colors duration-300 rounded-lg flex items-center justify-center gap-2
              ${value === opt.value
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
              }
            `}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;