import React, { useState, useRef, useEffect } from 'react';
import { Search, Check, Film as FilmIcon, ArrowUp, ArrowDown, ArrowDownAZ, ArrowUpZA, Filter, ArrowUpDown } from 'lucide-react';

interface RollsControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
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
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  filmTypes,
  selectedFilm,
  setSelectedFilm,
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(sortRef, () => setIsSortOpen(false));
  useOnClickOutside(filterRef, () => setIsFilterOpen(false));

  const sortOptions = [
    { key: 'newest', label: 'Newest First', icon: <ArrowDown className="w-4 h-4 text-gray-400" /> },
    { key: 'oldest', label: 'Oldest First', icon: <ArrowUp className="w-4 h-4 text-gray-400" /> },
    { key: 'title_asc', label: 'Title (A-Z)', icon: <ArrowDownAZ className="w-4 h-4 text-gray-400" /> },
    { key: 'title_desc', label: 'Title (Z-A)', icon: <ArrowUpZA className="w-4 h-4 text-gray-400" /> },
  ];

  return (
    <div className="flex flex-row gap-3 mb-6">
      <div className="relative flex-grow">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search rolls by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-brand-brown-dark border border-brand-border rounded-lg pl-11 pr-4 py-2.5 text-white focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition-colors h-12"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={filterRef}>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)} 
            className="flex items-center justify-center w-12 h-12 bg-brand-brown-dark border border-brand-border rounded-lg text-white hover:bg-brand-brown-light/80 transition-colors"
            aria-label="Filter rolls"
          >
            <Filter className="w-5 h-5 text-gray-400" />
          </button>
          {isFilterOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-brand-brown-dark border border-brand-border rounded-lg shadow-2xl z-10 p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Filter by Film</div>
              <button onClick={() => { setSelectedFilm('all'); setIsFilterOpen(false); }} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-200 hover:bg-brand-brown-light rounded-md">
                <span className="flex items-center gap-2"><FilmIcon className="w-4 h-4" /> All Film Types</span>
                {selectedFilm === 'all' && <Check className="w-4 h-4 text-brand-orange-start" />}
              </button>
              <div className="h-px bg-brand-border my-1"></div>
              {filmTypes.map(film => (
                <button key={film} onClick={() => { setSelectedFilm(film); setIsFilterOpen(false); }} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-200 hover:bg-brand-brown-light rounded-md">
                  <span className="flex items-center gap-2"><FilmIcon className="w-4 h-4" /> {film}</span>
                  {selectedFilm === film && <Check className="w-4 h-4 text-brand-orange-start" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={sortRef}>
          <button 
            onClick={() => setIsSortOpen(!isSortOpen)} 
            className="flex items-center justify-center w-12 h-12 bg-brand-brown-dark border border-brand-border rounded-lg text-white hover:bg-brand-brown-light/80 transition-colors"
            aria-label="Sort rolls"
          >
            <ArrowUpDown className="w-5 h-5 text-gray-400" />
          </button>
          {isSortOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-brand-brown-dark border border-brand-border rounded-lg shadow-2xl z-10 p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Sort by</div>
              {sortOptions.map(opt => (
                <button key={opt.key} onClick={() => { setSortOrder(opt.key); setIsSortOpen(false); }} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-200 hover:bg-brand-brown-light rounded-md">
                  <span className="flex items-center gap-2">{opt.icon} {opt.label}</span>
                  {sortOrder === opt.key && <Check className="w-4 h-4 text-brand-orange-start" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RollsControls;