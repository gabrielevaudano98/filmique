import React, { useState, useMemo } from 'react';
import { Film, Camera, Plus, BookCopy } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Roll, Album } from '../types';
import DevelopedRollCard from './DevelopedRollCard';
import DevelopingRollCard from './DevelopingRollCard';
import { isRollDeveloped, isRollDeveloping } from '../utils/rollUtils';
import CreateAlbumModal from './CreateAlbumModal';
import AlbumCard from './AlbumCard';

const RollsView: React.FC = () => {
  const {
    profile,
    activeRoll,
    completedRolls,
    developRoll,
    setCurrentView,
    setSelectedRoll,
    setShowFilmModal,
    setRollToName,
    albums,
    selectAlbum,
  } = useAppContext();

  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);

  const { developedRolls, developingRolls } = useMemo(() => {
    const allCompleted = completedRolls || [];
    const developed = allCompleted.filter(roll => isRollDeveloped(roll) && roll.title);
    const developing = allCompleted.filter(isRollDeveloping);
    return { developedRolls: developed, developingRolls: developing };
  }, [completedRolls]);

  const uncategorizedRolls = useMemo(() => {
    return developedRolls.filter(r => !r.album_id);
  }, [developedRolls]);

  const handleCurrentRollClick = () => {
    if (activeRoll) {
      setCurrentView('camera');
    } else {
      setShowFilmModal(true);
      setCurrentView('camera');
    }
  };

  const CurrentRollCard = () => (
    <div onClick={handleCurrentRollClick} className="bg-neutral-800 rounded-xl p-4 border border-neutral-700/80 shadow-lg transition-all duration-300 hover:border-neutral-600 cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-neutral-700 p-3 rounded-lg">
            <Camera className="w-6 h-6 text-brand-amber-start" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-lg">Current Roll</h4>
            <p className="text-gray-400 text-sm">{activeRoll ? activeRoll.film_type : 'No active roll'}</p>
          </div>
        </div>
        {activeRoll && (
          <div className="text-right">
            <p className="font-semibold text-white">{activeRoll.shots_used}/{activeRoll.capacity}</p>
            <p className="text-xs text-gray-500">shots</p>
          </div>
        )}
      </div>
      {activeRoll && (
        <div className="w-full bg-neutral-700 rounded-full h-2 mt-3">
          <div className="bg-brand-amber-start h-2 rounded-full" style={{ width: `${(activeRoll.shots_used / activeRoll.capacity) * 100}%` }}></div>
        </div>
      )}
      {!activeRoll && (
        <button onClick={(e) => { e.stopPropagation(); setShowFilmModal(true); setCurrentView('camera'); }} className="mt-3 w-full bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 font-semibold text-sm">
          <Film className="w-4 h-4" />
          <span>Load New Film</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col w-full space-y-8">
      <CurrentRollCard />

      {developingRolls.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">In the Darkroom</h3>
          <div className="max-w-2xl mx-auto space-y-4">
            {developingRolls.map(roll => <DevelopingRollCard key={roll.id} roll={roll} profile={profile} onDevelop={developRoll} />)}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Albums</h3>
          <button onClick={() => setShowCreateAlbumModal(true)} className="flex items-center gap-2 text-sm font-semibold text-brand-amber-start hover:text-brand-amber-mid">
            <Plus className="w-4 h-4" />
            New Album
          </button>
        </div>
        {albums.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {albums.map((album: Album) => (
              <AlbumCard key={album.id} album={album} onClick={() => { selectAlbum(album.id); setCurrentView('albumDetail'); }} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-4 bg-neutral-800/50 rounded-lg">
            <BookCopy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">No Albums Yet</h3>
            <p className="text-gray-400">Create your first album to organize your rolls.</p>
          </div>
        )}
      </div>

      {uncategorizedRolls.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Uncategorized Rolls</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {uncategorizedRolls.map(roll => (
              <DevelopedRollCard
                key={roll.id}
                roll={roll}
                onSelect={() => { setSelectedRoll(roll); setCurrentView('rollDetail'); }}
                onRename={() => setRollToName(roll)}
              />
            ))}
          </div>
        </div>
      )}

      {showCreateAlbumModal && <CreateAlbumModal onClose={() => setShowCreateAlbumModal(false)} />}
    </div>
  );
};

export default RollsView;