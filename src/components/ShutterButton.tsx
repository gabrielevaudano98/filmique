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
  const shotsUsed = capacity - shotsLeft;
  const isCompleted = activeRoll?.is_completed || false;

  // Adjusted dimensions for better spacing to match the reference image
  const radius = 40;
  const dotRadius = 1.5;
  const size = 92;
  const center = size / 2;

  const dots = [];
  if (capacity > 0) {
    for (let i = 0; i < capacity; i++) {
      // angle in radians, starting from the top and going clockwise
      const angle = (i / capacity) * 2 * Math.PI - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      const isUsed = i < shotsUsed; // The first 'shotsUsed' dots are marked as used
      dots.push({ x, y, isUsed });
    }
  }

  return (
    <div className="relative w-[92px] h-[92px] flex items-center justify-center">
      {/* Dots SVG */}
      <div className="absolute inset-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {dots.map((dot, i) => (
            <circle
              key={i}
              cx={dot.x}
              cy={dot.y}
              r={dotRadius}
              fill={dot.isUsed ? 'transparent' : 'white'}
              className="transition-colors duration-150"
            />
          ))}
        </svg>
      </div>
      
      {/* Central Button */}
      <button
        onClick={onTakePhoto}
        disabled={isCompleted}
        aria-label="Take Photo"
        className="w-[72px] h-[72px] min-w-0 min-h-0 rounded-full bg-amber-400 flex items-center justify-center transition-all active:scale-95 disabled:bg-amber-400/50 disabled:cursor-not-allowed text-gray-900 shadow-lg shadow-amber-500/20"
      >
        {isCompleted ? (
          <Lock className="w-8 h-8 text-gray-800" />
        ) : activeRoll ? (
          <span className="text-4xl font-bold font-sans">
            {shotsLeft}
          </span>
        ) : (
          <span className="text-4xl font-bold font-sans">
            -
          </span>
        )}
      </button>
    </div>
  );
};

export default ShutterButton;