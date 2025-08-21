import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Film, Archive, Library as LibraryIcon, Clock, Plus, Image as ImageIcon } from 'lucide-react';
import RollsControls from './RollsControls';
import ExpandableSearch from './ExpandableSearch';
import DevelopingRollCard from './DevelopingRollCard';
import DarkroomEmptyState from './DarkroomEmptyState';
import RollRow from './RollRow';
import StickyGroupHeader from './StickyGroupHeader';
import AlbumCard from './AlbumCard';
import UncategorizedAlbumCard from './UncategorizedAlbumCard';
import CreateAlbumModal from './CreateAlbumModal';
import { isRollDeveloped } from '../utils/rollUtils';
import { Album, Roll } from '../types';

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

const RollsCombinedView: React.FC = () => {
  const {
    developingRolls, completedRolls, albums,
    rollsSortOrder,
    rollsGroupBy,
    rollsSelectedFilm,
    rollsViewMode,
    searchTerm, setSearchTerm,
    setSelectedAlbum, setCurrentView,
    refetchAlbums,
  } = useAppContext();

  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);

  const filteredCompletedRolls = useMemo(() => {
    let filtered = completedRolls.filter(roll => {
      const matchesViewMode = rollsViewMode === 'active' ? !roll.is_archived : roll.is_archived;
      const matchesFilm = rollsSelectedFilm === 'all' || roll.film_type === rollsSelectedFilm;
      const matchesSearch = searchTerm === '' ||
        roll.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roll.film_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roll.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return isRollDeveloped(roll) && matchesViewMode && matchesFilm && matchesSearch;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      if (rollsSortOrder === 'newest') {
        return new Date(b.developed_at || b.completed_at!).getTime() - new Date(a.developed_at || a.completed_at!).getTime();
      }
      if (rollsSortOrder === 'oldest') {
        return new Date(a.developed_at || a.completed_at!).getTime() - new Date(b.developed_at || b.completed_at!).getTime();
      }
      if (rollsSortOrder === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (rollsSortOrder === 'title_desc') {
        return (b.title || '').localeCompare(a.title || '');
      }
      return 0;
    });

    return filtered;
  }, [completedRolls, rollsViewMode, rollsSelectedFilm, searchTerm, rollsSortOrder]);

  const groupedRolls = useMemo(() => {
    if (rollsGroupBy === 'none') {
      return { 'All Rolls': filteredCompletedRolls };
    }

    const groups: Record<string, Roll[]> = {};
    filteredCompletedRolls.forEach(roll => {
      let key: string;
      if (rollsGroupBy === 'date') {
        key = new Date(roll.developed_at || roll.created_at!).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      } else if (rollsGroupBy === 'film_type') {
        key = roll.film_type;
      } else if (rollsGroupBy === 'tag') {
        // Group by first tag, or 'No Tags'
        key = roll.tags?.[0] || 'No Tags';
      } else {
        key = 'Other';
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(roll);
    });

    // Sort groups by key (e.g., date descending, film type A-Z)
    const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
      if (rollsGroupBy === 'date') {
        // For date grouping, parse as date to sort correctly
        const dateA = new Date(a);
        const dateB = new Date(b);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return dateB.getTime() - dateA.getTime();
        }
      }
      return a.localeCompare(b);
    });

    const sortedGroups: Record<string, Roll[]> = {};
    sortedGroupKeys.forEach(key => {
      sortedGroups[key] = groups[key];
    });

    return sortedGroups;
  }, [filteredCompletedRolls, rollsGroupBy]);

  const groupEntries = Object.entries(groupedRolls);

  const uncategorizedRolls = useMemo(() => {
    return completedRolls.filter(r => isRollDeveloped(r) && !r.album_id && !r.is_archived);
  }, [completedRolls]);

  const handleSelectAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setCurrentView('albumDetail');
  };

  return (
    <div className="flex flex-col w-full">
      {/* Darkroom Section */}
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Clock className="w-6 h-6 text-brand-amber-start" /> Darkroom</h2>
      <div className="mb-8">
        {developingRolls.length > 0 ? (
          <div className="space-y-3">
            {developingRolls.map(roll => <DevelopingRollCard key={roll.id} roll={roll} />)}
          </div>
        ) : <DarkroomEmptyState />}
      </div>

      {/* Albums Section */}
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><LibraryIcon className="w-6 h-6 text-brand-amber-start" /> Albums</h2>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ExpandableSearch searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
          <RollsControls />
        </div>
        <button
          onClick={() => setShowCreateAlbumModal(true)}
          className="bg-gradient-to-r from-brand-amber-start to-brand-amber-end text-white font-bold p-3 rounded-full shadow-lg shadow-brand-amber-start/20 hover:opacity-90 transition-all"
          aria-label="Create New Album"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
      <div className="mb-8">
        {albums.length > 0 || uncategorizedRolls.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {uncategorizedRolls.length > 0 && (
              <UncategorizedAlbumCard
                rolls={uncategorizedRolls}
                onClick={() => setCurrentView('uncategorizedRolls')}
              />
            )}
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
      </div>

      {/* Developed Rolls Section */}
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Film className="w-6 h-6 text-brand-amber-start" /> Developed Rolls</h2>
      <div className="mb-8">
        {filteredCompletedRolls.length > 0 ? (
          <div className="space-y-3">
            {groupEntries.map(([groupName, rollsInGroup]) => (
              <div key={groupName}>
                {rollsGroupBy !== 'none' && <StickyGroupHeader title={groupName} />}
                <div className="space-y-3">
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

      {showCreateAlbumModal && <CreateAlbumModal onClose={() => setShowCreateAlbumModal(false)} />}
    </div>
  );
};

export default RollsCombinedView;