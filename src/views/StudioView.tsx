import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../types';
import { Film, Archive, Lock } from 'lucide-react';
import DevelopingRollCard from '../components/DevelopingRollCard';
import PrintsView from '../components/PrintsView';
import DarkroomEmptyState from '../components/DarkroomEmptyState';
import SegmentedControl from '../components/SegmentedControl';
import LibraryView from '../components/LibraryView'; // Import LibraryView

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const StudioView: React.FC = () => {
  const { 
    profile,
    developingRolls,
    studioSection, setStudioSection, studioSectionOptions,
    setIsStudioHeaderSticky,
  } = useAppContext();

  const observerTriggerRef = useRef<HTMLDivElement>(null);
  const prevSection = usePrevious(studioSection);

  const availableSections = useMemo(() => {
    if (profile?.experience_mode === 'digital') {
      return studioSectionOptions.filter(opt => opt.value !== 'prints');
    }
    return studioSectionOptions;
  }, [profile, studioSectionOptions]);

  const sectionOrder = useMemo(() => availableSections.map(opt => opt.value), [availableSections]);

  const direction = useMemo(() => {
    if (!prevSection) return 'right';
    const prevIndex = sectionOrder.indexOf(prevSection);
    const currentIndex = sectionOrder.indexOf(studioSection);
    if (prevIndex === -1 || currentIndex === -1) return 'right';
    return currentIndex > prevIndex ? 'left' : 'right';
  }, [studioSection, prevSection, sectionOrder]);

  const animationClass = direction === 'left' ? 'animate-slide-in-from-right' : 'animate-slide-in-from-left';

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStudioHeaderSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" } // 80px is h-20
    );

    const currentTriggerRef = observerTriggerRef.current;
    if (currentTriggerRef) observer.observe(currentTriggerRef);
    return () => {
      if (currentTriggerRef) observer.unobserve(currentTriggerRef);
    };
  }, [setIsStudioHeaderSticky]);

  useEffect(() => {
    if (!sectionOrder.includes(studioSection)) {
      setStudioSection(sectionOrder[0] as any);
    }
  }, [sectionOrder, setStudioSection, studioSection]);

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentIndex = sectionOrder.indexOf(studioSection);
    if (direction === 'left' && currentIndex < sectionOrder.length - 1) {
        setStudioSection(sectionOrder[currentIndex + 1] as any);
    } else if (direction === 'right' && currentIndex > 0) {
        setStudioSection(sectionOrder[currentIndex - 1] as any);
    }
  };

  const swipeHandlers = useSwipeable({
      onSwipedLeft: () => handleSwipe('left'),
      onSwipedRight: () => handleSwipe('right'),
      // Allow the browser to keep handling vertical scrolling for best UX on mobile
      preventScrollOnSwipe: false,
      preventDefaultTouchmoveEvent: false,
      trackMouse: true,
      trackTouch: true,
  });

  const getTitleForStudioSection = (section: typeof studioSection) => {
    switch (section) {
      case 'albums': return 'Albums';
      case 'darkroom': return 'Darkroom';
      case 'prints': return 'Prints';
      default: return 'Studio';
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div ref={observerTriggerRef} className="flex items-center justify-between pt-0 pb-6">
        <h1 className="text-3xl font-bold text-white">{getTitleForStudioSection(studioSection)}</h1>
        <div className="w-auto">
          <SegmentedControl
            options={availableSections}
            value={studioSection}
            onChange={(val) => setStudioSection(val as any)}
            hideLabels={true}
          />
        </div>
      </div>

      <div {...swipeHandlers} className="relative flex-1">
        <div key={studioSection} className={animationClass}>
          {studioSection === 'darkroom' && (
            <div>
              {developingRolls.length > 0 ? (
                <div className="space-y-3">
                  {developingRolls.map(roll => <DevelopingRollCard key={roll.id} roll={roll} />)}
                </div>
              ) : <DarkroomEmptyState />}
            </div>
          )}

          {studioSection === 'albums' && (
            <div className="pt-2">
              <LibraryView />
            </div>
          )}

          {studioSection === 'prints' && (
            <div>
              <PrintsView />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudioView;