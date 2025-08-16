import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const SettingsGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="px-2 pb-3 text-base font-semibold text-gray-400 tracking-wide">{title}</h3>
    <div className="flex flex-wrap gap-3">
      {children}
    </div>
  </div>
);

const SettingsPill: React.FC<{
  label: string;
  isSelected: boolean;
  onClick: () => void;
}> = ({ label, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex-shrink-0 whitespace-nowrap flex items-center gap-2
      ${isSelected
        ? 'bg-white text-black shadow-lg'
        : 'bg-neutral-800/60 text-gray-300 hover:bg-neutral-700/50 border border-neutral-700/50'
      }`}
  >
    {label}
    {isSelected && <Check className="w-4 h-4" />}
  </button>
);

const RollsSettingsView: React.FC = () => {
  const {
    setCurrentView,
    completedRolls,
    rollsSortOrder, setRollsSortOrder,
    rollsGroupBy, setRollsGroupBy,
    rollsSelectedFilm, setRollsSelectedFilm,
  } = useAppContext();

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
    { key: 'month', label: 'Month' },
    { key: 'film_type', label: 'Film Type' },
    { key: 'tag', label: 'Tag' },
    { key: 'none', label: 'None' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-transparent text-white">
      <div className="flex items-center p-4 border-b border-neutral-800">
        <button onClick={() => setCurrentView('rolls')} className="p-2 text-gray-400 hover:text-white rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white mx-auto">Display Options</h1>
        <div className="w-6 h-6"></div>
      </div>
      <div className="p-4 sm:p-6 overflow-y-auto no-scrollbar">
        <SettingsGroup title="Sort by">
          {sortOptions.map(opt => (
            <SettingsPill
              key={opt.key}
              label={opt.label}
              isSelected={rollsSortOrder === opt.key}
              onClick={() => setRollsSortOrder(opt.key)}
            />
          ))}
        </SettingsGroup>

        <SettingsGroup title="Group by">
          {groupOptions.map(opt => (
            <SettingsPill
              key={opt.key}
              label={opt.label}
              isSelected={rollsGroupBy === opt.key}
              onClick={() => setRollsGroupBy(opt.key)}
            />
          ))}
        </SettingsGroup>

        <SettingsGroup title="Filter by Film">
          <SettingsPill
            label="All Film Types"
            isSelected={rollsSelectedFilm === 'all'}
            onClick={() => setRollsSelectedFilm('all')}
          />
          {filmTypes.map(film => (
            <SettingsPill
              key={film}
              label={film}
              isSelected={rollsSelectedFilm === film}
              onClick={() => setRollsSelectedFilm(film)}
            />
          ))}
        </SettingsGroup>
      </div>
    </div>
  );
};

export default RollsSettingsView;