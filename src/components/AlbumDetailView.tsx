import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Edit, Image as ImageIcon, Film } from 'lucide-react';
import ManageRollsModal from './ManageRollsModal';
import { Photo, Roll } from '../context/AppContext';

const AlbumDetailView: React.FC = () => {
  const { selectedAlbum, setCurrentView, setSelectedAlbum } = useAppContext();
  const [showManageModal, setShowManageModal] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    if (selectedAlbum?.album_rolls) {
      const allPhotos = selectedAlbum.album_rolls.flatMap((ar: any) => ar.rolls.photos || []);
      setPhotos(allPhotos);
    }
  }, [selectedAlbum]);

  if (!selectedAlbum) {
    setCurrentView('albums');
    return null;
  }

  const handleBack = () => {
    setSelectedAlbum(null);
    setCurrentView('albums');
  };

  const rollCount = selectedAlbum.album_rolls?.length || 0;

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-6">
        <button onClick={handleBack} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Albums</span>
        </button>
        <button onClick={() => setShowManageModal(true)} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
          <Edit className="w-4 h-4" />
          <span>Manage Rolls</span>
        </button>
      </div>
      
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-recoleta text-white">{selectedAlbum.title}</h2>
        <div className="text-gray-400 mt-2 flex items-center space-x-4">
          <span className="flex items-center space-x-1.5"><Film className="w-4 h-4" /><span>{rollCount} Rolls</span></span>
          <span className="flex items-center space-x-1.5"><ImageIcon className="w-4 h-4" /><span>{photos.length} Photos</span></span>
        </div>
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1 sm:gap-2">
          {photos.map(photo => (
            <div key={photo.id} className="aspect-square bg-gray-800 rounded-lg overflow-hidden group cursor-pointer">
              <img 
                src={photo.thumbnail_url} 
                alt="User Photo" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 col-span-full bg-gray-800/50 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2 font-recoleta text-white">Empty Album</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            This album doesn't have any photos yet. Add some rolls to see them here.
          </p>
        </div>
      )}

      {showManageModal && (
        <ManageRollsModal
          album={selectedAlbum}
          onClose={() => setShowManageModal(false)}
        />
      )}
    </div>
  );
};

export default AlbumDetailView;