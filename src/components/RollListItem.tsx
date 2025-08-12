import React, { useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Roll } from '../types';
import { Trash2, FolderPlus } from 'lucide-react';

interface RollListItemProps {
  roll: Roll;
  onDelete: (roll: Roll) => void;
  onAssignAlbum: (roll: Roll) => void;
}

const RollListItem: React.FC<RollListItemProps> = ({ roll, onDelete, onAssignAlbum }) => {
  const [offsetX, setOffsetX] = useState(0);
  const itemRef = useRef<HTMLDivElement>(null);
  const ACTION_WIDTH = 80;

  const handlers = useSwipeable({
    onSwiping: (event) => {
      if (event.deltaX < -ACTION_WIDTH * 1.5 || event.deltaX > ACTION_WIDTH * 1.5) return;
      setOffsetX(event.deltaX);
    },
    onSwiped: (event) => {
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

  // A static component to render a long strip of holes to fill any screen width.
  const SprocketHoles = () => (
    <div className="flex space-x-3 h-4 px-2 shrink-0">
      {Array.from({ length: 100 }).map((_, i) => (
        <div key={i} className="w-4 h-full bg-black/60" />
      ))}
    </div>
  );

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <div className="absolute inset-0 flex items-center justify-between bg-neutral-900">
        <button
          onClick={handleAssignAlbum}
          className="h-full w-20 flex items-center justify-center bg-blue-600 text-white transition-colors hover:bg-blue-700"
          aria-label="Assign to Album"
        >
          <FolderPlus className="w-6 h-6" />
        </button>
        <button
          onClick={handleDelete}
          className="h-full w-20 flex items-center justify-center bg-red-600 text-white transition-colors hover:bg-red-700"
          aria-label="Delete Roll"
        >
          <Trash2 className="w-6 h-6" />
        </button>
      </div>

      <div
        {...handlers}
        ref={itemRef}
        className="relative bg-neutral-800 transition-transform duration-200 ease-out cursor-grab active:cursor-grabbing"
        style={{ transform: `translateX(${offsetX}px)` }}
      >
        <div className="p-4 border-b border-neutral-700/50">
          <h4 className="font-bold text-white truncate">{roll.title || 'Untitled Roll'}</h4>
          <p className="text-sm text-gray-400">{roll.film_type}</p>
        </div>
        
        {/* Film Strip */}
        <div className="relative bg-gradient-to-b from-warm-300/20 to-warm-400/10 overflow-hidden">
          {/* Top holes overlay */}
          <div className="absolute top-2 left-0 w-full pointer-events-none z-10">
            <SprocketHoles />
          </div>

          {/* Photo scroll area */}
          <div className="overflow-x-auto no-scrollbar py-8">
            <div className="inline-flex px-2 space-x-2">
              {roll.photos && roll.photos.length > 0 ? (
                roll.photos.map(photo => (
                  <img
                    key={photo.id}
                    src={`${photo.thumbnail_url}${cacheBuster}`}
                    alt="roll photo"
                    className="h-24 w-auto rounded-sm object-cover bg-neutral-700 shrink-0"
                    draggable="false"
                  />
                ))
              ) : (
                <div className="h-24 flex items-center justify-center text-gray-400 text-sm px-4 shrink-0">No photos in this roll.</div>
              )}
            </div>
          </div>

          {/* Bottom holes overlay */}
          <div className="absolute bottom-2 left-0 w-full pointer-events-none z-10">
            <SprocketHoles />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RollListItem;