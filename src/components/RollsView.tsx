import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../types';
import { isRollDeveloped } from '../utils/rollUtils';
import SegmentedControl from './SegmentedControl';
import RollListItem from './RollListItem';
import RollCard from './RollCard';
import { Clock, Film, Tag, Archive } from 'lucide-react';
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
    <p className="mt-2">Archive rolls from their detail page to store them here.</p>
  </div>
);

const RollsView: React.FC = () => {
  const { 
    developingRolls, completedRolls, deleteRoll, removeRollFromAlbum,
    rollsSortOrder, rollsGroupBy, rollsSelectedFilm
  } = useAppContext();
  const [activeSection, setActiveSection] = useState<'shelf' | 'darkroom' | 'archived'>('shelf');
  const [searchTerm, setSearchTerm] = useState('');

  const { shelfRolls, archivedRolls } = useMemo(() => {
    const developed = completedRolls.filter(r => isRollDeveloped(r));
    return {
      shelfRolls: developed.filter(r => !r.is_archived),
      archivedRolls: developed.filter(r => r.is_archived),
    };
  }, [completedRolls]);

  const filmTypes = useMemo(() => 
    [...new Set(shelfRolls.map(r => r.film_type))],
  [shelfRolls]);

  const processedRolls = useMemo(() => {
    let rolls = [...shelfRolls];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      rolls = rolls.filter(r => 
        r.title?.toLowerCase().includes(lowerSearch) || 
        r.tags?.some(tag => tag.toLowerCase().includes(lowerSearch))
      );
    }
    if (rollsSelectedFilm !== 'all') rolls = rolls.filter(r => r.film_type === rollsSelectedFilm);
    
    rolls.sort((a, b) => {
      switch (rollsSortOrder) {
        case 'oldest': return new Date(a.developed_at!).getTime() - new Date(b.developed_at!).getTime();
        case 'title_asc': return (a.title || '').localeCompare(b.title || '');
        case 'title_desc': return (b.title || '').localeCompare(a.title || '');
        case 'newest': default: return new Date(b.developed_at!).getTime() - new Date(a.developed_at!).getTime();
      }
    });
    return rolls;
  }, [shelfRolls, searchTerm, rollsSelectedFilm, rollsSortOrder]);

  const groupedRolls = useMemo(() => {
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

  return (
    <div className="flex flex-col w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">My Rolls</h1>
        {activeSection === 'shelf' && (
          <div className="flex items-center gap-2">
            <ExpandableSearch searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
            <RollsControls />
          </div>
        )}
      </div>

      <SegmentedControl
        options={[
          { label: 'Shelf', value: 'shelf' },
          { label: `Darkroom (${developingRolls.length})`, value: 'darkroom' },
          { label: 'Archived', value: 'archived' },
        ]}
        value={activeSection}
        onChange={(value) => setActiveSection(value as 'shelf' | 'darkroom' | 'archived')}
      />

      <div key={activeSection} className="animate-fade-in">
        {activeSection === 'darkroom' && (
          developingRolls.length > 0 ? (
            <div className="space-y-3">
              {developingRolls.map(roll => <RollListItem key={roll.id} roll={roll} onDelete={() => {}} onAssignAlbum={() => {}} isDeveloping={true} />)}
            </div>
          ) : <DarkroomEmptyState />
        )}

        {activeSection === 'shelf' && (
          <div className="space-y-6">
            {processedRolls.length > 0 ? (
              Object.entries(groupedRolls).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)).map(([groupName, rolls]) => (
                <div key={groupName}>
                  {rollsGroupBy !== 'none' && <h3 className="text-lg font-bold text-white mb-3">{groupName}</h3>}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {rolls.map(roll => <RollCard key={roll.id} roll={roll} />)}
                  </div>
                </div>
              ))
            ) : <ShelfEmptyState />}
          </div>
        )}

        {activeSection === 'archived' && (
          archivedRolls.length > 0 ? (
            <div className="space-y-3">
              {archivedRolls.map(roll => <RollListItem key={roll.id} roll={roll} onDelete={deleteRoll} onAssignAlbum={removeRollFromAlbum} assignActionIcon="remove" />)}
            </div>
          ) : <ArchivedEmptyState />
        )}
      </div>
    </div>
  );
};

export default RollsView;