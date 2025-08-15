import React, { useState } from 'react';
import { BookPlus, X, Lock, Link2, Globe } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface CreateAlbumModalProps {
  onClose: () => void;
}

const VisibilityOption: React.FC<{
  label: string;
  value: 'private' | 'unlisted' | 'public';
  icon: React.ElementType;
  selected: boolean;
  onSelect: () => void;
}> = ({ label, value, icon: Icon, selected, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    className={`flex-1 text-center p-3 rounded-lg border-2 transition-all ${
      selected ? 'bg-amber-500/10 border-amber-500' : 'bg-gray-700/50 border-transparent hover:border-gray-600'
    }`}
  >
    <Icon className={`w-5 h-5 mx-auto mb-1 ${selected ? 'text-amber-400' : 'text-gray-400'}`} />
    <span className={`text-xs font-bold ${selected ? 'text-white' : 'text-gray-300'}`}>{label}</span>
  </button>
);

const CreateAlbumModal: React.FC<CreateAlbumModalProps> = ({ onClose }) => {
  const { createAlbum } = useAppContext();
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'unlisted' | 'public'>('private');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsLoading(true);
    await createAlbum(title, visibility);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Create New Album</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="album-title" className="text-sm font-semibold text-gray-300 mb-2 block">Album Title</label>
              <input
                id="album-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Summer Vacation '24"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-300 mb-2 block">Visibility</label>
              <div className="flex items-center space-x-2">
                <VisibilityOption label="Private" value="private" icon={Lock} selected={visibility === 'private'} onSelect={() => setVisibility('private')} />
                <VisibilityOption label="Unlisted" value="unlisted" icon={Link2} selected={visibility === 'unlisted'} onSelect={() => setVisibility('unlisted')} />
                <VisibilityOption label="Public" value="public" icon={Globe} selected={visibility === 'public'} onSelect={() => setVisibility('public')} />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 font-semibold transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center space-x-2"
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