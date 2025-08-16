import React, { useState, useRef, useEffect } from 'react';
import { Check, Film as FilmIcon, ArrowUp, ArrowDown, ArrowDownAZ, ArrowUpZA, LayoutGrid, Tag, SlidersHorizontal } from 'lucide-react';

interface RollsControlsProps {
  sortOrder: string;
  setSortOrder: (order: string) => void;
  groupBy: string;
  setGroupBy: (group: string) => void;
  filmTypes: string[];
  selectedFilm: string;
  setSelectedFilm: (film: string) => void;
}

const useOnClickOutside = (ref: React.RefObject<HTMLDivElement>, handler: () => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

const RollsControls: React.FC<RollsControlsProps> = ({
  sortOrder,
  setSortOrder,
  groupBy,
  setGroupBy,
  filmTypes,
  selectedFilm,
  setSelectedFilm,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(controlsRef, () => setIsOpen(false));

  const sortOptions = [
    { key: 'newest', label: 'Newest First', icon: <ArrowDown className="w-4 h-4 text-gray-400" /> },
    { key: 'oldest', label: 'Oldest First', icon: <ArrowUp className="w-4 h-4 text-gray-400" /> },
    { key: 'title_asc', label: 'Title (A-Z)', icon: <ArrowDownAZ className="w-4 h-4 text-gray-400" /> },
    { key: 'title_desc', label: 'Title (Z-A)', icon: <ArrowUpZA className="w-4 h-4 text-gray-400" /> },
  ];

  const groupOptions = [
    { key: 'none', label: 'None', icon: <LayoutGrid className="w-4 h-4 text-gray-400" /> },
    { key: 'film_type', label: 'Film Type', icon: <FilmIcon className="w-4 h-4 text-gray-400" /> },
    { key: 'tag', label: 'Tag', icon: <Tag className="w-4 h-4 text-gray-400" /> },
  ];

  return (
    <div className="relative" ref={controlsRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-center w-11 h-11 bg-neutral-800/60 backdrop-blur-lg border border-white/10 rounded-xl text-white hover:bg-neutral-700/80 transition-colors"
        aria-label="Display options"
      >
        <SlidersHorizontal className="w-5 h-5 text-gray-300" />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-neutral-800/80 backdrop-blur-lg border border-white/10 rounded-lg shadow-2xl z-10 p-2">
          {/* Sort Section */}
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Sort by</div>
          {sortOptions.map(opt => (
            <button key={opt.key} onClick={() => { setSortOrder(opt.key); }} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-200 hover:bg-neutral-700/50 rounded-md">
              <span className="flex items-center gap-2">{opt.icon} {opt.label}</span>
              {sortOrder === opt.key && <Check className="w-4 h-4 text-brand-amber-start" />}
            </button>
          ))}
          <div className="h-px bg-white/10 my-1"></div>

          {/* Group Section */}
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Group by</div>
          {groupOptions.map(opt => (
            <button key={opt.key} onClick={() => { setGroupBy(opt.key); }} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-200 hover:bg-neutral-700/50 rounded-md">
              <span className="flex items-center gap-2">{opt.icon} {opt.label}</span>
              {groupBy === opt.key && <Check className="w-4 h-4 text-brand-amber-start" />}
            </button>
          ))}
          <div className="h-px bg-white/10 my-1"></div>

          {/* Filter Section */}
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Filter by Film</div>
          <button onClick={() => { setSelectedFilm('all'); }} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-200 hover:bg-neutral-700/50 rounded-md">
            <span className="flex items-center gap-2"><FilmIcon className="w-4 h-4" /> All Film Types</span>
            {selectedFilm === 'all' && <Check className="w-4 h-4 text-brand-amber-start" />}
          </button>
          {filmTypes.map(film => (
            <button key={film} onClick={() => { setSelectedFilm(film); }} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-200 hover:bg-neutral-700/50 rounded-md">
              <span className="flex items-center gap-2"><FilmIcon className="w-4 h-4" /> {film}</span>
              {selectedFilm === film && <Check className="w-4 h-4 text-brand-amber-start" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RollsControls;