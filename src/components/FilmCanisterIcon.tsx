import React from 'react';

interface FilmCanisterIconProps {
  filmType: string;
  className?: string;
  imageUrl?: string | null;
}

const FilmCanisterIcon: React.FC<FilmCanisterIconProps> = ({ filmType, className, imageUrl }) => {
  if (imageUrl) {
    return <img src={imageUrl} alt={`${filmType} canister`} className={`${className} object-contain bg-transparent`} />;
  }

  const filmBrand = filmType.split(' ')[0] || 'Filmique';
  const filmSpeed = filmType.match(/\d+/)?.[0] || '400';

  return (
    <svg viewBox="0 0 60 96" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Canister Body */}
      <rect x="2" y="8" width="56" height="80" rx="4" fill="#2a2d31" />
      
      {/* Top & Bottom Caps */}
      <path d="M2 12C2 9.79086 3.79086 8 6 8H54C56.2091 8 58 9.79086 58 12V20H2V12Z" fill="#1b1d20" />
      <path d="M2 84C2 86.2091 3.79086 88 6 88H54C56.2091 88 58 86.2091 58 84V76H2V84Z" fill="#1b1d20" />
      
      {/* Spool */}
      <rect x="26" y="0" width="8" height="8" rx="1" fill="#1b1d20" />

      {/* Label */}
      <g transform="rotate(-90 30 52)">
        <text x="30" y="35" fontFamily="'SF Pro Display', sans-serif" fontSize="10" fontWeight="bold" fill="#F6AE55" textAnchor="middle">
          {filmBrand.toUpperCase()}
        </text>
        <text x="30" y="52" fontFamily="'SF Mono', monospace" fontSize="18" fontWeight="bold" fill="white" textAnchor="middle">
          {filmSpeed}
        </text>
         <text x="30" y="65" fontFamily="'SF Pro Display', sans-serif" fontSize="8" fontWeight="500" fill="white" textAnchor="middle">
          COLOR FILM
        </text>
      </g>
    </svg>
  );
};

export default FilmCanisterIcon;