import React, { useState, useEffect } from 'react';
import { X, Download, Info, Share as ShareIcon } from 'lucide-react';
import { Photo } from '../context/AppContext';
import { useAppContext } from '../context/AppContext';
import Image from './Image';
import { useNativeShare } from '../hooks/useNativeShare';
import { getPhotoAsWebViewPath } from '../utils/fileStorage';
import { LocalPhoto } from '../integrations/db';

interface PhotoDetailModalProps {
  photo: Photo;
  onClose: () => void;
  onShowInfo: () => void;
}

const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({ photo, onClose, onShowInfo }) => {
  const { downloadPhoto, isOnline } = useAppContext();
  const { sharePhoto } = useNativeShare();
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const loadPhotoSrc = async () => {
      const localPhoto = photo as LocalPhoto;
      const src = localPhoto.url ? localPhoto.url : await getPhotoAsWebViewPath(localPhoto.local_path!);
      setImageSrc(src);
    };
    loadPhotoSrc();
  }, [photo]);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadPhoto(photo);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    sharePhoto(photo);
  };

  const handleShowInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShowInfo();
  };

  const cacheBuster = `?t=${new Date().getTime()}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] w-full h-full" onClick={e => e.stopPropagation()}>
        {imageSrc && <Image src={`${imageSrc}${cacheBuster}`} alt="Full size view" className="w-full h-full object-contain" />}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button onClick={handleShowInfo} className="bg-gray-800/70 hover:bg-gray-700 text-white font-semibold p-3 rounded-full transition-colors">
            <Info className="w-6 h-6" />
          </button>
          <button onClick={handleShare} disabled={!isOnline} className="bg-gray-800/70 hover:bg-gray-700 text-white font-semibold p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <ShareIcon className="w-6 h-6" />
          </button>
          <button onClick={handleDownload} disabled={!isOnline} className="bg-gray-800/70 hover:bg-gray-700 text-white font-semibold p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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