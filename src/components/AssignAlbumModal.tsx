import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../types';
import { X, Check, PlusCircle } from 'lucide-react';
import CreateAlbumModal from './CreateAlbumModal';

interface AssignAlbumModalProps {
  roll: Roll;
  onClose: () => void;
}

const AssignAlbumModal: React.FC<AssignAlbumModalProps> = ({ roll, onClose }) => {
  const { albums, addRollsToAlbum, refetchRolls, refetchAlbums } = useAppContext();
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(roll.album_id || null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSave = async () => {
    if (!selectedAlbumId) return;
    setIsLoading(true);
    await addRollsToAlbum(selectedAlbumId, [roll.id]);
    await refetchRolls();
    await refetchAlbums();
    setIsLoading(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
        <div className="bg-neutral-800/80 backdrop-blur-lg border border-neutral-700/50 rounded-2xl max-w-sm w-full flex flex-col max-h-[80vh] shadow-2xl animate-modal-enter">
          <div className="flex-shrink-0 p-5 border-b border-neutral-700/50 flex items-center justify-between">
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
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${selectedAlbumId === album.id ? 'bg-brand-amber-start/10' : 'bg-neutral-700/50 hover:bg-neutral-700'}`}
              >
                <span className="font-semibold text-white">{album.title}</span>
                {selectedAlbumId === album.id && <Check className="w-5 h-5 text-brand-amber-start" />}
              </button>
            ))}
            
            <button onClick={() => setShowCreateModal(true)} className="w-full flex items-center p-3 rounded-lg text-left transition-colors text-brand-amber-start hover:bg-brand-amber-start/10">
              <PlusCircle className="w-5 h-5 mr-3" />
              <span className="font-semibold">Create New Album</span>
            </button>
          </div>

          <div className="flex-shrink-0 p-5 border-t border-neutral-700/50">
            <button
              onClick={handleSave}
              disabled={isLoading || !selectedAlbumId}
              className="w-full py-3 rounded-lg bg-brand-amber-start hover:bg-brand-amber-end text-gray-900 font-bold transition-colors disabled:bg-neutral-600 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save to Album'}
            </button>
          </div>
        </div>
      </div>
      {showCreateModal && <CreateAlbumModal onClose={() => setShowCreateModal(false)} />}
    </>
  );
};

export default AssignAlbumModal;