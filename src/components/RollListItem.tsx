import React, { useState, useRef, useMemo } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Roll } from '../types';
import { Trash2, FolderPlus, Clock, FolderMinus } from 'lucide-react';

interface RollListItemProps {
  roll: Roll;
  onDelete: (roll: Roll) => void;
  onAssignAlbum: (roll: Roll) => void;
  isDeveloping?: boolean;
  assignActionIcon?: 'add' | 'remove';
}

const generateSprocketDataUrl = (fillColor: string, holeW = 12, holeH = 8, spacing = 18, rx = 2) => {
  const patternW = holeW + spacing;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${patternW}' height='${holeH}' viewBox='0 0 ${patternW} ${holeH}'>
    <rect width='${patternW}' height='${holeH}' fill='black'/>
    <rect x='${Math.round(spacing/2)}' y='1' rx='${rx}' ry='${rx}' width='${holeW}' height='${holeH-2}' fill='${fillColor}'/>
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
        backgroundSize: '30px 100%',
        height: 16,
      }}
    />
  );
};

const RollListItem: React.FC<RollListItemProps> = ({ roll, onDelete, onAssignAlbum, isDeveloping = false, assignActionIcon = 'add' }) => {
  const [offsetX, setOffsetX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const framesScrollRef = useRef<HTMLDivElement>(null);
  const ACTION_WIDTH = 84;

  const handlers = useSwipeable({
    onSwiping: (event) => {
      const sc = framesScrollRef.current;
      if (sc && (Math.abs(event.deltaX) < Math.abs(event.deltaY))) return;
      setOffsetX(Math.max(-ACTION_WIDTH, Math.min(ACTION_WIDTH, event.deltaX)));
    },
    onSwiped: (event) => {
      if (Math.abs(event.deltaX) < Math.abs(event.deltaY)) {
        setOffsetX(0);
        return;
      }
      if (event.deltaX < -ACTION_WIDTH / 2) {
        setOffsetX(-ACTION_WIDTH);
      } else if (event.deltaX > ACTION_WIDTH / 2) {
        setOffsetX(ACTION_WIDTH);
      } else {
        setOffsetX(0);
      }
    },
    trackMouse: true,
    preventDefaultTouchmoveEvent: false,
    delta: 10,
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
  const frames = roll.photos || [];

  const stopPropagation = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="relative w-full overflow-visible rounded-xl">
      <div className="absolute inset-0 flex items-center justify-between z-0 pointer-events-none">
        <div className="h-full w-20 flex items-center justify-center pointer-events-auto">
          <button
            onClick={handleAssignAlbum}
            className="h-12 w-12 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
            aria-label={assignActionIcon === 'add' ? "Assign to Album" : "Remove from Album"}
          >
            <AssignIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="h-full w-20 flex items-center justify-center pointer-events-auto">
          <button
            onClick={handleDelete}
            className="h-12 w-12 rounded-lg bg-red-600 text-white flex items-center justify-center hover:bg-red-700"
            aria-label="Delete Roll"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        {...handlers}
        ref={containerRef}
        className="relative z-10 transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${offsetX}px)` }}
      >
        <div className="film-strip rounded-xl overflow-visible border border-neutral-800 shadow-sm relative bg-neutral-900">
          <div className="film-top-notch" />
          <SprocketRow isDeveloping={isDeveloping} />
          <div
            ref={framesScrollRef}
            onTouchStart={stopPropagation as any}
            onPointerDown={stopPropagation as any}
            onWheel={stopPropagation as any}
            className={`film-frames-scroll no-scrollbar ${isDeveloping ? 'developing' : ''}`}
            role="region"
            aria-label="Film strip frames"
          >
            <div className="film-frames inline-flex items-center gap-3 px-3 py-3">
              <div className="film-edge left" />
              {frames.length > 0 ? (
                frames.map((photo) => (
                  <div key={photo.id} className="film-frame snap-center flex-shrink-0">
                    {isDeveloping ? (
                      <img
                        src={`${photo.thumbnail_url}${cacheBuster}`}
                        alt="roll photo"
                        className="film-frame-img"
                        style={{
                          filter: 'invert(1) sepia(0.9) saturate(3) hue-rotate(-20deg) brightness(1.05) contrast(0.95)',
                        }}
                        draggable={false}
                      />
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
              <div className="film-edge right" />
            </div>
          </div>
          <SprocketRow isDeveloping={isDeveloping} />
        </div>
        <div className="p-4 border-b border-black/20 bg-gradient-to-r from-brand-amber-start to-brand-amber-end">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white truncate">{roll.title || roll.film_type || 'Untitled Roll'}</h4>
              <p className="text-sm text-white/80">{roll.shots_used} photos • {roll.film_type}</p>
            </div>
            {isDeveloping && (
              <div className="flex items-center gap-2 text-sm text-amber-100">
                <Clock className="w-4 h-4" />
                <span>Developing...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RollListItem;