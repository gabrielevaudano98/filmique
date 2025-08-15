import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { FilmStock } from '../types';
import FilmInfoPanel from './FilmInfoPanel';
import FilmStockCard from './FilmStockCard';

const SegmentedControl: React.FC<{
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}> = ({ options, value, onChange }) => (
  <div className="flex w-full p-1 bg-neutral-900/70 border border-neutral-800 rounded-xl">
    {options.map(opt => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`relative z-10 flex-1 py-2 text-xs font-bold text-center transition-all duration-300 rounded-lg
          ${value === opt.value
            ? 'bg-neutral-700 text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]'
            : 'text-gray-400 hover:bg-neutral-800/50'
          }
        `}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const FilmSelectionModal: React.FC<{
  onStartRoll: (film: FilmStock, aspectRatio: string) => void;
  onClose: () => void;
}> = ({ onStartRoll, onClose }) => {
  const { profile, activeRoll, filmStocks } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState<'type' | 'brand'>('type');
  const [sortOrder, setSortOrder] = useState<'name' | 'price'>('name');
  const [infoFilm, setInfoFilm] = useState<FilmStock | null>(null);

  const firstUnlockedFilm = useMemo(() => 
    filmStocks.find(f => f.unlocked) || filmStocks[0]
  , [filmStocks]);

  const [selectedFilm, setSelectedFilm] = useState<FilmStock | undefined>(firstUnlockedFilm);

  const processedFilms = useMemo(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = filmStocks.filter(film => film.name.toLowerCase().includes(lowerCaseSearch));
    filtered.sort((a, b) => {
      if (sortOrder === 'price') return a.price - b.price;
      return a.name.localeCompare(b.name);
    });
    return filtered.reduce((acc, film) => {
      const key = groupBy === 'brand' ? (film.brand || 'Other') : (film.type || 'Uncategorized');
      if (!acc[key]) acc[key] = [];
      acc[key].push(film);
      return acc;
    }, {} as Record<string, FilmStock[]>);
  }, [searchTerm, sortOrder, groupBy, filmStocks]);

  const totalCost = selectedFilm?.price || 0;
  const canAfford = profile ? profile.credits >= totalCost : false;

  const handleStartRoll = () => {
    if (selectedFilm && canAfford && selectedFilm.unlocked) {
      onStartRoll(selectedFilm, '3:2');
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-end sm:items-center justify-center z-50 animate-fade-in">
        <div className="bg-neutral-900 sm:rounded-2xl w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md flex flex-col shadow-depth">
          {/* Header */}
          <div className="flex-shrink-0 border-b border-neutral-700/50 z-10">
            <div className="w-full flex justify-center pt-3 sm:hidden">
              <div className="w-10 h-1.5 bg-neutral-700 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-4">
              <h2 className="text-2xl font-bold text-white">Select Film</h2>
              <button onClick={onClose} className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-4 pb-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search film stocks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-11 pr-4 py-2.5 text-white focus:ring-2 focus:ring-brand-amber-start focus:border-brand-amber-start"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SegmentedControl options={[{value: 'type', label: 'Category'}, {value: 'brand', label: 'Brand'}]} value={groupBy} onChange={setGroupBy} />
                <SegmentedControl options={[{value: 'name', label: 'A-Z'}, {value: 'price', label: 'Price'}]} value={sortOrder} onChange={setSortOrder} />
              </div>
            </div>
          </div>

          {/* Film List */}
          <div className="overflow-y-auto no-scrollbar p-4 space-y-6">
            {activeRoll && !activeRoll.is_completed && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 p-3 rounded-lg text-sm">
                Changing film will discard the <strong>{activeRoll.shots_used} shots</strong> on your current roll.
              </div>
            )}
            
            {Object.keys(processedFilms).sort().map(groupName => (
              <div key={groupName}>
                <h3 className="text-lg font-semibold mb-3 text-brand-amber-start">{groupName}</h3>
                <div className="space-y-2">
                  {processedFilms[groupName].map(film => (
                    <FilmStockCard
                      key={film.id}
                      film={film}
                      isSelected={selectedFilm?.id === film.id}
                      onClick={() => setSelectedFilm(film)}
                      onInfoClick={() => setInfoFilm(film)}
                    />
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

          {/* Footer */}
          <div className="p-4 border-t border-neutral-700/50 flex-shrink-0 bg-neutral-900/80 backdrop-blur-lg">
            <button
              onClick={handleStartRoll}
              disabled={!selectedFilm || !canAfford || !selectedFilm.unlocked}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-brand-amber-start to-brand-amber-end hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-brand-amber-start disabled:bg-neutral-600 disabled:opacity-70 disabled:shadow-none transition-all transform hover:scale-105 active:scale-100"
            >
              {!selectedFilm?.unlocked 
                ? 'Film Locked'
                : !canAfford 
                ? 'Not Enough Credits'
                : `Load Film for ${totalCost} Credits`
              }
            </button>
          </div>
        </div>
      </div>
      {infoFilm && <FilmInfoPanel film={infoFilm} onClose={() => setInfoFilm(null)} />}
    </>
  );
};

export default FilmSelectionModal;