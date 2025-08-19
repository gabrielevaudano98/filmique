import React, { useState, useMemo } from 'react';
import { BookPlus, X, Lock, Link2, Globe } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface CreateAlbumModalProps {
  onClose: () => void;
  parentAlbumId?: string | null;
  itemType?: 'Album' | 'Box';
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
      selected ? 'bg-brand-amber-start/10 border-brand-amber-start' : 'bg-neutral-700/50 border-transparent hover:border-neutral-600'
    }`}
  >
    <Icon className={`w-5 h-5 mx-auto mb-1 ${selected ? 'text-brand-amber-start' : 'text-gray-400'}`} />
    <span className={`text-xs font-bold ${selected ? 'text-white' : 'text-gray-300'}`}>{label}</span>
  </button>
);

const CreateAlbumModal: React.FC<CreateAlbumModalProps> = ({ onClose, parentAlbumId: initialParentId = null, itemType = 'Album' }) => {
  const { createAlbum, albums } = useAppContext();
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'unlisted' | 'public'>('private');
  const [parentAlbumId, setParentAlbumId] = useState<string | null>(initialParentId);
  const [isLoading, setIsLoading] = useState(false);

  const albumOptions = useMemo(() => {
    const options: { value: string; label: string; depth: number }[] = [];
    const buildOptions = (parentId: string | null, depth: number) => {
      if (depth >= 3) return; // Max 3 levels of nesting
      albums
        .filter(album => album.parent_album_id === parentId)
        .forEach(album => {
          options.push({ value: album.id, label: album.title, depth });
          buildOptions(album.id, depth + 1);
        });
    };
    buildOptions(null, 0);
    return options;
  }, [albums]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsLoading(true);
    await createAlbum(title, visibility, parentAlbumId);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
      <div className="bg-neutral-800/80 backdrop-blur-lg border border-neutral-700/50 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-modal-enter">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Create New {itemType}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="album-title" className="text-sm font-semibold text-gray-300 mb-2 block">{itemType} Title</label>
              <input
                id="album-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Summer Vacation '24"
                className="w-full bg-neutral-700/50 border border-neutral-600 rounded-lg px-4 py-2 text-white focus:ring-brand-amber-start focus:border-brand-amber-start"
                required
              />
            </div>
            <div>
              <label htmlFor="parent-album" className="text-sm font-semibold text-gray-300 mb-2 block">Location (Parent {itemType})</label>
              <select
                id="parent-album"
                value={parentAlbumId || ''}
                onChange={(e) => setParentAlbumId(e.target.value || null)}
                className="w-full bg-neutral-700/50 border border-neutral-600 rounded-lg px-4 py-2 text-white focus:ring-brand-amber-start focus:border-brand-amber-start"
              >
                <option value="">Root Level</option>
                {albumOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {'--'.repeat(opt.depth)} {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {itemType === 'Album' && (
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Visibility</label>
                <div className="flex items-center space-x-2">
                  <VisibilityOption label="Private" value="private" icon={Lock} selected={visibility === 'private'} onSelect={() => setVisibility('private')} />
                  <VisibilityOption label="Unlisted" value="unlisted" icon={Link2} selected={visibility === 'unlisted'} onSelect={() => setVisibility('unlisted')} />
                  <VisibilityOption label="Public" value="public" icon={Globe} selected={visibility === 'public'} onSelect={() => setVisibility('public')} />
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 font-semibold transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="px-4 py-2 rounded-lg bg-brand-amber-start hover:bg-brand-amber-end text-gray-900 font-bold transition-colors disabled:bg-neutral-600 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <BookPlus className="w-4 h-4" />
              <span>{isLoading ? 'Creating...' : `Create ${itemType}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAlbumModal;