import React from 'react';
import { Roll } from '../types';
import { Folder, Image as ImageIcon } from 'lucide-react';
import Image from './Image';

interface UncategorizedAlbumCardProps {
  rolls: Roll[];
  onClick: () => void;
}

const UncategorizedAlbumCard: React.FC<UncategorizedAlbumCardProps> = ({ rolls, onClick }) => {
  const photoCount = rolls.reduce((sum, roll) => sum + (roll.shots_used || 0), 0);
  const coverPhotos = rolls.slice(0, 4).map(roll => roll.photos?.[0]?.thumbnail_url).filter(Boolean) as string[];

  return (
    <button
      onClick={onClick}
      className="w-full aspect-[4/5] bg-neutral-800 rounded-xl overflow-hidden group relative text-left flex flex-col justify-between p-4 border border-neutral-700/50 hover:border-brand-amber-start/50 transition-all"
    >
      <div className="relative z-10 flex-1 flex flex-col justify-start">
        <div className="w-12 h-12 rounded-lg bg-neutral-700 flex items-center justify-center mb-4">
          <Folder className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="font-bold text-lg text-white leading-tight">Uncategorized</h3>
        <div className="flex items-center space-x-3 text-xs text-gray-300 mt-1">
          <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> {photoCount} Photos</span>
        </div>
      </div>
      
      {coverPhotos.length > 0 && (
        <div className="relative z-10 grid grid-cols-2 gap-1 mt-4">
          {coverPhotos.map((url, i) => (
            <div key={i} className="aspect-square rounded-md bg-neutral-700 overflow-hidden">
              <Image src={url} alt="Uncategorized cover" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </button>
  );
};

export default UncategorizedAlbumCard;