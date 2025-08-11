import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Trophy, Users, User, Grid, LayoutList } from 'lucide-react';

interface FloatingNavProps {
  onNavigate: (view: string) => void;
  currentView: string;
}

const NavItem: React.FC<{
  view: string;
  label: string;
  icon: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}> = ({ view, label, icon, currentView, onNavigate }) => {
  const isActive = currentView === view;
  return (
    <button
      onClick={() => onNavigate(view)}
      className={`flex flex-col items-center justify-center p-2 transition-colors min-h-[44px] min-w-[60px] ${isActive ? 'text-red-600' : 'text-gray-500 hover:text-gray-900'}`}
      aria-label={label}
    >
      {icon}
      <span className={`text-xs font-semibold mt-0.5 ${isActive ? 'text-red-600' : 'text-gray-500'}`}>{label}</span>
    </button>
  );
};

const FloatingNav: React.FC<FloatingNavProps> = ({ onNavigate, currentView }) => {
  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="fixed bottom-0 left-0 right-0 w-full bg-white/70 backdrop-blur-xl border-t border-gray-200/80 z-50"
    >
      <div className="flex items-center justify-around max-w-md mx-auto py-1 safe-area-bottom">
        <NavItem view="rolls" label="Rolls" icon={<Grid className="w-6 h-6" />} currentView={currentView} onNavigate={onNavigate} />
        <NavItem view="albums" label="Albums" icon={<LayoutList className="w-6 h-6" />} currentView={currentView} onNavigate={onNavigate} />
        <button onClick={() => onNavigate('camera')} className="flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ease-in-out transform -translate-y-4 ring-4 ring-white bg-red-600 text-white hover:bg-red-500" aria-label="Camera">
          <Camera className="w-8 h-8" />
        </button>
        <NavItem view="community" label="Community" icon={<Users className="w-6 h-6" />} currentView={currentView} onNavigate={onNavigate} />
        <NavItem view="profile" label="Profile" icon={<User className="w-6 h-6" />} currentView={currentView} onNavigate={onNavigate} />
      </div>
    </motion.div>
  );
};

export default FloatingNav;