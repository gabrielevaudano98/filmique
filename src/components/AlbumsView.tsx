import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, LayoutGrid } from 'lucide-react';
import AlbumCard from './AlbumCard';
import CreateAlbumModal from './CreateAlbumModal';

const AlbumsView: React.FC = () => {
  const { albums, refetchAlbums, setSelectedAlbum, setCurrentView } = useAppContext();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    refetchAlbums();
  }, [refetchAlbums]);

  return (
    <div className="flex flex-col w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">My Library</h1>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 text-sm font-semibold text-brand-amber-start hover:text-brand-amber-mid">
          <Plus className="w-4 h-4" /> New Album
        </button>
      </div>

      {albums.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {albums.map(album => (
            <AlbumCard 
              key={album.id} 
              album={album} 
              onClick={() => {
                setSelectedAlbum(album);
                setCurrentView('albumDetail');
              }} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-24">
          <LayoutGrid className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">Your Library is Empty</h3>
          <p className="mt-2">Create an album to start organizing your photo rolls.</p>
        </div>
      )}

      {showCreateModal && <CreateAlbumModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
};

export default AlbumsView;