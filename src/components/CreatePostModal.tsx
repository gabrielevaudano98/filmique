import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Send, Check } from 'lucide-react';
import { useAppContext, Roll } from '../context/AppContext';
import RollSelector from './RollSelector';

interface CreatePostModalProps {
  onClose: () => void;
  unpostedRolls: Roll[];
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, unpostedRolls }) => {
  const { createPost, albums } = useAppContext();
  const [step, setStep] = useState<'select_roll' | 'write_caption'>('select_roll');
  const [selectedRoll, setSelectedRoll] = useState<Roll | null>(null);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [selectedCoverUrl, setSelectedCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedRoll && selectedRoll.photos && selectedRoll.photos.length > 0) {
      setSelectedCoverUrl(selectedRoll.photos[0].url);
    }
  }, [selectedRoll]);

  const handleSelectRollDirect = (roll: Roll) => {
    setSelectedRoll(roll);
    setStep('write_caption');
    setShowSelector(false);
  };

  const handleOpenSelector = () => {
    setShowSelector(true);
  };

  const handleBack = () => {
    setSelectedRoll(null);
    setStep('select_roll');
  };

  const handlePublish = async () => {
    if (!selectedRoll || !caption.trim()) return;
    setIsLoading(true);
    await createPost(selectedRoll.id, caption, selectedCoverUrl);
    setIsLoading(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-2xl max-w-lg w-full flex flex-col max-h-[80vh] shadow-2xl">
          <div className="flex-shrink-0 p-5 border-b border-gray-700 flex items-center justify-between">
            {step === 'write_caption' && (
              <button onClick={handleBack} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full -ml-2">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-bold text-white">
              {step === 'select_roll' ? 'Select a Roll to Post' : 'Write a Caption'}
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto no-scrollbar p-5 flex-1">
            {step === 'select_roll' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-gray-300">Choose a developed roll. You can filter by album or search for titles.</p>
                  <button onClick={handleOpenSelector} className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold">Pick Roll</button>
                </div>

                <div>
                  {unpostedRolls.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {unpostedRolls.slice(0, 6).map(roll => {
                        const cacheBuster = roll.developed_at ? `?t=${new Date(roll.developed_at).getTime()}` : '';
                        const thumbnailUrl = roll.photos?.[0]?.thumbnail_url || '';
                        return (
                          <button key={roll.id} onClick={() => handleSelectRollDirect(roll)} className="relative aspect-[9/12] rounded-xl overflow-hidden bg-gray-800 hover:scale-[1.01] transition-transform">
                            <img src={`${thumbnailUrl}${cacheBuster}`} alt="Roll thumbnail" className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                              <p className="text-sm font-semibold text-white truncate">{roll.title || roll.film_type}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500">You have no developed rolls ready to post. Develop a roll first.</p>
                  )}
                </div>
              </div>
            )}

            {step === 'write_caption' && selectedRoll && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">Select Cover Photo</label>
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto rounded-lg p-1 bg-gray-900/50">
                    {selectedRoll.photos?.map(photo => {
                      const cacheBuster = selectedRoll.developed_at ? `?t=${new Date(selectedRoll.developed_at).getTime()}` : '';
                      const isSelected = selectedCoverUrl === photo.url;
                      return (
                        <button 
                          key={photo.id}
                          onClick={() => setSelectedCoverUrl(photo.url)}
                          className={`relative aspect-square w-full rounded-md overflow-hidden border-2 transition-all ${isSelected ? 'border-amber-400' : 'border-transparent'}`}
                        >
                          <img src={`${photo.thumbnail_url}${cacheBuster}`} alt="Photo preview" className="w-full h-full object-cover bg-gray-700" />
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
                  rows={4}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            )}
          </div>

          {step === 'write_caption' && (
            <div className="flex-shrink-0 p-5 border-t border-gray-700">
              <button
                onClick={handlePublish}
                disabled={isLoading || !caption.trim()}
                className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{isLoading ? 'Publishing...' : 'Publish Post'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showSelector && (
        <RollSelector
          rolls={unpostedRolls}
          albums={albums || []}
          onSelect={(r) => handleSelectRollDirect(r)}
          onCreateAlbum={() => { /* optional hook */ }}
          onClose={() => setShowSelector(false)}
        />
      )}
    </>
  );
};

export default CreatePostModal;