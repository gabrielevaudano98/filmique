import React from 'react';

interface FocusControlProps {
  value: number; // 0 to 1
  onChange: (newValue: number) => void;
}

const FocusControl: React.FC<FocusControlProps> = ({ value, onChange }) => {
  const bars = Array.from({ length: 30 });

  return (
    <div className="bg-neutral-900 rounded-xl p-4 w-full h-full flex flex-col relative">
      <p className="text-neutral-500 text-xs font-bold tracking-widest uppercase mb-3 text-center">Focus</p>
      <div className="flex-1 flex items-end justify-between w-full">
        {bars.map((_, i) => {
          const barValue = i / (bars.length - 1);
          const isActive = barValue <= value;
          const height = 4 + (Math.sin(barValue * Math.PI) * 48);
          return (
            <div key={i} className="w-px" style={{ height: `${height}px` }}>
              <div className={`h-full w-full transition-colors ${isActive ? 'bg-white' : 'bg-neutral-700'}`}></div>
            </div>
          );
        })}
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-full absolute inset-0 opacity-0 cursor-pointer"
      />
    </div>
  );
};

export default FocusControl;