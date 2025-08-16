import React from 'react';

interface SegmentedControlProps {
  options: { 
    label: string; 
    value: string; 
    icon: React.ElementType;
  }[];
  value: string;
  onChange: (value: string) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange }) => {
  const activeIndex = options.findIndex(opt => opt.value === value);

  return (
    <div 
      className="relative grid w-full p-1 bg-neutral-800/60 backdrop-blur-lg border border-neutral-700/50 rounded-full shadow-inner gap-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {/* Sliding Pill Background */}
      <div
        className="h-full rounded-full bg-neutral-700 shadow-md transition-all duration-300 ease-spring-soft"
        style={{
          gridColumn: `${activeIndex + 1}`,
        }}
      />
      
      {options.map((opt, index) => {
        const Icon = opt.icon;
        const isActive = value === opt.value;

        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 flex-1 py-2.5 text-sm font-bold text-center transition-colors duration-300 rounded-full flex items-center justify-center gap-2
              ${isActive
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
              }
            `}
            style={{ gridRow: 1, gridColumn: index + 1 }}
          >
            <Icon className="w-5 h-5" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;