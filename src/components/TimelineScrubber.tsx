import React, { useRef, useState, useEffect, useCallback } from 'react';

interface TimelineScrubberProps {
  years: string[];
  activeYear: string | null;
  onSelectYear: (year: string) => void;
}

const TimelineScrubber: React.FC<TimelineScrubberProps> = ({ years, activeYear, onSelectYear }) => {
  const scrubberRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const handleInteraction = useCallback((clientY: number) => {
    if (!scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const percent = Math.max(0, Math.min(1, relativeY / rect.height));
    const index = Math.floor(percent * years.length);
    const selectedYear = years[index];
    if (selectedYear && selectedYear !== activeYear) {
      onSelectYear(selectedYear);
    }
  }, [scrubberRef, years, onSelectYear, activeYear]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsScrubbing(true);
    handleInteraction(e.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isScrubbing) {
      handleInteraction(e.clientY);
    }
  }, [isScrubbing, handleInteraction]);

  const handleMouseUp = useCallback(() => {
    setIsScrubbing(false);
  }, []);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsScrubbing(true);
    handleInteraction(e.touches[0].clientY);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isScrubbing) {
      e.preventDefault();
      handleInteraction(e.touches[0].clientY);
    }
  }, [isScrubbing, handleInteraction]);

  const handleTouchEnd = useCallback(() => {
    setIsScrubbing(false);
  }, []);

  useEffect(() => {
    if (isScrubbing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isScrubbing, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <div 
      ref={scrubberRef}
      className="relative w-full h-full flex items-center cursor-ew-resize"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-gray-700/50 rounded-full"></div>
      <div className="relative w-full h-full flex flex-col justify-between items-center py-2">
        {years.map(year => (
          <div key={year} className="relative flex items-center z-10">
            <div className={`w-2 h-2 rounded-full transition-all duration-200 ${activeYear === year ? 'bg-amber-400 scale-150' : 'bg-gray-600'}`}></div>
            <span className={`absolute right-full mr-4 text-sm font-bold transition-all duration-200 pointer-events-none ${activeYear === year ? 'text-white opacity-100 scale-100' : 'text-gray-500 opacity-0 scale-90'}`}>
              {year}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineScrubber;