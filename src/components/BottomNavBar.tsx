import React from 'react';
import { Camera, Film, Users, Library, ArrowLeft, Clock, Printer } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { showInfoToast } from '../utils/toasts';

interface NavItemProps {
  view: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
  isAccented?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ label, icon: Icon, isActive, onClick, isAccented = false }) => {
  const iconColor = isAccented ? 'text-brand-amber-start' : isActive ? 'text-brand-amber-start' : 'text-neutral-400 group-hover:text-white';
  const labelColor = isAccented ? 'text-brand-amber-start' : isActive ? 'text-brand-amber-start' : 'text-white';
  const labelOpacity = isAccented || isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100';

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="relative flex flex-col items-center justify-center w-16 h-16 transition-colors group"
    >
      <Icon
        className={`w-7 h-7 transition-all duration-300 ease-spring-soft ${iconColor} ${
          isActive || isAccented ? '-translate-y-2' : ''
        }`}
      />
      <span
        className={`absolute bottom-2 text-[10px] font-bold transition-all duration-300 ease-spring-soft ${labelColor} ${labelOpacity}`}
      >
        {label}
      </span>
      {isActive && !isAccented && (
        <div className="absolute bottom-0 w-1.5 h-1.5 bg-brand-amber-start rounded-full transition-all duration-300 ease-spring-soft"></div>
      )}
    </button>
  );
};

const BottomNavBar: React.FC = () => {
  const { currentView, setCurrentView, navMenu, setNavMenu, rollsViewSection, setRollsViewSection } = useAppContext();

  const mainNavItems = [
    { view: 'rolls', label: 'Darkroom', icon: Film, action: () => setNavMenu('darkroom') },
    { view: 'library', label: 'Library', icon: Library, action: () => setCurrentView('library') },
    { view: 'community', label: 'Community', icon: Users, action: () => setCurrentView('community') },
  ];

  const darkroomNavItems = [
    { view: 'back', label: 'Back', icon: ArrowLeft, action: () => setNavMenu('main'), isAccented: true },
    { view: 'darkroom', label: 'Darkroom', icon: Clock, action: () => { setCurrentView('rolls'); setRollsViewSection('darkroom'); } },
    { view: 'shelf', label: 'Shelf', icon: Film, action: () => { setCurrentView('rolls'); setRollsViewSection('shelf'); } },
    { view: 'prints', label: 'Prints', icon: Printer, action: () => showInfoToast('Prints are coming soon!') },
    { view: 'albums', label: 'Albums', icon: Library, action: () => setCurrentView('library') },
  ];

  const isDarkroomActive = (view: string) => {
    if (view === 'darkroom') return currentView === 'rolls' && rollsViewSection === 'darkroom';
    if (view === 'shelf') return currentView === 'rolls' && rollsViewSection === 'shelf';
    if (view === 'albums') return currentView === 'library';
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-28 flex justify-center z-50 pointer-events-none pb-safe">
      <div className="relative flex items-center pointer-events-auto">
        {/* Main Nav Structure */}
        <div className={`transition-all duration-300 ease-in-out ${navMenu === 'main' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <div className="absolute top-1/2 -translate-y-1/2 h-[72px] w-full bg-gradient-to-b from-neutral-800/60 to-neutral-900/70 backdrop-blur-2xl rounded-[36px] border border-white/10 shadow-depth shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)]"></div>
          <div className="relative flex items-center justify-center px-3">
            <NavItem {...mainNavItems[0]} isActive={currentView === 'rolls'} onClick={mainNavItems[0].action} />
            <div className="relative w-24 h-24 flex items-center justify-center mx-1">
              <button onClick={() => setCurrentView('camera')} aria-label="Camera" className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-brand-amber-start to-brand-amber-end camera-button-glow flex items-center justify-center transition-transform active:scale-95">
                <div className="w-[72px] h-[72px] rounded-full bg-warm-800 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <NavItem {...mainNavItems[1]} isActive={currentView === 'library'} onClick={mainNavItems[1].action} />
              <NavItem {...mainNavItems[2]} isActive={currentView === 'community'} onClick={mainNavItems[2].action} />
            </div>
          </div>
        </div>

        {/* Darkroom Nav Structure */}
        <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${navMenu === 'darkroom' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <div className="absolute top-1/2 -translate-y-1/2 h-[72px] w-full bg-gradient-to-b from-neutral-800/60 to-neutral-900/70 backdrop-blur-2xl rounded-[36px] border border-white/10 shadow-depth shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)]"></div>
          <div className="relative flex items-center justify-center px-3 gap-2">
            {darkroomNavItems.map((item) => (
              <NavItem
                key={item.view}
                {...item}
                isActive={isDarkroomActive(item.view)}
                onClick={item.action}
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BottomNavBar;