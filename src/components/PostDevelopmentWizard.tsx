import React, { useState, useEffect } from 'react';
import { Roll } from '../types';
import { useAppContext } from '../context/AppContext';
import { X, Check, PlusCircle } from 'lucide-react';
import Image from './Image';
import CreateAlbumModal from './CreateAlbumModal';

interface PostDevelopmentWizardProps {
  roll: Roll;
  onClose: () => void;
}

const PostDevelopmentWizard: React.FC<PostDevelopmentWizardProps> = ({ roll, onClose }) => {
  const { albums, addRollsToAlbum, createPost, refetchAlbums } = useAppContext();
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [shouldCreatePost, setShouldCreatePost] = useState(false);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);

  useEffect(() => {
    refetchAlbums();
  }, [refetchAlbums]);

  const handleFinish = async () => {
    setIsLoading(true);
    if (selectedAlbumId) {
      await addRollsToAlbum(selectedAlbumId, [roll.id]);
    }
    if (shouldCreatePost && caption.trim()) {
      const coverPhotoUrl = roll.photos?.[0]?.url || null;
      await createPost(roll.id, caption.trim(), coverPhotoUrl, selectedAlbumId);
    }
    setIsLoading(false);
    onClose();
  };

  const cacheBuster = roll.developed_at ? `?t=${new Date(roll.developed_at).getTime()}` : '';

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
        <div className="bg-neutral-800/80 backdrop-blur-lg border border-neutral-700/50 rounded-2xl max-w-md w-full flex flex-col max-h-[90vh] shadow-2xl animate-modal-enter">
          <div className="flex-shrink-0 p-5 border-b border-gray-700 text-center">
            <h2 className="text-2xl font-bold text-amber-400">Development Complete!</h2>
            <p className="text-gray-300 mt-1">Your roll "{roll.title || roll.film_type}" is ready.</p>
          </div>

          <div className="overflow-y-auto no-scrollbar p-5 space-y-6">
            {/* Photo Preview */}
            <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
              {roll.photos?.slice(0, 5).map(photo => (
                <Image key={photo.id} src={`${photo.thumbnail_url}${cacheBuster}`} alt="developed photo" className="w-20 h-20 rounded-md object-cover bg-gray-700 flex-shrink-0" />
              ))}
              {roll.photos && roll.photos.length > 5 && (
                <div className="w-20 h-20 rounded-md bg-gray-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  +{roll.photos.length - 5}
                </div>
              )}
            </div>

            {/* Album Assignment */}
            <div>
              <label className="text-sm font-semibold text-gray-300 mb-2 block">1. Assign to an Album (Optional)</label>
              <div className="flex flex-col space-y-2">
                <select
                  value={selectedAlbumId || ''}
                  onChange={(e) => setSelectedAlbumId(e.target.value || null)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">Don't assign to an album</option>
                  {albums.map(album => (
                    <option key={album.id} value={album.id}>{album.title}</option>
                  ))}
                </select>
                <button type="button" onClick={() => setShowCreateAlbumModal(true)} className="flex items-center space-x-2 text-amber-400 text-sm font-semibold p-2 hover:bg-amber-500/10 rounded-lg self-start">
                  <PlusCircle className="w-4 h-4" />
                  <span>Create New Album</span>
                </button>
              </div>
            </div>

            {/* Create Post */}
            <div>
              <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={shouldCreatePost}
                  onChange={(e) => setShouldCreatePost(e.target.checked)}
                  className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500 mr-3"
                />
                2. Create a Post (Optional)
              </label>
              {shouldCreatePost && (
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption for your post..."
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-amber-500 focus:border-amber-500 mt-2"
                />
              )}
            </div>
          </div>

          <div className="flex-shrink-0 p-5 border-t border-gray-700 flex items-center justify-between">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 font-semibold transition-colors">
              I'll do this later
            </button>
            <button
              onClick={handleFinish}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Check className="w-5 h-5" />
              <span>{isLoading ? 'Saving...' : 'Finish'}</span>
            </button>
          </div>
        </div>
      </div>
      {showCreateAlbumModal && <CreateAlbumModal onClose={() => {
        setShowCreateAlbumModal(false);
        refetchAlbums();
      }} />}
    </>
  );
};

export default PostDevelopmentWizard;