import React, { useState, useEffect, useMemo } from 'react';
import { Aperture, RefreshCw, Film, ChevronUp, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import FilmSelectionModal from './FilmSelectionModal';

type ProControl = 'iso' | 'aperture' | 'shutterSpeed' | 'focus';

const ProControlSlider: React.FC<{
  options: (string | number)[];
  value: string | number;
  onChange: (value: any) => void;
}> = ({ options, value, onChange }) => (
  <div className="w-full overflow-x-auto no-scrollbar py-2">
    <div className="flex items-center justify-start w-max mx-auto space-x-2 px-4">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-4 py-2 rounded-full text-sm font-mono transition-colors duration-200 ${
            value === opt
              ? 'bg-amber-500 text-white'
              : 'bg-gray-700 bg-opacity-50 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {opt.toString().replace('f/', '')}
        </button>
      ))}
    </div>
  </div>
);

const CameraView: React.FC = () => {
  const {
    cameraMode,
    setCameraMode,
    activeRoll,
    setActiveRoll,
    user,
    setCurrentView,
    showFilmModal,
    setShowFilmModal,
    completedRolls
  } = useAppContext();
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(true);
  const [activeProControl, setActiveProControl] = useState<ProControl | null>(null);
  const [showProControls, setShowProControls] = useState(false);

  const [manualSettings, setManualSettings] = useState({
    iso: 400,
    aperture: 'f/5.6',
    shutterSpeed: '1/125',
    focus: 50
  });

  const filmTypes = useMemo(() => [
    { name: 'Kodak Gold 200', capacity: 24, price: 0, unlocked: true },
    { name: 'Kodak Portra 400', capacity: 36, price: 0, unlocked: true },
    { name: 'Ilford HP5 Plus', capacity: 36, price: 5, unlocked: user.level >= 3 },
    { name: 'Fuji Pro 400H', capacity: 36, price: 8, unlocked: user.level >= 5 },
    { name: 'Kodak Tri-X 400', capacity: 24, price: 6, unlocked: user.level >= 4 },
    { name: 'Cinestill 800T', capacity: 36, price: 12, unlocked: user.subscription !== 'free' }
  ], [user]);

  const capacityOptions = useMemo(() => [
    { shots: 24, name: 'Standard', price: 0 },
    { shots: 36, name: 'Large', price: 3 }
  ], []);

  useEffect(() => {
    if (!activeRoll && !showFilmModal) {
      setShowFilmModal(true);
    }
  }, [activeRoll, showFilmModal, setShowFilmModal]);

  const handleTakePhoto = async () => {
    if (!activeRoll || activeRoll.isCompleted) {
      setShowFilmModal(true);
      return;
    }

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

  const lastPhotoThumbnail = useMemo(() => {
    if (activeRoll?.photos.length > 0) {
      return activeRoll.photos[activeRoll.photos.length - 1].thumbnail;
    }
    if (completedRolls.length > 0 && completedRolls[0].photos.length > 0) {
      return completedRolls[0].photos[completedRolls[0].photos.length - 1].thumbnail;
    }
    return null;
  }, [activeRoll, completedRolls]);

  if (hasPermission === null) {
    return <div className="flex-1 flex items-center justify-center bg-black text-white">Initializing...</div>;
  }
  if (hasPermission === false) {
    return <div className="flex-1 flex items-center justify-center bg-black text-red-400">Camera access denied.</div>;
  }

  const isoOptions = [100, 200, 400, 800, 1600, 3200];
  const apertureOptions = ['f/1.4', 'f/2.0', 'f/2.8', 'f/4.0', 'f/5.6', 'f/8.0', 'f/11'];
  const shutterSpeedOptions = ['1/30', '1/60', '1/125', '1/250', '1/500', '1/1000'];

  const proControls = [
    { id: 'iso', label: 'ISO', value: manualSettings.iso },
    { id: 'aperture', label: 'AP', value: manualSettings.aperture.replace('f/', '') },
    { id: 'shutterSpeed', label: 'S', value: manualSettings.shutterSpeed },
    { id: 'focus', label: 'F', value: `${manualSettings.focus}mm` },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-black text-white">
      {/* Camera Viewfinder */}
      <div className="flex-1 bg-black relative flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg font-mono">
          <p>Viewfinder (Mock)</p>
        </div>
        {activeRoll && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black bg-opacity-30 rounded-full px-3 py-1 text-xs font-mono">
            {activeRoll.filmType} &middot; {activeRoll.shotsUsed}/{activeRoll.capacity}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-black bg-opacity-50 pt-4 pb-safe select-none">
        <div className="flex flex-col items-center space-y-4">
          {/* Pro Controls Panel */}
          {cameraMode === 'pro' && (
            <div className="w-full flex flex-col items-center gap-3 px-2">
              <button onClick={() => setShowProControls(!showProControls)} className="p-1">
                {showProControls ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronUp className="w-5 h-5 text-gray-400" />}
              </button>
              {showProControls && (
                <>
                  <div className="flex items-center justify-center space-x-4">
                    {proControls.map(c => (
                      <button key={c.id} onClick={() => setActiveProControl(c.id as ProControl)} className={`flex flex-col items-center gap-1 ${activeProControl === c.id ? 'text-amber-400' : 'text-gray-300'}`}>
                        <span className="text-xs font-bold">{c.label}</span>
                        <span className="text-xs">{c.value}</span>
                      </button>
                    ))}
                  </div>
                  {activeProControl === 'iso' && <ProControlSlider options={isoOptions} value={manualSettings.iso} onChange={v => setManualSettings({...manualSettings, iso: v})} />}
                  {activeProControl === 'aperture' && <ProControlSlider options={apertureOptions} value={manualSettings.aperture} onChange={v => setManualSettings({...manualSettings, aperture: v})} />}
                  {activeProControl === 'shutterSpeed' && <ProControlSlider options={shutterSpeedOptions} value={manualSettings.shutterSpeed} onChange={v => setManualSettings({...manualSettings, shutterSpeed: v})} />}
                  {activeProControl === 'focus' && (
                     <div className="w-full max-w-xs px-4 pt-2">
                        <input type="range" min="24" max="200" value={manualSettings.focus} onChange={e => setManualSettings({...manualSettings, focus: Number(e.target.value)})} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                     </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Mode Selector */}
          <div className="flex items-center justify-center space-x-6 font-recoleta text-base">
            <button onClick={() => setCameraMode('simple')} className={cameraMode === 'simple' ? 'text-amber-400 font-bold' : 'text-white'}>SIMPLE</button>
            <button onClick={() => setCameraMode('pro')} className={cameraMode === 'pro' ? 'text-amber-400 font-bold' : 'text-white'}>PRO</button>
          </div>

          {/* Main Action Row */}
          <div className="w-full flex items-center justify-around px-4">
            <button onClick={() => setCurrentView('albums')} className="w-14 h-14 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden">
              {lastPhotoThumbnail ? (
                <img src={lastPhotoThumbnail} alt="Last photo" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-6 h-6 text-gray-400" />
              )}
            </button>
            <button
              onClick={handleTakePhoto}
              disabled={activeRoll?.isCompleted}
              aria-label="Take Photo"
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center transition-transform active:scale-95"
            >
              {activeRoll?.isCompleted && <Lock className="w-8 h-8 text-gray-500" />}
            </button>
            <button className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>

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
