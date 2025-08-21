import React from 'react';
import { Camera, Film, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useHaptics } from '../hooks/useHaptics';
import { ImpactStyle } from '@capacitor/haptics';

const NavItem: React.FC<{
  view: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon: Icon, isActive, onClick }) => {
  const { impact } = useHaptics();

  const handleClick = () => {
    impact(ImpactStyle.Light);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      aria-label={label}
      className="relative flex flex-col items-center justify-center w-16 h-16 transition-colors group"
    >
      <Icon
        className={`w-7 h-7 transition-all duration-300 ease-spring-soft ${
          isActive
            ? 'text-brand-amber-start -translate-y-2'
            : 'text-white dark:text-white text-black group-hover:text-brand-amber-start'
        }`}
      />
      <span
        className={`absolute bottom-2 text-[10px] font-bold transition-all duration-300 ease-spring-soft ${
          isActive ? 'opacity-100 text-brand-amber-start' : 'opacity-0 group-hover:opacity-100 text-black dark:text-white'
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
  const { impact } = useHaptics();

  const navItems = [
    { view: 'studio', label: 'Studio', icon: Film }, // Changed label from 'Rolls' to 'Studio'
    { view: 'social', label: 'Social', icon: Users }, // Changed label from 'Feed' to 'Social'
  ];

  const leftItems = navItems.slice(0, 1);
  const rightItems = navItems.slice(1, 2);

  const handleCameraClick = () => {
    impact(ImpactStyle.Light);
    setCurrentView('camera');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-28 flex justify-center z-50 pointer-events-none pb-safe-b">
      <div className="relative flex items-center pointer-events-auto pl-safe-l pr-safe-r w-full">
        {/* Enhanced glass nav pill */}
        <div
          className="
            floating-nav absolute top-1/2 -translate-y-1/2 h-[72px] w-full
            bg-white/80 dark:bg-neutral-900/80
            border border-white/30 dark:border-neutral-700/60
            shadow-lg shadow-black/10 dark:shadow-black/40
            backdrop-blur-xl
            transition-all
          "
          style={{
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            backdropFilter: 'blur(24px) saturate(160%)',
          }}
        ></div>

        <div className="relative flex items-center justify-center px-3 w-full">
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
              onClick={handleCameraClick}
              aria-label="Camera"
              className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-brand-amber-start to-brand-amber-end camera-button-glow flex items-center justify-center transition-transform active:scale-95"
            >
              <div className="w-[72px] h-[72px] rounded-full bg-warm-800 dark:bg-warm-800 bg-white flex items-center justify-center">
                <Camera className="w-8 h-8 text-black dark:text-white" />
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