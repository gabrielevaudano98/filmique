import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Film, Lock, Camera, ArrowLeft, Loader } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import FilmSelectionModal from './FilmSelectionModal';
import RangeSelector from './RangeSelector';
import FocalPlaneShutter from './FocalPlaneShutter';

type ProControl = 'iso' | 'shutterSpeed' | 'focus';

// Helper to format shutter speed for display
const formatShutterSpeed = (seconds: number): string => {
  if (seconds >= 1) return `${seconds}"`;
  return `1/${Math.round(1 / seconds)}`;
};

// Helper to generate a range of numbers for sliders
const generateNumericOptions = (min: number, max: number, steps: number): number[] => {
  if (min >= max) return [min];
  const step = (max - min) / (steps - 1);
  return Array.from({ length: steps }, (_, i) => min + i * step);
};

const CameraView: React.FC = () => {
  const {
    cameraMode,
    setCameraMode,
    activeRoll,
    startNewRoll,
    showFilmModal,
    setShowFilmModal,
    takePhoto,
    setCurrentView,
    isSavingPhoto,
  } = useAppContext();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<MediaTrackCapabilities | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  
  const [activeProControl, setActiveProControl] = useState<ProControl | null>(null);
  const [zoom, setZoom] = useState(1);
  const [zoomLevels, setZoomLevels] = useState<number[]>([1]);

  const [manualSettings, setManualSettings] = useState({
    iso: 400,
    shutterSpeed: 1 / 125, // Stored as seconds
    focus: 1, // Stored as meters
  });

  const [aspectRatioClass, setAspectRatioClass] = useState('aspect-[3/2]');
  const [targetAspectRatio, setTargetAspectRatio] = useState(3 / 2);
  const [isShutterAnimating, setIsShutterAnimating] = useState(false);

  useEffect(() => {
    if (activeRoll) {
        const ratio = activeRoll.aspect_ratio || '3:2';
        const [w, h] = ratio.split(':').map(Number);
        if (w && h) {
            setTargetAspectRatio(w / h);
            const ratioMap: { [key: string]: string } = {
                '3:2': 'aspect-[3/2]',
                '4:3': 'aspect-[4/3]',
                '1:1': 'aspect-[1/1]',
            };
            setAspectRatioClass(ratioMap[ratio] || 'aspect-[3/2]');
        }
    } else {
        // Default when no roll is loaded
        setTargetAspectRatio(3 / 2);
        setAspectRatioClass('aspect-[3/2]');
    }
  }, [activeRoll]);

  useEffect(() => {
    let isMounted = true;
    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        const constraints: MediaStreamConstraints = {
          video: { deviceId: activeCameraId ? { exact: activeCameraId } : undefined },
        };
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMounted) {
          newStream.getTracks().forEach(track => track.stop());
          return;
        }
        
        activeStream = newStream;
        setHasPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }

        const videoTrack = newStream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        setIsFrontCamera(settings.facingMode === 'user');

        const trackCapabilities = videoTrack.getCapabilities();
        setCapabilities(trackCapabilities);

        if (trackCapabilities.zoom?.max && trackCapabilities.zoom.max > 1) {
          const { min, max } = trackCapabilities.zoom;
          const levels = [min, min + (max - min) * 0.25, min + (max - min) * 0.5, min + (max - min) * 0.75, max].map(z => parseFloat(z.toFixed(1)));
          setZoomLevels(levels);
          setZoom(min);
        } else {
          setZoomLevels([1]);
          setZoom(1);
        }

        if (cameras.length === 0) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(d => d.kind === 'videoinput');
          setCameras(videoDevices);
          if (!activeCameraId && videoDevices.length > 0) {
            setActiveCameraId(videoDevices[0].deviceId);
          }
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setHasPermission(false);
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeCameraId]);

  const switchCamera = () => {
    if (cameras.length > 1) {
      const currentIndex = cameras.findIndex(c => c.deviceId === activeCameraId);
      const nextIndex = (currentIndex + 1) % cameras.length;
      setActiveCameraId(cameras[nextIndex].deviceId);
    }
  };

  const cycleZoom = () => {
    if (zoomLevels.length <= 1 || !videoRef.current?.srcObject) return;
    
    const currentIndex = zoomLevels.indexOf(zoom);
    const nextIndex = (currentIndex + 1) % zoomLevels.length;
    const newZoom = zoomLevels[nextIndex];
    setZoom(newZoom);

    const stream = videoRef.current.srcObject as MediaStream;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack && capabilities?.zoom) {
      videoTrack.applyConstraints({ advanced: [{ zoom: newZoom }] });
    }
  };

  const handleTakePhoto = async () => {
    if (!activeRoll || activeRoll.is_completed) {
      setShowFilmModal(true);
      return;
    }

    setIsShutterAnimating(true);

    let imageBlob: Blob | null = null;

    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const videoAspectRatio = videoWidth / videoHeight;

    let sWidth, sHeight, sx, sy;

    if (videoAspectRatio > targetAspectRatio) {
      sHeight = videoHeight;
      sWidth = videoHeight * targetAspectRatio;
      sx = (videoWidth - sWidth) / 2;
      sy = 0;
    } else {
      sWidth = videoWidth;
      sHeight = videoWidth / targetAspectRatio;
      sx = 0;
      sy = (videoHeight - sHeight) / 2;
    }

    canvas.width = sWidth;
    canvas.height = sHeight;

    const context = canvas.getContext('2d');
    if (context) {
      if (isFrontCamera) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      context.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
    }

    imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));

    if (imageBlob) {
      const metadata = {
        iso: cameraMode === 'pro' ? manualSettings.iso : 400,
        shutterSpeed: cameraMode === 'pro' ? formatShutterSpeed(manualSettings.shutterSpeed) : '1/125',
        zoom: `${zoom}x`,
      };
      await takePhoto(imageBlob, metadata);
    }
  };

  const proControls = [
    capabilities?.iso && { id: 'iso', label: 'ISO', value: manualSettings.iso },
    capabilities?.exposureTime && { id: 'shutterSpeed', label: 'S', value: formatShutterSpeed(manualSettings.shutterSpeed) },
    capabilities?.focusDistance && { id: 'focus', label: 'F', value: `${manualSettings.focus}m` },
  ].filter(Boolean) as { id: ProControl; label: string; value: string | number }[];

  if (hasPermission === null) {
    return <div className="h-screen flex items-center justify-center bg-black text-white">Initializing Camera...</div>;
  }
  if (hasPermission === false) {
    return <div className="h-screen flex items-center justify-center bg-black text-red-400 p-4 text-center">Camera access denied. Please enable camera permissions in your browser or device settings.</div>;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden text-white camera-modal bg-black">
      <header className="w-full bg-black text-white px-4 flex items-center justify-between relative z-40 h-16 py-3 pt-safe flex-shrink-0">
        <button
          onClick={() => setCurrentView('rolls')}
          className="text-gray-300 hover:text-white transition-colors flex items-center gap-1 text-base p-2"
          aria-label="Go back to rolls"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold font-recoleta text-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="text-amber-400">Filmique</span>
        </h1>
        <div className="w-11 h-11" />
      </header>
      
      <canvas ref={canvasRef} className="hidden"></canvas>
      
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <div className={`w-full h-full max-w-full max-h-full ${aspectRatioClass} relative bg-black overflow-hidden flex items-center justify-center`}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover transition-transform duration-300 ${isFrontCamera ? 'transform -scale-x-100' : ''}`}
          />
          <FocalPlaneShutter 
            isAnimating={isShutterAnimating} 
            onAnimationEnd={() => setIsShutterAnimating(false)} 
          />
        </div>
      </div>

      <div className="bg-gray-900 pb-safe select-none flex-shrink-0 flex flex-col justify-center h-[30vh] min-h-[240px] max-h-[300px]">
        <div className="flex flex-col items-center justify-center">
          {cameraMode === 'pro' && (
            <div className="w-full min-h-[90px] flex flex-col justify-center items-center gap-2 px-2">
              <div className="flex items-center justify-center space-x-6">
                {proControls.map(c => (
                  <button key={c.id} onClick={() => setActiveProControl(activeProControl === c.id ? null : c.id)} className={`flex flex-col items-center gap-1 transition-colors ${activeProControl === c.id ? 'text-amber-400' : 'text-gray-300 hover:text-white'}`}>
                    <span className="text-xs font-bold">{c.label}</span>
                    <span className="text-xs">{c.value}</span>
                  </button>
                ))}
              </div>
              <div className="h-20 w-full">
                {activeProControl === 'iso' && capabilities?.iso && <RangeSelector options={generateNumericOptions(capabilities.iso.min, capabilities.iso.max, 20)} value={manualSettings.iso} onChange={v => setManualSettings({...manualSettings, iso: v as number})} type="iso" />}
                {activeProControl === 'shutterSpeed' && capabilities?.exposureTime && <RangeSelector options={generateNumericOptions(capabilities.exposureTime.min, capabilities.exposureTime.max, 20).map(v => parseFloat(v.toPrecision(2)))} value={manualSettings.shutterSpeed} onChange={v => setManualSettings({...manualSettings, shutterSpeed: v as number})} type="shutterSpeed" />}
                {activeProControl === 'focus' && capabilities?.focusDistance && <RangeSelector options={generateNumericOptions(capabilities.focusDistance.min, capabilities.focusDistance.max, 20)} value={manualSettings.focus} onChange={v => setManualSettings({...manualSettings, focus: v as number})} type="focus" />}
              </div>
            </div>
          )}

          <div className="w-full flex items-center justify-between px-4 py-2">
            {/* Left: Roll Info */}
            <div className="flex-1 flex justify-start">
              <button onClick={() => setShowFilmModal(true)} className="flex items-center gap-3 text-left transition-opacity hover:opacity-80 p-2">
                <Film className="w-7 h-7 text-amber-400 flex-shrink-0" />
                <div>
                  <span className="block text-gray-400 text-xs font-bold uppercase tracking-wider">Loaded Film</span>
                  <span className="block text-white font-recoleta text-lg leading-tight -mt-1">
                    {activeRoll ? activeRoll.film_type : 'None'}
                  </span>
                </div>
              </button>
            </div>

            {/* Center: Shutter */}
            <div className="flex-shrink-0">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center space-x-6 font-sans text-base">
                  <button onClick={() => setCameraMode('simple')} className={cameraMode === 'simple' ? 'text-amber-400 font-bold' : 'text-white'}>PHOTO</button>
                  <button onClick={() => setCameraMode('pro')} className={cameraMode === 'pro' ? 'text-amber-400 font-bold' : 'text-white'}>PRO</button>
                </div>
                <div className="w-[88px] h-[88px] bg-neutral-800 rounded-full flex items-center justify-center ring-4 ring-neutral-700">
                  <button onClick={handleTakePhoto} disabled={activeRoll?.is_completed || isSavingPhoto} aria-label="Take Photo" className="w-20 h-20 rounded-full bg-white flex items-center justify-center transition-transform active:scale-95 disabled:bg-gray-200">
                    {isSavingPhoto ? (
                      <Loader className="w-8 h-8 text-gray-500 animate-spin" />
                    ) : activeRoll?.is_completed ? (
                      <Lock className="w-8 h-8 text-gray-500" />
                    ) : (
                      <Camera className="w-6 h-6 text-gray-900" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Zoom & Switch */}
            <div className="flex-1 flex justify-end items-center space-x-2">
              <button onClick={cycleZoom} disabled={zoomLevels.length <= 1} className="w-12 h-12 rounded-full bg-neutral-800 text-white flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-50">
                {`${zoom.toFixed(1)}x`}
              </button>
              <button onClick={switchCamera} disabled={cameras.length <= 1} className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-50">
                <RefreshCw className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showFilmModal && <FilmSelectionModal onStartRoll={startNewRoll} onClose={() => setShowFilmModal(false)} />}
    </div>
  );
};

export default CameraView;