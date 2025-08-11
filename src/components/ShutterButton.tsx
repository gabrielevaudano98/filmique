import React from 'react';
import { Lock } from 'lucide-react';
import { Roll } from '../context/AppContext';

interface ShutterButtonProps {
  activeRoll: Roll | null;
  onTakePhoto: () => void;
}

const ShutterButton: React.FC<ShutterButtonProps> = ({ activeRoll, onTakePhoto }) => {
  const shotsLeft = activeRoll ? activeRoll.capacity - activeRoll.shots_used : 0;
  const capacity = activeRoll ? activeRoll.capacity : 0;
  const isCompleted = activeRoll?.is_completed || false;

  const radius = 42;
  const dotRadius = 2;
  const size = (radius + dotRadius) * 2; // 88
  const center = size / 2; // 44

  const dots = [];
  if (capacity > 0) {
    for (let i = 0; i < capacity; i++) {
      // angle in radians, starting from the top
      const angle = (i / capacity) * 2 * Math.PI - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      const isUsed = i >= shotsLeft;
      dots.push({ x, y, isUsed });
    }
  }

  return (
    <div className="relative w-[92px] h-[92px] flex items-center justify-center">
      <div className="absolute inset-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {dots.map((dot, i) => (
            <circle
              key={i}
              cx={dot.x}
              cy={dot.y}
              r={dotRadius}
              fill={dot.isUsed ? '#4b5563' : '#f59e0b'} // gray-600 and amber-500
              className="transition-colors duration-300"
            />
          ))}
        </svg>
      </div>
      <button
        onClick={onTakePhoto}
        disabled={isCompleted}
        aria-label="Take Photo"
        className="w-20 h-20 rounded-full bg-white flex items-center justify-center transition-transform active:scale-95 disabled:bg-gray-200 text-gray-900"
      >
        {isCompleted ? (
          <Lock className="w-8 h-8 text-gray-500" />
        ) : activeRoll ? (
          <span className="text-4xl font-bold">
            {shotsLeft}
          </span>
        ) : (
          <span className="text-4xl font-bold">
            -
          </span>
        )}
      </button>
    </div>
  );
};

export default ShutterButton;