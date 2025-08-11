import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, Search, Check, ArrowDownAZ, DollarSign, Film, Lock, Filter as FilterIcon, ArrowUpDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { filmStockCategories, FilmStock } from '../utils/filters';

interface FilmSelectionModalProps {
  onStartRoll: (filmType: string, capacity: number) => void;
  onClose: () => void;
}

const useOnClickOutside = (ref: React.RefObject<HTMLElement>, handler: (event: MouseEvent | TouchEvent) => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

const FilmSelectionModal: React.FC<FilmSelectionModalProps> = ({ onStartRoll, onClose }) => {
  const { profile, activeRoll } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState<'type' | 'brand'>('type');
  const [sortOrder, setSortOrder] = useState<'name' | 'price'>('name');
  const [selectedFilm, setSelectedFilm] = useState<FilmStock | null>(null);

  const [isSortMenuOpen, setSortMenuOpen] = useState(false);
  const [isGroupMenuOpen, setGroupMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const groupMenuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(sortMenuRef, () => setSortMenuOpen(false));
  useOnClickOutside(groupMenuRef, () => setGroupMenuOpen(false));

  const processedFilms = useMemo(() => {
    const allFilms = Object.values(filmStockCategories).flat();
    const lowerCaseSearch = searchTerm.toLowerCase();

    const filtered = allFilms.filter(film => film.name.toLowerCase().includes(lowerCaseSearch));

    filtered.sort((a, b) => {
      if (sortOrder === 'price') return a.price - b.price;
      return a.name.localeCompare(b.name);
    });

    const getBrand = (name: string) => name.split(' ')[0];
    const findCategory = (film: FilmStock) => Object.keys(filmStockCategories).find(cat => filmStockCategories[cat].includes(film)) || 'Uncategorized';

    return filtered.reduce((acc, film) => {
      const key = groupBy === 'brand' ? getBrand(film.name) : findCategory(film);
      if (!acc[key]) acc[key] = [];
      acc[key].push(film);
      return acc;
    }, {} as Record<string, FilmStock[]>);
  }, [searchTerm, sortOrder, groupBy]);

  const totalCost = selectedFilm?.price ?? 0;
  const canAfford = profile ? profile.credits >= totalCost : false;

  const handleStartRoll = () => {
    if (selectedFilm && canAfford && selectedFilm.unlocked) {
      onStartRoll(selectedFilm.name, selectedFilm.capacity);
      onClose();
    }
  };

  const sortOptions = [
    { key: 'name', label: 'A-Z', icon: ArrowDownAZ },
    { key: 'price', label: 'Price', icon: DollarSign },
  ];

  const groupOptions = [
    { key: 'type', label: 'Category' },
    { key: 'brand', label: 'Brand' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-gray-900 sm:rounded-2xl w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex-shrink-0 backdrop-blur-lg bg-gray-900/80 border-b border-gray-700/50 z-10">
          <div className="w-full flex justify-center pt-3 sm:hidden">
            <div className="w-10 h-1.5 bg-gray-700 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-bold font-recoleta">Select Film</h2>
            <button onClick={onClose} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-4 pb-4 flex items-center gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search film stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-11 pr-4 py-2.5 text-white focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div className="relative" ref={groupMenuRef}>
              <button onClick={() => setGroupMenuOpen(v => !v)} className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <FilterIcon className="w-5 h-5 text-gray-300" />
              </button>
              {isGroupMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-20 p-2">
                  {groupOptions.map(opt => (
                    <button key={opt.key} onClick={() => { setGroupBy(opt.key as any); setGroupMenuOpen(false); }} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-md">
                      <span>Group by {opt.label}</span>
                      {groupBy === opt.key && <Check className="w-4 h-4 text-amber-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative" ref={sortMenuRef}>
              <button onClick={() => setSortMenuOpen(v => !v)} className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <ArrowUpDown className="w-5 h-5 text-gray-300" />
              </button>
              {isSortMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-20 p-2">
                  {sortOptions.map(opt => (
                    <button key={opt.key} onClick={() => { setSortOrder(opt.key as any); setSortMenuOpen(false); }} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-md">
                      <span className="flex items-center gap-2"><opt.icon className="w-4 h-4" /> Sort by {opt.label}</span>
                      {sortOrder === opt.key && <Check className="w-4 h-4 text-amber-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Film List */}
        <div className="overflow-y-auto no-scrollbar p-4 space-y-6 flex-grow">
          {activeRoll && !activeRoll.is_completed && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 p-3 rounded-lg text-sm">
              Changing film will discard the <strong>{activeRoll.shots_used} shots</strong> on your current roll.
            </div>
          )}
          
          {Object.keys(processedFilms).sort().map(groupName => (
            <div key={groupName}>
              <h3 className="text-lg font-semibold mb-3 font-recoleta text-amber-400">{groupName}</h3>
              <div className="space-y-2">
                {processedFilms[groupName].map(film => (
                  <button
                    key={film.name}
                    onClick={() => setSelectedFilm(film)}
                    disabled={!film.unlocked}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between
                      ${selectedFilm?.name === film.name ? 'border-amber-400 bg-amber-400/10' : film.unlocked ? 'border-gray-700 bg-gray-800 hover:border-gray-600' : 'border-gray-800 bg-gray-800 opacity-50 cursor-not-allowed'}`}
                  >
                    <div className="flex-grow">
                      <h4 className="font-semibold text-base text-white">{film.name}</h4>
                      <p className="text-sm text-gray-400">{film.capacity} exposures</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {selectedFilm?.name === film.name ? (
                        <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                          <Check className="w-4 h-4 text-gray-900" />
                        </div>
                      ) : film.unlocked ? (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-600"></div>
                      ) : (
                        <Lock className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(processedFilms).length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <p>No film stocks found for "{searchTerm}".</p>
            </div>
          )}
        </div>

        {/* Contextual Footer */}
        {selectedFilm && (
          <div className="flex-shrink-0 p-4 border-t border-gray-700/50 bg-gray-900/80 backdrop-blur-lg animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">{selectedFilm.name}</h4>
                <p className="text-sm text-gray-400">{selectedFilm.capacity} exposures</p>
              </div>
              <button
                onClick={handleStartRoll}
                disabled={!canAfford || !selectedFilm.unlocked}
                className="px-5 py-3 rounded-xl transition-colors font-bold text-base shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none enabled:bg-amber-500 enabled:hover:bg-amber-600 enabled:text-gray-900 enabled:shadow-amber-500/20 flex items-center gap-2"
              >
                {!selectedFilm.unlocked 
                  ? 'Locked'
                  : !canAfford 
                  ? 'No Credits'
                  : `Load for ${totalCost}`
                }
                {!canAfford && selectedFilm.unlocked && <Lock className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilmSelectionModal;