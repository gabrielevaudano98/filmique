import React from 'react';

interface SegmentedControlProps {
  options: { label: string; value: string; }[];
  value: string;
  onChange: (value: string) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange }) => {
  const activeIndex = options.findIndex(opt => opt.value === value);

  return (
    <div className="relative flex w-full p-1.5 bg-neutral-800/60 backdrop-blur-lg border border-neutral-700/50 rounded-full">
      {/* Sliding background */}
      <div
        className="absolute top-1.5 bottom-1.5 h-auto bg-gradient-to-r from-brand-amber-start to-brand-amber-end shadow-lg shadow-brand-amber-start/20 rounded-full transition-all duration-300 ease-spring-soft"
        style={{
          width: `calc(${100 / options.length}% - 6px)`,
          transform: `translateX(${activeIndex * 100}%)`,
          margin: '0 3px',
        }}
      />
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="relative z-10 flex-1 py-2.5 text-sm font-bold text-center transition-colors duration-300 text-white"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;