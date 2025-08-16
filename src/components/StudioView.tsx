import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../types';
import { isRollDeveloped } from '../utils/rollUtils';
import RollCard from './RollCard';
import { Clock, Film, Archive } from 'lucide-react';
import RollsControls from './RollsControls';
import ExpandableSearch from './ExpandableSearch';
import DevelopingRollCard from './DevelopingRollCard';
import StickyGroupHeader from './StickyGroupHeader';

const DarkroomEmptyState = () => (
  <div className="text-center py-12 text-neutral-500">
    <Clock className="w-12 h-12 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-white">Darkroom is Empty</h3>
    <p className="mt-2 text-sm">When you finish a roll, it will appear here to be developed.</p>
  </div>
);

const ShelfEmptyState = () => (
    <div className="text-center py-12 text-neutral-500">
      <Film className="w-12 h-12 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white">Your Shelf is Empty</h3>
      <p className="mt-2 text-sm">Developed rolls will appear here, ready to be viewed and organized.</p>
    </div>
);

const ArchivedEmptyState = () => (
  <div className="text-center py-12 text-neutral-500">
    <Archive className="w-12 h-12 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-white">No Archived Rolls</h3>
    <p className="mt-2 text-sm">You can archive rolls from their detail page to store them here.</p>
  </div>
);

const StudioView: React.FC = () => {
  const { 
    developingRolls, completedRolls,
    rollsSortOrder, rollsGroupBy, rollsSelectedFilm, rollsViewMode,
    searchTerm, setSearchTerm
  } = useAppContext();

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
    <div className="flex flex-col w-full">
      {/* Darkroom Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Darkroom</h2>
        {developingRolls.length > 0 ? (
          <div className="space-y-3">
            {developingRolls.map(roll => <DevelopingRollCard key={roll.id} roll={roll} />)}
          </div>
        ) : <DarkroomEmptyState />}
      </div>

      {/* Shelf Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Rolls</h2>
          <div className="flex items-center gap-2">
            <ExpandableSearch searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
            <RollsControls />
          </div>
        </div>
        <div className="space-y-6">
          {processedRolls.length > 0 ? (
            groupEntries.map(([groupName, rolls]) => (
              <div key={groupName}>
                {rollsGroupBy !== 'none' && (
                  <h3 className="py-2 text-lg font-bold text-white mb-3 border-b border-neutral-700/50">
                    {groupName}
                  </h3>
                )}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {rolls.map(roll => <RollCard key={roll.id} roll={roll} />)}
                </div>
              </div>
            ))
          ) : (
            rollsViewMode === 'archived' ? <ArchivedEmptyState /> : <ShelfEmptyState />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudioView;