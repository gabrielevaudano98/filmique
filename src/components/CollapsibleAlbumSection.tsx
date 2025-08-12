import React from 'react';
import { ChevronRight, Film, Image as ImageIcon } from 'lucide-react';
import { Roll, Album } from '../types';
import { useAppContext } from '../context/AppContext';

interface CollapsibleAlbumSectionProps {
  title: string;
  rolls: Roll[];
  album?: Album;
}

const CollapsibleAlbumSection: React.FC<CollapsibleAlbumSectionProps> = ({
  title,
  rolls,
  album,
}) => {
  const { setCurrentView, setSelectedAlbum } = useAppContext();

  const photoCount = rolls.reduce((sum, roll) => sum + (roll.shots_used || 0), 0);

  const handleHeaderClick = () => {
    if (album) {
      setSelectedAlbum(album);
      setCurrentView('albumDetail');
    } else {
      // This is the 'Uncategorized' section
      setCurrentView('uncategorizedRolls');
    }
  };

  return (
    <div
      onClick={handleHeaderClick}
      className="bg-neutral-800/50 rounded-xl border border-neutral-700/50 overflow-hidden hover:bg-neutral-700/30 transition-colors cursor-pointer"
    >
      <header className="flex items-center justify-between p-4">
        <div className="flex-1">
          <h4 className="font-bold text-lg text-white">{title}</h4>
          <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
            <span className="flex items-center gap-1.5"><Film className="w-4 h-4" /> {rolls.length} Rolls</span>
            <span className="flex items-center gap-1.5"><ImageIcon className="w-4 h-4" /> {photoCount} Photos</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-500" />
      </header>
    </div>
  );
};

export default CollapsibleAlbumSection;