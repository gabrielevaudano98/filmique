import React from 'react';

interface ExposureControlProps {
  value: number;
  onChange: (newValue: number) => void;
}

const ExposureControl: React.FC<ExposureControlProps> = ({ value, onChange }) => {
  const options = [-2, -1, 0, +1, +2];
  return (
    <div className="bg-neutral-900 rounded-xl p-2 flex items-center justify-center space-x-1">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`w-10 h-8 sm:w-12 sm:h-10 rounded-lg text-sm font-mono transition-colors ${
            value === opt ? 'bg-yellow-400 text-black font-bold' : 'text-white hover:bg-neutral-800'
          }`}
        >
          {opt > 0 ? `+${opt}` : opt}
        </button>
      ))}
    </div>
  );
};

export default ExposureControl;