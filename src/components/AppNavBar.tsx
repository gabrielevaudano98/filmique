import React from 'react';
import { Camera, Film, Users, Library, ArrowLeft, Clock, Printer } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { showInfoToast } from '../utils/toasts';

const NavItem: React.FC<{
  label: string;
  icon: React.ElementType;
  isActive?: boolean;
  isAccent?: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
}> = ({ label, icon: Icon, isActive, isAccent, onClick, style }) => {
  const activeClass = isAccent ? 'text-brand-amber-start' : 'text-white';
  const inactiveClass = 'text-neutral-400 group-hover:text-white';

  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={style}
      className="relative flex flex-col items-center justify-center w-16 h-16 transition-colors group animate-nav-item-in"
    >
      <Icon
        className={`w-7 h-7 transition-all duration-300 ease-spring-soft ${
          isActive ? `${activeClass} -translate-y-1` : inactiveClass
        }`}
      />
      <span
        className={`absolute bottom-3 text-[10px] font-bold transition-all duration-300 ease-spring-soft ${
          isActive ? `opacity-100 ${activeClass}` : 'opacity-0 group-hover:opacity-100 text-white'
        }`}
      >
        {label}
      </span>
    </button>
  );
};

const AppNavBar: React.FC = () => {
  const { currentView, setCurrentView, rollsViewSection, setRollsViewSection } = useAppContext();

  const isRollsFamilyView = ['rolls', 'library', 'rollDetail', 'rollsSettings', 'albumDetail', 'uncategorizedRolls'].includes(currentView);

  const handleNavItemClick = (view: string) => {
    if (view === 'rolls') {
      setRollsViewSection('darkroom');
    }
    setCurrentView(view);
  };

  const handlePrintsClick = () => showInfoToast('Prints are coming soon!');

  const mainNavItems = [
    { view: 'rolls', label: 'Rolls', icon: Film },
    { view: 'library', label: 'Library', icon: Library },
    { view: 'community', label: 'Community', icon: Users },
  ];

  const rollsSubNavItems = [
    { view: 'community', label: 'Back', icon: ArrowLeft, isAccent: true },
    { view: 'rolls', section: 'darkroom', label: 'Darkroom', icon: Clock },
    { view: 'rolls', section: 'shelf', label: 'Shelf', icon: Film },
    { view: 'prints', label: 'Prints', icon: Printer, action: handlePrintsClick },
    { view: 'library', label: 'Albums', icon: Library },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-28 flex justify-center z-50 pointer-events-none pb-safe">
      <div className="relative flex items-center pointer-events-auto">
        {/* Background Pill */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 h-[72px] bg-gradient-to-b from-neutral-800/60 to-neutral-900/70 backdrop-blur-2xl rounded-[36px] border border-white/10 shadow-depth shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)] transition-all duration-500 ease-spring-soft ${
            isRollsFamilyView ? 'w-[360px]' : 'w-[288px]'
          }`}
        />

        <div className="relative flex items-center justify-center px-3 h-full overflow-hidden">
          {/* Main Nav Group */}
          <div
            className={`absolute flex items-center justify-center transition-all duration-300 ease-spring-soft ${
              isRollsFamilyView ? 'opacity-0 -translate-x-8 pointer-events-none' : 'opacity-100 translate-x-0'
            }`}
          >
            <NavItem {...mainNavItems[0]} isActive={currentView === 'rolls'} onClick={() => handleNavItemClick('rolls')} />
            <div className="w-24 h-24" />
            <NavItem {...mainNavItems[1]} isActive={currentView === 'library'} onClick={() => handleNavItemClick('library')} />
            <NavItem {...mainNavItems[2]} isActive={currentView === 'community'} onClick={() => handleNavItemClick('community')} />
          </div>

          {/* Rolls Sub-Nav Group */}
          <div
            className={`absolute flex items-center justify-around transition-all duration-300 ease-spring-soft ${
              isRollsFamilyView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
            }`}
          >
            {rollsSubNavItems.map((item, index) => (
              <NavItem
                key={item.label}
                label={item.label}
                icon={item.icon}
                isAccent={item.isAccent}
                isActive={item.section ? rollsViewSection === item.section : currentView === item.view}
                onClick={() => {
                  if (item.action) item.action();
                  else if (item.section) {
                    setCurrentView('rolls');
                    setRollsViewSection(item.section as 'darkroom' | 'shelf');
                  } else {
                    setCurrentView(item.view);
                  }
                }}
                style={{ animationDelay: `${index * 30}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Camera Button (always visible) */}
        <div className="absolute left-1/2 -translate-x-1/2 w-24 h-24 flex items-center justify-center">
          <button
            onClick={() => setCurrentView('camera')}
            aria-label="Camera"
            className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-brand-amber-start to-brand-amber-end camera-button-glow flex items-center justify-center transition-transform active:scale-95"
          >
            <div className="w-[72px] h-[72px] rounded-full bg-warm-800 flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AppNavBar;