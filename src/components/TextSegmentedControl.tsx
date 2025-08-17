import React from 'react';

interface TextSegmentedControlProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

const TextSegmentedControl: React.FC<TextSegmentedControlProps> = ({ options, value, onChange }) => {
  const activeIndex = options.findIndex(opt => opt.value === value);

  return (
    <div
      className="relative grid w-full p-1 bg-neutral-900/70 border border-neutral-800 rounded-xl"
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {/* Sliding Pill Background */}
      <div
        className="absolute top-1 bottom-1 h-auto rounded-lg bg-gradient-to-r from-neutral-600 to-neutral-700 shadow-lg shadow-black/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/10 transition-all duration-300 ease-[cubic-bezier(0.2,1,0.35,1)]"
        style={{
          gridColumn: `${activeIndex + 1}`,
        }}
      />
      
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`relative z-10 flex-1 py-2 text-sm font-bold text-center transition-colors duration-300 rounded-lg
            ${value === opt.value
              ? 'text-white'
              : 'text-gray-300 hover:text-white'
            }
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default TextSegmentedControl;