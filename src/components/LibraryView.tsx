import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Album, Roll } from '../types';
import { isRollDeveloped } from '../utils/rollUtils';
import { Plus, Library as LibraryIcon, Film, Archive } from 'lucide-react';

import AlbumCard from './AlbumCard';
import CreateAlbumModal from './CreateAlbumModal';
import RollsControls from './RollsControls';
import ExpandableSearch from './ExpandableSearch';
import StickyGroupHeader from './StickyGroupHeader';
import RollCard from './RollCard';
import CollapsibleStudio from './CollapsibleStudio';

const TabIcon: React.FC<{ icon: React.ElementType; isActive: boolean; onClick: () => void; }> = ({ icon: Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`p-2.5 rounded-lg transition-colors ${isActive ? 'bg-neutral-700 text-white' : 'text-gray-400 hover:bg-neutral-700/50'}`}
  >
    <Icon className="w-5 h-5" />
  </button>
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

const LibraryView: React.FC = () => {
  const { 
    albums, setSelectedAlbum, setCurrentView, refetchAlbums,
    developingRolls, completedRolls,
    rollsSortOrder, rollsGroupBy, rollsSelectedFilm, rollsViewMode,
    librarySection, setLibrarySection,
    searchTerm, setSearchTerm
  } = useAppContext();
  
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (librarySection === 'albums') {
      refetchAlbums();
    }
  }, [librarySection, refetchAlbums]);

  const handleSelectAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setCurrentView('albumDetail');
  };

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
    <>
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white">
              {librarySection === 'rolls' ? 'Rolls' : 'Albums'}
            </h1>
            <div className="flex items-center gap-2 p-1 bg-neutral-800/60 rounded-xl border border-neutral-700/50">
              <TabIcon icon={Film} isActive={librarySection === 'rolls'} onClick={() => setLibrarySection('rolls')} />
              <TabIcon icon={LibraryIcon} isActive={librarySection === 'albums'} onClick={() => setLibrarySection('albums')} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {librarySection === 'rolls' && (
              <>
                <ExpandableSearch searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
                <RollsControls />
              </>
            )}
            {librarySection === 'albums' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-brand-amber-start to-brand-amber-end text-white font-bold p-3 rounded-full shadow-lg shadow-brand-amber-start/20 hover:opacity-90 transition-all"
                aria-label="Create New Album"
              >
                <Plus className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {librarySection === 'rolls' && (
          <div className="space-y-6">
            <CollapsibleStudio developingRolls={developingRolls} />
            {processedRolls.length > 0 ? (
              groupEntries.map(([groupName, rolls]) => (
                <div key={groupName}>
                  {rollsGroupBy !== 'none' && (
                    <StickyGroupHeader>
                      {groupName}
                    </StickyGroupHeader>
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
        )}

        {librarySection === 'albums' && (
          <>
            {albums.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {albums.map(album => (
                  <AlbumCard 
                    key={album.id} 
                    album={album} 
                    onClick={() => handleSelectAlbum(album)} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 text-neutral-500">
                <LibraryIcon className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white">Your Library is Empty</h3>
                <p className="mt-2">Create albums to organize your developed rolls.</p>
              </div>
            )}
          </>
        )}
      </div>
      {showCreateModal && <CreateAlbumModal onClose={() => setShowCreateModal(false)} />}
    </>
  );
};

export default LibraryView;