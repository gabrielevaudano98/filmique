import React from 'react';
import { Plus, Lock, Globe, Users, BookOpen } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const AlbumCard: React.FC<{ album: any }> = ({ album }) => {
  const AlbumIcon = () => {
    switch (album.type) {
      case 'public': return <Globe className="w-4 h-4" />;
      case 'shared': return <Users className="w-4 h-4" />;
      default: return <Lock className="w-4 h-4" />;
    }
  };

  return (
    <div className="group relative aspect-[4/5] cursor-pointer transition-transform duration-300 ease-in-out hover:-translate-y-2">
      {/* Book Cover */}
      <div className="w-full h-full bg-[#3a3a3a] rounded-lg shadow-xl overflow-hidden flex flex-col border-2 border-black/20">
        {/* Pasted-on Photo */}
        <div className="w-full h-3/5 bg-black p-3">
          <div className="w-full h-full shadow-lg">
            <img
              src={album.coverImage}
              alt={`Cover for ${album.title}`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        {/* Title Plate */}
        <div className="flex-1 p-4 flex flex-col justify-center items-center text-center">
          <h3 className="font-recoleta text-xl font-semibold text-gray-100 leading-tight [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]">{album.title}</h3>
          <div className="w-1/4 h-px bg-gray-500 my-2"></div>
          <p className="text-xs text-gray-400">{album.photoCount} photos • {album.rollCount} rolls</p>
        </div>
      </div>
      {/* Privacy Badge */}
      <div className="absolute top-5 right-5 bg-black/60 p-2 rounded-full backdrop-blur-sm text-white transition-transform duration-300 group-hover:scale-110">
        <AlbumIcon />
      </div>
      {/* Subtle spine effect */}
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/30 rounded-l-lg"></div>
    </div>
  );
};

const CreateAlbumCard: React.FC<{ remainingSlots: number }> = ({ remainingSlots }) => (
  <div className="group relative aspect-[4/5] cursor-pointer transition-transform duration-300 ease-in-out hover:-translate-y-2">
    <div className="w-full h-full bg-[#2d2d2d] rounded-lg shadow-lg flex flex-col items-center justify-center text-center p-4 border-2 border-black/20">
      <div className="w-16 h-16 flex items-center justify-center rounded-full border-2 border-dashed border-gray-500 group-hover:border-amber-400 group-hover:bg-amber-400/10 transition-all duration-300 mb-4">
        <Plus className="w-8 h-8 text-gray-500 group-hover:text-amber-400 transition-colors duration-300" />
      </div>
      <h3 className="font-recoleta text-xl font-semibold text-gray-200 group-hover:text-white">Create Album</h3>
      <p className="text-xs text-gray-500 mt-1">{remainingSlots} free slot{remainingSlots > 1 ? 's' : ''} remaining</p>
    </div>
    <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/30 rounded-l-lg"></div>
  </div>
);

const AlbumsView: React.FC = () => {
  const { albums } = useAppContext();
  const totalAlbumSlots = 3; // Default free slots

  const totalPhotos = albums.reduce((sum, album) => sum + album.photoCount, 0);

  return (
    <div className="w-full p-4 sm:p-6 space-y-8 pb-safe bg-gray-900/50 min-h-screen">
      {/* Header & Stats */}
      <div className="text-center pt-4 pb-2">
        <h1 className="text-3xl sm:text-4xl font-bold font-recoleta text-white">Your Collections</h1>
        <p className="text-gray-400 mt-2">Your personal library of curated memories.</p>
        <div className="mt-6 flex justify-center items-center space-x-6 text-white">
          <div className="text-center">
            <div className="text-2xl font-bold">{albums.length} / {totalAlbumSlots}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Albums</div>
          </div>
          <div className="h-8 w-px bg-gray-600"></div>
          <div className="text-center">
            <div className="text-2xl font-bold">{totalPhotos}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Photos</div>
          </div>
        </div>
      </div>

      {/* Bookshelf */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
        {albums.length < totalAlbumSlots && (
          <CreateAlbumCard remainingSlots={totalAlbumSlots - albums.length} />
        )}
      </div>

      {/* Empty State */}
      {albums.length === 0 && (
        <div className="text-center py-16 px-4 col-span-full">
          <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2 font-recoleta text-white">Your Bookshelf is Empty</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Albums are where your stories live. Create your first collection to begin archiving your favorite photo rolls.
          </p>
        </div>
      )}
    </div>
  );
};

export default AlbumsView;
