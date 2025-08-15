import React from 'react';

const TopBar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-700/50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex items-center justify-between h-16 px-4">
        <div className="w-10"></div> {/* Spacer */}
        <h1 className="text-lg font-bold text-white">
          Filmique
        </h1>
        <div className="w-10 h-10"></div> {/* Spacer to keep title centered */}
      </div>
    </header>
  );
};

export default TopBar;