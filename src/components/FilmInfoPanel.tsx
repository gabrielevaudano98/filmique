import React from 'react';
import { X } from 'lucide-react';
import { FilmStock } from '../types';
import Histogram from './Histogram';

const SAMPLE_IMAGE_URL = 'https://images.pexels.com/photos/1619651/pexels-photo-1619651.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

interface FilmInfoPanelProps {
  film: FilmStock;
  onClose: () => void;
}

const FilmInfoPanel: React.FC<FilmInfoPanelProps> = ({ film, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-[80]" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-neutral-800 h-full shadow-2xl border-l border-neutral-700/50 flex flex-col animate-slide-in-right"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b border-neutral-700/50 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-white">{film.name}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="overflow-y-auto p-6 space-y-8 no-scrollbar">
          <div>
            <h3 className="text-lg font-semibold text-brand-amber-start mb-2">Color Profile</h3>
            <p className="text-sm text-gray-400 mb-4">This histogram shows how the film preset affects a neutral sample image.</p>
            <Histogram imageUrl={SAMPLE_IMAGE_URL} preset={film.preset} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-brand-amber-start mb-2">Description</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{film.description || 'No description available.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilmInfoPanel;