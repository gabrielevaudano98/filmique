import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../types';
import { Film, Archive, Lock, Library, Clock, Printer } from 'lucide-react'; // Added Library, Clock, Printer
import RollsControls from './RollsControls';
import ExpandableSearch from './ExpandableSearch';
import DevelopingRollCard from './DevelopingRollCard';
import PrintsView from './PrintsView';
import DarkroomEmptyState from './DarkroomEmptyState';
import SegmentedControl from './SegmentedControl';
import RollRow from './RollRow';
import StickyGroupHeader from './StickyGroupHeader';
import LibraryView from './LibraryView'; // Import LibraryView

const RollsEmptyState = () => (
    <div className="text-center py-24 text-neutral-500">
      <Film className="w-16 h-16 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white">Your Shelf is Empty</h3>
      <p className="mt-2">Developed rolls will appear here, ready to be viewed and organized.</p>
    </div>
);

const ArchivedEmptyState = () => (
  <div className="text-center py-24 text-neutral-500">
    <Archive className="w-16 h-16 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-white">No Archived Rolls</h3>
    <p className="mt-2">You can archive rolls from their detail page to store them here.</p>
  </div>
);

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const StudioView: React.FC = () => { // Renamed from RollsView
  const { 
    profile,
    developingRolls, completedRolls,
    // Removed rollsSortOrder, rollsGroupBy, rollsSelectedFilm, rollsViewMode,
    // Removed searchTerm, setSearchTerm, as they will be managed by LibraryView if needed
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

  // Removed processedRolls, groupedRolls, groupEntries as they are no longer needed here.

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
      case 'albums': return 'Albums'; // Changed from 'rolls' to 'albums'
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
          />
        </div>
      </div>

      <div {...swipeHandlers} className="relative flex-1">
        <div key={studioSection} className={animationClass}>
          {studioSection === 'albums' && ( // Now 'albums' is the default and includes darkroom content
            <div className="pt-2">
              <LibraryView /> {/* Render LibraryView here */}
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