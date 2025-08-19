import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Edit, Image as ImageIcon, Film, Lock, Link2, Globe } from 'lucide-react';
import ManageRollsModal from './ManageRollsModal';
import { Roll, Photo } from '../types';
import PhotoGridItem from './PhotoGridItem';
import PhotoDetailModal from './PhotoDetailModal';
import PhotoInfoModal from './PhotoInfoModal';

const AlbumDetailView: React.FC = () => {
  const { selectedAlbum, setCurrentView, setSelectedAlbum } = useAppContext();
  const [showManageModal, setShowManageModal] = useState(false);
  const [photoToView, setPhotoToView] = useState<(Photo & { roll: Roll }) | null>(null);
  const [photoToShowInfo, setPhotoToShowInfo] = useState<(Photo & { roll: Roll }) | null>(null);

  if (!selectedAlbum) {
    setCurrentView('profile');
    return null;
  }

  const handleBack = () => {
    setSelectedAlbum(null);
    setCurrentView('library');
  };

  const allPhotos = useMemo(() => {
    if (!selectedAlbum?.rolls) return [];
    return selectedAlbum.rolls.flatMap(roll => 
      roll.photos?.map(photo => ({ ...photo, roll })) || []
    );
  }, [selectedAlbum]);

  const rolls = selectedAlbum.rolls || [];
  const photoCount = allPhotos.length;

  const visibilityInfo = {
    private: { icon: Lock, label: 'Private', color: 'text-red-400' },
    unlisted: { icon: Link2, label: 'Unlisted', color: 'text-yellow-400' },
    public: { icon: Globe, label: 'Public', color: 'text-green-400' },
  };
  const info = visibilityInfo[selectedAlbum.type] || visibilityInfo.private;
  const Icon = info.icon;

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-6">
        <button onClick={handleBack} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Library</span>
        </button>
        <button onClick={() => setShowManageModal(true)} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
          <Edit className="w-4 h-4" />
          <span>Manage Rolls</span>
        </button>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-3xl font-bold text-white">{selectedAlbum.title}</h2>
          <span className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full bg-neutral-700/50 ${info.color}`}>
            <Icon className="w-4 h-4" />
            {info.label}
          </span>
        </div>
        <div className="text-gray-400 mt-2 flex items-center space-x-4">
          <span className="flex items-center space-x-1.5"><Film className="w-4 h-4" /><span>{rolls.length} Rolls</span></span>
          <span className="flex items-center space-x-1.5"><ImageIcon className="w-4 h-4" /><span>{photoCount} Photos</span></span>
        </div>
      </div>

      {allPhotos.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {allPhotos.map(photo => (
            <PhotoGridItem
              key={photo.id}
              photo={photo}
              onClick={() => setPhotoToView(photo)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 col-span-full bg-gray-800/50 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2 text-white">Empty Album</h3>
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

      {photoToView && (
        <PhotoDetailModal 
          photo={photoToView} 
          onClose={() => setPhotoToView(null)}
          onShowInfo={() => { setPhotoToShowInfo(photoToView); setPhotoToView(null); }}
        />
      )}
      {photoToShowInfo && (
        <PhotoInfoModal 
          photo={photoToShowInfo} 
          roll={photoToShowInfo.roll} 
          onClose={() => setPhotoToShowInfo(null)} 
        />
      )}
    </div>
  );
};

export default AlbumDetailView;