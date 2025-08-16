import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../types';
import { isRollDeveloped } from '../utils/rollUtils';
import SegmentedControl from './SegmentedControl';
import RollListItem from './RollListItem';
import { Clock } from 'lucide-react';
import RollsTimelineView from './RollsTimelineView';
import RollsOrganizerView from './RollsOrganizerView';

const DarkroomEmptyState = () => (
  <div className="text-center py-24 text-neutral-500">
    <Clock className="w-16 h-16 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-white">Darkroom is Empty</h3>
    <p className="mt-2">When you finish a roll, it will appear here to be developed.</p>
  </div>
);

const RollsView: React.FC = () => {
  const { developingRolls } = useAppContext();
  const [activeSection, setActiveSection] = useState<'shelf' | 'darkroom'>('shelf');
  const [shelfView, setShelfView] = useState<'timeline' | 'organizer'>('timeline');

  return (
    <div className="flex flex-col w-full space-y-6">
      <h1 className="text-3xl font-bold text-white">My Rolls</h1>
      <SegmentedControl
        options={[
          { label: 'Shelf', value: 'shelf' },
          { label: `Darkroom (${developingRolls.length})`, value: 'darkroom' },
        ]}
        value={activeSection}
        onChange={(value) => setActiveSection(value as 'shelf' | 'darkroom')}
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

        {activeSection === 'shelf' && (
          <div className="space-y-6">
            <SegmentedControl
              options={[
                { label: 'Timeline', value: 'timeline' },
                { label: 'Organizer', value: 'organizer' },
              ]}
              value={shelfView}
              onChange={(value) => setShelfView(value as 'timeline' | 'organizer')}
            />
            {shelfView === 'timeline' ? <RollsTimelineView /> : <RollsOrganizerView />}
          </div>
        )}
      </div>
    </div>
  );
};

export default RollsView;