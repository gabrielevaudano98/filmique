import React from 'react';

interface SegmentedControlProps {
  options: { label: string; value: string; }[];
  value: string;
  onChange: (value: string) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange }) => {
  return (
    <div className="flex w-full p-1 bg-neutral-800/50 border border-neutral-700/50 rounded-xl backdrop-blur-sm">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`relative z-10 flex-1 py-3 text-sm font-bold text-center transition-all duration-300 rounded-lg
            ${value === opt.value
              ? 'bg-gradient-to-r from-brand-orange-start to-brand-orange-end text-white shadow-md shadow-black/20'
              : 'text-gray-400 hover:bg-neutral-700/50'
            }
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;