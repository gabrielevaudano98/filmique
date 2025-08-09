import React, { useState, useRef, useEffect, useCallback } from 'react';

interface FastScrollerProps {
  scrollContainerRef: React.RefObject<HTMLElement>;
  groupHeaderRefs: React.RefObject<{ [key: string]: HTMLElement | null }>;
}

const FastScroller: React.FC<FastScrollerProps> = ({ scrollContainerRef, groupHeaderRefs }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [handleTop, setHandleTop] = useState(0);
  const [tooltipText, setTooltipText] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  
  const groupKeys = Object.keys(groupHeaderRefs.current || {});

  const updateHandlePosition = useCallback(() => {
    if (scrollContainerRef.current && scrollerRef.current && handleRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const scrollableHeight = scrollHeight - clientHeight;
      if (scrollableHeight > 0) {
        const scrollerHeight = scrollerRef.current.clientHeight;
        const handleHeight = handleRef.current.clientHeight;
        const position = (scrollTop / scrollableHeight) * (scrollerHeight - handleHeight);
        setHandleTop(position);
      }
    }
  }, [scrollContainerRef]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimeout: number;
    const handleScroll = () => {
      if (!isDragging) {
        updateHandlePosition();
      }
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => setIsScrolling(false), 200);
    };

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateHandlePosition);
    
    // Set initial position after a short delay to allow layout to settle
    setTimeout(updateHandlePosition, 100);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateHandlePosition);
      clearTimeout(scrollTimeout);
    };
  }, [scrollContainerRef, updateHandlePosition, isDragging]);

  const getTooltipTextForPosition = (scrollTop: number): string => {
    const headers = groupHeaderRefs.current;
    if (!headers) return '';
    
    let currentHeaderText = groupKeys[0] || '';
    // Iterate backwards to find the last header that is above the viewport's top
    for (let i = groupKeys.length - 1; i >= 0; i--) {
      const key = groupKeys[i];
      const headerEl = headers[key];
      if (headerEl && headerEl.offsetTop <= scrollTop + 20) { // +20 for a small offset
        currentHeaderText = key;
        break;
      }
    }
    return currentHeaderText;
  };

  const handleDrag = useCallback((e: MouseEvent) => {
    if (!scrollerRef.current || !scrollContainerRef.current) return;
    
    const scrollerBounds = scrollerRef.current.getBoundingClientRect();
    const handleHeight = handleRef.current!.clientHeight;
    
    let newHandleTop = e.clientY - scrollerBounds.top - (handleHeight / 2);
    newHandleTop = Math.max(0, Math.min(newHandleTop, scrollerBounds.height - handleHeight));
    
    setHandleTop(newHandleTop);
    
    const scrollPercentage = newHandleTop / (scrollerBounds.height - handleHeight);
    const { scrollHeight, clientHeight } = scrollContainerRef.current;
    const newScrollTop = scrollPercentage * (scrollHeight - clientHeight);
    
    scrollContainerRef.current.scrollTop = newScrollTop;
    setTooltipText(getTooltipTextForPosition(newScrollTop));
  }, [scrollContainerRef, groupHeaderRefs]);

  const stopDrag = useCallback(() => {
    setIsDragging(false);
    setTooltipText(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', stopDrag);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', stopDrag);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleDrag, stopDrag]);

  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setTooltipText(getTooltipTextForPosition(scrollContainerRef.current?.scrollTop || 0));
  };

  const isVisible = (scrollContainerRef.current?.scrollHeight || 0) > (scrollContainerRef.current?.clientHeight || 0);

  if (!isVisible) return null;

  return (
    <div 
      ref={scrollerRef}
      className={`absolute top-0 right-0 h-full w-8 flex justify-center items-center transition-opacity duration-300 z-20 ${isScrolling || isDragging ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="relative h-full w-1 bg-gray-700/50 rounded-full">
        <div
          ref={handleRef}
          onMouseDown={startDrag}
          className="absolute w-4 h-10 -left-[6px] bg-gray-400 rounded-full cursor-pointer transition-transform duration-150"
          style={{ top: `${handleTop}px`, transform: isDragging ? 'scale(1.2)' : 'scale(1)' }}
        ></div>
      </div>
      {tooltipText && isDragging && (
        <div 
          className="absolute right-10 bg-gray-600 text-white text-sm font-semibold px-3 py-1 rounded-lg shadow-lg whitespace-nowrap"
          style={{ top: `${handleTop}px` }}
        >
          {tooltipText}
        </div>
      )}
    </div>
  );
};

export default FastScroller;