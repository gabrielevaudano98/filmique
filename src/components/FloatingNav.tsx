import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Trophy, Users, User, Grid } from 'lucide-react';

interface FloatingNavProps {
  onNavigate: (view: string) => void;
}

const submenuVariants = {
  hidden: { width: 0, opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1, when: 'afterChildren' } },
  visible: { width: 'auto', opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1, when: 'beforeChildren' } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const NavButton: React.FC<{
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ icon, onClick }) => (
  <motion.button
    onClick={onClick}
    className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md bg-white/10 hover:bg-white/20 transition-colors duration-300"
    variants={itemVariants}
    whileHover={{ scale: 1.1, y: -2 }}
    whileTap={{ scale: 0.95, y: 0 }}
  >
    {icon}
  </motion.button>
);

const FloatingNav: React.FC<FloatingNavProps> = ({ onNavigate }) => {
  const [openMenu, setOpenMenu] = useState<'social' | null>(null);

  const handleToggle = (menu: 'social') => {
    setOpenMenu(prev => (prev === menu ? null : menu));
  };

  const handleNavigate = (view: string) => {
    onNavigate(view);
    setOpenMenu(null);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-28 flex items-center justify-center" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)', pointerEvents: 'none' }}>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.5 }}
        className="flex items-center bg-gray-900/50 backdrop-blur-xl rounded-full shadow-2xl border border-white/10 p-2 gap-2" 
        style={{ pointerEvents: 'auto' }}
      >
        
        {/* Main Gallery Icon (Direct link to rolls) */}
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          onClick={() => handleNavigate('rolls')}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg bg-white/10 hover:bg-white/20 transition-all duration-300"
        >
          <Grid className="w-8 h-8" />
        </motion.button>

        {/* Main Camera Icon (Standalone) */}
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          onClick={() => handleNavigate('camera')}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg bg-white/10 hover:bg-white/20 transition-all duration-300"
        >
          <Camera className="w-8 h-8" />
        </motion.button>

        {/* Main Social Icon */}
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          onClick={() => handleToggle('social')}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ${openMenu === 'social' ? 'bg-red-600' : 'bg-white/10 hover:bg-white/20'}`}
        >
          <Users className="w-8 h-8" />
        </motion.button>

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
              <NavButton icon={<Trophy className="w-6 h-6" />} onClick={() => handleNavigate('challenges')} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default FloatingNav;