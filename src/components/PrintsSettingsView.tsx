import React from 'react';
import { useSwipeable } from 'react-swipeable';
import { X, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import TextSegmentedControl from './TextSegmentedControl';

const SettingsGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="px-2 pb-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
    <div className="bg-white/60 dark:bg-neutral-900/50 backdrop-blur-lg rounded-xl border border-white/40 dark:border-neutral-700/50 shadow-none">
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
    className={`w-full flex items-center justify-between p-4 text-left transition-colors rounded-lg ${
      isSelected
        ? 'bg-brand-amber-start/15 text-black dark:text-white font-bold'
        : 'hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white'
    }`}
    style={{ WebkitBackdropFilter: 'blur(8px)' }}
  >
    <span className={`font-medium ${isSelected ? 'text-brand-amber-start' : ''}`}>{label}</span>
    {isSelected && <Check className="w-5 h-5 text-brand-amber-start" />}
  </button>
);

const PrintsSettingsView: React.FC = () => {
  const {
    isPrintsSettingsOpen,
    setIsPrintsSettingsOpen,
    printStatusFilter,
    setPrintStatusFilter,
    printSortOrder,
    setPrintSortOrder,
  } = useAppContext();

  const handleClose = () => setIsPrintsSettingsOpen(false);

  const handlers = useSwipeable({
    onSwipedDown: handleClose,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'queued', label: 'Queued' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'canceled', label: 'Canceled' },
  ];

  const sortOptions = [
    { key: 'newest', label: 'Newest First' },
    { key: 'oldest', label: 'Oldest First' },
  ];

  if (!isPrintsSettingsOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 dark:bg-black/80 backdrop-blur-lg flex items-end z-[60]" onClick={handleClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-white/80 dark:bg-neutral-800/60 backdrop-blur-lg border-t border-white/40 dark:border-neutral-700/50 rounded-t-2xl shadow-none flex flex-col max-h-[80vh] animate-slide-up text-black dark:text-white"
        style={{ WebkitBackdropFilter: 'blur(24px) saturate(160%)' }}
      >
        <div {...handlers} className="flex-shrink-0 p-4 text-center relative cursor-grab border-b border-white/30 dark:border-neutral-700/50">
          <div className="w-10 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto mb-2"></div>
          <h2 className="text-lg font-bold">Print Options</h2>
          <button onClick={handleClose} className="absolute top-1/2 -translate-y-1/2 right-4 p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar p-4 sm:p-6">
          <SettingsGroup title="Filter by Status">
            <div className="p-2">
              <TextSegmentedControl options={statusOptions} value={printStatusFilter} onChange={setPrintStatusFilter} />
            </div>
          </SettingsGroup>

          <SettingsGroup title="Sort by">
            {sortOptions.map(opt => (
              <SettingsRow key={opt.key} label={opt.label} isSelected={printSortOrder === opt.key} onClick={() => setPrintSortOrder(opt.key)} />
            ))}
          </SettingsGroup>
        </div>
      </div>
    </div>
  );
};

export default PrintsSettingsView;