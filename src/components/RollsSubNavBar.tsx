import React from 'react';
import { ArrowLeft, Clock, Film, Printer, Library } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { showInfoToast } from '../utils/toasts';

const SubNavItem: React.FC<{
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  isAccent?: boolean;
  onClick: () => void;
}> = ({ label, icon: Icon, isActive, isAccent, onClick }) => {
  const activeClass = isAccent ? 'text-brand-amber-start' : 'text-white';
  const inactiveClass = 'text-neutral-400 group-hover:text-white';

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="relative flex flex-col items-center justify-center w-16 h-16 transition-colors group"
    >
      <Icon
        className={`w-6 h-6 mb-1 transition-all duration-200 ${isActive ? activeClass : inactiveClass}`}
      />
      <span
        className={`text-[10px] font-bold transition-colors ${isActive ? activeClass : inactiveClass}`}
      >
        {label}
      </span>
    </button>
  );
};

const RollsSubNavBar: React.FC = () => {
  const { currentView, setCurrentView, rollsViewSection, setRollsViewSection } = useAppContext();

  const handlePrintsClick = () => {
    showInfoToast('Prints are coming soon!');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900/80 backdrop-blur-lg border-t border-neutral-700/50 pb-safe">
      <div className="flex items-center justify-around max-w-6xl mx-auto px-2">
        <SubNavItem
          label="Back"
          icon={ArrowLeft}
          isActive={false}
          isAccent
          onClick={() => setCurrentView('community')}
        />
        <SubNavItem
          label="Darkroom"
          icon={Clock}
          isActive={rollsViewSection === 'darkroom'}
          onClick={() => setRollsViewSection('darkroom')}
        />
        <SubNavItem
          label="Shelf"
          icon={Film}
          isActive={rollsViewSection === 'shelf'}
          onClick={() => setRollsViewSection('shelf')}
        />
        <SubNavItem
          label="Prints"
          icon={Printer}
          isActive={false}
          onClick={handlePrintsClick}
        />
        <SubNavItem
          label="Albums"
          icon={Library}
          isActive={currentView === 'library'}
          onClick={() => setCurrentView('library')}
        />
      </div>
    </nav>
  );
};

export default RollsSubNavBar;