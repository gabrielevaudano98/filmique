import React from 'react';

interface SegmentedControlProps {
  options: { 
    label: string; 
    value: string; 
    icon: React.ElementType;
    colors: { from: string; to: string; shadow: string; };
  }[];
  value: string;
  onChange: (value: string) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange }) => {
  return (
    <div className="flex items-center justify-center p-1.5 bg-black/30 backdrop-blur-xl border border-white/10 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] space-x-1.5">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = value === opt.value;
        const gradientClass = `bg-gradient-to-br ${opt.colors.from} ${opt.colors.to}`;
        const shadowClass = `shadow-lg ${opt.colors.shadow}`;

        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.2,1,0.35,1)] overflow-hidden
              ${isActive
                ? `${gradientClass} ${shadowClass} w-36 h-14 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]`
                : 'w-14 h-14 bg-transparent text-gray-400 hover:text-white'
              }
            `}
          >
            <div className="flex items-center justify-center px-4">
              <Icon className={`w-6 h-6 flex-shrink-0 transition-colors duration-300 ${isActive ? 'text-white' : ''}`} />
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isActive ? 'max-w-xs' : 'max-w-0'}`}
              >
                <span 
                  className={`font-bold text-sm text-white whitespace-nowrap transition-opacity duration-200 ml-2 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                >
                  {opt.label}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;