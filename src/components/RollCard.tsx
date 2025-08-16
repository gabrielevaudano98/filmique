import React from 'react';
import { Roll } from '../types';
import { useAppContext } from '../context/AppContext';
import { Image as ImageIcon } from 'lucide-react';
import Image from './Image';

interface RollCardProps {
  roll: Roll;
}

const RollCard: React.FC<RollCardProps> = ({ roll }) => {
  const { setSelectedRoll, setCurrentView } = useAppContext();
  const coverPhoto = roll.photos?.[0];

  const handleClick = () => {
    setSelectedRoll(roll);
    setCurrentView('rollDetail');
  };

  return (
    <button 
      onClick={handleClick}
      className="w-full aspect-square bg-neutral-800 rounded-xl overflow-hidden group relative text-left flex flex-col justify-end p-3 border border-neutral-700/50 hover:border-brand-amber-start/50 transition-all"
    >
      {coverPhoto ? (
        <>
          <Image
            src={coverPhoto.thumbnail_url}
            alt={roll.title || 'Roll cover'}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="w-10 h-10 text-neutral-600" />
        </div>
      )}
      
      <div className="relative z-10">
        <p className="font-bold text-white text-sm truncate" title={roll.title || 'Untitled Roll'}>
          {roll.title || 'Untitled Roll'}
        </p>
        <div className="flex items-center space-x-1 text-xs text-gray-300 mt-0.5">
          <ImageIcon className="w-3 h-3" />
          <span>{roll.shots_used} photos</span>
        </div>
      </div>
    </button>
  );
};

export default RollCard;