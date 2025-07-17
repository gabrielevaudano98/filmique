import React, { useRef, useEffect } from 'react';

interface RangeSelectorProps {
  options: (string | number)[];
  value: string | number;
  onChange: (newValue: string | number) => void;
}

const RangeSelector: React.FC<RangeSelectorProps> = ({ options, value, onChange }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const activeElement = container.querySelector(`[data-value="${value}"]`) as HTMLElement;
      if (activeElement) {
        const containerWidth = container.offsetWidth;
        const elementLeft = activeElement.offsetLeft;
        const elementWidth = activeElement.offsetWidth;
        
        const scrollTarget = elementLeft - (containerWidth / 2) + (elementWidth / 2);
        
        container.scrollTo({
          left: scrollTarget,
          behavior: 'smooth'
        });
      }
    }
  }, [value, options]);

  return (
    <div className="relative w-full h-20 flex items-center">
      {/* Center Marker */}
      <div className="absolute left-1/2 -translate-x-1/2 top-2 z-10 flex flex-col items-center pointer-events-none">
        <span className="text-amber-400 font-bold text-sm font-mono">{value.toString().replace('f/','')}</span>
        <div className="w-0.5 h-6 bg-amber-400 rounded-full mt-1"></div>
      </div>

      <div ref={scrollContainerRef} className="w-full overflow-x-auto no-scrollbar flex items-center h-full">
        {/* Padding to allow first/last items to center. 5rem is half of w-40 */}
        <div className="flex items-center h-full px-[calc(50%-3rem)]"> 
          {options.map((opt, i) => (
            <button
              key={i}
              data-value={opt}
              onClick={() => onChange(opt)}
              className="relative flex flex-col items-center justify-end h-full w-24 flex-shrink-0 group focus:outline-none"
            >
              {/* Third-Stop Indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[1px] h-1 bg-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[1px] h-1 bg-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <span className="text-xs text-neutral-400 font-mono group-hover:text-white transition-colors">{opt.toString().replace('f/','')}</span>
              <div className="w-px h-4 bg-neutral-600 mt-1"></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RangeSelector;
