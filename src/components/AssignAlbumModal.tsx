import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Roll, Album } from '../types';
import { X, BookCopy, Check, PlusCircle } from 'lucide-react';

interface AssignAlbumModalProps {
  roll: Roll;
  onClose: () => void;
}

const AssignAlbumModal: React.FC<AssignAlbumModalProps> = ({ roll, onClose }) => {
  const { albums, addRollsToAlbum, refetchRolls, refetchAlbums, createAlbum } = useAppContext();
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(roll.album_id || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');

  const handleSave = async () => {
    if (!selectedAlbumId) return;
    setIsLoading(true);
    await addRollsToAlbum(selectedAlbumId, [roll.id]);
    await refetchRolls();
    await refetchAlbums();
    setIsLoading(false);
    onClose();
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) return;
    setIsLoading(true);
    await createAlbum(newAlbumTitle.trim());
    await refetchAlbums();
    setIsLoading(false);
    setNewAlbumTitle('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800/80 backdrop-blur-lg border border-neutral-700/50 rounded-2xl max-w-sm w-full flex flex-col max-h-[80vh] shadow-2xl">
        <div className="flex-shrink-0 p-5 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Assign to Album</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar p-5 space-y-2">
          {albums.map(album => (
            <button
              key={album.id}
              onClick={() => setSelectedAlbumId(album.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${selectedAlbumId === album.id ? 'bg-amber-500/10' : 'bg-gray-700/50 hover:bg-gray-700'}`}
            >
              <span className="font-semibold text-white">{album.title}</span>
              {selectedAlbumId === album.id && <Check className="w-5 h-5 text-amber-400" />}
            </button>
          ))}
          
          {!isCreating && (
            <button onClick={() => setIsCreating(true)} className="w-full flex items-center p-3 rounded-lg text-left transition-colors text-amber-400 hover:bg-amber-500/10">
              <PlusCircle className="w-5 h-5 mr-3" />
              <span className="font-semibold">Create New Album</span>
            </button>
          )}

          {isCreating && (
            <form onSubmit={handleCreateAlbum} className="p-3 bg-gray-700/50 rounded-lg space-y-3">
              <input
                type="text"
                value={newAlbumTitle}
                onChange={(e) => setNewAlbumTitle(e.target.value)}
                placeholder="New album title..."
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-amber-500 focus:border-amber-500"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setIsCreating(false)} className="px-3 py-1 rounded-md bg-gray-600 text-sm font-semibold">Cancel</button>
                <button type="submit" disabled={!newAlbumTitle.trim() || isLoading} className="px-3 py-1 rounded-md bg-amber-500 text-gray-900 text-sm font-bold disabled:bg-gray-500">
                  {isLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="flex-shrink-0 p-5 border-t border-gray-700">
          <button
            onClick={handleSave}
            disabled={isLoading || !selectedAlbumId}
            className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save to Album'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignAlbumModal;