import React from 'react';

interface SegmentedControlProps {
  options: { label: string; value: string; }[];
  value: string;
  onChange: (value: string) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange }) => {
  const activeIndex = options.findIndex(opt => opt.value === value);

  return (
    <div className="relative flex w-full p-1 bg-neutral-800 rounded-full">
      {/* Sliding background */}
      <div
        className="absolute top-1 bottom-1 h-auto bg-neutral-600 rounded-full transition-all duration-300 ease-spring-soft"
        style={{
          width: `calc(${100 / options.length}% - 4px)`,
          transform: `translateX(${activeIndex * 100}%)`,
          margin: '0 2px',
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