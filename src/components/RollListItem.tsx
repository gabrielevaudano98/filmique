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

  // Calculate number of sprocket holes based on photo count.
  // Assuming each photo is roughly 96px wide (h-24) and we want a hole every 24px.
  // So 4 holes per photo. Add a few extra for padding.
  const numHoles = (roll.photos?.length || 5) * 4;

  const SprocketHoles = () => (
    <div className="flex space-x-2 h-2 px-2 shrink-0">
      {Array.from({ length: numHoles }).map((_, i) => (
        <div key={i} className="w-4 h-full bg-black/50 rounded-sm" />
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
        <div className="bg-warm-700/40 overflow-x-auto no-scrollbar">
          <div className="inline-flex flex-col space-y-1 py-2">
            <SprocketHoles />
            <div className="flex space-x-2 px-2">
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
            <SprocketHoles />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RollListItem;