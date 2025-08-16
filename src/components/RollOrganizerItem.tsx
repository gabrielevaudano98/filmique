import React from 'react';
import { Roll } from '../types';
import { ChevronRight } from 'lucide-react';
import Image from './Image';

interface RollOrganizerItemProps {
  roll: Roll;
  onClick: () => void;
}

const RollOrganizerItem: React.FC<RollOrganizerItemProps> = ({ roll, onClick }) => {
  const coverPhoto = roll.photos?.[0];

  return (
    <button onClick={onClick} className="w-full flex items-center p-4 bg-neutral-800/60 backdrop-blur-lg border border-neutral-700/50 hover:bg-neutral-700/50 rounded-xl transition-colors">
      <Image 
        src={coverPhoto?.thumbnail_url}
        alt={roll.title || 'Roll cover'}
        className="w-10 h-10 rounded-lg object-cover bg-neutral-700 mr-4 flex-shrink-0"
      />
      <div className="flex-1 text-left overflow-hidden">
        <p className="text-white font-semibold truncate">{roll.title}</p>
        <p className="text-gray-400 text-sm">{roll.shots_used || 0} photos</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-500 ml-2 flex-shrink-0" />
    </button>
  );
};

export default RollOrganizerItem;