import React, { useState, useEffect } from 'react';
import { Roll } from '../types';
import { useAppContext } from '../context/AppContext';
import { X, Check, PlusCircle, BookOpen, MessageSquare } from 'lucide-react';
import Image from './Image';
import CreateAlbumModal from './CreateAlbumModal';
import { getPhotoAsWebViewPath } from '../utils/fileStorage';
import { LocalPhoto } from '../integrations/db';

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
  const [photoSrcs, setPhotoSrcs] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadPhotoSrcs = async () => {
      if (roll.photos) {
        const srcs: Record<string, string> = {};
        for (const photo of roll.photos) {
          const localPhoto = photo as LocalPhoto;
          if (localPhoto.local_path) {
            srcs[photo.id] = await getPhotoAsWebViewPath(localPhoto.local_path);
          }
        }
        setPhotoSrcs(srcs);
      }
    };
    loadPhotoSrcs();
  }, [roll.photos]);

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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[70] p-4">
        <div className="bg-neutral-800/80 backdrop-blur-2xl border border-neutral-700/50 rounded-2xl max-w-md w-full flex flex-col max-h-[90vh] shadow-2xl animate-modal-enter">
          {/* Header */}
          <div className="flex-shrink-0 p-6 text-center border-b border-neutral-700/50">
            <div className="inline-block p-3 bg-brand-amber-start/10 rounded-full mb-3">
              <Check className="w-8 h-8 text-brand-amber-start" />
            </div>
            <h2 className="text-2xl font-bold text-white">Development Complete!</h2>
            <p className="text-gray-300 mt-1">Your roll "{roll.title || roll.film_type}" is ready.</p>
          </div>

          {/* Content */}
          <div className="overflow-y-auto no-scrollbar p-6 space-y-6">
            {/* Photo Preview */}
            <div className="flex space-x-2 overflow-x-auto no-scrollbar -mx-2 px-2 pb-2">
              {roll.photos?.slice(0, 5).map(photo => (
                photoSrcs[photo.id] ? (
                  <Image key={photo.id} src={`${photoSrcs[photo.id]}${cacheBuster}`} alt="developed photo" className="w-24 h-24 rounded-md object-cover bg-neutral-700 flex-shrink-0" />
                ) : (
                  <div key={photo.id} className="w-24 h-24 rounded-md bg-neutral-700 flex-shrink-0" />
                )
              ))}
              {roll.photos && roll.photos.length > 5 && (
                <div className="w-24 h-24 rounded-md bg-neutral-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  +{roll.photos.length - 5}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4">
              {/* Album Assignment */}
              <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-700/50">
                <div className="flex items-center mb-3">
                  <BookOpen className="w-5 h-5 text-brand-amber-start mr-3" />
                  <h3 className="font-semibold text-white">Assign to an Album</h3>
                </div>
                <select
                  value={selectedAlbumId || ''}
                  onChange={(e) => setSelectedAlbumId(e.target.value || null)}
                  className="w-full bg-neutral-700/50 border border-neutral-600 rounded-lg px-3 py-2.5 text-white focus:ring-brand-amber-start focus:border-brand-amber-start"
                >
                  <option value="">Don't assign to an album</option>
                  {albums.map(album => (
                    <option key={album.id} value={album.id}>{album.title}</option>
                  ))}
                </select>
                <button type="button" onClick={() => setShowCreateAlbumModal(true)} className="flex items-center space-x-2 text-brand-amber-start text-sm font-semibold p-2 hover:bg-brand-amber-start/10 rounded-lg mt-2 -ml-2">
                  <PlusCircle className="w-4 h-4" />
                  <span>Create New Album</span>
                </button>
              </div>

              {/* Create Post */}
              <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-700/50">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 text-brand-amber-start mr-3" />
                    <h3 className="font-semibold text-white">Create a Post</h3>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={shouldCreatePost}
                      onChange={(e) => setShouldCreatePost(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-amber-start"></div>
                  </div>
                </label>
                {shouldCreatePost && (
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption for your post..."
                    rows={3}
                    className="w-full bg-neutral-700/50 border border-neutral-600 rounded-lg p-3 text-white focus:ring-brand-amber-start focus:border-brand-amber-start mt-3"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-4 border-t border-neutral-700/50 flex items-center justify-between bg-neutral-800/50">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 font-semibold transition-colors">
              I'll do this later
            </button>
            <button
              onClick={handleFinish}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-brand-amber-start hover:bg-brand-amber-end text-gray-900 font-bold transition-colors disabled:bg-neutral-600 disabled:cursor-not-allowed flex items-center space-x-2"
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