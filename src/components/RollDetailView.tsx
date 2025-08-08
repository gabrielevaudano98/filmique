import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Download, Printer, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const RollDetailView: React.FC = () => {
  const { selectedRoll, setCurrentView, setSelectedRoll } = useAppContext();

  if (!selectedRoll) {
    setCurrentView('profile');
    return null;
  }

  const handleBack = () => {
    setSelectedRoll(null);
    setCurrentView('profile');
  };

  const handleComingSoon = (feature: string) => {
    toast(`${feature} feature coming soon!`, { icon: '🚧' });
  };

  const developedDate = selectedRoll.developed_at 
    ? new Date(selectedRoll.developed_at)
    : new Date(new Date(selectedRoll.completed_at!).getTime() + 7 * 24 * 60 * 60 * 1000);

  const cacheBuster = selectedRoll.developed_at ? `?t=${new Date(selectedRoll.developed_at).getTime()}` : '';

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={handleBack} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Profile</span>
        </button>
        <div className="flex items-center space-x-2">
          <button onClick={() => handleComingSoon('Download')} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold p-2 rounded-lg transition-colors">
            <Download className="w-5 h-5" />
          </button>
          <button onClick={() => handleComingSoon('Print')} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold p-2 rounded-lg transition-colors">
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-recoleta text-white">{selectedRoll.title || selectedRoll.film_type}</h2>
        <p className="text-gray-400 mt-1">
          {selectedRoll.shots_used} photos • Developed on {developedDate.toLocaleDateString()}
        </p>
      </div>

      {/* Photo Grid */}
      {selectedRoll.photos && selectedRoll.photos.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1 sm:gap-2">
          {selectedRoll.photos.map(photo => (
            <div key={photo.id} className="aspect-square bg-gray-800 rounded-lg overflow-hidden group cursor-pointer">
              <img 
                src={`${photo.thumbnail_url}${cacheBuster}`} 
                alt="User Photo" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 col-span-full bg-gray-800/50 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2 font-recoleta text-white">No Photos Found</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            It looks like there was an issue loading the photos for this roll.
          </p>
        </div>
      )}
    </div>
  );
};

export default RollDetailView;