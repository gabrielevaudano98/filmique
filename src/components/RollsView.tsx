import React, { useMemo } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../types';
import { isRollDeveloped } from '../utils/rollUtils';
import RollCard from './RollCard';
import { Clock, Film, Archive, Library } from 'lucide-react';
import RollsControls from './RollsControls';
import ExpandableSearch from './ExpandableSearch';
import DevelopingRollCard from './DevelopingRollCard';
import StickyGroupHeader from './StickyGroupHeader';

const DarkroomEmptyState = () => (
  <div className="text-center py-24 text-neutral-500">
    <Clock className="w-16 h-16 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-white">Darkroom is Empty</h3>
    <p className="mt-2">When you finish a roll, it will appear here to be developed.</p>
  </div>
);

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
    rollsViewSection, setRollsViewSection,
    searchTerm, setSearchTerm
  } = useAppContext();

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (rollsViewSection === 'rolls') setRollsViewSection('darkroom');
    },
    onSwipedRight: () => {
      if (rollsViewSection === 'darkroom') setRollsViewSection('rolls');
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

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

  return (
    <div {...handlers} className="flex flex-col w-full">
      <header className="sticky top-[64px] z-30 bg-neutral-900/80 backdrop-blur-lg -mx-4 px-4 pt-4 pb-4 border-b border-neutral-700/50">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">
            {rollsViewSection === 'rolls' ? 'Rolls' : 'Darkroom'}
          </h1>
          {rollsViewSection === 'rolls' ? (
            <button
              onClick={() => setRollsViewSection('darkroom')}
              className="flex items-center gap-2 text-gray-300 hover:text-white font-semibold transition-colors px-4 py-2.5 rounded-xl bg-neutral-800/60 backdrop-blur-lg border border-white/10 hover:bg-neutral-700/80"
              aria-label="View Darkroom"
            >
              <Clock className="w-5 h-5" />
              <span>Darkroom</span>
            </button>
          ) : (
            <button
              onClick={() => setRollsViewSection('rolls')}
              className="flex items-center gap-2 text-gray-300 hover:text-white font-semibold transition-colors px-4 py-2.5 rounded-xl bg-neutral-800/60 backdrop-blur-lg border border-white/10 hover:bg-neutral-700/80"
              aria-label="View Rolls"
            >
              <Library className="w-5 h-5" />
              <span>Rolls</span>
            </button>
          )}
        </div>
      </header>

      <div className="relative flex-1 mt-6">
        {rollsViewSection === 'darkroom' && (
          <div key="darkroom" className="animate-slide-in-from-left">
            {developingRolls.length > 0 ? (
              <div className="space-y-3">
                {developingRolls.map(roll => <DevelopingRollCard key={roll.id} roll={roll} />)}
              </div>
            ) : <DarkroomEmptyState />}
          </div>
        )}

        {rollsViewSection === 'rolls' && (
          <div key="rolls" className="animate-slide-in-from-right space-y-6">
            {processedRolls.length > 0 ? (
              groupEntries.map(([groupName, rolls], index) => (
                <div key={groupName}>
                  <StickyGroupHeader>
                    <div className="flex justify-between items-center w-full">
                      <span>{groupName}</span>
                      {/* Controls are only rendered for the first group header, but will stick with it */}
                      {index === 0 && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <ExpandableSearch searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
                          <RollsControls />
                        </div>
                      )}
                    </div>
                  </StickyGroupHeader>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {rolls.map(roll => <RollCard key={roll.id} roll={roll} />)}
                  </div>
                </div>
              ))
            ) : (
              rollsViewMode === 'archived' ? <ArchivedEmptyState /> : <RollsEmptyState />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RollsView;