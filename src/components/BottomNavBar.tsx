import React from 'react';
import { Camera, Users, Library } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const NavItem: React.FC<{
  view: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon: Icon, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="relative flex flex-col items-center justify-center w-16 h-16 transition-colors group"
    >
      <Icon
        className={`w-7 h-7 transition-all duration-300 ease-spring-soft ${
          isActive ? 'text-brand-amber-start -translate-y-2' : 'text-neutral-400 group-hover:text-white'
        }`}
      />
      <span
        className={`absolute bottom-2 text-[10px] font-bold transition-all duration-300 ease-spring-soft ${
          isActive ? 'opacity-100 text-brand-amber-start' : 'opacity-0 group-hover:opacity-100 text-white'
        }`}
      >
        {label}
      </span>
      {isActive && (
        <div className="absolute bottom-0 w-1.5 h-1.5 bg-brand-amber-start rounded-full transition-all duration-300 ease-spring-soft"></div>
      )}
    </button>
  );
};

const BottomNavBar: React.FC = () => {
  const { currentView, setCurrentView } = useAppContext();

  const navItems = [
    { view: 'community', label: 'Community', icon: Users },
    { view: 'library', label: 'Library', icon: Library },
  ];

  const leftItems = navItems.slice(0, 1);
  const rightItems = navItems.slice(1, 2);

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-28 flex justify-center z-50 pointer-events-none pb-safe">
      <div className="relative flex items-center pointer-events-auto">
        {/* Main glass pill background */}
        <div className="absolute top-1/2 -translate-y-1/2 h-[72px] w-full bg-gradient-to-b from-neutral-800/60 to-neutral-900/70 backdrop-blur-2xl rounded-[36px] border border-white/10 shadow-depth shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)]"></div>

        <div className="relative flex items-center justify-center px-3">
          {/* Left Items */}
          <div className="flex items-center gap-2">
            {leftItems.map((item) => (
              <NavItem
                key={item.view}
                {...item}
                isActive={currentView === item.view}
                onClick={() => setCurrentView(item.view)}
              />
            ))}
          </div>

          {/* Camera Button */}
          <div className="relative w-24 h-24 flex items-center justify-center mx-1">
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

          {/* Right Items */}
          <div className="flex items-center gap-2">
            {rightItems.map((item) => (
              <NavItem
                key={item.view}
                {...item}
                isActive={currentView === item.view}
                onClick={() => setCurrentView(item.view)}
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BottomNavBar;