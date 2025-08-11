import React from 'react';
import { motion } from 'framer-motion';
import { Users, User, X } from 'lucide-react';

interface SocialNavBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onClose: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 w-24 transition-colors duration-200 ${
      isActive ? 'text-amber-400' : 'text-gray-400 hover:text-white'
    }`}
  >
    {icon}
    <span className="text-xs font-bold">{label}</span>
  </button>
);

const SocialNavBar: React.FC<SocialNavBarProps> = ({ currentView, onNavigate, onClose }) => {
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
      initial={{ y: '100%' }}
      animate={{ y: '0%' }}
      exit={{ y: '100%' }}
      transition={{ type: 'tween', ease: 'circOut', duration: 0.4 }}
    >
      <div className="w-full bg-gray-800/80 backdrop-blur-lg border-t border-gray-700/50 flex justify-around items-center h-20">
        <NavItem
          icon={<Users className="w-6 h-6" />}
          label="Community"
          isActive={currentView === 'community'}
          onClick={() => onNavigate('community')}
        />
        <button
          onClick={onClose}
          className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 -mt-12 border-4 border-gray-900"
        >
          <X className="w-7 h-7" />
        </button>
        <NavItem
          icon={<User className="w-6 h-6" />}
          label="Profile"
          isActive={currentView === 'profile'}
          onClick={() => onNavigate('profile')}
        />
      </div>
    </motion.div>
  );
};

export default SocialNavBar;