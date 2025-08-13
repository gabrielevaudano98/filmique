import React from 'react';

const FilmCanister: React.FC = () => {
  return (
    <div className="relative w-14 h-28 flex-shrink-0" aria-hidden="true">
      {/* Main Body */}
      <div className="absolute inset-y-2 left-1/2 -translate-x-1/2 w-11 bg-gray-300 rounded-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400 opacity-70"></div>
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-gray-600 -rotate-90 tracking-widest">35MM</span>
      </div>
      {/* Top Cap */}
      <div className="absolute top-0 left-0 w-full h-4 bg-gray-700 rounded-t-md">
        <div className="absolute inset-x-1 top-1 h-2 bg-gray-800 rounded-t-sm"></div>
      </div>
      {/* Bottom Cap */}
      <div className="absolute bottom-0 left-0 w-full h-4 bg-gray-700 rounded-b-md">
        <div className="absolute inset-x-1 bottom-1 h-2 bg-gray-800 rounded-b-sm"></div>
      </div>
    </div>
  );
};

export default FilmCanister;