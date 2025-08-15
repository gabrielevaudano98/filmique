import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../types';
import { isRollDeveloped } from '../utils/rollUtils';
import SegmentedControl from './SegmentedControl';
import RollListItem from './RollListItem';
import RollsControls from './RollsControls';
import RollOnShelf from './RollOnShelf';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import AssignAlbumModal from './AssignAlbumModal';
import { Clock } from 'lucide-react';

// Group rolls by month and year for the shelf view
const groupRollsByMonth = (rolls: Roll[]) => {
  return rolls.reduce((acc, roll) => {
    const date = new Date(roll.developed_at!);
    const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(roll);
    return acc;
  }, {} as Record<string, Roll[]>);
};

const DarkroomEmptyState = () => (
  <div className="text-center py-24 text-neutral-500">
    <Clock className="w-16 h-16 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-white">Darkroom is Empty</h3>
    <p className="mt-2">When you finish a roll, it will appear here to be developed.</p>
  </div>
);

const RollsView: React.FC = () => {
  const { completedRolls, refetchRolls, deleteRoll } = useAppContext();
  const [activeSection, setActiveSection] = useState<'shelf' | 'darkroom'>('shelf');
  
  // State for modals
  const [rollToDelete, setRollToDelete] = useState<Roll | null>(null);
  const [rollToAssign, setRollToAssign] = useState<Roll | null>(null);

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedFilm, setSelectedFilm] = useState('all');

  useEffect(() => {
    refetchRolls();
  }, [refetchRolls]);

  const { developingRolls, developedRolls } = useMemo(() => {
    const allCompleted = completedRolls || [];
    const developing = allCompleted.filter(r => r.is_completed && r.completed_at && !isRollDeveloped(r));
    const developed = allCompleted.filter(r => isRollDeveloped(r));
    return { 
      developingRolls: developing.sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()), 
      developedRolls: developed
    };
  }, [completedRolls]);

  const filmTypes = useMemo(() => {
    const types = new Set(developedRolls.map(r => r.film_type));
    return Array.from(types);
  }, [developedRolls]);

  const filteredAndSortedRolls = useMemo(() => {
    let rolls = developedRolls;

    if (searchTerm) {
      rolls = rolls.filter(r => r.title?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (selectedFilm !== 'all') {
      rolls = rolls.filter(r => r.film_type === selectedFilm);
    }

    rolls.sort((a, b) => {
      switch (sortOrder) {
        case 'oldest': return new Date(a.developed_at!).getTime() - new Date(b.developed_at!).getTime();
        case 'title_asc': return (a.title || '').localeCompare(b.title || '');
        case 'title_desc': return (b.title || '').localeCompare(a.title || '');
        case 'newest':
        default:
          return new Date(b.developed_at!).getTime() - new Date(a.developed_at!).getTime();
      }
    });
    return rolls;
  }, [developedRolls, searchTerm, sortOrder, selectedFilm]);

  const groupedRolls = useMemo(() => groupRollsByMonth(filteredAndSortedRolls), [filteredAndSortedRolls]);
  const sortedGroupKeys = useMemo(() => {
    return Object.keys(groupedRolls).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [groupedRolls]);

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
                    onDelete={() => {}} // Cannot delete from darkroom
                    onAssignAlbum={() => {}} // Cannot assign from darkroom
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
              filmTypes={filmTypes}
              selectedFilm={selectedFilm}
              setSelectedFilm={setSelectedFilm}
            />
            {sortedGroupKeys.map(month => (
              <div key={month}>
                <h3 className="text-sm font-bold uppercase text-neutral-400 tracking-wider px-2 mb-3">{month}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-8">
                  {groupedRolls[month].map(roll => (
                    <RollOnShelf key={roll.id} roll={roll} />
                  ))}
                </div>
              </div>
            ))}
            {filteredAndSortedRolls.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <p>No developed rolls found.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {rollToDelete && (
        <ConfirmDeleteModal
          isOpen={!!rollToDelete}
          onClose={() => setRollToDelete(null)}
          onConfirm={() => {
            if (rollToDelete) deleteRoll(rollToDelete.id);
            setRollToDelete(null);
          }}
          title="Delete Roll"
          message={`Are you sure you want to permanently delete "${rollToDelete.title || rollToDelete.film_type}"? This cannot be undone.`}
          confirmText="Delete"
        />
      )}
      {rollToAssign && (
        <AssignAlbumModal
          roll={rollToAssign}
          onClose={() => setRollToAssign(null)}
        />
      )}
    </div>
  );
};

export default RollsView;