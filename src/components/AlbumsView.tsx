import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Album } from '../types';
import AlbumCard from './AlbumCard';
import { Library as LibraryIcon } from 'lucide-react';
import CreateAlbumModal from './CreateAlbumModal';
import StudioHeader from './StudioHeader';

const AlbumsView: React.FC = () => {
  const { albums, setSelectedAlbum, setCurrentView, refetchAlbums } = useAppContext();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    refetchAlbums();
  }, [refetchAlbums]);

  const handleSelectAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setCurrentView('albumDetail');
  };

  return (
    <>
      <div className="flex flex-col w-full">
        <StudioHeader onNewAlbumClick={() => setShowCreateModal(true)} />

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
            <h3 className="text-xl font-bold text-white">No Albums Yet</h3>
            <p className="mt-2">Create your first album to organize your rolls.</p>
          </div>
        )}
      </div>
      {showCreateModal && <CreateAlbumModal onClose={() => setShowCreateModal(false)} />}
    </>
  );
};

export default AlbumsView;