import React, { useState, useEffect } from 'react';
import { X, Send, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Album } from '../types';

interface CreatePostModalProps {
  album: Album;
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ album, onClose }) => {
  const { createPost } = useAppContext();
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCoverUrl, setSelectedCoverUrl] = useState<string | null>(null);

  const allPhotos = album.rolls?.flatMap(roll => roll.photos || []) || [];

  useEffect(() => {
    if (allPhotos.length > 0) {
      setSelectedCoverUrl(allPhotos[0].url);
    }
  }, [album]);

  const handlePublish = async () => {
    if (!caption.trim()) return;
    setIsLoading(true);
    await createPost(album.id, caption, selectedCoverUrl);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-lg w-full flex flex-col max-h-[80vh] shadow-2xl">
        <div className="flex-shrink-0 p-5 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Create a New Post</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar p-5 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-300 mb-2 block">Select Cover Photo</label>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto rounded-lg p-1 bg-gray-900/50">
              {allPhotos.map(photo => {
                const isSelected = selectedCoverUrl === photo.url;
                return (
                  <button 
                    key={photo.id}
                    onClick={() => setSelectedCoverUrl(photo.url)}
                    className={`relative aspect-square w-full rounded-md overflow-hidden border-2 transition-all ${isSelected ? 'border-amber-400' : 'border-transparent'}`}
                  >
                    <img src={photo.thumbnail_url} alt="Photo preview" className="w-full h-full object-cover bg-gray-700" />
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
      </div>
    </div>
  );
};

export default CreatePostModal;