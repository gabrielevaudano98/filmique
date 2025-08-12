import React, { useState, useMemo } from 'react';
import { Plus, Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../types';
import { isRollDeveloped, isRollDeveloping } from '../utils/rollUtils';
import CreateAlbumModal from './CreateAlbumModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import AssignAlbumModal from './AssignAlbumModal';
import SegmentedControl from './SegmentedControl';
import CollapsibleAlbumSection from './CollapsibleAlbumSection';
import RollListItem from './RollListItem';

const RollsView: React.FC = () => {
  const {
    completedRolls,
    albums,
    deleteRoll,
  } = useAppContext();

  const [activeSection, setActiveSection] = useState<'rolls' | 'darkroom'>('rolls');
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
  const [rollToDelete, setRollToDelete] = useState<Roll | null>(null);
  const [rollToAssign, setRollToAssign] = useState<Roll | null>(null);

  const { developedRolls, developingRolls } = useMemo(() => {
    const allCompleted = completedRolls || [];
    const developed = allCompleted.filter(roll => isRollDeveloped(roll));
    const developing = allCompleted.filter(isRollDeveloping);
    return { developedRolls: developed, developingRolls: developing };
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
    return developedRolls
      .filter(r => !r.album_id)
      .sort((a, b) => new Date(b.developed_at!).getTime() - new Date(a.developed_at!).getTime());
  }, [developedRolls]);

  const DarkroomEmptyState = () => (
    <div className="text-center py-24 text-neutral-500">
      <Clock className="w-16 h-16 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white">Darkroom is Empty</h3>
      <p className="mt-2">Completed rolls will appear here while they develop.</p>
    </div>
  );

  return (
    <div className="flex flex-col w-full space-y-6">
      <SegmentedControl
        options={[
          { label: 'My Rolls', value: 'rolls' },
          { label: `Darkroom (${developingRolls.length})`, value: 'darkroom' },
        ]}
        value={activeSection}
        onChange={(value) => setActiveSection(value as 'rolls' | 'darkroom')}
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

        {activeSection === 'rolls' && (
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
                  onDeleteRoll={setRollToDelete}
                  onAssignRoll={setRollToAssign}
                />
              ))}
              {uncategorizedRolls.length > 0 && (
                <CollapsibleAlbumSection
                  title="Uncategorized"
                  rolls={uncategorizedRolls}
                  initiallyOpen={false}
                  onDeleteRoll={setRollToDelete}
                  onAssignRoll={setRollToAssign}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {showCreateAlbumModal && <CreateAlbumModal onClose={() => setShowCreateAlbumModal(false)} />}
      {rollToDelete && (
        <ConfirmDeleteModal
          isOpen={!!rollToDelete}
          onClose={() => setRollToDelete(null)}
          onConfirm={() => {
            if (rollToDelete) deleteRoll(rollToDelete.id);
            setRollToDelete(null);
          }}
          title="Delete Roll"
          message={`Are you sure you want to permanently delete "${rollToDelete.title || rollToDelete.film_type}"? This cannot be undone.`}
          confirmText="Delete"
        />
      )}
      {rollToAssign && (
        <AssignAlbumModal
          roll={rollToAssign}
          onClose={() => setRollToAssign(null)}
        />
      )}
    </div>
  );
};

export default RollsView;