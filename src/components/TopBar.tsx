import React from 'react';
import { Film, ImageIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const TopBar: React.FC = () => {
  const { setCurrentView } = useAppContext();

  return (
    <div className="w-full flex items-center justify-between px-4 py-4 pt-4 bg-black text-white"> {/* Added pt-4 here */}
      <button onClick={() => setCurrentView('film-rolls')} className="p-2">
        <Film className="w-6 h-6" />
      </button>
      <h1 className="text-xl font-bold">FILMIQUE</h1>
      <button onClick={() => setCurrentView('gallery')} className="p-2">
        <ImageIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default TopBar;
