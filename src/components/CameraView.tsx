import React, { useState } from 'react';
import { Camera, Settings, RotateCcw, Zap, Film, Lock, Unlock, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import FilmSelectionModal from './FilmSelectionModal';

const CameraView: React.FC = () => {
  const { cameraMode, setCameraMode, activeRoll, setActiveRoll, user, setCurrentView } = useAppContext();
  const [showFilmModal, setShowFilmModal] = useState(false);
  const [manualSettings, setManualSettings] = useState({
    iso: 400,
    aperture: 'f/5.6',
    shutterSpeed: '1/125',
    focus: 50
  });

  const filmTypes = [
    { name: 'Kodak Gold 200', capacity: 24, price: 0, unlocked: true },
    { name: 'Kodak Portra 400', capacity: 36, price: 0, unlocked: true },
    { name: 'Ilford HP5 Plus', capacity: 36, price: 5, unlocked: user.level >= 3 },
    { name: 'Fuji Pro 400H', capacity: 36, price: 8, unlocked: user.level >= 5 },
    { name: 'Kodak Tri-X 400', capacity: 24, price: 6, unlocked: user.level >= 4 },
    { name: 'Cinestill 800T', capacity: 36, price: 12, unlocked: user.subscription !== 'free' }
  ];

  const capacityOptions = [
    { shots: 4, name: 'Mini', price: 0 },
    { shots: 12, name: 'Small', price: 2 },
    { shots: 24, name: 'Standard', price: 0 },
    { shots: 36, name: 'Medium', price: 3 },
    { shots: 48, name: 'Large', price: 5 }
  ];

  const handleTakePhoto = () => {
    if (!activeRoll) {
      setShowFilmModal(true);
      return;
    }

    if (activeRoll.shotsUsed >= activeRoll.capacity) {
      // Roll is full
      return;
    }

    // Simulate taking a photo
    const newPhoto = {
      id: `photo-${Date.now()}`,
      rollId: activeRoll.id,
      url: `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=800`,
      thumbnail: `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=400`,
      metadata: {
        iso: cameraMode === 'pro' ? manualSettings.iso : 400,
        aperture: cameraMode === 'pro' ? manualSettings.aperture : 'f/5.6',
        shutterSpeed: cameraMode === 'pro' ? manualSettings.shutterSpeed : '1/125',
        focal: cameraMode === 'pro' ? `${manualSettings.focus}mm` : '50mm',
        timestamp: new Date()
      }
    };

    const updatedRoll = {
      ...activeRoll,
      shotsUsed: activeRoll.shotsUsed + 1,
      photos: [...activeRoll.photos, newPhoto],
      isCompleted: activeRoll.shotsUsed + 1 >= activeRoll.capacity
    };

    setActiveRoll(updatedRoll);
  };

  const startNewRoll = (filmType: string, capacity: number) => {
    const newRoll = {
      id: `roll-${Date.now()}`,
      filmType,
      capacity,
      shotsUsed: 0,
      isCompleted: false,
      isUnlocked: false,
      createdDate: new Date(),
      photos: []
    };
    
    setActiveRoll(newRoll);
    setShowFilmModal(false);
  };

  const handleExitCamera = () => {
    setCurrentView('home'); // Navigate back to the home screen
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Camera Controls Header */}
      <div className="bg-gray-800 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCameraMode(cameraMode === 'simple' ? 'pro' : 'simple')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                cameraMode === 'pro' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } min-h-[44px] text-sm sm:text-base`}
            >
              {cameraMode === 'pro' ? 'Pro Mode' : 'Simple Mode'}
            </button>
            <button
              onClick={() => setShowFilmModal(true)}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-3 sm:px-4 py-2 rounded-lg transition-colors min-h-[44px] text-sm sm:text-base"
            >
              <Film className="w-4 h-4" />
              <span className="hidden sm:inline">Change Film</span>
              <span className="sm:hidden">Film</span>
            </button>
          </div>
          <button className="p-3 hover:bg-gray-700 rounded-full transition-colors min-h-[44px] min-w-[44px]">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Current Roll Info */}
        {activeRoll && (
          <div className="bg-gray-700 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-amber-400 text-sm sm:text-base">{activeRoll.filmType}</h3>
                <p className="text-sm text-gray-300">
                  {activeRoll.shotsUsed}/{activeRoll.capacity} shots
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-gray-600 rounded-full h-2 w-16 sm:w-24">
                  <div 
                    className="bg-amber-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(activeRoll.shotsUsed / activeRoll.capacity) * 100}%` }}
                  ></div>
                </div>
                {activeRoll.isCompleted ? (
                  <Lock className="w-4 h-4 text-red-400" />
                ) : (
                  <Unlock className="w-4 h-4 text-green-400" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Camera Viewfinder */}
      <div className="flex-1 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black touch-none">
          {/* Simulated Camera Feed */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 text-sm sm:text-base px-4">Camera viewfinder simulation</p>
              <p className="text-gray-600 text-xs sm:text-sm mt-2 px-4">
                In a real app, this would show the camera feed
              </p>
            </div>
          </div>
        </div>

        {/* Exit Button */}
        <button
          onClick={handleExitCamera}
          className="absolute top-4 left-4 p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors z-10 min-h-[44px] min-w-[44px]"
          aria-label="Exit Camera"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {/* Viewfinder Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full border border-gray-700 border-opacity-30">
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 text-amber-400 text-xs sm:text-sm font-mono">
              {cameraMode === 'pro' && (
                <>
                  <div>ISO: {manualSettings.iso}</div>
                  <div>{manualSettings.aperture}</div>
                  <div>{manualSettings.shutterSpeed}</div>
                  <div>Focus: {manualSettings.focus}mm</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pro Mode Controls */}
      {cameraMode === 'pro' && (
        <div className="bg-gray-800 p-3 sm:p-4 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1">ISO</label>
              <select
                value={manualSettings.iso}
                onChange={(e) => setManualSettings({...manualSettings, iso: Number(e.target.value)})}
                className="w-full bg-gray-700 rounded-lg px-3 py-3 text-white text-sm sm:text-base min-h-[44px]"
              >
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={400}>400</option>
                <option value={800}>800</option>
                <option value={1600}>1600</option>
                <option value={3200}>3200</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1">Aperture</label>
              <select
                value={manualSettings.aperture}
                onChange={(e) => setManualSettings({...manualSettings, aperture: e.target.value})}
                className="w-full bg-gray-700 rounded-lg px-3 py-3 text-white text-sm sm:text-base min-h-[44px]"
              >
                <option value="f/1.4">f/1.4</option>
                <option value="f/2.0">f/2.0</option>
                <option value="f/2.8">f/2.8</option>
                <option value="f/4.0">f/4.0</option>
                <option value="f/5.6">f/5.6</option>
                <option value="f/8.0">f/8.0</option>
                <option value="f/11">f/11</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1">Shutter Speed</label>
              <select
                value={manualSettings.shutterSpeed}
                onChange={(e) => setManualSettings({...manualSettings, shutterSpeed: e.target.value})}
                className="w-full bg-gray-700 rounded-lg px-3 py-3 text-white text-sm sm:text-base min-h-[44px]"
              >
                <option value="1/30">1/30</option>
                <option value="1/60">1/60</option>
                <option value="1/125">1/125</option>
                <option value="1/250">1/250</option>
                <option value="1/500">1/500</option>
                <option value="1/1000">1/1000</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1">Focus (mm)</label>
              <input
                type="range"
                min="24"
                max="200"
                value={manualSettings.focus}
                onChange={(e) => setManualSettings({...manualSettings, focus: Number(e.target.value)})}
                className="w-full h-8"
              />
              <div className="text-xs sm:text-sm text-gray-400 text-center">{manualSettings.focus}mm</div>
            </div>
          </div>
        </div>
      )}

      {/* Shutter Button */}
      <div className="bg-gray-800 p-4 sm:p-6 pb-safe">
        <div className="flex items-center justify-center">
          <button
            onClick={handleTakePhoto}
            disabled={activeRoll?.isCompleted}
            aria-label="Take Photo"
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 transition-all duration-200 ease-in-out ${
              activeRoll?.isCompleted
                ? 'border-gray-600 bg-gray-700 cursor-not-allowed'
                : 'border-amber-500 bg-amber-500 hover:border-amber-400 hover:bg-amber-400 active:scale-95'
            }`}
          >
            <div className={`w-full h-full rounded-full transition-colors ${
              activeRoll?.isCompleted ? 'bg-gray-600' : 'bg-gray-900'
            }`}></div>
          </button>
        </div>
        {activeRoll?.isCompleted && (
          <p className="text-center text-gray-400 text-xs sm:text-sm mt-2 px-4">
            Roll completed! Check your albums to view photos after unlock.
          </p>
        )}
      </div>

      {/* Film Selection Modal */}
      {showFilmModal && (
        <FilmSelectionModal
          filmTypes={filmTypes}
          capacityOptions={capacityOptions}
          onStartRoll={startNewRoll}
          onClose={() => setShowFilmModal(false)}
        />
      )}
    </div>
  );
};

export default CameraView;
