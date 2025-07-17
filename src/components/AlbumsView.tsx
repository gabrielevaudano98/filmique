import React, { useState } from 'react';
import { Plus, Lock, Unlock, Calendar, Package, Eye, Download, Share } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const AlbumsView: React.FC = () => {
  const { completedRolls, user } = useAppContext();
  const [selectedRoll, setSelectedRoll] = useState<string | null>(null);

  const handleUnlockRoll = (rollId: string) => {
    // Handle unlock logic (instant unlock with credits)
    console.log('Unlock roll:', rollId);
  };

  const handleOrderPrints = (rollId: string) => {
    // Handle print ordering
    console.log('Order prints for roll:', rollId);
  };

  const selectedRollData = completedRolls.find(roll => roll.id === selectedRoll);

  return (
    <div className="p-3 sm:p-4 space-y-4 sm:space-y-6 pb-safe">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">My Albums</h1>
        <button className="bg-amber-500 hover:bg-amber-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center space-x-2 transition-colors min-h-[44px] text-sm sm:text-base">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Album</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Active Roll Status */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
        <h2 className="text-lg sm:text-xl font-bold mb-2">Current Progress</h2>
        <p className="text-blue-100 mb-3 sm:mb-4 text-sm sm:text-base">Your photography journey continues</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold">{completedRolls.length}</div>
            <div className="text-sm text-blue-100">Completed Rolls</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold">
              {completedRolls.filter(roll => roll.isUnlocked).length}
            </div>
            <div className="text-sm text-blue-100">Unlocked</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold">
              {completedRolls.reduce((sum, roll) => sum + roll.photos.length, 0)}
            </div>
            <div className="text-sm text-blue-100">Total Photos</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold">{user.level}</div>
            <div className="text-sm text-blue-100">Current Level</div>
          </div>
        </div>
      </div>

      {/* Rolls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {completedRolls.map((roll) => (
          <div key={roll.id} className="bg-gray-800 rounded-xl overflow-hidden">
            {/* Roll Header */}
            <div className="p-3 sm:p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-amber-400 text-sm sm:text-base">{roll.filmType}</h3>
                  <p className="text-sm text-gray-400">
                    {roll.photos.length} photos
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {roll.isUnlocked ? (
                    <Unlock className="w-5 h-5 text-green-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Photo Preview Grid */}
            <div className="grid grid-cols-3 gap-0.5 sm:gap-1 p-2">
              {roll.isUnlocked ? (
                roll.photos.slice(0, 9).map((photo, index) => (
                  <div key={photo.id} className="aspect-square bg-gray-700 overflow-hidden rounded-sm">
                    <img
                      src={photo.thumbnail}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => setSelectedRoll(roll.id)}
                    />
                  </div>
                ))
              ) : (
                Array.from({ length: 9 }).map((_, index) => (
                  <div key={index} className="aspect-square bg-gray-700 rounded-sm flex items-center justify-center">
                    <Lock className="w-4 h-4 text-gray-500" />
                  </div>
                ))
              )}
            </div>

            {/* Roll Actions */}
            <div className="p-3 sm:p-4 space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">{roll.createdDate.toLocaleDateString()}</span>
                </div>
                <div className={`px-2 py-1 rounded text-xs sm:text-sm ${
                  roll.isUnlocked 
                    ? 'bg-green-500 bg-opacity-20 text-green-400' 
                    : 'bg-orange-500 bg-opacity-20 text-orange-400'
                }`}>
                  {roll.isUnlocked ? 'Unlocked' : 'Locked'}
                </div>
              </div>

              {roll.isUnlocked ? (
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    onClick={() => setSelectedRoll(roll.id)}
                    className="bg-blue-500 hover:bg-blue-600 px-3 py-3 rounded text-sm flex items-center justify-center space-x-1 transition-colors min-h-[44px]"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleOrderPrints(roll.id)}
                    className="bg-purple-500 hover:bg-purple-600 px-3 py-3 rounded text-sm flex items-center justify-center space-x-1 transition-colors min-h-[44px]"
                  >
                    <Package className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleUnlockRoll(roll.id)}
                  className="w-full bg-amber-500 hover:bg-amber-600 px-3 py-3 rounded text-sm flex items-center justify-center space-x-1 transition-colors min-h-[44px]"
                >
                  <Unlock className="w-4 h-4" />
                  <span className="hidden sm:inline">Unlock Now (15 credits)</span>
                  <span className="sm:hidden">Unlock (15)</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Album Creation Prompt */}
      {completedRolls.length === 0 && (
        <div className="text-center py-8 sm:py-12 px-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">No completed rolls yet</h3>
          <p className="text-gray-400 mb-6 text-sm sm:text-base">
            Start shooting to create your first film roll and build your collection
          </p>
          <button className="bg-amber-500 hover:bg-amber-600 px-6 py-3 rounded-lg transition-colors min-h-[48px] text-sm sm:text-base">
            Start Your First Roll
          </button>
        </div>
      )}

      {/* Roll Detail Modal */}
      {selectedRoll && selectedRollData && selectedRollData.isUnlocked && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-gray-800 rounded-t-xl sm:rounded-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
              <div>
                <h2 className="text-lg sm:text-xl font-bold">{selectedRollData.filmType}</h2>
                <p className="text-gray-400">{selectedRollData.photos.length} photos</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-3 hover:bg-gray-700 rounded-full transition-colors min-h-[44px] min-w-[44px]">
                  <Download className="w-5 h-5" />
                </button>
                <button className="p-3 hover:bg-gray-700 rounded-full transition-colors min-h-[44px] min-w-[44px]">
                  <Share className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedRoll(null)}
                  className="p-3 hover:bg-gray-700 rounded-full transition-colors min-h-[44px] min-w-[44px]"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 p-4 sm:p-6 pb-safe">
              {selectedRollData.photos.map((photo, index) => (
                <div key={photo.id} className="aspect-square bg-gray-700 overflow-hidden rounded-lg touch-manipulation">
                  <img
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlbumsView;
