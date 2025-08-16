import React, { useMemo, useEffect, useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../types';
import { isRollDeveloped } from '../utils/rollUtils';
import RollCard from './RollCard';
import { Clock, Film, Archive, Printer } from 'lucide-react';
import RollsControls from './RollsControls';
import ExpandableSearch from './ExpandableSearch';
import DevelopingRollCard from './DevelopingRollCard';
import StickyGroupHeader from './StickyGroupHeader';

const DarkroomEmptyState = () => (
  <div className="text-center py-24 text-neutral-500">
    <Clock className="w-16 h-16 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-white">Darkroom is Empty</h3>
    <p className="mt-2">Finish a roll in the camera to start developing.</p>
  </div>
);

const ShelfEmptyState = () => (
    <div className="text-center py-24 text-neutral-500">
      <Film className="w-16 h-16 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white">Your Shelf is Empty</h3>
      <p className="mt-2">Developed rolls will appear here.</p>
    </div>
);

const ArchivedEmptyState = () => (
  <div className="text-center py-24 text-neutral-500">
    <Archive className="w-16 h-16 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-white">No Archived Rolls</h3>
    <p className="mt-2">You can archive rolls from their detail page.</p>
  </div>
);

const PrintsEmptyState = () => (
  <div className="text-center py-24 text-neutral-500">
    <Printer className="w-16 h-16 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-white">Prints Coming Soon</h3>
    <p className="mt-2">A place to order and manage physical prints of your photos.</p>
  </div>
);

const SectionButton: React.FC<{
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon: Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`p-3 rounded-lg transition-colors ${
      isActive ? 'bg-neutral-700 text-white' : 'text-gray-400 hover:bg-neutral-700/50'
    }`}
  >
    <Icon className="w-5 h-5" />
  </button>
);

const StudioView: React.FC = () => {
  const { 
    developingRolls, completedRolls,
    rollsSortOrder, rollsGroupBy, rollsSelectedFilm, rollsViewMode,
    studioSection, setStudioSection,
    searchTerm, setSearchTerm
  } = useAppContext();

  const { shelfRolls, archivedRolls } = useMemo(() => {
    const developed = completedRolls.filter(r => isRollDeveloped(r));
    return {
      shelfRolls: developed.filter(r => !r.is_archived),
      archivedRolls: developed.filter(r => r.is_archived),
    };
  }, [completedRolls]);

  const processedRolls = useMemo(() => {
    let rolls = rollsViewMode === 'active' ? [...shelfRolls] : [...archivedRolls];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      rolls = rolls.filter(r => 
        r.title?.toLowerCase().includes(lowerSearch) || 
        r.tags?.some(tag => tag.toLowerCase().includes(lowerSearch))
      );
    }
    if (rollsSelectedFilm !== 'all') rolls = rolls.filter(r => r.film_type === rollsSelectedFilm);
    
    rolls.sort((a, b) => {
      const dateA = a.developed_at || a.completed_at || a.created_at;
      const dateB = b.developed_at || b.completed_at || b.created_at;
      switch (rollsSortOrder) {
        case 'oldest': return new Date(dateA).getTime() - new Date(dateB).getTime();
        case 'title_asc': return (a.title || '').localeCompare(b.title || '');
        case 'title_desc': return (b.title || '').localeCompare(a.title || '');
        case 'newest': default: return new Date(dateB).getTime() - new Date(dateA).getTime();
      }
    });
    return rolls;
  }, [shelfRolls, archivedRolls, searchTerm, rollsSelectedFilm, rollsSortOrder, rollsViewMode]);

  const groupedRolls = useMemo(() => {
    if (rollsGroupBy === 'date') {
      const byDay = processedRolls.reduce((acc, roll) => {
        const dateKey = roll.developed_at || roll.completed_at;
        if (!dateKey) return acc;
        const key = new Date(dateKey).toISOString().split('T')[0];
        if (!acc[key]) acc[key] = [];
        acc[key].push(roll);
        return acc;
      }, {} as Record<string, Roll[]>);
      
      const sortedKeys = Object.keys(byDay).sort((a, b) => b.localeCompare(a));
      
      const sortedGroups: Record<string, Roll[]> = {};
      for (const key of sortedKeys) {
        const date = new Date(key + 'T00:00:00');
        const displayKey = date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
        sortedGroups[displayKey] = byDay[key];
      }
      return sortedGroups;
    }

    if (rollsGroupBy === 'none') return { 'All Rolls': processedRolls };

    return processedRolls.reduce((acc, roll) => {
      let keys: string[] = [];
      if (rollsGroupBy === 'film_type') keys = [roll.film_type];
      else if (rollsGroupBy === 'tag') keys = roll.tags?.length ? roll.tags : ['Untagged'];
      keys.forEach(key => {
        if (!acc[key]) acc[key] = [];
        acc[key].push(roll);
      });
      return acc;
    }, {} as Record<string, Roll[]>);
  }, [processedRolls, rollsGroupBy]);

  const groupEntries = Object.entries(groupedRolls);

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Studio</h1>
        <div className="flex items-center p-1 bg-neutral-800 rounded-xl space-x-1">
          <SectionButton icon={Clock} isActive={studioSection === 'darkroom'} onClick={() => setStudioSection('darkroom')} />
          <SectionButton icon={Film} isActive={studioSection === 'rolls'} onClick={() => setStudioSection('rolls')} />
          <SectionButton icon={Printer} isActive={studioSection === 'prints'} onClick={() => setStudioSection('prints')} />
        </div>
      </div>

      {studioSection === 'darkroom' && (
        <div key="darkroom" className="animate-fade-in">
          {developingRolls.length > 0 ? (
            <div className="space-y-3">
              {developingRolls.map(roll => <DevelopingRollCard key={roll.id} roll={roll} />)}
            </div>
          ) : <DarkroomEmptyState />}
        </div>
      )}

      {studioSection === 'rolls' && (
        <div key="rolls" className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Shelf</h2>
            <div className="flex items-center gap-2">
              <ExpandableSearch searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
              <RollsControls />
            </div>
          </div>
          {processedRolls.length > 0 ? (
            groupEntries.map(([groupName, rolls]) => (
              <div key={groupName}>
                {rollsGroupBy !== 'none' && (
                  <StickyGroupHeader>
                    {groupName}
                  </StickyGroupHeader>
                )}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {rolls.map(roll => <RollCard key={roll.id} roll={roll} />)}
                </div>
              </div>
            ))
          ) : (
            rollsViewMode === 'archived' ? <ArchivedEmptyState /> : <ShelfEmptyState />
          )}
        </div>
      )}

      {studioSection === 'prints' && (
        <div key="prints" className="animate-fade-in">
          <PrintsEmptyState />
        </div>
      )}
    </div>
  );
};

export default StudioView;