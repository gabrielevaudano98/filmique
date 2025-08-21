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
      className="relative grid w-full p-1 bg-white/60 dark:bg-neutral-900/70 border border-white/30 dark:border-neutral-800 rounded-xl backdrop-blur-lg shadow-none"
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {/* Sliding Pill Background */}
      <div
        className="absolute top-1 bottom-1 h-auto rounded-lg bg-white/80 dark:bg-neutral-700/80 border border-white/40 dark:border-white/10 transition-all duration-300 ease-[cubic-bezier(0.2,1,0.35,1)]"
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
              ? 'text-black dark:text-white'
              : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white'
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