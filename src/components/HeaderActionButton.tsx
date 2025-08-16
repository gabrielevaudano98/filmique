import React from 'react';

interface HeaderActionButtonProps {
  icon: React.ElementType;
  onClick: () => void;
  isActive?: boolean;
  'aria-label': string;
}

const HeaderActionButton: React.FC<HeaderActionButtonProps> = ({ icon: Icon, onClick, isActive = false, ...props }) => {
  return (
    <button
      {...props}
      onClick={onClick}
      className={`
        flex items-center justify-center w-11 h-11 
        backdrop-blur-lg border rounded-xl 
        transition-all duration-200 ease-in-out
        ${isActive 
          ? 'bg-white/20 border-white/30 text-white shadow-lg' 
          : 'bg-neutral-800/60 border-white/10 text-gray-300 hover:bg-neutral-700/80 hover:text-white'
        }
      `}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
};

export default HeaderActionButton;