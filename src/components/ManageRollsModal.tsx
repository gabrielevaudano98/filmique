import React, { useState, useMemo, useEffect } from 'react';
import { X, Film, CheckSquare, Square } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../context/AppContext';

interface ManageRollsModalProps {
  album: any; // Full album object with rolls
  onClose: () => void;
}

const ManageRollsModal: React.FC<ManageRollsModalProps> = ({ album, onClose }) => {
  const { completedRolls, updateAlbumRolls } = useAppContext();
  const [selectedRollIds, setSelectedRollIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const ALBUM_PHOTO_LIMIT = 512;

  useEffect(() => {
    const initialRollIds = album.album_rolls?.map((ar: any) => ar.roll_id) || [];
    setSelectedRollIds(initialRollIds);
  }, [album]);

  const developedRolls = useMemo(() => {
    return completedRolls.filter(roll => roll.developed_at || (roll.completed_at && new Date().getTime() >= new Date(roll.completed_at).getTime() + 7 * 24 * 60 * 60 * 1000));
  }, [completedRolls]);

  const { totalPhotos, canSave } = useMemo(() => {
    const photos = developedRolls
      .filter(roll => selectedRollIds.includes(roll.id))
      .reduce((sum, roll) => sum + (roll.shots_used || 0), 0);
    return { totalPhotos: photos, canSave: photos <= ALBUM_PHOTO_LIMIT };
  }, [selectedRollIds, developedRolls]);

  const handleToggleRoll = (rollId: string) => {
    setSelectedRollIds(prev =>
      prev.includes(rollId) ? prev.filter(id => id !== rollId) : [...prev, rollId]
    );
  };

  const handleSaveChanges = async () => {
    if (!canSave) return;
    setIsLoading(true);
    await updateAlbumRolls(album.id, selectedRollIds);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full flex flex-col max-h-[80vh] shadow-2xl border border-gray-700">
        <div className="flex-shrink-0 p-5 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-recoleta text-white">Manage Rolls</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-1">Select rolls to include in "{album.title}".</p>
        </div>

        <div className="overflow-y-auto no-scrollbar p-5 space-y-3">
          {developedRolls.length > 0 ? (
            developedRolls.map(roll => {
              const isSelected = selectedRollIds.includes(roll.id);
              const developedDate = new Date(roll.developed_at || roll.completed_at!).toLocaleDateString();
              return (
                <button
                  key={roll.id}
                  onClick={() => handleToggleRoll(roll.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${isSelected ? 'bg-red-600/10' : 'bg-gray-800/50 hover:bg-gray-800'}`}
                >
                  <div className="flex items-center space-x-3">
                    <Film className={`w-5 h-5 ${isSelected ? 'text-red-500' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-semibold text-white">{roll.title || roll.film_type}</p>
                      <p className="text-xs text-gray-400">{roll.shots_used} photos • {developedDate}</p>
                    </div>
                  </div>
                  {isSelected ? <CheckSquare className="w-6 h-6 text-red-500" /> : <Square className="w-6 h-6 text-gray-500" />}
                </button>
              );
            })
          ) : (
            <p className="text-center text-gray-500 py-8">You have no developed rolls to add.</p>
          )}
        </div>

        <div className="flex-shrink-0 p-5 border-t border-gray-700 bg-gray-900/50">
          <div className="flex justify-between items-center mb-4 text-sm">
            <span className="font-medium text-gray-300">Photo Count:</span>
            <span className={`font-bold ${canSave ? 'text-white' : 'text-red-500'}`}>
              {totalPhotos} / {ALBUM_PHOTO_LIMIT}
            </span>
          </div>
          <button
            onClick={handleSaveChanges}
            disabled={isLoading || !canSave}
            className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageRollsModal;