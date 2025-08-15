import React from 'react';
import { X, Download, Info } from 'lucide-react';
import { Photo } from '../context/AppContext';
import { useAppContext } from '../context/AppContext';

interface PhotoDetailModalProps {
  photo: Photo;
  onClose: () => void;
  onShowInfo: () => void;
}

const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({ photo, onClose, onShowInfo }) => {
  const { downloadPhoto } = useAppContext();

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadPhoto(photo);
  };

  const handleShowInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShowInfo();
  };

  const cacheBuster = `?t=${new Date().getTime()}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] w-full h-full" onClick={e => e.stopPropagation()}>
        <img src={`${photo.url}${cacheBuster}`} alt="Full size view" className="w-full h-full object-contain" />
        <div className="absolute top-4 right-4 flex space-x-2">
          <button onClick={handleShowInfo} className="bg-gray-800/70 hover:bg-gray-700 text-white font-semibold p-3 rounded-full transition-colors">
            <Info className="w-6 h-6" />
          </button>
          <button onClick={handleDownload} className="bg-gray-800/70 hover:bg-gray-700 text-white font-semibold p-3 rounded-full transition-colors">
            <Download className="w-6 h-6" />
          </button>
          <button onClick={onClose} className="bg-gray-800/70 hover:bg-gray-700 text-white font-semibold p-3 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetailModal;