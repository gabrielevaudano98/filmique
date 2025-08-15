import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Edit, Image as ImageIcon, Film, Send } from 'lucide-react';
import ManageRollsOnAlbumModal from './ManageRollsOnAlbumModal';
import { Roll } from '../types';
import RollListItem from './RollListItem';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import CreatePostModal from './CreatePostModal';

const AlbumDetailView: React.FC = () => {
  const { selectedAlbum, setCurrentView, setSelectedAlbum, deleteRoll, removeRollFromAlbum } = useAppContext();
  const [showManageModal, setShowManageModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [rollToDelete, setRollToDelete] = useState<Roll | null>(null);

  if (!selectedAlbum) {
    setCurrentView('albums');
    return null;
  }

  const handleBack = () => {
    setSelectedAlbum(null);
    setCurrentView('albums');
  };

  const handleRemoveFromAlbum = (roll: Roll) => {
    removeRollFromAlbum(roll.id);
  };

  const rolls = selectedAlbum.rolls || [];
  const photoCount = rolls.reduce((sum, roll) => sum + (roll.shots_used || 0), 0);

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-6">
        <button onClick={handleBack} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Library</span>
        </button>
        <div className="flex items-center space-x-2">
          <button onClick={() => setShowManageModal(true)} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>Manage</span>
          </button>
          <button onClick={() => setShowCreatePostModal(true)} className="bg-brand-amber-start hover:bg-brand-amber-mid text-black font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
            <Send className="w-4 h-4" />
            <span>Post</span>
          </button>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">{selectedAlbum.title}</h2>
        <div className="text-gray-400 mt-2 flex items-center space-x-4">
          <span className="flex items-center space-x-1.5"><Film className="w-4 h-4" /><span>{rolls.length} Rolls</span></span>
          <span className="flex items-center space-x-1.5"><ImageIcon className="w-4 h-4" /><span>{photoCount} Photos</span></span>
        </div>
      </div>

      {rolls.length > 0 ? (
        <div className="space-y-2">
          {rolls.map(roll => (
            <RollListItem
              key={roll.id}
              roll={roll}
              onDelete={setRollToDelete}
              onAssignAlbum={handleRemoveFromAlbum}
              assignActionIcon="remove"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 col-span-full bg-gray-800/50 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2 text-white">Empty Album</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            This album doesn't have any photos yet. Add some rolls to see them here.
          </p>
        </div>
      )}

      {showManageModal && (
        <ManageRollsOnAlbumModal
          album={selectedAlbum}
          onClose={() => setShowManageModal(false)}
        />
      )}

      {showCreatePostModal && (
        <CreatePostModal
          album={selectedAlbum}
          onClose={() => setShowCreatePostModal(false)}
        />
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
    </div>
  );
};

export default AlbumDetailView;