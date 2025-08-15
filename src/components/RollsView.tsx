import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../types';
import { isRollDeveloped } from '../utils/rollUtils';
import CreateAlbumModal from './CreateAlbumModal';
import SegmentedControl from './SegmentedControl';
import CollapsibleAlbumSection from './CollapsibleAlbumSection';
import RollListItem from './RollListItem';
import GlassPanel from './GlassPanel';
import RollCard from './RollCard';

const RollsView: React.FC = () => {
  const { completedRolls, albums, refetchRolls, refetchAlbums } = useAppContext();

  const [activeSection, setActiveSection] = useState<'shelf' | 'darkroom' | 'albums'>('shelf');
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);

  useEffect(() => {
    refetchRolls();
    refetchAlbums();
  }, [refetchRolls, refetchAlbums]);

  const { developingRolls, shelvedRolls, developedRollsOnShelf } = useMemo(() => {
    const allCompleted = completedRolls || [];
    const developing = allCompleted.filter(r => r.is_completed && r.completed_at && !isRollDeveloped(r));
    const shelved = allCompleted.filter(r => r.is_completed && !r.completed_at && !r.developed_at);
    const developedOnShelf = allCompleted.filter(r => isRollDeveloped(r));
    return { 
      developingRolls: developing.sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()), 
      shelvedRolls: shelved.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at!).getTime()), 
      developedRollsOnShelf: developedOnShelf.sort((a, b) => new Date(b.developed_at!).getTime() - new Date(a.developed_at!).getTime()) 
    };
  }, [completedRolls]);

  const rollsByAlbum = useMemo(() => {
    const grouped: { [albumId: string]: Roll[] } = {};
    albums.forEach(album => {
      grouped[album.id] = [];
    });
    developedRollsOnShelf.forEach(roll => {
      if (roll.album_id && grouped[roll.album_id]) {
        grouped[roll.album_id].push(roll);
      }
    });
    return grouped;
  }, [developedRollsOnShelf, albums]);

  const uncategorizedRolls = useMemo(() => {
    return developedRollsOnShelf.filter(r => !r.album_id);
  }, [developedRollsOnShelf]);

  const DarkroomEmptyState = () => (
    <div className="text-center py-24 text-neutral-500">
      <Clock className="w-16 h-16 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white">Darkroom is Empty</h3>
      <p className="mt-2">Send undeveloped rolls from your shelf to the darkroom to start the development process.</p>
    </div>
  );

  return (
    <div className="flex flex-col w-full space-y-8">
      <h1 className="text-4xl font-semibold text-white px-2">Shelf</h1>
      <SegmentedControl
        options={[
          { label: 'Shelf', value: 'shelf' },
          { label: `Darkroom (${developingRolls.length})`, value: 'darkroom' },
          { label: 'Albums', value: 'albums' },
        ]}
        value={activeSection}
        onChange={(value) => setActiveSection(value as 'shelf' | 'darkroom' | 'albums')}
      />

      <div key={activeSection} className="animate-fade-in">
        {activeSection === 'shelf' && (
          <div className="space-y-8">
            <GlassPanel title="Undeveloped" tint="warm">
              {shelvedRolls.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {shelvedRolls.map(roll => <RollCard key={roll.id} roll={roll} isDeveloped={false} />)}
                </div>
              ) : (
                <p className="text-center text-neutral-400 py-8">Finish a roll of film and it will appear here.</p>
              )}
            </GlassPanel>
            <GlassPanel title="Developed" tint="cool">
              {developedRollsOnShelf.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {developedRollsOnShelf.map(roll => <RollCard key={roll.id} roll={roll} isDeveloped={true} />)}
                </div>
              ) : (
                <p className="text-center text-neutral-400 py-8">No developed rolls on your shelf yet.</p>
              )}
            </GlassPanel>
          </div>
        )}

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