import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Album, Roll } from '../types';
import { Folder, ArrowLeft, PlusCircle, Film } from 'lucide-react';
import AlbumListItem from './AlbumListItem';
import TimelineRollCard from './TimelineRollCard';
import CreateAlbumModal from './CreateAlbumModal';

const RollsOrganizerView: React.FC = () => {
  const { albums, completedRolls } = useAppContext();
  const [currentAlbumId, setCurrentAlbumId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; title: string }[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { childAlbums, rollsInCurrentAlbum, uncategorizedRolls } = useMemo(() => {
    const childAlbums = albums.filter(a => a.parent_album_id === currentAlbumId);
    const rollsInCurrentAlbum = completedRolls.filter(r => r.album_id === currentAlbumId && !r.is_archived);
    const uncategorizedRolls = currentAlbumId === null 
      ? completedRolls.filter(r => !r.album_id && !r.is_archived) 
      : [];
    return { childAlbums, rollsInCurrentAlbum, uncategorizedRolls };
  }, [albums, completedRolls, currentAlbumId]);

  const navigateToAlbum = (album: Album) => {
    setBreadcrumbs([...breadcrumbs, { id: currentAlbumId, title: currentAlbumId ? albums.find(a => a.id === currentAlbumId)?.title || 'Organizer' : 'Organizer' }]);
    setCurrentAlbumId(album.id);
  };

  const navigateBack = () => {
    const prev = breadcrumbs.pop();
    if (prev) {
      setCurrentAlbumId(prev.id);
      setBreadcrumbs([...breadcrumbs]);
    }
  };

  const navigateToRoot = () => {
    setCurrentAlbumId(null);
    setBreadcrumbs([]);
  };

  const currentAlbum = albums.find(a => a.id === currentAlbumId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-400">
          {currentAlbumId && (
            <>
              <button onClick={navigateToRoot} className="hover:text-white">Organizer</button>
              <span className="mx-2">/</span>
            </>
          )}
          {breadcrumbs.length > 1 && <span>... /</span>}
          {breadcrumbs.length > 0 && (
            <button onClick={navigateBack} className="hover:text-white">{breadcrumbs[breadcrumbs.length - 1].title}</button>
          )}
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 text-amber-400 font-semibold text-sm p-2 hover:bg-amber-500/10 rounded-lg">
          <PlusCircle className="w-4 h-4" />
          <span>New Album</span>
        </button>
      </div>

      <h2 className="text-2xl font-bold text-white">{currentAlbum?.title || 'Organizer'}</h2>

      {childAlbums.length > 0 && (
        <div className="space-y-2">
          {childAlbums.map(album => (
            <AlbumListItem key={album.id} album={album} onClick={() => navigateToAlbum(album)} />
          ))}
        </div>
      )}

      {rollsInCurrentAlbum.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mt-6 mb-3">Rolls in this Album</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {rollsInCurrentAlbum.map(roll => (
              <TimelineRollCard key={roll.id} roll={roll} />
            ))}
          </div>
        </div>
      )}

      {uncategorizedRolls.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mt-6 mb-3">Uncategorized Rolls</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {uncategorizedRolls.map(roll => (
              <TimelineRollCard key={roll.id} roll={roll} />
            ))}
          </div>
        </div>
      )}

      {childAlbums.length === 0 && rollsInCurrentAlbum.length === 0 && uncategorizedRolls.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Folder className="w-12 h-12 mx-auto mb-4" />
          <p>This album is empty.</p>
        </div>
      )}

      {showCreateModal && (
        <CreateAlbumModal 
          onClose={() => setShowCreateModal(false)} 
          parentAlbumId={currentAlbumId}
        />
      )}
    </div>
  );
};

export default RollsOrganizerView;