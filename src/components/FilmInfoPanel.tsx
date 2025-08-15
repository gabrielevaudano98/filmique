import React from 'react';
import { X, Building, Aperture, Film as FilmIcon, Type } from 'lucide-react';
import { FilmStock } from '../types';
import Histogram from './Histogram';

const SAMPLE_IMAGE_URL = 'https://images.pexels.com/photos/1619651/pexels-photo-1619651.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

interface FilmInfoPanelProps {
  film: FilmStock;
  onClose: () => void;
}

const SpecRow: React.FC<{ label: string; value: string | number | undefined; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-center justify-between text-sm py-3 border-b border-neutral-700/50">
    <div className="flex items-center text-gray-400">
      {icon}
      <span className="ml-3">{label}</span>
    </div>
    <p className="font-semibold text-white">{value || 'N/A'}</p>
  </div>
);

const FilmInfoPanel: React.FC<FilmInfoPanelProps> = ({ film, onClose }) => {
  const nativeIso = film.name.match(/\d+/)?.[0] || 'N/A';

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
            <h3 className="text-lg font-semibold text-brand-amber-start mb-2">Specifications</h3>
            <div className="bg-neutral-900/50 rounded-lg border border-neutral-700/50 px-4">
              <SpecRow label="Manufacturer" value={film.brand} icon={<Building className="w-5 h-5" />} />
              <SpecRow label="Native ISO" value={nativeIso} icon={<Aperture className="w-5 h-5" />} />
              <SpecRow label="Exposures" value={film.capacity} icon={<FilmIcon className="w-5 h-5" />} />
              <SpecRow label="Film Type" value={film.type} icon={<Type className="w-5 h-5" />} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-brand-amber-start mb-2">Description</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{film.description || 'No description available.'}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-brand-amber-start mb-2">Color Profile</h3>
            <p className="text-sm text-gray-400 mb-4">This histogram shows how the film preset affects a neutral sample image.</p>
            <Histogram 
              imageUrl={SAMPLE_IMAGE_URL} 
              preset={film.preset} 
              precomputedData={film.histogram_data}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilmInfoPanel;