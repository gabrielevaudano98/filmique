import React from 'react';

interface ShutterAnimationProps {
  isAnimating: boolean;
}

const ShutterAnimation: React.FC<ShutterAnimationProps> = ({ isAnimating }) => {
  if (!isAnimating) {
    return null;
  }

  const blades = 7; // Using 7 blades for a nice circular aperture
  const bladeElements = Array.from({ length: blades }).map((_, i) => {
    const rotation = (360 / blades) * i;
    return (
      <g key={i} transform={`rotate(${rotation} 50 50)`}>
        <path
          className="shutter-blade"
          // This path creates a shape that looks like an aperture blade
          d="M50,50 L20,-20 A80,80 0 0,1 80,-20 L50,50 Z"
        />
      </g>
    );
  });

  return (
    <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center bg-black">
      <svg viewBox="0 0 100 100" className="w-auto h-full max-w-full max-h-full overflow-visible">
        {bladeElements}
      </svg>
    </div>
  );
};

export default ShutterAnimation;