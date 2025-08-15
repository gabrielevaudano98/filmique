import React from 'react';

interface SegmentedControlProps {
  options: { label: string; value: string; }[];
  value: string;
  onChange: (value: string) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange }) => {
  return (
    <div className="flex w-full p-1 bg-neutral-900/70 border border-neutral-800 rounded-xl">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`relative z-10 flex-1 py-3 text-sm font-bold text-center transition-all duration-300 rounded-lg
            ${value === opt.value
              ? 'bg-neutral-700 text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]'
              : 'text-gray-400 hover:bg-neutral-800/50'
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