import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Film, Trophy, X } from 'lucide-react';

interface ActionMenuProps {
  onClose: () => void;
  onNavigate: (view: string) => void;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const menuVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      delay: 0.1,
      type: 'spring',
      stiffness: 260,
      damping: 20,
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const ActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => (
  <motion.button
    variants={itemVariants}
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-3 text-white group"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <div className="w-20 h-20 bg-gray-700/50 group-hover:bg-amber-500/20 border border-gray-600 group-hover:border-amber-500 rounded-2xl flex items-center justify-center transition-colors duration-300">
      {icon}
    </div>
    <span className="font-semibold text-sm">{label}</span>
  </motion.button>
);

const ActionMenu: React.FC<ActionMenuProps> = ({ onClose, onNavigate }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-end z-[100] pb-safe"
      onClick={onClose}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={backdropVariants}
    >
      <motion.div
        className="w-full max-w-md p-8"
        onClick={(e) => e.stopPropagation()}
        variants={menuVariants}
      >
        <div className="flex justify-around items-center">
          <ActionButton
            icon={<Film className="w-10 h-10" />}
            label="Rolls"
            onClick={() => onNavigate('rolls')}
          />
          <ActionButton
            icon={<Camera className="w-10 h-10" />}
            label="Camera"
            onClick={() => onNavigate('camera')}
          />
          <ActionButton
            icon={<Trophy className="w-10 h-10" />}
            label="Challenges"
            onClick={() => onNavigate('challenges')}
          />
        </div>
      </motion.div>
      <motion.button
        onClick={onClose}
        className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-gray-900 mb-8"
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, y: 50 }}
        animate={{ scale: 1, y: 0, transition: { delay: 0.4, type: 'spring' } }}
      >
        <X className="w-8 h-8" />
      </motion.button>
    </motion.div>
  );
};

export default ActionMenu;