import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Film, Trophy, Users, User, X } from 'lucide-react';

interface FloatingNavProps {
  onNavigate: (view: string) => void;
}

const containerVariants = {
  hidden: { width: 0, opacity: 0, padding: 0 },
  visible: {
    width: 'auto',
    opacity: 1,
    padding: '0.5rem',
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.05
    }
  },
  exit: {
    width: 0,
    opacity: 0,
    padding: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

const itemVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 }
};

const FloatingNav: React.FC<FloatingNavProps> = ({ onNavigate }) => {
  const [openMenu, setOpenMenu] = useState<'camera' | 'community' | null>(null);

  const handleToggle = (menu: 'camera' | 'community') => {
    if (openMenu === menu) {
      setOpenMenu(null);
    } else {
      setOpenMenu(menu);
    }
  };

  const handleNavigate = (view: string) => {
    onNavigate(view);
    setOpenMenu(null);
  };

  const mainIconClass = "w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-colors duration-300";
  const subIconClass = "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md transition-colors duration-300";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-28 flex items-center justify-center" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)', pointerEvents: 'none' }}>
      <div className="relative w-full max-w-xs sm:max-w-sm flex justify-between items-center" style={{ pointerEvents: 'auto' }}>
        
        {/* Left Menu (Camera) */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => handleToggle('camera')}
            className={`${mainIconClass} ${openMenu === 'camera' ? 'bg-amber-500' : 'bg-gray-700 hover:bg-gray-600'}`}
            whileTap={{ scale: 0.9 }}
            animate={{ rotate: openMenu === 'camera' ? 45 : 0 }}
          >
            <Camera className="w-8 h-8" />
          </motion.button>
          
          <AnimatePresence>
            {openMenu === 'camera' && (
              <motion.div
                className="flex items-center gap-3 bg-gray-800/80 backdrop-blur-lg rounded-full overflow-hidden"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.button onClick={() => handleNavigate('rolls')} className={`${subIconClass} bg-gray-600 hover:bg-amber-500`} variants={itemVariants}><Film className="w-6 h-6" /></motion.button>
                <motion.button onClick={() => handleNavigate('challenges')} className={`${subIconClass} bg-gray-600 hover:bg-amber-500`} variants={itemVariants}><Trophy className="w-6 h-6" /></motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Menu (Community) */}
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {openMenu === 'community' && (
              <motion.div
                className="flex items-center gap-3 bg-gray-800/80 backdrop-blur-lg rounded-full overflow-hidden"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.button onClick={() => handleNavigate('profile')} className={`${subIconClass} bg-gray-600 hover:bg-amber-500`} variants={itemVariants}><User className="w-6 h-6" /></motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => handleToggle('community')}
            className={`${mainIconClass} ${openMenu === 'community' ? 'bg-amber-500' : 'bg-gray-700 hover:bg-gray-600'}`}
            whileTap={{ scale: 0.9 }}
            animate={{ rotate: openMenu === 'community' ? 45 : 0 }}
          >
            <Users className="w-8 h-8" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default FloatingNav;