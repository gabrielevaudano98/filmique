import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Film, Archive, Clock } from 'lucide-react';
import DevelopingRollCard from './DevelopingRollCard';
import DarkroomEmptyState from './DarkroomEmptyState';
import RollsControls from './RollsControls';
import ExpandableSearch from './ExpandableSearch';
import RollRow from './RollRow';
import StickyGroupHeader from './StickyGroupHeader';
import { isRollDeveloped } from '../utils/rollUtils';
import { Roll } from '../types';

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
    developingRolls,
    completedRolls,
    rollsSortOrder, rollsGroupBy, rollsSelectedFilm, rollsViewMode,
    searchTerm, setSearchTerm, setIsRollsSettingsOpen
  } = useAppContext();

  const { shelfRolls, archivedRolls } = useMemo(() => {
    return {
      shelfRolls: completedRolls.filter(r => !r.is_archived),
      archivedRolls: completedRolls.filter(r => r.is_archived),
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
        case 'newest': default: return new Date(dateB).getTime() - new Date(a.created_at).getTime();
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
      {/* Developing Rolls Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-cyan-400" /> Darkroom
        </h2>
        {developingRolls.length > 0 ? (
          <div className="space-y-3">
            {developingRolls.map(roll => <DevelopingRollCard key={roll.id} roll={roll} />)}
          </div>
        ) : <DarkroomEmptyState />}
      </div>

      {/* Developed Rolls Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Film className="w-6 h-6 text-brand-amber-start" /> {rollsViewMode === 'active' ? 'Your Rolls' : 'Archived Rolls'}
          </h2>
          <div className="flex items-center gap-2">
            <ExpandableSearch searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
            <RollsControls />
          </div>
        </div>

        {processedRolls.length > 0 ? (
          <div className="space-y-4">
            {groupEntries.map(([groupName, rollsInGroup]) => (
              <div key={groupName}>
                {rollsGroupBy !== 'none' && <StickyGroupHeader title={groupName} />}
                <div className="space-y-2">
                  {rollsInGroup.map(roll => (
                    <RollRow key={roll.id} roll={roll} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          rollsViewMode === 'active' ? <RollsEmptyState /> : <ArchivedEmptyState />
        )}
      </div>
    </div>
  );
};

export default RollsView;