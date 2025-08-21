import React from 'react';
import { useSwipeable } from 'react-swipeable';
import { X, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import TextSegmentedControl from './TextSegmentedControl';

const SettingsGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="px-2 pb-2 text-sm font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider">{title}</h3>
    <div className="bg-white/70 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl border border-white/30 dark:border-neutral-700/50 shadow-lg shadow-black/20">
      {React.Children.map(children, (child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < React.Children.count(children) - 1 && <div className="h-px bg-white/10 dark:bg-neutral-700/50 mx-4"></div>}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const SettingsRow: React.FC<{ label: string; isSelected: boolean; onClick: () => void; }> = ({ label, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 text-left transition-colors rounded-lg ${isSelected ? 'bg-brand-amber-start/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
  >
    <span className={`font-medium ${isSelected ? 'text-brand-amber-start' : 'text-black dark:text-white'}`}>{label}</span>
    {isSelected && <Check className="w-5 h-5 text-brand-amber-start" />}
  </button>
);

const RollsSettingsView: React.FC = () => {
  const {
    setIsRollsSettingsOpen,
    completedRolls,
    rollsSortOrder, setRollsSortOrder,
    rollsGroupBy, setRollsGroupBy,
    rollsSelectedFilm, setRollsSelectedFilm,
    rollsViewMode, setRollsViewMode,
  } = useAppContext();

  const handleClose = () => setIsRollsSettingsOpen(false);

  const handlers = useSwipeable({
    onSwipedDown: handleClose,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const filmTypes = React.useMemo(() =>
    [...new Set(completedRolls.filter(r => r.is_completed && r.developed_at).map(r => r.film_type))],
  [completedRolls]);

  const sortOptions = [
    { key: 'newest', label: 'Newest First' },
    { key: 'oldest', label: 'Oldest First' },
    { key: 'title_asc', label: 'Title (A-Z)' },
    { key: 'title_desc', label: 'Title (Z-A)' },
  ];

  const groupOptions = [
    { value: 'date', label: 'Date' },
    { value: 'film_type', label: 'Film Type' },
    { value: 'tag', label: 'Tag' },
    { value: 'none', label: 'None' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/60 backdrop-blur-sm flex items-end z-[60]" onClick={handleClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-white/70 dark:bg-gradient-to-b dark:from-neutral-800/80 dark:to-neutral-900/90 backdrop-blur-2xl border-t border-white/30 dark:border-white/10 rounded-t-2xl shadow-2xl flex flex-col max-h-[80vh] animate-slide-up text-black dark:text-white"
      >
        <div {...handlers} className="flex-shrink-0 p-4 text-center relative cursor-grab border-b border-white/30 dark:border-neutral-700/50">
          <div className="w-10 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto mb-2"></div>
          <h2 className="text-lg font-bold">Display Options</h2>
          <button onClick={handleClose} className="absolute top-1/2 -translate-y-1/2 right-4 p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar p-4 sm:p-6">
          <SettingsGroup title="Status">
            <SettingsRow label="Active" isSelected={rollsViewMode === 'active'} onClick={() => setRollsViewMode('active')} />
            <SettingsRow label="Archived" isSelected={rollsViewMode === 'archived'} onClick={() => setRollsViewMode('archived')} />
          </SettingsGroup>

          <SettingsGroup title="Group by">
            <div className="p-2">
              <TextSegmentedControl options={groupOptions} value={rollsGroupBy} onChange={setRollsGroupBy} />
            </div>
          </SettingsGroup>

          <SettingsGroup title="Sort by">
            {sortOptions.map(opt => (
              <SettingsRow key={opt.key} label={opt.label} isSelected={rollsSortOrder === opt.key} onClick={() => setRollsSortOrder(opt.key)} />
            ))}
          </SettingsGroup>

          <SettingsGroup title="Filter by Film">
            <SettingsRow label="All Film Types" isSelected={rollsSelectedFilm === 'all'} onClick={() => setRollsSelectedFilm('all')} />
            {filmTypes.map(film => (
              <SettingsRow key={film} label={film} isSelected={rollsSelectedFilm === film} onClick={() => setRollsSelectedFilm(film)} />
            ))}
          </SettingsGroup>
        </div>
      </div>
    </div>
  );
};

export default RollsSettingsView;