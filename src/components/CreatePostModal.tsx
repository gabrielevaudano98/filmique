import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Send, Check, PlusCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../context/AppContext';
import CreateAlbumModal from './CreateAlbumModal';
import Image from './Image';

interface CreatePostModalProps {
  onClose: () => void;
  unpostedRolls: Roll[];
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, unpostedRolls }) => {
  const { createPost, albums, refetchAlbums, isOnline } = useAppContext();
  const [step, setStep] = useState<'select_roll' | 'write_caption'>('select_roll');
  const [selectedRoll, setSelectedRoll] = useState<Roll | null>(null);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCoverUrl, setSelectedCoverUrl] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);

  useEffect(() => {
    if (selectedRoll && selectedRoll.photos && selectedRoll.photos.length > 0) {
      setSelectedCoverUrl(selectedRoll.photos[0].url);
    }
  }, [selectedRoll]);

  const handleSelectRoll = (roll: Roll) => {
    setSelectedRoll(roll);
    if (roll.album_id) {
      setSelectedAlbumId(roll.album_id);
    }
    setStep('write_caption');
  };

  const handleBack = () => {
    setSelectedRoll(null);
    setSelectedAlbumId(null);
    setStep('select_roll');
  };

  const handlePublish = async () => {
    if (!selectedRoll || !caption.trim()) return;
    setIsLoading(true);
    await createPost(selectedRoll.id, caption, selectedCoverUrl, selectedAlbumId);
    setIsLoading(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/70 dark:bg-neutral-800/60 backdrop-blur-lg border border-white/30 dark:border-neutral-700/50 rounded-2xl max-w-lg w-full flex flex-col max-h-[80vh] shadow-none">
          <div className="flex-shrink-0 p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            {step === 'write_caption' && (
              <button onClick={handleBack} className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors rounded-full -ml-2">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-bold text-black dark:text-white">
              {step === 'select_roll' ? 'Select a Roll to Post' : 'Write a Caption'}
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto no-scrollbar p-5">
            {step === 'select_roll' && (
              <div className="space-y-3">
                {unpostedRolls.length > 0 ? (
                  unpostedRolls.map(roll => {
                    const cacheBuster = roll.developed_at ? `?t=${new Date(roll.developed_at).getTime()}` : '';
                    const thumbnailUrl = roll.photos?.[0]?.thumbnail_url || '';
                    return (
                      <button
                        key={roll.id}
                        onClick={() => handleSelectRoll(roll)}
                        className="w-full flex items-center p-3 rounded-lg text-left transition-colors bg-gray-100/60 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Image src={`${thumbnailUrl}${cacheBuster}`} alt="Roll thumbnail" className="w-16 h-16 rounded-md object-cover bg-gray-600 mr-4" />
                        <div>
                          <p className="font-semibold text-black dark:text-white">{roll.title || roll.film_type}</p>
                          <p className="text-xs text-gray-500">Developed {new Date(roll.developed_at!).toLocaleDateString()}</p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-500 py-8">You have no developed rolls to post.</p>
                )}
              </div>
            )}

            {step === 'write_caption' && selectedRoll && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Select Cover Photo</label>
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto rounded-lg p-1 bg-gray-100/60 dark:bg-gray-900/50">
                    {selectedRoll.photos?.map(photo => {
                      const cacheBuster = selectedRoll.developed_at ? `?t=${new Date(selectedRoll.developed_at).getTime()}` : '';
                      const isSelected = selectedCoverUrl === photo.url;
                      return (
                        <button 
                          key={photo.id}
                          onClick={() => setSelectedCoverUrl(photo.url)}
                          className={`relative aspect-square w-full rounded-md overflow-hidden border-2 transition-all ${isSelected ? 'border-amber-400' : 'border-transparent'}`}
                        >
                          <Image src={`${photo.thumbnail_url}${cacheBuster}`} alt="Photo preview" className="w-full h-full object-cover bg-gray-700" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Check className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  rows={3}
                  className="w-full bg-gray-100/60 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-black dark:text-white focus:ring-amber-500 focus:border-amber-500"
                />
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Add to Album (Optional)</label>
                  <div className="flex flex-col space-y-2">
                    <select
                      value={selectedAlbumId || ''}
                      onChange={(e) => setSelectedAlbumId(e.target.value || null)}
                      className="w-full bg-gray-100/60 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-black dark:text-white focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="">Uncategorized</option>
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
              </div>
            )}
          </div>

          {step === 'write_caption' && (
            <div className="flex-shrink-0 p-5 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handlePublish}
                disabled={isLoading || !caption.trim() || !isOnline}
                className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{isLoading ? 'Publishing...' : 'Publish Post'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
      {showCreateAlbumModal && <CreateAlbumModal onClose={() => {
        setShowCreateAlbumModal(false);
        refetchAlbums();
      }} />}
    </>
  );
};

export default CreatePostModal;