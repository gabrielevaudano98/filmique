import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../types';
import { isRollDeveloped } from '../utils/rollUtils';
import TimelineRollCard from './TimelineRollCard';
import { Film } from 'lucide-react';

const groupRollsByDate = (rolls: Roll[]) => {
  return rolls.reduce((acc, roll) => {
    const date = new Date(roll.developed_at!);
    const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(roll);
    return acc;
  }, {} as Record<string, Roll[]>);
};

const RollsTimelineView: React.FC = () => {
  const { completedRolls } = useAppContext();

  const developedRolls = useMemo(() => {
    return completedRolls
      .filter(r => isRollDeveloped(r) && !r.is_archived)
      .sort((a, b) => new Date(b.developed_at!).getTime() - new Date(a.developed_at!).getTime());
  }, [completedRolls]);

  const groupedRolls = useMemo(() => groupRollsByDate(developedRolls), [developedRolls]);
  const sortedGroupKeys = useMemo(() => {
    return Object.keys(groupedRolls).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [groupedRolls]);

  if (developedRolls.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Film className="w-12 h-12 mx-auto mb-4" />
        <p>No developed rolls on your shelf yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedGroupKeys.map(date => (
        <div key={date}>
          <h3 className="text-lg font-bold text-white mb-3">{date}</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {groupedRolls[date].map(roll => (
              <TimelineRollCard key={roll.id} roll={roll} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RollsTimelineView;