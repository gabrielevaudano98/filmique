import React from 'react';
import { Album } from '../types';
import { Folder, ChevronRight } from 'lucide-react';

interface AlbumListItemProps {
  album: Album;
  onClick: () => void;
}

const AlbumListItem: React.FC<AlbumListItemProps> = ({ album, onClick }) => {
  return (
    <button onClick={onClick} className="w-full flex items-center p-4 bg-neutral-800/60 backdrop-blur-lg border border-neutral-700/50 hover:bg-neutral-700/50 rounded-xl transition-colors">
      <Folder className="w-6 h-6 text-amber-400 mr-4 flex-shrink-0" />
      <div className="flex-1 text-left overflow-hidden">
        <p className="text-white font-semibold truncate">{album.title}</p>
        <p className="text-gray-400 text-sm">{album.rollCount || 0} rolls, {album.photoCount || 0} photos</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-500 ml-2 flex-shrink-0" />
    </button>
  );
};

export default AlbumListItem;