import React, { useState, useMemo } from 'react';
import { Folder, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Album, Roll } from '../types';

interface MoveItemModalProps {
  itemToMove: Album | Roll;
  onClose: () => void;
}

const MoveItemModal: React.FC<MoveItemModalProps> = ({ itemToMove, onClose }) => {
  const { albums, addRollsToAlbum, moveAlbum } = useAppContext();
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isMovingAlbum = 'parent_album_id' in itemToMove;

  const availableDestinations = useMemo(() => {
    const options: { value: string; label: string; depth: number }[] = [];
    const descendantIds = new Set<string>();

    if (isMovingAlbum) {
      const getDescendants = (parentId: string) => {
        descendantIds.add(parentId);
        albums.filter(a => a.parent_album_id === parentId).forEach(child => getDescendants(child.id));
      };
      getDescendants(itemToMove.id);
    }

    const buildOptions = (parentId: string | null, depth: number) => {
      if (depth >= 3) return;
      albums
        .filter(album => album.parent_album_id === parentId && !descendantIds.has(album.id))
        .forEach(album => {
          options.push({ value: album.id, label: album.title, depth });
          buildOptions(album.id, depth + 1);
        });
    };
    buildOptions(null, 0);
    return options;
  }, [albums, itemToMove, isMovingAlbum]);

  const handleSubmit = async () => {
    setIsLoading(true);
    if (isMovingAlbum) {
      await moveAlbum(itemToMove.id, destinationId);
    } else {
      await addRollsToAlbum(destinationId || '', [itemToMove.id]);
    }
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Move Item</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-300 mb-4 text-sm">Move "{(itemToMove as Album).title || (itemToMove as Roll).title}" to a new location.</p>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="destination" className="text-sm font-semibold text-gray-300 mb-2 block">Destination Box</label>
            <select
              id="destination"
              value={destinationId || ''}
              onChange={(e) => setDestinationId(e.target.value || null)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Root Level</option>
              {availableDestinations.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {'--'.repeat(opt.depth)} {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 font-semibold transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold transition-colors disabled:bg-gray-600"
          >
            {isLoading ? 'Moving...' : 'Move'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveItemModal;