import React from 'react';
import { Film, Library as LibraryIcon, Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import RollsControls from './RollsControls';
import ExpandableSearch from './ExpandableSearch';

interface StudioHeaderProps {
  onNewAlbumClick?: () => void;
}

const StudioHeader: React.FC<StudioHeaderProps> = ({ onNewAlbumClick }) => {
  const { currentView, setCurrentView, searchTerm, setSearchTerm } = useAppContext();
  const isRollsActive = currentView === 'studio';
  const isAlbumsActive = currentView === 'albums';

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Studio</h1>
        <div className="flex items-center gap-2 p-1 bg-neutral-800/60 rounded-full border border-white/10">
          <button
            onClick={() => setCurrentView('studio')}
            className={`p-2 rounded-full transition-colors ${isRollsActive ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`}
            aria-label="View Rolls"
          >
            <Film className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentView('albums')}
            className={`p-2 rounded-full transition-colors ${isAlbumsActive ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`}
            aria-label="View Albums"
          >
            <LibraryIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isRollsActive && (
          <>
            <ExpandableSearch searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
            <RollsControls />
          </>
        )}
        {isAlbumsActive && onNewAlbumClick && (
          <button
            onClick={onNewAlbumClick}
            className="flex items-center gap-2 text-sm font-semibold text-brand-amber-start hover:text-brand-amber-mid transition-colors"
            aria-label="Create New Album"
          >
            <Plus className="w-4 h-4" />
            <span>New Album</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default StudioHeader;