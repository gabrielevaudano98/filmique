import React, { useState, useMemo } from 'react';
import { Printer, CheckSquare, Square } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Image from './Image';

const PRINT_COST_PER_PHOTO = 10;

const PrintsView: React.FC = () => {
  const { completedRolls, profile, queuePrintOrder } = useAppContext();
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());

  const allDevelopedPhotos = useMemo(() => {
    return completedRolls
      .filter(roll => roll.developed_at)
      .flatMap(roll => roll.photos || []);
  }, [completedRolls]);

  const handleTogglePhoto = (photoId: string) => {
    setSelectedPhotoIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const totalCost = selectedPhotoIds.size * PRINT_COST_PER_PHOTO;
  const canAfford = profile ? profile.credits >= totalCost : false;

  const handleQueueOrder = () => {
    if (selectedPhotoIds.size === 0) return;
    queuePrintOrder(Array.from(selectedPhotoIds), totalCost);
    setSelectedPhotoIds(new Set());
  };

  return (
    <div className="flex flex-col w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Order Prints</h1>
        <p className="text-gray-400 mt-1">Select photos to order high-quality prints. Each print costs {PRINT_COST_PER_PHOTO} credits.</p>
      </div>

      {allDevelopedPhotos.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 pb-32">
          {allDevelopedPhotos.map(photo => {
            const isSelected = selectedPhotoIds.has(photo.id);
            return (
              <button
                key={photo.id}
                onClick={() => handleTogglePhoto(photo.id)}
                className="relative aspect-square w-full rounded-md overflow-hidden group"
              >
                <Image src={photo.thumbnail_url} alt="Photo for print" className="w-full h-full object-cover" />
                <div className={`absolute inset-0 transition-all ${isSelected ? 'bg-black/50' : 'bg-black/0 group-hover:bg-black/30'}`} />
                <div className="absolute top-2 right-2">
                  {isSelected ? <CheckSquare className="w-6 h-6 text-white bg-blue-500 rounded" /> : <Square className="w-6 h-6 text-white/70 opacity-0 group-hover:opacity-100" />}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 text-neutral-500">
          <Printer className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">No Photos to Print</h3>
          <p className="mt-2">Develop some rolls to see your photos here.</p>
        </div>
      )}

      {selectedPhotoIds.size > 0 && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-full max-w-md p-4 z-50">
          <div className="bg-neutral-800/80 backdrop-blur-lg rounded-xl p-4 flex items-center justify-between shadow-lg border border-neutral-700/50">
            <div>
              <p className="font-bold text-white">{selectedPhotoIds.size} photos selected</p>
              <p className={`text-sm ${canAfford ? 'text-gray-400' : 'text-red-400'}`}>
                Total Cost: {totalCost} credits (Balance: {profile?.credits})
              </p>
            </div>
            <button
              onClick={handleQueueOrder}
              disabled={!canAfford}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Queue Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintsView;