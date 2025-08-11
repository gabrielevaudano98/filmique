import React from 'react';
import { Roll } from '../context/AppContext';

interface FilmStripProps {
  roll: Roll | null;
}

const FilmStrip: React.FC<FilmStripProps> = ({ roll }) => {
  if (!roll) {
    return (
      <div className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-4 w-16 h-2/3 max-h-[400px] bg-black/30 backdrop-blur-sm rounded-2xl p-2 z-20 flex items-center justify-center text-center text-xs text-gray-400">
        No active roll
      </div>
    );
  }

  const { photos, capacity, shots_used } = roll;
  const photoThumbnails = photos?.map(p => p.thumbnail_url) || [];

  const slots = Array.from({ length: capacity }, (_, i) => {
    if (i < shots_used) {
      const cacheBuster = `?t=${new Date().getTime()}`;
      return { type: 'filled', url: `${photoThumbnails[i]}${cacheBuster}` };
    }
    return { type: 'empty' };
  });

  return (
    <div className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-4 w-16 h-2/3 max-h-[400px] bg-black/30 backdrop-blur-sm rounded-2xl p-2 z-20">
      <div className="w-full h-full overflow-y-auto no-scrollbar flex flex-col items-center space-y-2">
        {slots.map((slot, index) => (
          <div
            key={index}
            className="w-12 h-12 rounded-lg flex-shrink-0 bg-gray-800/50 flex items-center justify-center overflow-hidden"
          >
            {slot.type === 'filled' ? (
              <img src={slot.url} alt={`Shot ${index + 1}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full border-2 border-dashed border-gray-600/70 rounded-lg"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilmStrip;