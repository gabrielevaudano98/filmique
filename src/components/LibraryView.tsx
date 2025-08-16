import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Album } from '../types';
import AlbumCard from './AlbumCard';
import { Plus, Library as LibraryIcon, Clock, Film, Printer } from 'lucide-react';
import CreateAlbumModal from './CreateAlbumModal';
import { showInfoToast } from '../utils/toasts';

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

  const handlePrintsClick = () => {
    showInfoToast('Prints are coming soon!');
  };

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Library</h1>
        </div>

        {/* Main Navigation Group */}
        <div className="mb-10">
          <div className="bg-neutral-800/60 backdrop-blur-lg border border-neutral-700/50 rounded-2xl overflow-hidden shadow-soft">
            <button onClick={handleGoToDarkroom} className="w-full flex items-center p-4 text-left hover:bg-neutral-700/50 transition-colors">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cyan-500/20 mr-4">
                <Clock className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white">Darkroom</p>
                <p className="text-sm text-neutral-400">Develop your completed rolls</p>
              </div>
            </button>
            
            <div className="h-px bg-neutral-700/50 ml-18"></div>

            <button onClick={handleGoToShelf} className="w-full flex items-center p-4 text-left hover:bg-neutral-700/50 transition-colors">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-500/20 mr-4">
                <Film className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white">Shelf</p>
                <p className="text-sm text-neutral-400">View all your developed rolls</p>
              </div>
            </button>

            <div className="h-px bg-neutral-700/50 ml-18"></div>

            <button onClick={handlePrintsClick} className="w-full flex items-center p-4 text-left hover:bg-neutral-700/50 transition-colors">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-500/20 mr-4">
                <Printer className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white">Prints</p>
                <p className="text-sm text-neutral-400">Order prints of your photos</p>
              </div>
            </button>
          </div>
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