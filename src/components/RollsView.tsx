import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../types';
import { isRollDeveloped } from '../utils/rollUtils';
import SegmentedControl from './SegmentedControl';
import RollListItem from './RollListItem';
import { Clock, Film, Tag } from 'lucide-react';
import RollsControls from './RollsControls';

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

const RollsView: React.FC = () => {
  const { developingRolls, completedRolls, deleteRoll, removeRollFromAlbum } = useAppContext();
  const [activeSection, setActiveSection] = useState<'shelf' | 'darkroom'>('shelf');
  
  // State for controls
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [groupBy, setGroupBy] = useState('none');
  const [selectedFilm, setSelectedFilm] = useState('all');

  const developedRolls = useMemo(() => 
    completedRolls.filter(r => isRollDeveloped(r) && !r.is_archived),
  [completedRolls]);

  const filmTypes = useMemo(() => 
    [...new Set(developedRolls.map(r => r.film_type))],
  [developedRolls]);

  const processedRolls = useMemo(() => {
    let rolls = [...developedRolls];

    // 1. Filter by search term
    if (searchTerm) {
      rolls = rolls.filter(r => r.title?.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // 2. Filter by film type
    if (selectedFilm !== 'all') {
      rolls = rolls.filter(r => r.film_type === selectedFilm);
    }

    // 3. Sort
    rolls.sort((a, b) => {
      switch (sortOrder) {
        case 'oldest': return new Date(a.developed_at!).getTime() - new Date(b.developed_at!).getTime();
        case 'title_asc': return (a.title || '').localeCompare(b.title || '');
        case 'title_desc': return (b.title || '').localeCompare(a.title || '');
        case 'newest':
        default: return new Date(b.developed_at!).getTime() - new Date(a.developed_at!).getTime();
      }
    });

    return rolls;
  }, [developedRolls, searchTerm, selectedFilm, sortOrder]);

  const groupedRolls = useMemo(() => {
    if (groupBy === 'none') return { 'All Rolls': processedRolls };

    return processedRolls.reduce((acc, roll) => {
      let keys: string[] = [];
      if (groupBy === 'film_type') {
        keys = [roll.film_type];
      } else if (groupBy === 'tag') {
        keys = roll.tags?.length ? roll.tags : ['Untagged'];
      }
      
      keys.forEach(key => {
        if (!acc[key]) acc[key] = [];
        acc[key].push(roll);
      });

      return acc;
    }, {} as Record<string, Roll[]>);
  }, [processedRolls, groupBy]);

  return (
    <div className="flex flex-col w-full space-y-6">
      <h1 className="text-3xl font-bold text-white">My Rolls</h1>
      <SegmentedControl
        options={[
          { label: 'Shelf', value: 'shelf' },
          { label: `Darkroom (${developingRolls.length})`, value: 'darkroom' },
        ]}
        value={activeSection}
        onChange={(value) => setActiveSection(value as 'shelf' | 'darkroom')}
      />

      <div key={activeSection} className="animate-fade-in">
        {activeSection === 'darkroom' && (
          <div>
            {developingRolls.length > 0 ? (
              <div className="space-y-3">
                {developingRolls.map(roll => (
                  <RollListItem
                    key={roll.id}
                    roll={roll}
                    onDelete={() => {}}
                    onAssignAlbum={() => {}}
                    isDeveloping={true}
                  />
                ))}
              </div>
            ) : (
              <DarkroomEmptyState />
            )}
          </div>
        )}

        {activeSection === 'shelf' && (
          <div className="space-y-6">
            <RollsControls 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              groupBy={groupBy}
              setGroupBy={setGroupBy}
              filmTypes={filmTypes}
              selectedFilm={selectedFilm}
              setSelectedFilm={setSelectedFilm}
            />
            {Object.keys(groupedRolls).length > 0 && processedRolls.length > 0 ? (
              Object.entries(groupedRolls).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)).map(([groupName, rolls]) => (
                <div key={groupName}>
                  {groupBy !== 'none' && <h3 className="text-lg font-bold text-white mb-3">{groupName}</h3>}
                  <div className="space-y-3">
                    {rolls.map(roll => (
                      <RollListItem
                        key={roll.id}
                        roll={roll}
                        onDelete={deleteRoll}
                        onAssignAlbum={removeRollFromAlbum}
                        assignActionIcon="remove"
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <ShelfEmptyState />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RollsView;