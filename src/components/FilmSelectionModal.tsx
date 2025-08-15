import React, { useState, useMemo } from 'react';
import { X, Search, Check, Lock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { FilmStock } from '../types';

interface FilmSelectionModalProps {
  onStartRoll: (film: FilmStock, aspectRatio: string) => void;
  onClose: () => void;
}

const SegmentedControl: React.FC<{
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}> = ({ options, value, onChange }) => (
  <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
    {options.map(opt => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`flex-1 py-1.5 px-2 rounded-md text-xs font-bold transition-colors ${
          value === opt.value ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const FilmSelectionModal: React.FC<FilmSelectionModalProps> = ({ onStartRoll, onClose }) => {
  const { profile, activeRoll, filmStocks } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState<'type' | 'brand'>('type');
  const [sortOrder, setSortOrder] = useState<'name' | 'price'>('name');

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-gray-900 sm:rounded-2xl w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex-shrink-0 backdrop-blur-lg bg-gray-900/80 border-b border-gray-700/50 z-10">
          <div className="w-full flex justify-center pt-3 sm:hidden">
            <div className="w-10 h-1.5 bg-gray-700 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-bold">Select Film</h2>
            <button onClick={onClose} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors">
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
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-11 pr-4 py-2.5 text-white focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 font-semibold mb-1 block px-1">Group By</label>
                <SegmentedControl options={[{value: 'type', label: 'Category'}, {value: 'brand', label: 'Brand'}]} value={groupBy} onChange={setGroupBy} />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold mb-1 block px-1">Sort By</label>
                <SegmentedControl options={[{value: 'name', label: 'A-Z'}, {value: 'price', label: '$'}]} value={sortOrder} onChange={setSortOrder} />
              </div>
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
              <h3 className="text-lg font-semibold mb-3 text-amber-400">{groupName}</h3>
              <div className="space-y-2">
                {processedFilms[groupName].map(film => (
                  <button
                    key={film.id}
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
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-white">{film.price}</div>
                        <div className="text-xs text-gray-500">credits</div>
                      </div>
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

        {/* Footer */}
        <div className="p-4 border-t border-gray-700/50 flex-shrink-0 bg-gray-900/80 backdrop-blur-lg">
          <button
            onClick={handleStartRoll}
            disabled={!selectedFilm || !canAfford || !selectedFilm.unlocked}
            className="w-full py-3.5 rounded-xl transition-colors font-bold text-base shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none enabled:bg-amber-500 enabled:hover:bg-amber-600 enabled:text-gray-900 enabled:shadow-amber-500/20"
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
  );
};

export default FilmSelectionModal;