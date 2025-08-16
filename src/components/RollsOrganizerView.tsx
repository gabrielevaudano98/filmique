import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Album, Roll } from '../types';
import { Folder, PlusCircle } from 'lucide-react';
import AlbumListItem from './AlbumListItem';
import RollOrganizerItem from './RollOrganizerItem';
import CreateAlbumModal from './CreateAlbumModal';

const RollsOrganizerView: React.FC = () => {
  const { albums, completedRolls, setCurrentView, setSelectedRoll } = useAppContext();
  const [breadcrumbs, setBreadcrumbs] = useState<Album[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const currentAlbumId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null;
  const currentAlbum = currentAlbumId ? albums.find(a => a.id === currentAlbumId) : null;

  const items = useMemo(() => {
    const childAlbums = albums.filter(a => a.parent_album_id === currentAlbumId);
    const rollsInAlbum = completedRolls.filter(r => r.album_id === currentAlbumId && !r.is_archived);
    
    const combinedItems: (Album | Roll)[] = [...childAlbums, ...rollsInAlbum];
    
    combinedItems.sort((a, b) => {
      const isAlbumA = 'parent_album_id' in a;
      const isAlbumB = 'parent_album_id' in b;
      if (isAlbumA && !isAlbumB) return -1; // Albums first
      if (!isAlbumA && isAlbumB) return 1;  // Rolls after
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return combinedItems;
  }, [albums, completedRolls, currentAlbumId]);

  const navigateToAlbum = (album: Album) => {
    setBreadcrumbs([...breadcrumbs, album]);
  };

  const navigateToCrumb = (index: number) => {
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const navigateToRoot = () => {
    setBreadcrumbs([]);
  };

  const handleRollClick = (roll: Roll) => {
    setSelectedRoll(roll);
    setCurrentView('rollDetail');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-400">
          <button onClick={navigateToRoot} className="hover:text-white">Organizer</button>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              <span className="mx-2">/</span>
              <button 
                onClick={() => navigateToCrumb(index)} 
                className="hover:text-white truncate max-w-24"
                title={crumb.title}
              >
                {crumb.title}
              </button>
            </React.Fragment>
          ))}
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 text-amber-400 font-semibold text-sm p-2 hover:bg-amber-500/10 rounded-lg">
          <PlusCircle className="w-4 h-4" />
          <span>New Album</span>
        </button>
      </div>

      <h2 className="text-2xl font-bold text-white">{currentAlbum?.title || 'Organizer'}</h2>

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map(item => {
            if ('shots_used' in item) { // It's a Roll
              return <RollOrganizerItem key={`roll-${item.id}`} roll={item} onClick={() => handleRollClick(item)} />;
            } else { // It's an Album
              return <AlbumListItem key={`album-${item.id}`} album={item} onClick={() => navigateToAlbum(item)} />;
            }
          })}
        </div>
      ) : (
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