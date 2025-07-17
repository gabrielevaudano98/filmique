import React, { useState } from 'react';
import { X, Film, Lock, Zap, Star } from 'lucide-react';
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
  const { user } = useAppContext();
  const [selectedFilm, setSelectedFilm] = useState<FilmType>(filmTypes[0]);
  const [selectedCapacity, setSelectedCapacity] = useState<CapacityOption>(capacityOptions[2]);

  const totalCost = selectedFilm.price + selectedCapacity.price;
  const canAfford = user.credits >= totalCost;

  const handleStartRoll = () => {
    if (canAfford && selectedFilm.unlocked) {
      onStartRoll(selectedFilm.name, selectedCapacity.shots);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-800 rounded-t-xl sm:rounded-xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold">Load New Film</h2>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-700 rounded-full transition-colors min-h-[44px] min-w-[44px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Film Selection */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Film Type</h3>
            <div className="space-y-2 sm:space-y-3">
              {filmTypes.map((film) => (
                <button
                  key={film.name}
                  onClick={() => setSelectedFilm(film)}
                  disabled={!film.unlocked}
                  className={`w-full p-3 sm:p-4 rounded-lg border text-left transition-colors min-h-[60px] ${
                    selectedFilm.name === film.name
                      ? 'border-amber-400 bg-amber-400 bg-opacity-10'
                      : film.unlocked
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-700 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold flex items-center space-x-2">
                        <Film className="w-4 h-4 flex-shrink-0" />
                        <span>{film.name}</span>
                        {!film.unlocked && <Lock className="w-4 h-4 text-gray-500" />}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-400">Default: {film.capacity} shots</p>
                    </div>
                    <div className="text-right">
                      {film.price > 0 ? (
                        <div className="flex items-center space-x-1 text-yellow-400 text-sm">
                          <Zap className="w-4 h-4" />
                          <span>{film.price}</span>
                        </div>
                      ) : (
                        <span className="text-green-400 text-xs sm:text-sm">Free</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Capacity Selection */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Roll Capacity</h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {capacityOptions.map((option) => (
                <button
                  key={option.shots}
                  onClick={() => setSelectedCapacity(option)}
                  className={`p-3 sm:p-4 rounded-lg border text-center transition-colors min-h-[70px] ${
                    selectedCapacity.shots === option.shots
                      ? 'border-amber-400 bg-amber-400 bg-opacity-10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="font-semibold text-sm sm:text-base">{option.name}</div>
                  <div className="text-sm text-gray-400">{option.shots} shots</div>
                  {option.price > 0 ? (
                    <div className="flex items-center justify-center space-x-1 text-yellow-400 text-xs sm:text-sm mt-1">
                      <Zap className="w-3 h-3" />
                      <span>{option.price}</span>
                    </div>
                  ) : (
                    <div className="text-green-400 text-xs sm:text-sm mt-1">Free</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-gray-700 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm sm:text-base">Film Cost:</span>
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm sm:text-base">{selectedFilm.price}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm sm:text-base">Capacity Cost:</span>
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm sm:text-base">{selectedCapacity.price}</span>
              </div>
            </div>
            <div className="border-t border-gray-600 pt-2 flex items-center justify-between font-semibold text-sm sm:text-base">
              <span>Total:</span>
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>{totalCost}</span>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-gray-400 mt-2">
              Your credits: {user.credits}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 sm:space-x-3 pb-safe">
            <button
              onClick={onClose}
              className="flex-1 py-3 sm:py-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors min-h-[48px] text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleStartRoll}
              disabled={!canAfford || !selectedFilm.unlocked}
              className={`flex-1 py-3 sm:py-4 rounded-lg transition-colors min-h-[48px] text-sm sm:text-base ${
                canAfford && selectedFilm.unlocked
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-gray-600 cursor-not-allowed text-gray-400'
              }`}
            >
              {!selectedFilm.unlocked 
                ? 'Locked'
                : !canAfford 
                ? 'Need Credits'
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
