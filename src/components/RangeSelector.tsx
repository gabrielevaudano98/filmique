import React, { useRef, useEffect } from 'react';

interface RangeSelectorProps {
  options: (string | number)[];
  value: string | number;
  onChange: (newValue: string | number) => void;
  type: 'aperture' | 'shutterSpeed' | 'iso' | 'focus';
}

const majorApertures = [
  'f/1.0', 'f/1.4', 'f/2.0', 'f/2.8', 'f/4.0', 'f/5.6', 'f/8.0', 'f/11', 'f/16', 'f/22', 'f/32'
];

const majorShutterSpeeds = [
  '1', '1/2', '1/4', '1/8', '1/15', '1/30', '1/60', '1/125', '1/250', '1/500', '1/1000', '1/2000', '1/4000', '1/8000'
];

const isMajorStop = (val: string | number, type: RangeSelectorProps['type']) => {
  const stringValue = typeof val === 'number' ? val.toString() : val;
  if (type === 'aperture') {
    return majorApertures.includes(stringValue);
  } else if (type === 'shutterSpeed') {
    return majorShutterSpeeds.includes(stringValue);
  }
  // For ISO and Focus, all options are treated as major stops for line height
  return true;
};

const getLineHeightClass = (opt: string | number, type: RangeSelectorProps['type']): string => {
  if (isMajorStop(opt, type)) {
    return 'h-4'; // Full stop
  }
  return 'h-2'; // 1/3 stop
};

const getLineMarginClass = (opt: string | number): string => {
  return 'mt-1';
};

const RangeSelector: React.FC<RangeSelectorProps> = ({ options, value, onChange, type }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to the active value when it changes (e.g., by click or initial load)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // Use a small timeout to ensure elements are rendered and measured correctly
      const timeoutId = setTimeout(() => {
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
      }, 50); // Small delay
      return () => clearTimeout(timeoutId);
    }
  }, [value, options]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const containerCenter = container.scrollLeft + container.offsetWidth / 2;
    let closestOptionValue: string | number | null = null;
    let minDistance = Infinity;

    const optionElements = container.querySelectorAll<HTMLElement>('[data-value]');

    optionElements.forEach(element => {
      const elementCenter = element.offsetLeft + element.offsetWidth / 2;
      const distance = Math.abs(elementCenter - containerCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestOptionValue = element.dataset.value!;
      }
    });

    if (closestOptionValue !== null) {
      // Convert back to original type if original option was number
      const originalOption = options.find(opt => opt.toString() === closestOptionValue);
      if (originalOption !== undefined && originalOption !== value) { // Only call onChange if value actually changed
        onChange(originalOption);
      }
    }
  };

  // Calculate padding based on the new button width (w-0.5 = 2px, half is 1px)
  const paddingX = 'px-[calc(50%-1px)]'; // Adjusted for w-0.5 button width

  return (
    <div className="relative w-full h-20 flex items-center">
      {/* Center Marker */}
      <div className="absolute left-1/2 -translate-x-1/2 top-2 z-10 flex flex-col items-center pointer-events-none">
        <span className="text-amber-400 font-bold text-sm font-mono">{value.toString().replace('f/','')}</span>
        <div className="w-0.5 h-6 bg-amber-400 rounded-full mt-1"></div>
      </div>

      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto no-scrollbar flex items-center h-full scroll-smooth snap-x snap-mandatory" // Added scroll-snap properties
        onScroll={handleScroll}
      >
        {/* Padding to allow first/last items to center. Half of button width (w-0.5 = 2px, half is 1px) */}
        <div className={`flex items-center h-full ${paddingX}`}>
          {options.map((opt, i) => (
            <button
              key={i}
              data-value={opt}
              onClick={() => {
                onChange(opt);
              }}
              className="relative flex flex-col items-center justify-end h-full w-0.5 flex-shrink-0 group focus:outline-none snap-center" // Increased width to w-0.5 and added snap-center
            >
              <div className={`w-px ${getLineHeightClass(opt, type)} ${getLineMarginClass(opt)} ${opt === value ? 'bg-amber-400' : 'bg-gray-500'}`}></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RangeSelector;
