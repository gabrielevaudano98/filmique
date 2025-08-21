import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Album } from '../types';
import AlbumCard from './AlbumCard';
import { Plus, Library as LibraryIcon, Clock } from 'lucide-react'; // Added Clock icon
import CreateAlbumModal from './CreateAlbumModal';
import UncategorizedAlbumCard from './UncategorizedAlbumCard';
import { isRollDeveloped } from '../utils/rollUtils';
import DevelopingRollCard from './DevelopingRollCard'; // Import DevelopingRollCard
import DarkroomEmptyState from './DarkroomEmptyState'; // Import DarkroomEmptyState

const LibraryView: React.FC = () => {
  const { albums, setSelectedAlbum, setCurrentView, refetchAlbums, completedRolls, developingRolls } = useAppContext();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    refetchAlbums();
  }, [refetchAlbums]);

  const uncategorizedRolls = useMemo(() => {
    return completedRolls.filter(r => isRollDeveloped(r) && !r.album_id && !r.is_archived);
  }, [completedRolls]);

  const handleSelectAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setCurrentView('albumDetail');
  };

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Albums</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-brand-amber-start to-brand-amber-end text-white font-bold p-3 rounded-full shadow-lg shadow-brand-amber-start/20 hover:opacity-90 transition-all"
            aria-label="Create New Album"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Darkroom Section - Integrated */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-brand-amber-start" /> Darkroom
          </h2>
          {developingRolls.length > 0 ? (
            <div className="space-y-3">
              {developingRolls.map(roll => <DevelopingRollCard key={roll.id} roll={roll} />)}
            </div>
          ) : (
            <DarkroomEmptyState />
          )}
        </div>

        {/* Albums Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <LibraryIcon className="w-6 h-6 text-brand-amber-start" /> Your Albums
          </h2>
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
      </div>
      {showCreateModal && <CreateAlbumModal onClose={() => setShowCreateModal(false)} />}
    </>
  );
};

export default LibraryView;