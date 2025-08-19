import React from 'react';
import { Camera } from 'lucide-react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-transparent text-white">
      <div className="relative w-20 h-20 text-white animate-pulse-soft">
        <div className="absolute -top-1 -left-1 w-6 h-6 rounded-tl-lg border-t-2 border-l-2 border-current animate-viewfinder-focus" style={{ animationDelay: '0s' }}></div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-tr-lg border-t-2 border-r-2 border-current animate-viewfinder-focus" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-bl-lg border-b-2 border-l-2 border-current animate-viewfinder-focus" style={{ animationDelay: '0.4s' }}></div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-br-lg border-b-2 border-r-2 border-current animate-viewfinder-focus" style={{ animationDelay: '0.6s' }}></div>
        <Camera className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-600" />
      </div>
    </div>
  );
};

export default LoadingIndicator;