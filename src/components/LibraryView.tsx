import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Album } from '../types';
import AlbumCard from './AlbumCard';
import { Plus, Library as LibraryIcon, Clock, Film } from 'lucide-react';
import CreateAlbumModal from './CreateAlbumModal';

const LibraryView: React.FC = () => {
  const { albums, setSelectedAlbum, setCurrentView, refetchAlbums, setRollsViewSection } = useAppContext();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    refetchAlbums();
  }, [refetchAlbums]);

  const handleSelectAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setCurrentView('albumDetail');
  };

  const handleGoToDarkroom = () => {
    setCurrentView('rolls');
    setRollsViewSection('darkroom');
  };

  const handleGoToShelf = () => {
    setCurrentView('rolls');
    setRollsViewSection('shelf');
  };

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Library</h1>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button 
            onClick={handleGoToDarkroom} 
            className="p-4 bg-neutral-800/60 backdrop-blur-lg border border-white/10 rounded-2xl flex items-center gap-3 text-left hover:bg-neutral-700/80 transition-colors shadow-soft"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cyan-500/20">
              <Clock className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="font-bold text-white">Darkroom</p>
              <p className="text-xs text-neutral-400">Develop rolls</p>
            </div>
          </button>
          <button 
            onClick={handleGoToShelf} 
            className="p-4 bg-neutral-800/60 backdrop-blur-lg border border-white/10 rounded-2xl flex items-center gap-3 text-left hover:bg-neutral-700/80 transition-colors shadow-soft"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-500/20">
              <Film className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="font-bold text-white">Shelf</p>
              <p className="text-xs text-neutral-400">View developed</p>
            </div>
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Albums</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 text-sm font-semibold text-brand-amber-start hover:text-brand-amber-mid transition-colors"
            aria-label="Create New Album"
          >
            <Plus className="w-4 h-4" />
            <span>New Album</span>
          </button>
        </div>

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
          <div className="text-center py-16 text-neutral-500">
            <LibraryIcon className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white">Your Library is Empty</h3>
            <p className="mt-2">Create albums to organize your developed rolls.</p>
          </div>
        )}
      </div>
      {showCreateModal && <CreateAlbumModal onClose={() => setShowCreateModal(false)} />}
    </>
  );
};

export default LibraryView;