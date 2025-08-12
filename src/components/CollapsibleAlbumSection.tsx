import React from 'react';
import { ChevronDown, Film, Image as ImageIcon } from 'lucide-react';
import { Roll, Album } from '../types';
import RollListItem from './RollListItem';
import { useAppContext } from '../context/AppContext';

interface CollapsibleAlbumSectionProps {
  title: string;
  rolls: Roll[];
  album?: Album;
  initiallyOpen?: boolean;
  onDeleteRoll: (roll: Roll) => void;
  onAssignRoll: (roll: Roll) => void;
}

const CollapsibleAlbumSection: React.FC<CollapsibleAlbumSectionProps> = ({
  title,
  rolls,
  album,
  initiallyOpen = true,
  onDeleteRoll,
  onAssignRoll,
}) => {
  const { setCurrentView, setSelectedAlbum } = useAppContext();
  const [isOpen, setIsOpen] = React.useState(initiallyOpen);

  const photoCount = rolls.reduce((sum, roll) => sum + (roll.shots_used || 0), 0);

  const handleHeaderClick = () => {
    if (album) {
      setSelectedAlbum(album);
      setCurrentView('albumDetail');
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    if (album) {
      e.stopPropagation(); // Prevent navigation if clicking the chevron on a real album
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-neutral-800/50 rounded-xl border border-neutral-700/50 overflow-hidden">
      <header
        onClick={handleHeaderClick}
        className={`flex items-center justify-between p-4 ${album ? 'cursor-pointer' : ''} hover:bg-neutral-700/30 transition-colors`}
      >
        <div className="flex-1">
          <h4 className="font-bold text-lg text-white">{title}</h4>
          <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
            <span className="flex items-center gap-1.5"><Film className="w-4 h-4" /> {rolls.length} Rolls</span>
            <span className="flex items-center gap-1.5"><ImageIcon className="w-4 h-4" /> {photoCount} Photos</span>
          </div>
        </div>
        <button
          onClick={handleToggle}
          className="p-2 rounded-full hover:bg-neutral-600 transition-colors"
          aria-label={isOpen ? 'Collapse section' : 'Expand section'}
        >
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </header>
      {isOpen && (
        <div className="p-2 space-y-2">
          {rolls.length > 0 ? (
            rolls.map(roll => (
              <RollListItem
                key={roll.id}
                roll={roll}
                onDelete={onDeleteRoll}
                onAssignAlbum={onAssignRoll}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500 px-4 py-6 text-center">This album is empty.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CollapsibleAlbumSection;