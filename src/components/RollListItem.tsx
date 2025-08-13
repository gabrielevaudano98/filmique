import React, { useState, useRef, useMemo } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Roll } from '../types';
import { Trash2, FolderPlus, Clock, FolderMinus } from 'lucide-react';
import NegativePhoto from './NegativePhoto';

interface RollListItemProps {
  roll: Roll;
  onDelete: (roll: Roll) => void;
  onAssignAlbum: (roll: Roll) => void;
  isDeveloping?: boolean;
  assignActionIcon?: 'add' | 'remove';
}

/**
 * Generate a small SVG pattern for sprocket holes.
 * We encode the SVG as a data URI and use it as a background image so the holes look rectangular
 * with slightly rounded corners and use the palette color passed in.
 */
const generateSprocketDataUrl = (fillColor: string, holeW = 12, holeH = 8, spacing = 16, rx = 2) => {
  const patternW = holeW + spacing;
  // simple pattern that repeats horizontally
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='${holeH}' viewBox='0 0 ${patternW} ${holeH}' preserveAspectRatio='none'>
    <rect width='${patternW}' height='${holeH}' fill='black' />
    <rect x='${Math.round(spacing/2)}' y='1' rx='${rx}' ry='${rx}' width='${holeW}' height='${holeH - 2}' fill='${fillColor}'/>
  </svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

const SprocketRow: React.FC<{ isDeveloping?: boolean }> = ({ isDeveloping }) => {
  const holeColor = isDeveloping ? 'rgba(214,106,46,0.38)' : 'rgba(255,255,255,0.08)';
  const bg = useMemo(() => generateSprocketDataUrl(holeColor), [holeColor]);
  return (
    <div
      className="sprocket-row"
      style={{
        backgroundImage: bg,
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'left center',
        backgroundSize: '28px 100%',
        height: 14,
      }}
    />
  );
};

const RollListItem: React.FC<RollListItemProps> = ({ roll, onDelete, onAssignAlbum, isDeveloping = false, assignActionIcon = 'add' }) => {
  const [offsetX, setOffsetX] = useState(0);
  const itemRef = useRef<HTMLDivElement>(null);
  const ACTION_WIDTH = 80;

  const handlers = useSwipeable({
    onSwiping: (event) => {
      if (isDeveloping) return;
      if (event.deltaX < -ACTION_WIDTH * 1.5 || event.deltaX > ACTION_WIDTH * 1.5) return;
      setOffsetX(event.deltaX);
    },
    onSwiped: (event) => {
      if (isDeveloping) return;
      if (event.deltaX < -ACTION_WIDTH / 2) {
        setOffsetX(-ACTION_WIDTH);
      } else if (event.deltaX > ACTION_WIDTH / 2) {
        setOffsetX(ACTION_WIDTH);
      } else {
        setOffsetX(0);
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const resetPosition = () => setOffsetX(0);

  const handleDelete = () => {
    onDelete(roll);
    resetPosition();
  };

  const handleAssignAlbum = () => {
    onAssignAlbum(roll);
    resetPosition();
  };

  const cacheBuster = roll.developed_at ? `?t=${new Date(roll.developed_at).getTime()}` : '';
  const AssignIcon = assignActionIcon === 'add' ? FolderPlus : FolderMinus;

  // Film frame nodes
  const frames = roll.photos && roll.photos.length > 0 ? roll.photos : [];

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      {/* Action panels (swipe-to-reveal) */}
      {!isDeveloping && (
        <div className="absolute inset-0 flex items-center justify-between z-0">
          <button
            onClick={handleAssignAlbum}
            className="h-full w-20 flex items-center justify-center bg-blue-600 text-white transition-colors hover:bg-blue-700"
            aria-label={assignActionIcon === 'add' ? "Assign to Album" : "Remove from Album"}
          >
            <AssignIcon className="w-6 h-6" />
          </button>
          <button
            onClick={handleDelete}
            className="h-full w-20 flex items-center justify-center bg-red-600 text-white transition-colors hover:bg-red-700"
            aria-label="Delete Roll"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        </div>
      )}

      <div
        {...handlers}
        ref={itemRef}
        className={`relative transition-transform duration-200 ease-out cursor-grab active:cursor-grabbing z-10`}
        style={{ transform: `translateX(${offsetX}px)` }}
      >
        <div className="film-strip rounded-xl overflow-hidden border border-neutral-800 shadow-sm">
          {/* top sprocket row */}
          <SprocketRow isDeveloping={isDeveloping} />

          {/* film frames area */}
          <div className={`film-frames flex items-stretch ${isDeveloping ? 'developing' : ''}`}>

            {/* left edge: film border */}
            <div className="film-edge left" />

            {/* frames */}
            <div className="flex gap-2 px-2 py-3 overflow-x-auto no-scrollbar">
              {frames.length > 0 ? (
                frames.map((photo) => (
                  <div key={photo.id} className="film-frame flex-shrink-0">
                    {isDeveloping ? (
                      <NegativePhoto src={photo.thumbnail_url} className="film-frame-img" />
                    ) : (
                      <img
                        src={`${photo.thumbnail_url}${cacheBuster}`}
                        alt="roll photo"
                        className="film-frame-img"
                        draggable={false}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="film-frame flex items-center justify-center text-gray-400 px-6">
                  No photos
                </div>
              )}
            </div>

            {/* right edge: film border */}
            <div className="film-edge right" />
          </div>

          {/* bottom sprocket row */}
          <SprocketRow isDeveloping={isDeveloping} />
        </div>

        {/* Header band */}
        <div className="p-4 border-b border-black/20 bg-gradient-to-r from-brand-amber-start to-brand-amber-end">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white truncate">{roll.title || roll.film_type || 'Untitled Roll'}</h4>
              <p className="text-sm text-white/80">{roll.shots_used} photos • {roll.film_type}</p>
            </div>
            {isDeveloping ? (
              <div className="flex items-center gap-2 text-sm text-amber-100">
                <Clock className="w-4 h-4" />
                <span>Developing...</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RollListItem;