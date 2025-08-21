import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Film, Archive, Lock } from 'lucide-react';
import DevelopingRollCard from './DevelopingRollCard';
import AlbumCard from './AlbumCard';
import UncategorizedAlbumCard from './UncategorizedAlbumCard';
import PrintsView from './PrintsView';
import DarkroomEmptyState from './DarkroomEmptyState';
import SegmentedControl from './SegmentedControl';
import { isRollDeveloped } from '../utils/rollUtils';

const StudioView: React.FC = () => {
  const { 
    profile,
    developingRolls, completedRolls,
    setSelectedAlbum, setCurrentView,
    refetchAlbums, albums
  } = useAppContext();

  const [studioSection, setStudioSection] = useState<'darkroom' | 'albums' | 'prints'>('darkroom');

  useEffect(() => {
    refetchAlbums();
  }, [refetchAlbums]);

  const uncategorizedRolls = useMemo(() => {
    return completedRolls.filter(r => isRollDeveloped(r) && !r.album_id && !r.is_archived);
  }, [completedRolls]);

  const handleSelectAlbum = (albumId: string) => {
    const album = albums.find(a => a.id === albumId);
    if (album) {
      setSelectedAlbum(album);
      setCurrentView('albumDetail');
    }
  };

  const studioSectionOptions = [
    { 
      value: 'darkroom', 
      label: 'Darkroom', 
      icon: Film, 
      colors: { from: 'from-brand-amber-start', to: 'to-brand-amber-end', shadow: 'shadow-brand-amber-end/40' },
      description: 'Develop your completed rolls.'
    },
    { 
      value: 'albums', 
      label: 'Albums', 
      icon: Archive, 
      colors: { from: 'from-accent-violet', to: 'to-indigo-600', shadow: 'shadow-indigo-500/30' },
      description: 'Organize and view your developed photos.'
    },
    { 
      value: 'prints', 
      label: 'Prints', 
      icon: Lock, 
      colors: { from: 'from-accent-teal', to: 'to-emerald-500', shadow: 'shadow-emerald-500/30' },
      description: 'Order prints of your photos.'
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Studio</h1>
        <div className="w-auto">
          <SegmentedControl
            options={studioSectionOptions}
            value={studioSection}
            onChange={(val) => setStudioSection(val as any)}
          />
        </div>
      </div>

      <div className="flex-1">
        {studioSection === 'darkroom' && (
          <div>
            {developingRolls.length > 0 ? (
              <div className="space-y-3">
                {developingRolls.map(roll => <DevelopingRollCard key={roll.id} roll={roll} />)}
              </div>
            ) : <DarkroomEmptyState />}
          </div>
        )}

        {studioSection === 'albums' && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {uncategorizedRolls.length > 0 && (
                <UncategorizedAlbumCard 
                  rolls={uncategorizedRolls} 
                  onClick={() => setCurrentView('uncategorizedRolls')} 
                />
              )}
              {albums.map(album => (
                <AlbumCard 
                  key={album.id} 
                  album={album} 
                  onClick={() => handleSelectAlbum(album.id)} 
                />
              ))}
            </div>
          </div>
        )}

        {studioSection === 'prints' && (
          <div>
            <PrintsView />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioView;