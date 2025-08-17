import React from 'react';
import { X, Film, Camera, Clock, ZoomIn, MapPin } from 'lucide-react';
import { Photo, Roll } from '../types';
import Histogram from './Histogram';
import { getPhotoAsWebViewPath } from '../utils/fileStorage';
import { LocalPhoto } from '../integrations/db';

interface PhotoInfoModalProps {
  photo: Photo;
  roll: Roll;
  onClose: () => void;
}

const InfoRow: React.FC<{ label: string; value: string | number | undefined; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-center text-sm">
    <div className="w-8 h-8 flex items-center justify-center text-gray-400">{icon}</div>
    <div className="ml-2">
      <p className="font-semibold text-white truncate" title={String(value || '')}>{value || 'N/A'}</p>
      <p className="text-gray-500 text-xs">{label}</p>
    </div>
  </div>
);

const PhotoInfoModal: React.FC<PhotoInfoModalProps> = ({ photo, roll, onClose }) => {
  const developedDate = roll.developed_at 
    ? new Date(roll.developed_at).toLocaleDateString()
    : 'N/A';
  
  const geolocation = photo.metadata?.geolocation;
  const localPhoto = photo as LocalPhoto;
  const imageSrc = localPhoto.url ? localPhoto.url : getPhotoAsWebViewPath(localPhoto.local_path!);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-[70]" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-neutral-800 h-full shadow-2xl border-l border-neutral-700/50 flex flex-col animate-slide-in-right"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b border-neutral-700/50 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-white">Photo Details</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="overflow-y-auto p-6 space-y-8 no-scrollbar">
          <div>
            <h3 className="text-lg font-semibold text-brand-amber-start mb-4">Color Analysis</h3>
            <Histogram imageUrl={imageSrc} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-brand-amber-start mb-4">Roll Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Film Stock" value={roll.film_type} icon={<Film className="w-5 h-5" />} />
              <InfoRow label="Roll Title" value={roll.title} icon={<Film className="w-5 h-5" />} />
              <InfoRow label="Developed" value={developedDate} icon={<Clock className="w-5 h-5" />} />
            </div>
          </div>

          {photo.metadata && (
            <div>
              <h3 className="text-lg font-semibold text-brand-amber-start mb-4">Camera Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="ISO" value={photo.metadata.iso} icon={<Camera className="w-5 h-5" />} />
                <InfoRow label="Shutter" value={photo.metadata.shutterSpeed} icon={<Camera className="w-5 h-5" />} />
                <InfoRow label="Zoom" value={photo.metadata.zoom} icon={<ZoomIn className="w-5 h-5" />} />
              </div>
            </div>
          )}

          {geolocation && (
            <div>
              <h3 className="text-lg font-semibold text-brand-amber-start mb-4">Location</h3>
              <a 
                href={`https://www.openstreetmap.org/?mlat=${geolocation.latitude}&mlon=${geolocation.longitude}#map=16/${geolocation.latitude}/${geolocation.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm p-2 rounded-lg hover:bg-neutral-700/50 transition-colors -ml-2"
              >
                <div className="w-8 h-8 flex items-center justify-center text-gray-400"><MapPin className="w-5 h-5" /></div>
                <div className="ml-2">
                  <p className="font-semibold text-white">{`${geolocation.latitude.toFixed(4)}, ${geolocation.longitude.toFixed(4)}`}</p>
                  <p className="text-gray-500 text-xs">View on map</p>
                </div>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoInfoModal;