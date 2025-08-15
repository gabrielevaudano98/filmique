import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Download, Trash2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import PhotoDetailModal from './PhotoDetailModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { Photo } from '../context/AppContext';
import PhotoInfoModal from './PhotoInfoModal';

const RollDetailView: React.FC = () => {
  const { selectedRoll, setCurrentView, setSelectedRoll, downloadRoll, deleteRoll } = useAppContext();
  const [photoToView, setPhotoToView] = useState<Photo | null>(null);
  const [photoToShowInfo, setPhotoToShowInfo] = useState<Photo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!selectedRoll) {
    setCurrentView('rolls');
    return null;
  }

  const handleBack = () => {
    setSelectedRoll(null);
    setCurrentView('rolls');
  };

  const handleDownloadRoll = () => {
    downloadRoll(selectedRoll);
  };

  const handleDeleteRoll = () => {
    deleteRoll(selectedRoll.id);
    setShowDeleteConfirm(false);
  };

  const developedDate = selectedRoll.developed_at 
    ? new Date(selectedRoll.developed_at)
    : new Date(new Date(selectedRoll.completed_at!).getTime() + 7 * 24 * 60 * 60 * 1000);

  const cacheBuster = selectedRoll.developed_at ? `?t=${new Date(selectedRoll.developed_at).getTime()}` : '';

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={handleBack} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Rolls</span>
        </button>
        <div className="flex items-center space-x-2">
          <button onClick={handleDownloadRoll} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold p-2 rounded-lg transition-colors">
            <Download className="w-5 h-5" />
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} className="bg-red-900/70 hover:bg-red-800/80 text-white font-semibold p-2 rounded-lg transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">{selectedRoll.title || selectedRoll.film_type}</h2>
        <p className="text-gray-400 mt-1">
          {selectedRoll.shots_used} photos • Developed on {developedDate.toLocaleDateString()}
        </p>
      </div>

      {/* Photo Grid */}
      {selectedRoll.photos && selectedRoll.photos.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1 sm:gap-2">
          {selectedRoll.photos.map(photo => (
            <div key={photo.id} className="aspect-square bg-gray-800 rounded-lg overflow-hidden group cursor-pointer" onClick={() => setPhotoToView(photo)}>
              <img 
                src={`${photo.thumbnail_url}${cacheBuster}`} 
                alt="User Photo" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 col-span-full bg-gray-800/50 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2 text-white">No Photos Found</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            It looks like there was an issue loading the photos for this roll.
          </p>
        </div>
      )}

      {photoToView && (
        <PhotoDetailModal 
          photo={photoToView} 
          onClose={() => setPhotoToView(null)}
          onShowInfo={() => {
            setPhotoToShowInfo(photoToView);
            setPhotoToView(null);
          }}
        />
      )}

      {photoToShowInfo && (
        <PhotoInfoModal 
          photo={photoToShowInfo} 
          roll={selectedRoll} 
          onClose={() => setPhotoToShowInfo(null)} 
        />
      )}
      
      {showDeleteConfirm && (
        <ConfirmDeleteModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteRoll}
          title="Delete Roll"
          message={`Are you sure you want to permanently delete "${selectedRoll.title || selectedRoll.film_type}"? All ${selectedRoll.shots_used} photos and related posts will be lost forever.`}
          confirmText="Delete"
        />
      )}
    </div>
  );
};

export default RollDetailView;