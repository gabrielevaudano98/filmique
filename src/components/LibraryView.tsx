import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Clock, Film, Printer, Library as LibraryIcon } from 'lucide-react';
import { showInfoToast } from '../utils/toasts';

const LibraryView: React.FC = () => {
  const { setCurrentView, setRollsViewSection } = useAppContext();

  const handleGoToDarkroom = () => {
    setCurrentView('rolls');
    setRollsViewSection('darkroom');
  };

  const handleGoToShelf = () => {
    setCurrentView('rolls');
    setRollsViewSection('shelf');
  };

  const handleGoToAlbums = () => {
    setCurrentView('albums');
  };

  const handlePrintsClick = () => {
    showInfoToast('Prints are coming soon!');
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Library</h1>
      </div>

      {/* Main Navigation Group */}
      <div className="mb-10">
        <div className="bg-neutral-800/60 backdrop-blur-lg border border-neutral-700/50 rounded-2xl overflow-hidden shadow-soft">
          <button onClick={handleGoToDarkroom} className="w-full flex items-center p-4 text-left hover:bg-neutral-700/50 transition-colors">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cyan-500/20 mr-4">
              <Clock className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">Darkroom</p>
              <p className="text-sm text-neutral-400">Develop your completed rolls</p>
            </div>
          </button>
          
          <div className="h-px bg-neutral-700/50 ml-18"></div>

          <button onClick={handleGoToShelf} className="w-full flex items-center p-4 text-left hover:bg-neutral-700/50 transition-colors">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-500/20 mr-4">
              <Film className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">Shelf</p>
              <p className="text-sm text-neutral-400">View all your developed rolls</p>
            </div>
          </button>

          <div className="h-px bg-neutral-700/50 ml-18"></div>

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