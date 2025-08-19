import React from 'react';
import { Photo, Roll } from '../types';
import Image from './Image';

interface PhotoGridItemProps {
  photo: Photo & { roll: Roll };
  onClick: () => void;
}

const PhotoGridItem: React.FC<PhotoGridItemProps> = ({ photo, onClick }) => {
  const cacheBuster = photo.roll.developed_at ? `?t=${new Date(photo.roll.developed_at).getTime()}` : '';
  
  return (
    <button
      onClick={onClick}
      className="w-full aspect-square bg-neutral-800 rounded-lg overflow-hidden group relative"
    >
      <Image
        src={`${photo.thumbnail_url}${cacheBuster}`}
        alt="Album photo"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />
    </button>
  );
};

export default PhotoGridItem;