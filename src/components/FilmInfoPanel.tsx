import React from 'react';
import { X, Building, Aperture, Film as FilmIcon, Type, ThumbsUp, ThumbsDown, Sun } from 'lucide-react';
import { FilmStock } from '../types';
import Histogram from './Histogram';

const SAMPLE_IMAGE_URL = 'https://images.pexels.com/photos/1619651/pexels-photo-1619651.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

interface FilmInfoPanelProps {
  film: FilmStock;
  onClose: () => void;
}

// Internal component for consistent section styling
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3 className="text-lg font-semibold text-brand-amber-start mb-4">{title}</h3>
    {children}
  </div>
);

// Internal component for individual spec items
const SpecRow: React.FC<{ label: string; value: string | number | undefined; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-center justify-between text-sm py-3 border-b border-neutral-700/50 last:border-b-0">
    <div className="flex items-center text-gray-400">
      {icon}
      <span className="ml-3">{label}</span>
    </div>
    <p className="font-semibold text-white truncate" title={String(value || '')}>{value || 'N/A'}</p>
  </div>
);

// Internal component for usage characteristics
const CharacteristicCard: React.FC<{ title: string; content: string; icon: React.ReactNode; }> = ({ title, content, icon }) => (
    <div className="flex items-start">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-neutral-700">
            {icon}
        </div>
        <div className="ml-4">
            <p className="font-bold text-white">{title}</p>
            <p className="text-gray-300 text-sm leading-relaxed">{content}</p>
        </div>
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
          <Section title="Specifications">
            <div className="bg-neutral-900/50 rounded-xl border border-neutral-700/50 px-4">
              <SpecRow label="Manufacturer" value={film.brand} icon={<Building className="w-5 h-5" />} />
              <SpecRow label="Native ISO" value={nativeIso} icon={<Aperture className="w-5 h-5" />} />
              <SpecRow label="Exposures" value={film.capacity} icon={<FilmIcon className="w-5 h-5" />} />
              <SpecRow label="Film Type" value={film.type} icon={<Type className="w-5 h-5" />} />
            </div>
          </Section>

          <Section title="Description">
            <p className="text-gray-300 text-sm leading-relaxed">{film.description || 'No description available.'}</p>
          </Section>

          <Section title="Usage & Characteristics">
            <div className="space-y-5">
              {film.good_for && (
                <CharacteristicCard 
                  title="Strengths"
                  content={film.good_for}
                  icon={<ThumbsUp className="w-5 h-5 text-brand-amber-start" />}
                />
              )}
              {film.bad_for && (
                <CharacteristicCard 
                  title="Weaknesses"
                  content={film.bad_for}
                  icon={<ThumbsDown className="w-5 h-5 text-brand-amber-start" />}
                />
              )}
              {film.usage_notes && (
                <CharacteristicCard 
                  title="Best For"
                  content={film.usage_notes}
                  icon={<Sun className="w-5 h-5 text-brand-amber-start" />}
                />
              )}
            </div>
          </Section>

          <Section title="Color Profile">
            <p className="text-sm text-gray-400 mb-4">This histogram shows how the film preset affects a neutral sample image.</p>
            <Histogram 
              imageUrl={SAMPLE_IMAGE_URL} 
              preset={film.preset} 
              precomputedData={film.histogram_data}
            />
          </Section>
        </div>
      </div>
    </div>
  );
};

export default FilmInfoPanel;