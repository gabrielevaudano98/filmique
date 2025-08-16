import React, { useState, useMemo } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../types';
import { isRollDeveloped } from '../utils/rollUtils';
import RollListItem from './RollListItem';
import RollCard from './RollCard';
import { Clock, Film, Archive, ArrowLeft, Library } from 'lucide-react';
import RollsControls from './RollsControls';
import ExpandableSearch from './ExpandableSearch';

const DarkroomEmptyState = () => (
  <div className="text-center py-24 text-neutral-500">
    <Clock className="w-16 h-16 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-white">Darkroom is Empty</h3>
    <p className="mt-2">When you finish a roll, it will appear here to be developed.</p>
  </div>
);

const ShelfEmptyState = () => (
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
    rollsSortOrder, rollsGroupBy, rollsSelectedFilm, rollsViewMode
  } = useAppContext();
  const [activeSection, setActiveSection] = useState<'darkroom' | 'shelf'>('darkroom');
  const [searchTerm, setSearchTerm] = useState('');

  const handlers = useSwipeable({
    onSwipedRight: () => {
      if (activeSection === 'shelf') {
        setActiveSection('darkroom');
      }
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
    <div {...handlers} className="flex flex-col w-full space-y-6">
      <div className="flex items-center justify-between">
        {activeSection === 'shelf' ? (
          <>
            <button onClick={() => setActiveSection('darkroom')} className="p-2 text-gray-400 hover:text-white transition-colors -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-white">Shelf</h1>
            <div className="flex items-center gap-2">
              <ExpandableSearch searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
              <RollsControls />
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-white">Darkroom</h1>
            <button
              onClick={() => setActiveSection('shelf')}
              className="flex items-center justify-center w-11 h-11 bg-gradient-to-r from-brand-amber-start to-brand-amber-end rounded-xl text-white hover:opacity-90 transition-colors shadow-lg shadow-brand-amber-start/20"
              aria-label="View Shelf"
            >
              <Library className="w-5 h-5 text-white" />
            </button>
          </>
        )}
      </div>

      <div className="relative flex-1">
        {activeSection === 'darkroom' && (
          <div key="darkroom" className="animate-slide-in-from-left">
            {developingRolls.length > 0 ? (
              <div className="space-y-3">
                {developingRolls.map(roll => <RollListItem key={roll.id} roll={roll} onDelete={() => {}} onAssignAlbum={() => {}} isDeveloping={true} />)}
              </div>
            ) : <DarkroomEmptyState />}
          </div>
        )}

        {activeSection === 'shelf' && (
          <div key="shelf" className="animate-slide-in-from-right space-y-6">
            {processedRolls.length > 0 ? (
              groupEntries.map(([groupName, rolls]) => (
                <div key={groupName}>
                  {rollsGroupBy !== 'none' && <h3 className="text-lg font-bold text-white mb-3">{groupName}</h3>}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {rolls.map(roll => <RollCard key={roll.id} roll={roll} />)}
                  </div>
                </div>
              ))
            ) : (
              rollsViewMode === 'archived' ? <ArchivedEmptyState /> : <ShelfEmptyState />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RollsView;