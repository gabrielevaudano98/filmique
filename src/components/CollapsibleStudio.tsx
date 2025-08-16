import React, { useState } from 'react';
import { ChevronDown, Clock } from 'lucide-react';
import { Roll } from '../types';
import DevelopingRollCard from './DevelopingRollCard';

interface CollapsibleStudioProps {
  developingRolls: Roll[];
}

const CollapsibleStudio: React.FC<CollapsibleStudioProps> = ({ developingRolls }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (developingRolls.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 bg-neutral-800/60 rounded-xl border border-neutral-700/50"
      >
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-brand-amber-start" />
          <div>
            <h2 className="text-xl font-bold text-white">Studio</h2>
            <p className="text-sm text-gray-400">{developingRolls.length} rolls developing</p>
          </div>
        </div>
        <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform ${!isCollapsed ? 'rotate-180' : ''}`} />
      </button>
      {!isCollapsed && (
        <div className="mt-3 space-y-3 animate-fade-in">
          {developingRolls.map(roll => (
            <DevelopingRollCard key={roll.id} roll={roll} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CollapsibleStudio;