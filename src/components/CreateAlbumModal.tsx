import React, { useState } from 'react';
import { BookPlus, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface CreateAlbumModalProps {
  onClose: () => void;
}

const CreateAlbumModal: React.FC<CreateAlbumModalProps> = ({ onClose }) => {
  const { createAlbum } = useAppContext();
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsLoading(true);
    await createAlbum(title);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-recoleta text-white">Create New Album</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <p className="text-gray-400 mb-4 text-sm">
            Give your new collection a name. You can add photo rolls to it after it's created.
          </p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Summer Vacation '24"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-red-600 focus:border-red-600"
            required
          />
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 font-semibold transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <BookPlus className="w-4 h-4" />
              <span>{isLoading ? 'Creating...' : 'Create Album'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAlbumModal;