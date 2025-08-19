import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Roll } from '../types';
import { isRollDeveloped } from '../utils/rollUtils';
import RollListItem from './RollListItem';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import AssignAlbumModal from './AssignAlbumModal';
import { useSwipeable } from 'react-swipeable';

const UncategorizedRollsView: React.FC = () => {
  const { completedRolls, setCurrentView, deleteRoll } = useAppContext();
  const [rollToDelete, setRollToDelete] = useState<Roll | null>(null);
  const [rollToAssign, setRollToAssign] = useState<Roll | null>(null);

  const uncategorizedRolls = useMemo(() => {
    return completedRolls
      .filter(r => isRollDeveloped(r) && !r.album_id)
      .sort((a, b) => new Date(b.developed_at!).getTime() - new Date(a.developed_at!).getTime());
  }, [completedRolls]);

  const handleBack = () => {
    setCurrentView('rolls');
  };

  const handlers = useSwipeable({
    onSwipedRight: handleBack,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <div className="flex flex-col w-full" {...handlers}>
      <div className="flex items-center justify-between mb-6">
        <button onClick={handleBack} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Rolls</span>
        </button>
      </div>
      
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Uncategorized Rolls</h2>
        <p className="text-gray-400 mt-1">
          {uncategorizedRolls.length} developed rolls not in any album.
        </p>
      </div>

      {uncategorizedRolls.length > 0 ? (
        <div className="space-y-2">
          {uncategorizedRolls.map(roll => (
            <RollListItem
              key={roll.id}
              roll={roll}
              onDelete={setRollToDelete}
              onAssignAlbum={setRollToAssign}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 col-span-full bg-gray-800/50 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2 text-white">All Rolls Organized</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            You have no uncategorized rolls. Great job!
          </p>
        </div>
      )}

      {rollToDelete && (
        <ConfirmDeleteModal
          isOpen={!!rollToDelete}
          onClose={() => setRollToDelete(null)}
          onConfirm={() => {
            if (rollToDelete) deleteRoll(rollToDelete.id);
            setRollToDelete(null);
          }}
          title="Delete Roll"
          message={`Are you sure you want to permanently delete "${rollToDelete.title || rollToDelete.film_type}"? This cannot be undone.`}
          confirmText="Delete"
        />
      )}
      {rollToAssign && (
        <AssignAlbumModal
          roll={rollToAssign}
          onClose={() => setRollToAssign(null)}
        />
      )}
    </div>
  );
};

export default UncategorizedRollsView;