import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Library as LibraryIcon, Film, Printer } from 'lucide-react';
import { showInfoToast } from '../utils/toasts';

const LibraryView: React.FC = () => {
  const { setCurrentView, setRollsViewSection } = useAppContext();

  const handleGoToRolls = () => {
    setCurrentView('rolls');
    setRollsViewSection('shelf'); // Default to the shelf view as requested
  };

  const handleGoToAlbums = () => {
    setCurrentView('albums');
  };

  const handlePrintsClick = () => {
    showInfoToast('Prints are coming soon!');
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Library</h1>
      </div>

      {/* Rolls Section */}
      <div className="mb-10">
        <button 
          onClick={handleGoToRolls} 
          className="w-full flex items-center p-5 text-left bg-neutral-800/60 backdrop-blur-lg border border-white/10 rounded-2xl hover:bg-neutral-700/80 transition-colors shadow-soft"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-500/20 mr-4">
            <Film className="w-7 h-7 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-white">Rolls</p>
            <p className="text-sm text-neutral-400">View your developed film rolls and darkroom</p>
          </div>
        </button>
      </div>

      {/* Studio Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Studio</h2>
        <div className="bg-neutral-800/60 backdrop-blur-lg border border-neutral-700/50 rounded-2xl overflow-hidden shadow-soft">
          <button onClick={handleGoToAlbums} className="w-full flex items-center p-4 text-left hover:bg-neutral-700/50 transition-colors">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500/20 mr-4">
              <LibraryIcon className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">Albums</p>
              <p className="text-sm text-neutral-400">Organize your rolls into collections</p>
            </div>
          </button>

          <div className="h-px bg-neutral-700/50 ml-18"></div>

          <button onClick={handlePrintsClick} className="w-full flex items-center p-4 text-left hover:bg-neutral-700/50 transition-colors">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-500/20 mr-4">
              <Printer className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">Prints</p>
              <p className="text-sm text-neutral-400">Order prints of your photos</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LibraryView;