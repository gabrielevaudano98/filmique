import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Film, Trophy, Users, User } from 'lucide-react';

interface FloatingNavProps {
  onNavigate: (view: string) => void;
}

const submenuVariants = {
  hidden: { width: 0, opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1, when: 'afterChildren' } },
  visible: { width: 'auto', opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1, when: 'beforeChildren' } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1 },
};

const NavButton: React.FC<{
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ icon, onClick }) => (
  <motion.button
    onClick={onClick}
    className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md bg-gray-600 hover:bg-gray-500 transition-colors duration-300"
    variants={itemVariants}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
  >
    {icon}
  </motion.button>
);

const FloatingNav: React.FC<FloatingNavProps> = ({ onNavigate }) => {
  const [openMenu, setOpenMenu] = useState<'camera' | 'social' | null>(null);

  const handleToggle = (menu: 'camera' | 'social') => {
    setOpenMenu(prev => (prev === menu ? null : menu));
  };

  const handleNavigate = (view: string) => {
    onNavigate(view);
    setOpenMenu(null);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-28 flex items-center justify-center" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)', pointerEvents: 'none' }}>
      <div className="flex items-center bg-gray-800/80 backdrop-blur-lg rounded-full shadow-2xl border border-gray-700/50 p-2 gap-2" style={{ pointerEvents: 'auto' }}>
        
        {/* Camera Submenu */}
        <AnimatePresence>
          {openMenu === 'camera' && (
            <motion.div
              className="flex items-center gap-2 overflow-hidden"
              variants={submenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <NavButton icon={<Camera className="w-6 h-6" />} onClick={() => handleNavigate('camera')} />
              <NavButton icon={<Film className="w-6 h-6" />} onClick={() => handleNavigate('rolls')} />
              <NavButton icon={<Trophy className="w-6 h-6" />} onClick={() => handleNavigate('challenges')} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Camera Icon */}
        <button
          onClick={() => handleToggle('camera')}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ${openMenu === 'camera' ? 'bg-amber-500' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          <Camera className="w-8 h-8" />
        </button>

        {/* Main Social Icon */}
        <button
          onClick={() => handleToggle('social')}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ${openMenu === 'social' ? 'bg-amber-500' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          <Users className="w-8 h-8" />
        </button>

        {/* Social Submenu */}
        <AnimatePresence>
          {openMenu === 'social' && (
            <motion.div
              className="flex items-center gap-2 overflow-hidden"
              variants={submenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <NavButton icon={<Users className="w-6 h-6" />} onClick={() => handleNavigate('community')} />
              <NavButton icon={<User className="w-6 h-6" />} onClick={() => handleNavigate('profile')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FloatingNav;