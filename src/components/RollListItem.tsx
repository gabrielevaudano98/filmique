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
 * Encoded as a data URL used as background (rectangular holes with slight rounding).
 */
const generateSprocketDataUrl = (fillColor: string, holeW = 12, holeH = 8, spacing = 18, rx = 2) => {
  const patternW = holeW + spacing;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${patternW}' height='${holeH}' viewBox='0 0 ${patternW} ${holeH}'>
    <rect width='${patternW}' height='${holeH}' fill='black'/>
    <rect x='${Math.round(spacing/2)}' y='1' rx='${rx}' ry='${rx}' width='${holeW}' height='${holeH-2}' fill='${fillColor}'/>
  </svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

/**
 * Generate a small ruler SVG background with repeating frame numbers.
 * We use a compact pattern that repeats horizontally.
 */
const generateRulerDataUrl = (text = '34', width = 56, height = 16, color = '#d78657') => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>
    <rect width='100%' height='100%' fill='black' />
    <text x='50%' y='12' font-family='Inter, Arial, sans-serif' font-size='10' fill='${color}' text-anchor='middle'>${text}</text>
    <rect x='2' y='2' width='4' height='6' fill='${color}' rx='1' />
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

  // Swipeable handles reveal actions when user swipes the entire card horizontally.
  const handlers = useSwipeable({
    onSwiping: (event) => {
      // don't intercept when the user is interacting with the inner scroll container
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

  // film frames list (first frame shows negative for developed rolls if desired)
  const frames = roll.photos || [];

  // careful: allow native horizontal scrolling — stop propagation on pointer events inside the scroll element
  const stopPropagation = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  const rulerBg = useMemo(() => generateRulerDataUrl('34'), []);

  return (
    <div className="relative w-full overflow-visible rounded-xl">
      {/* Action panels */}
      <div className="absolute inset-0 flex items-center justify-between z-0 pointer-events-none">
        {/* left action */}
        <div className="h-full w-20 flex items-center justify-center pointer-events-auto">
          <button
            onClick={handleAssignAlbum}
            className="h-12 w-12 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
            aria-label={assignActionIcon === 'add' ? "Assign to Album" : "Remove from Album"}
          >
            <AssignIcon className="w-5 h-5" />
          </button>
        </div>

        {/* right action */}
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
          {/* top perforation / notch */}
          <div className="film-top-notch" />

          {/* top sprocket row */}
          <SprocketRow isDeveloping={isDeveloping} />

          {/* frames scroll area: this is the native-scroll container, allow touch/scroll events here */}
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
              {/* left film border */}
              <div className="film-edge left" />

              {frames.length > 0 ? (
                frames.map((photo, idx) => (
                  <div
                    key={photo.id}
                    className="film-frame snap-center flex-shrink-0"
                    style={{ scrollSnapAlign: 'center' }}
                  >
                    {isDeveloping ? (
                      <NegativePhoto src={photo.thumbnail_url} className="film-frame-img" />
                    ) : (
                      // emulate the scanned strip look by showing first frame as darker/negative when the roll is developed
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

              {/* right film border */}
              <div className="film-edge right" />
            </div>
          </div>

          {/* bottom sprocket & ruler */}
          <div className="relative">
            <SprocketRow isDeveloping={isDeveloping} />
            <div
              className="film-ruler"
              style={{
                backgroundImage: rulerBg,
                backgroundRepeat: 'repeat-x',
                backgroundPosition: 'left center',
                backgroundSize: '56px 100%',
              }}
            />
          </div>
        </div>

        {/* header below the strip */}
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