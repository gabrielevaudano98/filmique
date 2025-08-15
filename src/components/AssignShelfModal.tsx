import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../types';
import { X, BookCopy, Check, PlusCircle } from 'lucide-react';

interface AssignShelfModalProps {
  roll: Roll;
  onClose: () => void;
}

const AssignShelfModal: React.FC<AssignShelfModalProps> = ({ roll, onClose }) => {
  const { shelves, addRollsToShelf, refetchRolls, refetchShelves, createShelf } = useAppContext();
  const [selectedShelfId, setSelectedShelfId] = useState<string | null>(roll.album_id || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newShelfTitle, setNewShelfTitle] = useState('');

  const handleSave = async () => {
    if (!selectedShelfId) return;
    setIsLoading(true);
    await addRollsToShelf(selectedShelfId, [roll.id]);
    await refetchRolls();
    await refetchShelves();
    setIsLoading(false);
    onClose();
  };

  const handleCreateShelf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShelfTitle.trim()) return;
    setIsLoading(true);
    await createShelf(newShelfTitle.trim());
    await refetchShelves();
    setIsLoading(false);
    setNewShelfTitle('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-sm w-full flex flex-col max-h-[80vh] shadow-2xl">
        <div className="flex-shrink-0 p-5 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Assign to Shelf</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar p-5 space-y-2">
          {shelves.map(shelf => (
            <button
              key={shelf.id}
              onClick={() => setSelectedShelfId(shelf.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${selectedShelfId === shelf.id ? 'bg-amber-500/10' : 'bg-gray-700/50 hover:bg-gray-700'}`}
            >
              <span className="font-semibold text-white">{shelf.title}</span>
              {selectedShelfId === shelf.id && <Check className="w-5 h-5 text-amber-400" />}
            </button>
          ))}
          
          {!isCreating && (
            <button onClick={() => setIsCreating(true)} className="w-full flex items-center p-3 rounded-lg text-left transition-colors text-amber-400 hover:bg-amber-500/10">
              <PlusCircle className="w-5 h-5 mr-3" />
              <span className="font-semibold">Create New Shelf</span>
            </button>
          )}

          {isCreating && (
            <form onSubmit={handleCreateShelf} className="p-3 bg-gray-700/50 rounded-lg space-y-3">
              <input
                type="text"
                value={newShelfTitle}
                onChange={(e) => setNewShelfTitle(e.target.value)}
                placeholder="New shelf title..."
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-amber-500 focus:border-amber-500"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setIsCreating(false)} className="px-3 py-1 rounded-md bg-gray-600 text-sm font-semibold">Cancel</button>
                <button type="submit" disabled={!newShelfTitle.trim() || isLoading} className="px-3 py-1 rounded-md bg-amber-500 text-gray-900 text-sm font-bold disabled:bg-gray-500">
                  {isLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="flex-shrink-0 p-5 border-t border-gray-700">
          <button
            onClick={handleSave}
            disabled={isLoading || !selectedShelfId}
            className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save to Shelf'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignShelfModal;