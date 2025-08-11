import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { BookPlus, Image as ImageIcon, Film } from 'lucide-react';
import CreateAlbumModal from './CreateAlbumModal';
import { Album } from '../context/AppContext';

const AlbumCard: React.FC<{ album: Album; onSelect: () => void; }> = ({ album, onSelect }) => {
  const coverImage = album.cover_image_url || `https://placehold.co/400x400/e5e7eb/9ca3af?text=${album.title.charAt(0)}`;
  
  return (
    <div onClick={onSelect} className="group relative aspect-[4/5] cursor-pointer transition-transform duration-300 ease-in-out hover:-translate-y-1">
      <div className="w-full h-full bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col border border-gray-200/80">
        <div className="w-full aspect-square bg-gray-100 overflow-hidden">
          <img src={coverImage} alt={album.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </div>
        <div className="p-3 flex-1 flex flex-col justify-between bg-white">
          <div>
            <h4 className="font-semibold text-gray-900 truncate text-base leading-tight">{album.title}</h4>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
            <span className="flex items-center gap-1.5"><Film className="w-4 h-4" /> {album.rollCount || 0}</span>
            <span className="flex items-center gap-1.5"><ImageIcon className="w-4 h-4" /> {album.photoCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AlbumsView: React.FC = () => {
  const { albums, selectAlbum } = useAppContext();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-gray-900">My Albums</h1>
        <button onClick={() => setShowCreateModal(true)} className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 shadow-lg shadow-red-500/20">
          <BookPlus className="w-4 h-4" />
          <span>New Album</span>
        </button>
      </div>

      {albums.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {albums.map(album => (
            <AlbumCard key={album.id} album={album} onSelect={() => selectAlbum(album.id)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-lg border border-gray-200/80">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2 text-gray-800">No Albums Yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Create albums to organize your favorite photo rolls.
          </p>
        </div>
      )}

      {showCreateModal && <CreateAlbumModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
};

export default AlbumsView;