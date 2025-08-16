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
  return (
    <div className="flex items-center justify-center gap-4">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = value === opt.value;
        const gradientClass = `bg-gradient-to-br ${opt.colors.from} ${opt.colors.to}`;
        const shadowClass = `shadow-lg ${opt.colors.shadow}`;

        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ease-spring-soft
              ${isActive
                ? `${gradientClass} ${shadowClass} scale-110 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] border-2 border-white/50`
                : 'bg-black/30 backdrop-blur-lg border border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] hover:bg-white/10'
              }
            `}
          >
            <Icon className={`w-7 h-7 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400'}`} />
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;