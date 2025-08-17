import React from 'react';

interface TextSegmentedControlProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

const TextSegmentedControl: React.FC<TextSegmentedControlProps> = ({ options, value, onChange }) => (
  <div className="flex w-full p-1 bg-neutral-700/50 rounded-lg">
    {options.map(opt => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`flex-1 py-2 text-sm font-medium text-center transition-colors rounded-md ${
          value === opt.value ? 'bg-neutral-600 text-white' : 'text-gray-300 hover:text-white'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export default TextSegmentedControl;