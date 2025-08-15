import React, { useState, useEffect } from 'react';
import { Clock, Archive, Edit } from 'lucide-react';
import { Roll } from '../types';
import { useAppContext } from '../context/AppContext';
import { showErrorToast, showSuccessToast, showLoadingToast, dismissToast } from '../utils/toasts';

interface RollCompletionWizardProps {
  roll: Roll;
  onSendToDarkroom: (roll: Roll, title: string) => void;
  onPutOnShelf: (roll: Roll, title: string) => void;
}

const RollCompletionWizard: React.FC<RollCompletionWizardProps> = ({ roll, onSendToDarkroom, onPutOnShelf }) => {
  const { albums, addRollsToAlbum, createPost, filmStocks } = useAppContext();
  const [title, setTitle] = useState(roll.title || '');
  const [isLoading, setIsLoading] = useState<'darkroom' | 'shelf' | null>(null);

  // New states
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [postNow, setPostNow] = useState(false);
  const [postCaption, setPostCaption] = useState('');
  const [selectedCoverUrl, setSelectedCoverUrl] = useState<string | null>(roll.photos && roll.photos[0]?.url ? roll.photos[0].url : null);

  useEffect(() => {
    // Try to default to an "Uncategorized" album if present (title contains 'uncategor')
    const unc = albums.find(a => /uncategor/i.test(a.title || ''));
    if (unc) setSelectedAlbumId(unc.id);
  }, [albums]);

  const handleFinish = async (action: 'darkroom' | 'shelf') => {
    if (!title.trim()) {
      showErrorToast('Please provide a title for your roll.');
      return;
    }
    setIsLoading(action);
    const toastId = showLoadingToast(action === 'darkroom' ? 'Sending to darkroom...' : 'Putting on shelf...');

    try {
      if (action === 'darkroom') {
        onSendToDarkroom(roll, title.trim());
      } else {
        onPutOnShelf(roll, title.trim());
      }

      // After the parent handler completes (it updates DB), attempt to assign album and optionally post.
      // Give a short delay to allow backend changes to settle.
      await new Promise(res => setTimeout(res, 600));

      if (selectedAlbumId) {
        await addRollsToAlbum(selectedAlbumId, [roll.id]);
      }

      if (postNow) {
        // cover url may be null — that's acceptable
        await createPost(roll.id, postCaption || '', selectedCoverUrl || null, selectedAlbumId);
        showSuccessToast('Post created.');
      }

      showSuccessToast(action === 'darkroom' ? 'Roll sent to the darkroom!' : 'Roll placed on your shelf.');
    } catch (err: any) {
      console.error(err);
      showErrorToast(err?.message || 'Could not complete operation.');
    } finally {
      dismissToast(toastId);
      setIsLoading(null);
    }
  };

  const albumTypeWarning = (() => {
    const album = albums.find(a => a.id === selectedAlbumId);
    if (!album) return null;
    if (album.type === 'public') return null;
    return `This album is ${album.type}. The album itself will not be viewable publicly — only posts or the roll itself will be accessible if you publish.`;
  })();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-lg flex items-center justify-center z-[60] p-4">
      <div className="bg-transparent max-w-lg w-full p-6 animate-modal-enter text-center">
        <div className="bg-neutral-900 rounded-2xl p-6 shadow-2xl border border-neutral-700/50">
          <h2 className="text-3xl font-bold text-white">Name Your Roll</h2>
          <p className="text-sm text-gray-400 mt-2 mb-4">Give this roll a title and choose where it should be stored. You can also post it now.</p>

          <div className="space-y-4">
            <div className="relative">
              <Edit className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g., Summer Vacation '24" 
                className="w-full bg-neutral-800 border-2 border-neutral-700 rounded-lg pl-12 pr-4 py-3 text-white text-lg focus:ring-brand-amber-start focus:border-brand-amber-start transition-all" 
                required 
                maxLength={60} 
                autoFocus 
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-300 mb-2 block">Put in Album</label>
              <select
                value={selectedAlbumId || ''}
                onChange={(e) => setSelectedAlbumId(e.target.value || null)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">Keep uncategorized</option>
                {albums.map(album => (
                  <option key={album.id} value={album.id}>
                    {album.title} {album.type !== 'public' ? `(${album.type})` : ''}
                  </option>
                ))}
              </select>

              {albumTypeWarning && (
                <div className="mt-3 p-3 rounded-md bg-yellow-900/20 border border-yellow-700/30 text-sm text-yellow-200">
                  {albumTypeWarning}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-300 mb-2 block">Post now?</label>
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={postNow} onChange={(e) => setPostNow(e.target.checked)} className="h-4 w-4" />
                  <span className="text-gray-300">Create a post for this roll immediately</span>
                </label>
              </div>

              {postNow && (
                <div className="mt-3 space-y-3">
                  <textarea
                    value={postCaption}
                    onChange={(e) => setPostCaption(e.target.value)}
                    placeholder="Caption (optional)"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:ring-amber-500 focus:border-amber-500"
                    rows={3}
                  />
                  <div>
                    <label className="text-sm text-gray-300 block mb-2">Choose cover photo</label>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                      {(roll.photos || []).map(p => (
                        <button key={p.id} onClick={() => setSelectedCoverUrl(p.url)} className={`w-20 h-20 rounded-md overflow-hidden border-2 ${selectedCoverUrl === p.url ? 'border-amber-400' : 'border-transparent'}`}>
                          <img src={p.thumbnail_url} alt="cover option" className="w-full h-full object-cover" />
                        </button>
                      ))}
                      {(roll.photos || []).length === 0 && <div className="text-sm text-gray-500">No photos available for cover selection.</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => handleFinish('shelf')}
              disabled={!!isLoading}
              className="flex-1 flex justify-center items-center space-x-2 py-3 px-4 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-base font-bold text-white transition-colors disabled:opacity-50"
            >
              <Archive className="w-5 h-5" />
              <span>{isLoading === 'shelf' ? 'Saving...' : 'Put on Shelf'}</span>
            </button>
            <button 
              onClick={() => handleFinish('darkroom')}
              disabled={!!isLoading}
              className="flex-1 flex justify-center items-center space-x-2 py-3 px-4 rounded-xl shadow-lg shadow-brand-amber-start/20 text-base font-bold text-white bg-gradient-to-r from-brand-amber-start to-brand-amber-end hover:opacity-90 transition-all disabled:opacity-50"
            >
              <Clock className="w-5 h-5" />
              <span>{isLoading === 'darkroom' ? 'Sending...' : 'Send to Darkroom'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RollCompletionWizard;