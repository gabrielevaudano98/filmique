import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../types';
import { isRollDeveloped } from '../utils/rollUtils';
import RollCard from './RollCard';
import { Film, Archive } from 'lucide-react';
import RollsControls from './RollsControls';
import ExpandableSearch from './ExpandableSearch';
import DevelopingRollCard from './DevelopingRollCard';
import PrintsView from './PrintsView';
import DarkroomEmptyState from './DarkroomEmptyState';
import SegmentedControl from './SegmentedControl';

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

const RollsView: React.FC = () => {
  const { 
    developingRolls, completedRolls,
    rollsSortOrder, rollsGroupBy, rollsSelectedFilm, rollsViewMode,
    searchTerm, setSearchTerm,
    studioSection, setStudioSection, studioSectionOptions,
    setIsStudioHeaderSticky,
  } = useAppContext();

  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerTriggerRef = useRef<HTMLDivElement>(null);
  const sectionOrder = useMemo(() => studioSectionOptions.map(opt => opt.value), [studioSectionOptions]);

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

  const { shelfRolls, archivedRolls } = useMemo(() => {
    const developed = completedRolls.filter(r => isRollDeveloped(r));
    return {
      shelfRolls: developed.filter(r => !r.is_archived),
      archivedRolls: developed.filter(r => r.is_archived),
    };
  }, [completedRolls]);

  const processedRolls = useMemo(() => {
    let rolls = rollsViewMode === 'active' ? [...shelfRolls] : [...archivedRolls];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      rolls = rolls.filter(r => 
        r.title?.toLowerCase().includes(lowerSearch) || 
        r.tags?.some(tag => tag.toLowerCase().includes(lowerSearch))
      );
    }
    if (rollsSelectedFilm !== 'all') rolls = rolls.filter(r => r.film_type === rollsSelectedFilm);
    
    rolls.sort((a, b) => {
      const dateA = a.developed_at || a.completed_at || a.created_at;
      const dateB = b.developed_at || b.completed_at || b.created_at;
      switch (rollsSortOrder) {
        case 'oldest': return new Date(dateA).getTime() - new Date(dateB).getTime();
        case 'title_asc': return (a.title || '').localeCompare(b.title || '');
        case 'title_desc': return (b.title || '').localeCompare(a.title || '');
        case 'newest': default: return new Date(dateB).getTime() - new Date(dateA).getTime();
      }
    });
    return rolls;
  }, [shelfRolls, archivedRolls, searchTerm, rollsSelectedFilm, rollsSortOrder, rollsViewMode]);

  const groupedRolls = useMemo(() => {
    if (rollsGroupBy === 'date') {
      const byDay = processedRolls.reduce((acc, roll) => {
        const dateKey = roll.developed_at || roll.completed_at;
        if (!dateKey) return acc;
        const key = new Date(dateKey).toISOString().split('T')[0];
        if (!acc[key]) acc[key] = [];
        acc[key].push(roll);
        return acc;
      }, {} as Record<string, Roll[]>);
      
      const sortedKeys = Object.keys(byDay).sort((a, b) => b.localeCompare(a));
      
      const sortedGroups: Record<string, Roll[]> = {};
      for (const key of sortedKeys) {
        const date = new Date(key + 'T00:00:00');
        const displayKey = date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
        sortedGroups[displayKey] = byDay[key];
      }
      return sortedGroups;
    }

    if (rollsGroupBy === 'none') return { 'All Rolls': processedRolls };

    return processedRolls.reduce((acc, roll) => {
      let keys: string[] = [];
      if (rollsGroupBy === 'film_type') keys = [roll.film_type];
      else if (rollsGroupBy === 'tag') keys = roll.tags?.length ? roll.tags : ['Untagged'];
      keys.forEach(key => {
        if (!acc[key]) acc[key] = [];
        acc[key].push(roll);
      });
      return acc;
    }, {} as Record<string, Roll[]>);
  }, [processedRolls, rollsGroupBy]);

  const groupEntries = Object.entries(groupedRolls);

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentIndex = sectionOrder.indexOf(studioSection);
    if (direction === 'left' && currentIndex < sectionOrder.length - 1) {
        setStudioSection(sectionOrder[currentIndex + 1] as any);
    } else if (direction === 'right' && currentIndex > 0) {
        setStudioSection(sectionOrder[currentIndex - 1] as any);
    }
  };

  const swipeHandlers = useSwipeable({
      onSwiping: (event) => {
        if (!containerRef.current) return;
        const currentIndex = sectionOrder.indexOf(studioSection);
        if ((currentIndex === 0 && event.dir === 'Right') || (currentIndex === sectionOrder.length - 1 && event.dir === 'Left')) {
          const resistance = 1 + (Math.abs(event.deltaX) / containerRef.current.offsetWidth) * 2;
          setSwipeOffset(event.deltaX / resistance);
          return;
        }
        setIsSwiping(true);
        setSwipeOffset(event.deltaX);
      },
      onSwiped: (event) => {
        setIsSwiping(false);
        const viewWidth = containerRef.current?.offsetWidth || window.innerWidth;
        const swipeThreshold = viewWidth / 4;
        const velocityThreshold = 0.3;

        if (event.dir === 'Left' && (Math.abs(event.deltaX) > swipeThreshold || event.velocity > velocityThreshold)) {
            handleSwipe('left');
        } else if (event.dir === 'Right' && (Math.abs(event.deltaX) > swipeThreshold || event.velocity > velocityThreshold)) {
            handleSwipe('right');
        }
        
        setSwipeOffset(0);
      },
      preventScrollOnSwipe: true,
      trackMouse: true,
  });

  const renderSectionContent = (section: 'rolls' | 'darkroom' | 'prints') => {
    switch (section) {
      case 'darkroom':
        return developingRolls.length > 0 ? (
          <div className="space-y-3">
            {developingRolls.map(roll => <DevelopingRollCard key={roll.id} roll={roll} />)}
          </div>
        ) : <DarkroomEmptyState />;
      
      case 'rolls':
        return (
          <div>
            <div className="sticky top-[80px] z-20 pointer-events-none -mx-4 px-4 h-14">
              <div className="absolute top-0 right-4 h-full pointer-events-auto flex items-center gap-2">
                <ExpandableSearch searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
                <RollsControls />
              </div>
            </div>
            <div className="space-y-6 -mt-14">
              {processedRolls.length > 0 ? (
                groupEntries.map(([groupName, rolls]) => (
                  <div key={groupName}>
                    <h3 className="sticky top-[80px] z-10 py-4 -mx-4 px-4 text-lg font-bold text-white bg-neutral-800/60 backdrop-blur-lg border-y border-neutral-700/50 pr-[150px]">
                      {groupName}
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-3">
                      {rolls.map(roll => <RollCard key={roll.id} roll={roll} />)}
                    </div>
                  </div>
                ))
              ) : (
                rollsViewMode === 'archived' ? <ArchivedEmptyState /> : <RollsEmptyState />
              )}
            </div>
          </div>
        );

      case 'prints':
        return <PrintsView />;
      
      default:
        return null;
    }
  };

  const currentIndex = sectionOrder.indexOf(studioSection);
  const containerWidth = containerRef.current?.offsetWidth || 0;
  const transformX = -currentIndex * containerWidth + swipeOffset;

  return (
    <div className="flex flex-col w-full">
      <div ref={observerTriggerRef} className="flex items-center justify-between pt-4 pb-6">
        <h1 className="text-3xl font-bold text-white">Studio</h1>
        <div className="w-auto">
          <SegmentedControl
            options={studioSectionOptions}
            value={studioSection}
            onChange={(val) => {
              setSwipeOffset(0);
              setStudioSection(val as any);
            }}
          />
        </div>
      </div>

      <div ref={containerRef} {...swipeHandlers} className="relative flex-1 overflow-hidden">
        <div
          className="flex h-full"
          style={{
            width: `${sectionOrder.length * 100}%`,
            transform: `translateX(${transformX}px)`,
            transition: isSwiping ? 'none' : 'transform 0.4s cubic-bezier(0.2, 1, 0.35, 1)',
          }}
        >
          {sectionOrder.map(section => (
            <div key={section} className="w-full h-full flex-shrink-0" style={{ width: `${100 / sectionOrder.length}%` }}>
              {renderSectionContent(section as any)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RollsView;