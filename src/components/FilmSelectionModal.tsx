import React, { useState } from 'react';
import { X, Film, Lock, Zap } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface FilmType {
  name: string;
  capacity: number;
  price: number;
  unlocked: boolean;
}

interface CapacityOption {
  shots: number;
  name: string;
  price: number;
}

interface FilmSelectionModalProps {
  filmTypes: FilmType[];
  capacityOptions: CapacityOption[];
  onStartRoll: (filmType: string, capacity: number) => void;
  onClose: () => void;
}

const FilmSelectionModal: React.FC<FilmSelectionModalProps> = ({
  filmTypes,
  capacityOptions,
  onStartRoll,
  onClose
}) => {
  const { profile, activeRoll, setCurrentView } = useAppContext();
  const [selectedFilm, setSelectedFilm] = useState<FilmType>(filmTypes.find(f => f.unlocked) || filmTypes[0]);
  const [selectedCapacity, setSelectedCapacity] = useState<CapacityOption>(capacityOptions[0]);

  const totalCost = selectedFilm.price + selectedCapacity.price;
  const canAfford = profile ? profile.credits >= totalCost : false;

  const handleStartRoll = () => {
    if (canAfford && selectedFilm.unlocked) {
      onStartRoll(selectedFilm.name, selectedCapacity.shots);
      onClose(); // Close the modal after starting the roll
    }
  };

  const handleCloseModal = () => {
    onClose();
    // If no film is active, and the user cancels, go back to home
    if (!activeRoll) {
      setCurrentView('home');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-gray-900 border-t border-gray-700 sm:border-none sm:rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl shadow-black/50">
        {/* Grabber and Header */}
        <div className="flex-shrink-0">
          <div className="w-full flex justify-center pt-3 sm:hidden">
            <div className="w-10 h-1.5 bg-gray-700 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between p-4 sm:p-5">
            <h2 className="text-xl sm:text-2xl font-bold font-recoleta">{activeRoll ? 'Change Film' : 'Load New Film'}</h2>
            <button
              onClick={handleCloseModal}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto no-scrollbar p-4 sm:p-5 space-y-6">
          {activeRoll && !activeRoll.isCompleted && (
            <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500/30 text-yellow-200 p-3 rounded-lg text-sm">
              Changing film will discard the <strong>{activeRoll.shotsUsed} shots</strong> on your current roll of <strong>{activeRoll.filmType}</strong>.
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-semibold mb-3 font-recoleta text-amber-400">Film Type</h3>
            <div className="space-y-3">
              {filmTypes.map((film) => (
                <button
                  key={film.name}
                  onClick={() => setSelectedFilm(film)}
                  disabled={!film.unlocked}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 min-h-[60px] flex items-center
                    ${selectedFilm.name === film.name
                      ? 'border-amber-400 bg-amber-400/10 ring-2 ring-amber-400/20'
                      : film.unlocked
                      ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      : 'border-gray-800 bg-gray-800 opacity-50 cursor-not-allowed'
                    }`}
                >
                  <div className="flex-grow">
                    <h4 className="font-semibold flex items-center space-x-2 text-base">
                      <Film className="w-4 h-4 flex-shrink-0 text-amber-400/80" />
                      <span>{film.name}</span>
                      {!film.unlocked && <Lock className="w-4 h-4 text-gray-500" />}
                    </h4>
                    <p className="text-sm text-gray-400">Default: {film.capacity} shots</p>
                  </div>
                  <div className="text-right flex-shrink-0 pl-4">
                    {film.price > 0 ? (
                      <div className="flex items-center space-x-1 text-yellow-400 font-semibold">
                        <Zap className="w-4 h-4" />
                        <span>{film.price}</span>
                      </div>
                    ) : (
                      <span className="text-green-400 font-semibold text-sm">Free</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Capacity Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3 font-recoleta text-amber-400">Roll Capacity</h3>
            <div className="grid grid-cols-2 gap-3">
              {capacityOptions.map((option) => (
                <button
                  key={option.shots}
                  onClick={() => setSelectedCapacity(option)}
                  className={`p-4 rounded-xl border-2 text-center transition-all duration-200 min-h-[70px]
                    ${selectedCapacity.shots === option.shots
                      ? 'border-amber-400 bg-amber-400/10 ring-2 ring-amber-400/20'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                >
                  <div className="font-bold text-base">{option.name}</div>
                  <div className="text-sm text-gray-400">{option.shots} shots</div>
                  {option.price > 0 ? (
                    <div className="flex items-center justify-center space-x-1 text-yellow-400 text-xs font-semibold mt-1">
                      <Zap className="w-3 h-3" />
                      <span>+ {option.price}</span>
                    </div>
                  ) : (
                    <div className="text-green-400 text-xs font-semibold mt-1">Free</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-700 flex-shrink-0 bg-gray-900/50 backdrop-blur-sm">
          {/* Cost Summary */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Film Cost:</span>
                <div className="flex items-center space-x-1 font-medium">
                  <Zap className="w-4 h-4 text-yellow-400/80" />
                  <span>{selectedFilm.price} credits</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Capacity Cost:</span>
                <div className="flex items-center space-x-1 font-medium">
                  <Zap className="w-4 h-4 text-yellow-400/80" />
                  <span>{selectedCapacity.price} credits</span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-700 my-3"></div>
            <div className="flex items-center justify-between font-bold text-base">
              <span className="font-recoleta">Total Cost</span>
              <div className="flex items-center space-x-1.5 text-amber-400">
                <Zap className="w-5 h-5" />
                <span>{totalCost} credits</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-right">
              Your balance: {profile?.credits ?? 0} credits
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pb-safe">
            <button
              onClick={handleCloseModal}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors min-h-[52px] text-base font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleStartRoll}
              disabled={!canAfford || !selectedFilm.unlocked}
              className={`flex-1 py-3 rounded-xl transition-all duration-200 min-h-[52px] text-base font-bold shadow-lg
                ${canAfford && selectedFilm.unlocked
                  ? 'bg-amber-500 hover:bg-amber-600 text-gray-900 shadow-amber-500/20'
                  : 'bg-gray-600 cursor-not-allowed text-gray-400'
                }`}
            >
              {!selectedFilm.unlocked 
                ? 'Film Locked'
                : !canAfford 
                ? 'Not Enough Credits'
                : 'Load Film'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilmSelectionModal;