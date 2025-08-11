import React from 'react';

interface ValueSelectorProps {
  label: string;
  options: (string | number)[];
  value: string | number;
  onChange: (newValue: string | number) => void;
  unit?: string;
  disabled?: boolean;
}

const ValueSelector: React.FC<ValueSelectorProps> = ({ label, options, value, onChange, unit, disabled = false }) => {
  const currentIndex = options.findIndex(opt => opt === value);

  const handleSelect = (selectedValue: string | number) => {
    if (!disabled && options.includes(selectedValue)) {
      onChange(selectedValue);
    }
  };

  const prevValue = currentIndex > 0 ? options[currentIndex - 1] : ' ';
  const currentValue = options[currentIndex] ?? value;
  const nextValue = currentIndex < options.length - 1 ? options[currentIndex + 1] : ' ';

  return (
    <div className="bg-neutral-900 rounded-xl p-3 w-full text-center select-none">
      <p className="text-neutral-500 text-xs font-bold tracking-widest uppercase mb-2">{label}</p>
      <div className="flex items-center justify-between h-10">
        <button
          onClick={() => handleSelect(prevValue)}
          disabled={disabled || currentIndex <= 0}
          className="text-neutral-500 text-lg w-1/3 disabled:opacity-20 transition-opacity"
        >
          {prevValue}
        </button>
        <div className="w-1/3">
          <p className="text-yellow-400 font-bold text-xl">{currentValue}</p>
          {unit && <p className="text-yellow-400 text-xs font-light -mt-1">{unit}</p>}
        </div>
        <button
          onClick={() => handleSelect(nextValue)}
          disabled={disabled || currentIndex >= options.length - 1}
          className="text-neutral-500 text-lg w-1/3 disabled:opacity-20 transition-opacity"
        >
          {nextValue}
        </button>
      </div>
    </div>
  );
};

export default ValueSelector;