import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../types';
import { isRollDeveloped } from '../utils/rollUtils';
import CreateAlbumModal from './CreateAlbumModal';
import SegmentedControl from './SegmentedControl';
import CollapsibleAlbumSection from './CollapsibleAlbumSection';
import RollListItem from './RollListItem';

const DarkroomEmptyState = () => (
  <div className="text-center py-24 text-neutral-500">
    <Clock className="w-16 h-16 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-white">Darkroom is Empty</h3>
    <p className="mt-2">When you finish a roll, it will appear here to be developed.</p>
  </div>
);

const RollsView: React.FC = () => {
  const { completedRolls, albums, refetchRolls, refetchAlbums } = useAppContext();

  const [activeSection, setActiveSection] = useState<'albums' | 'darkroom'>('albums');
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);

  useEffect(() => {
    refetchRolls();
    refetchAlbums();
  }, [refetchRolls, refetchAlbums]);

  const { developingRolls, developedRolls } = useMemo(() => {
    const allCompleted = completedRolls || [];
    const developing = allCompleted.filter(r => r.is_completed && r.completed_at && !isRollDeveloped(r));
    const developed = allCompleted.filter(r => isRollDeveloped(r));
    return { 
      developingRolls: developing.sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()), 
      developedRolls: developed.sort((a, b) => new Date(b.developed_at!).getTime() - new Date(a.developed_at!).getTime()) 
    };
  }, [completedRolls]);

  const rollsByAlbum = useMemo(() => {
    const grouped: { [albumId: string]: Roll[] } = {};
    albums.forEach(album => {
      grouped[album.id] = [];
    });
    developedRolls.forEach(roll => {
      if (roll.album_id && grouped[roll.album_id]) {
        grouped[roll.album_id].push(roll);
      }
    });
    return grouped;
  }, [developedRolls, albums]);

  const uncategorizedRolls = useMemo(() => {
    return developedRolls.filter(r => !r.album_id);
  }, [developedRolls]);

  return (
    <div className="flex flex-col w-full space-y-6">
      <h1 className="text-3xl font-bold text-white">My Rolls</h1>
      <SegmentedControl
        options={[
          { label: 'Albums', value: 'albums' },
          { label: `Darkroom (${developingRolls.length})`, value: 'darkroom' },
        ]}
        value={activeSection}
        onChange={(value) => setActiveSection(value as 'albums' | 'darkroom')}
      />

      <div key={activeSection} className="animate-fade-in">
        {activeSection === 'darkroom' && (
          <div>
            {developingRolls.length > 0 ? (
              <div className="space-y-3">
                {developingRolls.map(roll => (
                  <RollListItem
                    key={roll.id}
                    roll={roll}
                    onDelete={() => {}}
                    onAssignAlbum={() => {}}
                    isDeveloping={true}
                  />
                ))}
              </div>
            ) : (
              <DarkroomEmptyState />
            )}
          </div>
        )}

        {activeSection === 'albums' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">My Albums</h3>
              <button onClick={() => setShowCreateAlbumModal(true)} className="flex items-center gap-2 text-sm font-semibold text-brand-amber-start hover:text-brand-amber-mid">
                <Plus className="w-4 h-4" />
                New Album
              </button>
            </div>
            <div className="space-y-4">
              {albums.map(album => (
                <CollapsibleAlbumSection
                  key={album.id}
                  title={album.title}
                  rolls={rollsByAlbum[album.id] || []}
                  album={album}
                />
              ))}
              {uncategorizedRolls.length > 0 && (
                <CollapsibleAlbumSection
                  title="Uncategorized"
                  rolls={uncategorizedRolls}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {showCreateAlbumModal && <CreateAlbumModal onClose={() => setShowCreateAlbumModal(false)} />}
    </div>
  );
};

export default RollsView;