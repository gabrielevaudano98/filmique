import React from 'react';
import { Trophy, Film, Users, User, Camera } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const BottomNav: React.FC = () => {
  const { currentView, setCurrentView } = useAppContext();

  const navButton = (key: string, icon: React.ReactNode, label?: string) => {
    const active = currentView === key;
    return (
      <button
        onClick={() => setCurrentView(key)}
        aria-label={label || key}
        className={`flex flex-col items-center justify-center gap-0.5 text-sm transition-colors ${active ? 'text-amber-300' : 'text-gray-400 hover:text-white'}`}
      >
        {icon}
      </button>
    );
  };

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-lg rounded-2xl px-4 py-3 z-50" style={{ background: 'var(--bottom-pill-bg)', boxShadow: 'var(--elev-1)' }}>
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center justify-start">
          {navButton('challenges', <Trophy className="w-5 h-5" />, 'Challenges')}
        </div>

        <div className="flex-1 flex items-center justify-center">
          <button
            onClick={() => setCurrentView('camera')}
            aria-label="Camera"
            className="relative -top-3 w-16 h-16 rounded-full bg-gradient-to-br from-[var(--brand-brown-1)] to-[var(--brand-brown-2)] shadow-brand-elev-2 flex items-center justify-center text-white transform active:scale-95"
          >
            <Camera className="w-7 h-7" />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-end space-x-4">
          {navButton('community', <Users className="w-5 h-5" />, 'Community')}
          {navButton('profile', <User className="w-5 h-5" />, 'Profile')}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;