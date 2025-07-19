import React, { useState } from 'react';
import { Plus, Lock, Unlock, Calendar, Package, Eye, Download, Share, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const AlbumsView: React.FC = () => {
  const { completedRolls, user, setCurrentView } = useAppContext();
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
    <div className="w-full p-3 sm:p-4 space-y-4 sm:space-y-6 pb-safe">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold font-recoleta">My Rolls</h1>
      </div>

      {/* Active Roll Status */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
        <h2 className="text-lg sm:text-xl font-bold mb-2 font-recoleta">Your Collection</h2>
        <p className="text-blue-100 mb-3 sm:mb-4 text-sm sm:text-base">A summary of your photography journey.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center bg-black bg-opacity-10 p-3 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold">{completedRolls.length}</div>
            <div className="text-xs text-blue-100">Completed Rolls</div>
          </div>
          <div className="text-center bg-black bg-opacity-10 p-3 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold">
              {completedRolls.filter(roll => roll.isUnlocked).length}
            </div>
            <div className="text-xs text-blue-100">Unlocked</div>
          </div>
          <div className="text-center bg-black bg-opacity-10 p-3 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold">
              {completedRolls.reduce((sum, roll) => sum + roll.photos.length, 0)}
            </div>
            <div className="text-xs text-blue-100">Total Photos</div>
          </div>
          <div className="text-center bg-black bg-opacity-10 p-3 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold">{user.level}</div>
            <div className="text-xs text-blue-100">Your Level</div>
          </div>
        </div>
      </div>

      {/* Rolls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {completedRolls.map((roll) => (
          <div key={roll.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl ring-1 ring-gray-700/50 hover:ring-gray-600/70 flex flex-col group transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <img
                src={roll.photos[0]?.thumbnail || ''}
                alt={`${roll.filmType} cover photo`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              {!roll.isUnlocked && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Lock className="w-10 h-10 text-white/70" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="font-semibold text-white text-lg font-recoleta">{roll.filmType}</h3>
                <p className="text-sm text-gray-300">{roll.photos.length} photos</p>
              </div>
              <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                  roll.isUnlocked 
                    ? 'bg-green-500/20 text-green-300 ring-1 ring-inset ring-green-500/30' 
                    : 'bg-red-500/20 text-red-300 ring-1 ring-inset ring-red-500/30'
                }`}>
                  {roll.isUnlocked ? 'Unlocked' : 'Locked'}
              </div>
            </div>
            
            <div className="p-4 flex-grow flex flex-col justify-between">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{roll.createdDate.toLocaleDateString()}</span>
                </div>
              </div>

              {roll.isUnlocked ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedRoll(roll.id)}
                    className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg ring-1 ring-blue-500/30 min-h-[48px]"
                  >
                    <Eye className="w-5 h-5" />
                    <span>View Roll</span>
                  </button>
                  <button
                    onClick={() => handleOrderPrints(roll.id)}
                    className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg ring-1 ring-purple-500/30 min-h-[48px]"
                  >
                    <Package className="w-5 h-5" />
                    <span>Order Prints</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleUnlockRoll(roll.id)}
                  className="w-full bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl ring-1 ring-amber-400/30 min-h-[48px]"
                >
                  <Unlock className="w-5 h-5" />
                  <span>Unlock Now (15 credits)</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Album Creation Prompt */}
      {completedRolls.length === 0 && (
        <div className="text-center py-12 px-4 col-span-1 sm:col-span-2 lg:col-span-3">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2 font-recoleta">No completed rolls yet</h3>
          <p className="text-gray-400 mb-6 text-base">
            Start shooting to create your first film roll and build your collection.
          </p>
          <button 
            onClick={() => setCurrentView('camera')}
            className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-8 py-4 rounded-xl transition-all duration-200 min-h-[52px] text-base font-semibold shadow-lg hover:shadow-xl ring-1 ring-amber-400/30"
          >
            Start Your First Roll
          </button>
        </div>
      )}

      {/* Roll Detail Modal */}
      {selectedRoll && selectedRollData && selectedRollData.isUnlocked && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedRoll(null)}>
          <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold font-recoleta">{selectedRollData.filmType}</h2>
                <p className="text-gray-400">{selectedRollData.photos.length} photos</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 bg-gray-700/50 hover:bg-gray-700 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ring-1 ring-gray-600/50">
                  <Download className="w-5 h-5" />
                </button>
                <button className="p-2 bg-gray-700/50 hover:bg-gray-700 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ring-1 ring-gray-600/50">
                  <Share className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedRoll(null)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedRollData.photos.map((photo) => (
                  <div key={photo.id} className="aspect-square bg-gray-700 overflow-hidden rounded-lg group">
                    <img
                      src={photo.url}
                      alt={`Photo from ${selectedRollData.filmType}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlbumsView;
