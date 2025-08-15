import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../types';
import { isRollDeveloped } from '../utils/rollUtils';
import SegmentedControl from './SegmentedControl';
import RollListItem from './RollListItem';
import RollsControls from './RollsControls';
import RollOnShelf from './RollOnShelf';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import AssignShelfModal from './AssignShelfModal';
import CreateShelfModal from './CreateShelfModal';
import ShelfCard from './ShelfCard';
import { Clock, Plus, LayoutGrid } from 'lucide-react';

const DarkroomEmptyState = () => (
  <div className="text-center py-24 text-neutral-500">
    <Clock className="w-16 h-16 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-white">Darkroom is Empty</h3>
    <p className="mt-2">When you finish a roll, it will appear here to be developed.</p>
  </div>
);

const RollsView: React.FC = () => {
  const { completedRolls, shelves, refetchRolls, deleteRoll, refetchShelves, setSelectedShelf, setCurrentView } = useAppContext();
  const [activeView, setActiveView] = useState<'list' | 'shelves' | 'darkroom'>('list');
  
  const [rollToDelete, setRollToDelete] = useState<Roll | null>(null);
  const [rollToAssign, setRollToAssign] = useState<Roll | null>(null);
  const [showCreateShelfModal, setShowCreateShelfModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedFilm, setSelectedFilm] = useState('all');

  useEffect(() => {
    refetchRolls();
    refetchShelves();
  }, [refetchRolls, refetchShelves]);

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
    if (searchTerm) rolls = rolls.filter(r => r.title?.toLowerCase().includes(searchTerm.toLowerCase()));
    if (selectedFilm !== 'all') rolls = rolls.filter(r => r.film_type === selectedFilm);
    rolls.sort((a, b) => {
      switch (sortOrder) {
        case 'oldest': return new Date(a.developed_at!).getTime() - new Date(b.developed_at!).getTime();
        case 'title_asc': return (a.title || '').localeCompare(b.title || '');
        case 'title_desc': return (b.title || '').localeCompare(a.title || '');
        default: return new Date(b.developed_at!).getTime() - new Date(a.developed_at!).getTime();
      }
    });
    return rolls;
  }, [developedRolls, searchTerm, sortOrder, selectedFilm]);

  return (
    <div className="flex flex-col w-full space-y-6">
      <h1 className="text-3xl font-bold text-white">My Rolls</h1>
      <SegmentedControl
        options={[
          { label: 'List', value: 'list' },
          { label: 'Shelves', value: 'shelves' },
          { label: `Darkroom (${developingRolls.length})`, value: 'darkroom' },
        ]}
        value={activeView}
        onChange={(value) => setActiveView(value as 'list' | 'shelves' | 'darkroom')}
      />

      <div key={activeView} className="animate-fade-in">
        {activeView === 'list' && (
          <div className="space-y-3">
            <RollsControls {...{ searchTerm, setSearchTerm, sortOrder, setSortOrder, filmTypes, selectedFilm, setSelectedFilm }} />
            {filteredAndSortedRolls.map(roll => (
              <RollListItem key={roll.id} roll={roll} onDelete={setRollToDelete} onAssignAlbum={setRollToAssign} />
            ))}
            {filteredAndSortedRolls.length === 0 && <div className="text-center py-16 text-gray-500"><p>No developed rolls found.</p></div>}
          </div>
        )}

        {activeView === 'shelves' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">My Shelves</h3>
              <button onClick={() => setShowCreateShelfModal(true)} className="flex items-center gap-2 text-sm font-semibold text-brand-amber-start hover:text-brand-amber-mid">
                <Plus className="w-4 h-4" /> New Shelf
              </button>
            </div>
            {shelves.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {shelves.map(shelf => (
                  <ShelfCard key={shelf.id} shelf={shelf} onClick={() => { setSelectedShelf(shelf); setCurrentView('shelfDetail'); }} />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-16"><LayoutGrid className="w-12 h-12 mx-auto mb-4" /><p>No shelves created yet.</p></div>
            )}
          </div>
        )}

        {activeView === 'darkroom' && (
          <div>
            {developingRolls.length > 0 ? (
              <div className="space-y-3">
                {developingRolls.map(roll => <RollListItem key={roll.id} roll={roll} onDelete={() => {}} onAssignAlbum={() => {}} isDeveloping={true} />)}
              </div>
            ) : <DarkroomEmptyState />}
          </div>
        )}
      </div>
      
      {rollToDelete && <ConfirmDeleteModal isOpen={!!rollToDelete} onClose={() => setRollToDelete(null)} onConfirm={() => { if (rollToDelete) deleteRoll(rollToDelete.id); setRollToDelete(null); }} title="Delete Roll" message={`Are you sure you want to permanently delete "${rollToDelete.title || rollToDelete.film_type}"? This cannot be undone.`} confirmText="Delete" />}
      {rollToAssign && <AssignShelfModal roll={rollToAssign} onClose={() => setRollToAssign(null)} />}
      {showCreateShelfModal && <CreateShelfModal onClose={() => setShowCreateShelfModal(false)} />}
    </div>
  );
};

export default RollsView;