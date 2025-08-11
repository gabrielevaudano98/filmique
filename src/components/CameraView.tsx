import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { CameraView as NativeCameraView } from 'capacitor-camera-view';
import { RefreshCw, Film, Lock, ArrowLeft, SlidersHorizontal, Aperture, Focus, X, Image as ImageIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import FilmSelectionModal from './FilmSelectionModal';
import RangeSelector from './RangeSelector';
import VerticalSlider from './VerticalSlider';

const formatShutterSpeed = (seconds: number): string => {
  if (seconds >= 1) return `${seconds}"`;
  return `1/${Math.round(1 / seconds)}`;
};

const CameraView: React.FC = () => {
  const {
    activeRoll,
    startNewRoll,
    showFilmModal,
    setShowFilmModal,
    takePhoto,
    setCurrentView,
  } = useAppContext();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isNative, setIsNative] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<MediaTrackCapabilities | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  
  const [showProControls, setShowProControls] = useState(false);
  const [exposureValue, setExposureValue] = useState(0);

  const [manualSettings, setManualSettings] = useState({
    iso: 400,
    shutterSpeed: 1 / 125,
    focus: 1,
  });

  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    setIsNative(native);
  }, []);

  useEffect(() => {
    if (!isNative) return;
    const startNativeCamera = async () => {
      try {
        await NativeCameraView.start({});
        document.body.classList.add('camera-running');
        setHasPermission(true);
      } catch (e) {
        console.error(e);
        setHasPermission(false);
      }
    };
    startNativeCamera();
    return () => {
      document.body.classList.remove('camera-running');
      NativeCameraView.stop();
    };
  }, [isNative]);

  useEffect(() => {
    if (isNative) return;
    const setupCamera = async () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: activeCameraId ? { exact: activeCameraId } : undefined } });
        setStream(newStream);
        setHasPermission(true);
        if (videoRef.current) videoRef.current.srcObject = newStream;
        const videoTrack = newStream.getVideoTracks()[0];
        setIsFrontCamera(videoTrack.getSettings().facingMode === 'user');
        setCapabilities(videoTrack.getCapabilities());
        if (cameras.length === 0) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          setCameras(devices.filter(d => d.kind === 'videoinput'));
        }
      } catch (err) {
        console.error(err);
        setHasPermission(false);
      }
    };
    setupCamera();
    return () => stream?.getTracks().forEach(track => track.stop());
  }, [isNative, activeCameraId]);

  const switchCamera = () => {
    if (isNative) NativeCameraView.flipCamera();
    else if (cameras.length > 1) {
      const currentIndex = cameras.findIndex(c => c.deviceId === activeCameraId);
      setActiveCameraId(cameras[(currentIndex + 1) % cameras.length].deviceId);
    }
  };

  const handleTakePhoto = async () => {
    if (!activeRoll || activeRoll.is_completed) {
      setShowFilmModal(true);
      return;
    }
    let imageBlob: Blob | null = null;
    if (isNative) {
      const result = await NativeCameraView.capture({ quality: 90 });
      imageBlob = await (await fetch(`data:image/jpeg;base64,${result.photo}`)).blob();
    } else if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const side = Math.min(video.videoWidth, video.videoHeight);
      canvas.width = side;
      canvas.height = side;
      const sx = (video.videoWidth - side) / 2;
      const sy = (video.videoHeight - side) / 2;
      const context = canvas.getContext('2d');
      if (context) {
        if (isFrontCamera) {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        context.drawImage(video, sx, sy, side, side, 0, 0, side, side);
      }
      imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    }
    if (imageBlob) {
      const metadata = { ...manualSettings, ev: exposureValue };
      await takePhoto(imageBlob, metadata);
    }
  };

  const capacityOptions = useMemo(() => [
    { shots: 12, name: 'Short', price: 1 }, { shots: 24, name: 'Standard', price: 2 }, { shots: 36, name: 'Large', price: 3 }
  ], []);

  const proControls = [
    { id: 'iso', label: 'ISO', value: manualSettings.iso, capabilities: capabilities?.iso, icon: Aperture },
    { id: 'shutterSpeed', label: 'Speed', value: formatShutterSpeed(manualSettings.shutterSpeed), capabilities: capabilities?.exposureTime, icon: SlidersHorizontal },
    { id: 'focus', label: 'Focus', value: `${manualSettings.focus}m`, capabilities: capabilities?.focusDistance, icon: Focus },
  ].filter(c => c.capabilities) as any[];

  const generateNumericOptions = (min: number, max: number, steps: number) => {
    const options = [];
    const step = (max - min) / (steps - 1);
    for (let i = 0; i < steps; i++) options.push(min + i * step);
    return options;
  };

  const lastPhotoThumbnail = useMemo(() => {
    if (activeRoll && activeRoll.photos && activeRoll.photos.length > 0) {
      return activeRoll.photos[activeRoll.photos.length - 1].thumbnail_url;
    }
    return null;
  }, [activeRoll]);

  if (hasPermission === null) return <div className="h-screen flex items-center justify-center bg-black text-white">Initializing Camera...</div>;
  if (hasPermission === false) return <div className="h-screen flex items-center justify-center bg-black text-red-400 p-4 text-center">Camera access denied. Please enable permissions.</div>;

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden relative select-none">
      <canvas ref={canvasRef} className="hidden"></canvas>
      
      <div className="absolute inset-0 flex items-center justify-center">
        {!isNative && <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${isFrontCamera ? 'transform -scale-x-100' : ''}`} style={{ filter: `brightness(${1 + exposureValue * 0.1})` }} />}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
          {[...Array(9)].map((_, i) => <div key={i} className="border border-white/10"></div>)}
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 p-4 pt-safe flex justify-between items-center z-20">
        <button onClick={() => setCurrentView('rolls')} className="p-2 bg-black/30 rounded-full backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <button 
          onClick={() => setShowFilmModal(true)}
          className="bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium flex items-center space-x-2"
        >
          <Film className="w-4 h-4" />
          <span>{activeRoll ? `${activeRoll.film_type} (${activeRoll.shots_used}/${activeRoll.capacity})` : 'No Roll'}</span>
        </button>

        <button onClick={switchCamera} disabled={!isNative && cameras.length <= 1} className="p-2 bg-black/30 rounded-full backdrop-blur-sm disabled:opacity-50">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 right-4 h-1/2 max-h-[300px] z-20 flex items-center space-x-2">
        <VerticalSlider min={-3} max={3} step={0.1} value={exposureValue} onChange={setExposureValue} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 pb-safe flex justify-between items-center z-30">
        <button 
          onClick={() => setShowProControls(true)} 
          className="w-16 h-16 flex items-center justify-center bg-black/30 rounded-full backdrop-blur-sm"
        >
          <SlidersHorizontal className="w-6 h-6" />
        </button>
        
        <button 
          onClick={handleTakePhoto} 
          disabled={activeRoll?.is_completed} 
          aria-label="Take Photo" 
          className="w-20 h-20 rounded-full bg-white flex items-center justify-center transition-transform active:scale-95 disabled:bg-gray-400 ring-4 ring-white/20"
        >
          {activeRoll?.is_completed && <Lock className="w-8 h-8 text-gray-800" />}
        </button>

        <button 
          onClick={() => setCurrentView('rolls')} 
          className="w-16 h-16 flex items-center justify-center bg-black/30 rounded-full backdrop-blur-sm overflow-hidden"
        >
          {lastPhotoThumbnail ? (
            <img src={lastPhotoThumbnail} alt="Last photo" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-6 h-6 text-gray-400" />
          )}
        </button>
      </div>

      {!isNative && (
        <div className={`absolute inset-0 bg-black/70 backdrop-blur-md z-40 transition-opacity duration-300 flex items-center justify-center ${showProControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="w-full max-w-sm p-4">
            <div className="bg-gray-900/80 rounded-2xl p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Pro Controls</h3>
                <button onClick={() => setShowProControls(false)}><X className="w-5 h-5" /></button>
              </div>
              {proControls.map(c => (
                <div key={c.id}>
                  <div className="flex justify-between items-baseline text-sm mb-2">
                    <span className="font-medium">{c.label}</span>
                    <span className="font-mono">{c.value}</span>
                  </div>
                  <RangeSelector options={generateNumericOptions(c.capabilities.min, c.capabilities.max, 20)} value={manualSettings[c.id]} onChange={v => setManualSettings({...manualSettings, [c.id]: v})} type={c.id as any} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showFilmModal && <FilmSelectionModal capacityOptions={capacityOptions} onStartRoll={startNewRoll} onClose={() => setShowFilmModal(false)} />}
    </div>
  );
};

export default CameraView;