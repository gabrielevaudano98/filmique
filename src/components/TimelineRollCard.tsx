import React from 'react';
import { Roll } from '../types';
import Image from './Image';
import { useAppContext } from '../context/AppContext';

interface TimelineRollCardProps {
  roll: Roll;
}

const TimelineRollCard: React.FC<TimelineRollCardProps> = ({ roll }) => {
  const { setSelectedRoll, setCurrentView } = useAppContext();
  const coverPhoto = roll.photos?.[0];

  const handleClick = () => {
    setSelectedRoll(roll);
    setCurrentView('rollDetail');
  };

  return (
    <button onClick={handleClick} className="w-full aspect-square bg-neutral-800 rounded-lg overflow-hidden group relative">
      <Image
        src={coverPhoto?.thumbnail_url}
        alt={roll.title || 'Roll cover'}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <p className="text-white text-xs font-bold truncate">{roll.title}</p>
      </div>
    </button>
  );
};

export default TimelineRollCard;