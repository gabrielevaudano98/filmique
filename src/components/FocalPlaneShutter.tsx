import React from 'react';

interface FocalPlaneShutterProps {
  isAnimating: boolean;
  onAnimationEnd: () => void;
}

const FocalPlaneShutter: React.FC<FocalPlaneShutterProps> = ({ isAnimating, onAnimationEnd }) => {
  if (!isAnimating) {
    return null;
  }

  return (
    <div 
      className="absolute inset-0 z-50 pointer-events-none overflow-hidden animate-shutter-fade-out"
      onAnimationEnd={onAnimationEnd}
    >
      <div className="absolute top-0 left-0 w-full h-1/2 bg-black animate-shutter-top-curtain"></div>
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-black animate-shutter-bottom-curtain"></div>
    </div>
  );
};

export default FocalPlaneShutter;