import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingIndicatorProps {
  size?: number;
  text?: string;
  className?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ size = 20, text, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Loader className="animate-spin text-gray-300" size={size} />
      {text && <span className="text-sm text-gray-300">{text}</span>}
    </div>
  );
};

export default LoadingIndicator;