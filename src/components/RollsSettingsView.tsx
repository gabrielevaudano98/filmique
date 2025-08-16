import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const SettingsGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="px-4 pb-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>
    <div className="bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700/50">
      {React.Children.map(children, (child, index) => (
        <React.Fragment>
          {child}
          {index < React.Children.count(children) - 1 && <div className="pl-4"><div className="h-px bg-neutral-700/50"></div></div>}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const SettingsRow: React.FC<{
  label: string;
  isSelected: boolean;
  onClick: () => void;
}> = ({ label, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 text-left transition-colors min-h-[56px] ${
      isSelected ? 'bg-neutral-700/50' : 'hover:bg-neutral-700/30'
    }`}
  >
    <span className={`font-medium ${isSelected ? 'text-brand-amber-start' : 'text-white'}`}>{label}</span>
    {isSelected && <Check className="w-5 h-5 text-brand-amber-start" />}
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
            <SettingsRow
              key={opt.key}
              label={opt.label}
              isSelected={rollsSortOrder === opt.key}
              onClick={() => setRollsSortOrder(opt.key)}
            />
          ))}
        </SettingsGroup>

        <SettingsGroup title="Group by">
          {groupOptions.map(opt => (
            <SettingsRow
              key={opt.key}
              label={opt.label}
              isSelected={rollsGroupBy === opt.key}
              onClick={() => setRollsGroupBy(opt.key)}
            />
          ))}
        </SettingsGroup>

        <SettingsGroup title="Filter by Film">
          <SettingsRow
            label="All Film Types"
            isSelected={rollsSelectedFilm === 'all'}
            onClick={() => setRollsSelectedFilm('all')}
          />
          {filmTypes.map(film => (
            <SettingsRow
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