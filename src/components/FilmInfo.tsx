import React from 'react';
import { Film } from 'lucide-react';

interface FilmInfoProps {
  filmName: string;
  iso: number;
  onClick: () => void;
}

const FilmInfo: React.FC<FilmInfoProps> = ({ filmName, iso, onClick }) => {
  return (
    <button onClick={onClick} className="bg-yellow-400 rounded-xl p-4 w-full text-left text-black">
      <p className="text-black/70 text-xs font-bold tracking-widest uppercase mb-2">Film</p>
      <div className="flex items-center space-x-2">
        <Film className="w-5 h-5" />
        <p className="font-bold">{filmName} &bull; ISO {iso}</p>
      </div>
    </button>
  );
};

export default FilmInfo;