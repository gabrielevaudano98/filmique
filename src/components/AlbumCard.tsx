import React from 'react';
import { BookCopy } from 'lucide-react';
import { Album } from '../types';

interface AlbumCardProps {
  album: Album;
  onClick: () => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, onClick }) => {
  const coverPhoto = album.rolls?.[0]?.photos?.[0]?.thumbnail_url;
  const rollCount = album.rollCount || 0;
  const photoCount = album.photoCount || 0;

  return (
    <div className="group relative aspect-[4/5] cursor-pointer transition-transform duration-300 ease-in-out hover:-translate-y-2" onClick={onClick}>
      <div className="w-full h-full bg-neutral-800 rounded-2xl shadow-xl overflow-hidden flex flex-col border border-neutral-700/80">
        <div className="w-full aspect-square bg-neutral-900 overflow-hidden relative">
          {coverPhoto ? (
            <img src={coverPhoto} alt={album.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-900">
              <BookCopy className="w-16 h-16 text-neutral-700" />
            </div>
          )}
        </div>
        <div className="p-3 flex-1 flex flex-col justify-between bg-neutral-800">
          <div>
            <h4 className="font-bold text-white truncate text-base leading-tight">{album.title}</h4>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
            <span>{rollCount} {rollCount === 1 ? 'roll' : 'rolls'}</span>
            <span>{photoCount} photos</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumCard;