import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { CameraView as NativeCameraView } from 'capacitor-camera-view';
import { RefreshCw, Film, Lock, Camera as CameraIcon, ArrowLeft, Send } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import FilmSelectionModal from './FilmSelectionModal';
import RangeSelector from './RangeSelector';
import RollSelector from './RollSelector';
import AccentButton from './AccentButton';

type ProControl = 'iso' | 'shutterSpeed' | 'focus';

const formatShutterSpeed = (seconds: number): string => {
  if (seconds >= 1) return `${seconds}"`;
  return `1/${Math.round(1 / seconds)}`;
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
    completedRolls,
    albums
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
  
  const [activeProControl, setActiveProControl] = useState<ProControl | null>(null);
  const [zoom, setZoom] = useState(1);
  const [zoomLevels, setZoomLevels] = useState<number[]>([1]);

  const [manualSettings, setManualSettings] = useState({
    iso: 400,
    shutterSpeed: 1 / 125,
    focus: 1,
  });

  const [aspectRatioClass, setAspectRatioClass] = useState('aspect-[3/2]');
  const [targetAspectRatio, setTargetAspectRatio] = useState(3 / 2);

  const [showRollSelector, setShowRollSelector] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setAspectRatioClass('aspect-[2/3]');
        setTargetAspectRatio(2 / 3);
      } else {
        setAspectRatioClass('aspect-[3/2]');
        setTargetAspectRatio(3 / 2);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    setIsNative(native);
  }, []);

  // Native camera effect
  useEffect(() => {
    if (!isNative) return;

    const startNativeCamera = async () => {
      try {
        const permissions = await NativeCameraView.checkPermissions();
        if (permissions.camera === 'granted') {
          setHasPermission(true);
          await NativeCameraView.start({});
          document.body.classList.add('camera-running');
        } else {
          const request = await NativeCameraView.requestPermissions();
          if (request.camera === 'granted') {
            setHasPermission(true);
            startNativeCamera();
          } else {
            setHasPermission(false);
          }
        }
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

  // Web camera setup
  useEffect(() => {
    if (isNative) return;

    const setupCamera = async () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      try {
        const constraints: MediaStreamConstraints = {
          video: { deviceId: activeCameraId ? { exact: activeCameraId } : undefined },
        };
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(newStream);
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
        setHasPermission(false);
      }
    };

    setupCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [isNative, activeCameraId]);

  const switchCamera = () => {
    if (isNative) {
      NativeCameraView.flipCamera();
    } else {
      if (cameras.length > 1) {
        const currentIndex = cameras.findIndex(c => c.deviceId === activeCameraId);
        const nextIndex = (currentIndex + 1) % cameras.length;
        setActiveCameraId(cameras[nextIndex].deviceId);
      }
    }
  };

  const cycleZoom = () => {
    if (isNative || zoomLevels.length <= 1) return;
    
    const currentIndex = zoomLevels.indexOf(zoom);
    const nextIndex = (currentIndex + 1) % zoomLevels.length;
    const newZoom = zoomLevels[nextIndex];
    setZoom(newZoom);

    const videoTrack = stream?.getVideoTracks()[0];
    if (videoTrack && capabilities?.zoom) {
      videoTrack.applyConstraints({ advanced: [{ zoom: newZoom }] });
    }
  };

  const handleTakePhoto = async () => {
    if (!activeRoll || activeRoll.is_completed) {
      setShowFilmModal(true);
      return;
    }

    let imageBlob: Blob | null = null;

    if (isNative) {
      try {
        const result = await NativeCameraView.capture({ quality: 90 });
        const base64Response = await fetch(`data:image/jpeg;base64,${result.photo}`);
        imageBlob = await base64Response.blob();
      } catch (e) {
        console.error(e);
      }
    } else {
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
    }

    if (imageBlob) {
      const metadata = {
        iso: cameraMode === 'pro' && !isNative ? manualSettings.iso : 400,
        shutterSpeed: cameraMode === 'pro' && !isNative ? formatShutterSpeed(manualSettings.shutterSpeed) : '1/125',
        zoom: `${zoom}x`,
      };
      await takePhoto(imageBlob, metadata);
    }
  };

  const capacityOptions = useMemo(() => [
    { shots: 4, name: 'Mini', price: 0 },
    { shots: 12, name: 'Short', price: 1 },
    { shots: 24, name: 'Standard', price: 2 },
    { shots: 36, name: 'Large', price: 3 },
    { shots: 64, name: 'Bulk', price: 5 },
  ], []);

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

  // Redesigned camera central button UI
  const CameraButton = ({ onClick, disabled }: { onClick: () => void; disabled?: boolean; }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label="Take Photo"
      className="relative w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-95 disabled:opacity-60"
    >
      {/* Gradient ring */}
      <span className="absolute inset-0 rounded-full" style={{
        background: 'conic-gradient(from 180deg at 50% 50%, rgba(246,174,85,0.95), rgba(233,138,67,0.95), rgba(212,106,46,0.95))',
        filter: 'blur(8px)',
        opacity: 0.95,
        transform: 'scale(1.16)'
      }} />
      {/* inner white button */}
      <span className="absolute w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
        <span className="w-12 h-12 rounded-full bg-white/98 border border-white/40" />
      </span>
      {/* small badge showing film type */}
      {activeRoll && (
        <span className="absolute -bottom-7 bg-gray-900/80 px-2 py-1 rounded-full text-xs text-white flex items-center gap-2">
          <Film className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-xs">{activeRoll.film_type}</span>
        </span>
      )}
    </button>
  );

  return (
    <div className={`h-screen flex flex-col overflow-hidden text-white camera-modal ${isNative ? 'bg-transparent' : 'bg-black'}`}>
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
        <div className={`w-full h-full max-w-full max-h-full ${aspectRatioClass} relative ${isNative ? 'bg-transparent' : 'bg-black'} overflow-hidden flex items-center justify-center`}>
          {!isNative && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover transition-transform duration-300 ${isFrontCamera ? 'transform -scale-x-100' : ''}`}
            />
          )}
        </div>
      </div>

      <div className="bg-gray-900 pb-safe select-none flex-shrink-0 flex flex-col justify-center h-[30vh] min-h-[240px] max-h-[300px]">
        <div className="flex flex-col items-center justify-center">
          {cameraMode === 'pro' && !isNative && (
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
                {activeProControl === 'iso' && capabilities?.iso && <RangeSelector options={Array.from({length:20}).map((_,i)=>capabilities.iso!.min + (capabilities.iso!.max - capabilities.iso!.min) * (i/(19)))} value={manualSettings.iso} onChange={v => setManualSettings({...manualSettings, iso: v as number})} type="iso" />}
                {activeProControl === 'shutterSpeed' && capabilities?.exposureTime && <RangeSelector options={Array.from({length:20}).map((_,i)=>parseFloat((capabilities.exposureTime!.min + (capabilities.exposureTime!.max - capabilities.exposureTime!.min) * (i/19)).toPrecision(2)))} value={manualSettings.shutterSpeed} onChange={v => setManualSettings({...manualSettings, shutterSpeed: v as number})} type="shutterSpeed" />}
                {activeProControl === 'focus' && capabilities?.focusDistance && <RangeSelector options={Array.from({length:20}).map((_,i)=>capabilities.focusDistance!.min + (capabilities.focusDistance!.max - capabilities.focusDistance!.min) * (i/19))} value={manualSettings.focus} onChange={v => setManualSettings({...manualSettings, focus: v as number})} type="focus" />}
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

            {/* Center: Camera Button */}
            <div className="flex-shrink-0">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center space-x-6 font-sans text-base">
                  <button onClick={() => setCameraMode('simple')} className={cameraMode === 'simple' ? 'text-amber-400 font-bold' : 'text-white'}>PHOTO</button>
                  {!isNative && <button onClick={() => setCameraMode('pro')} className={cameraMode === 'pro' ? 'text-amber-400 font-bold' : 'text-white'}>PRO</button>}
                </div>

                <div className="relative flex items-center justify-center mt-3">
                  <CameraButton onClick={handleTakePhoto} disabled={false} />
                </div>
              </div>
            </div>

            {/* Right: Quick actions (zoom & quick post) */}
            <div className="flex-1 flex justify-end items-center space-x-2">
              <button onClick={cycleZoom} disabled={isNative || zoomLevels.length <= 1} className="w-12 h-12 rounded-full bg-neutral-800 text-white flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-50">
                {!isNative && `${zoom.toFixed(1)}x`}
              </button>
              <button onClick={switchCamera} disabled={!isNative && cameras.length <= 1} className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-50">
                <RefreshCw className="w-6 h-6 text-white" />
              </button>
              <button onClick={() => setShowRollSelector(true)} className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-gray-900 hover:bg-amber-600 transition-colors" title="Quick Post">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showFilmModal && <FilmSelectionModal capacityOptions={capacityOptions} onStartRoll={startNewRoll} onClose={() => setShowFilmModal(false)} />}

      {showRollSelector && (
        <RollSelector
          rolls={completedRolls.filter(r => r.is_completed && (r.developed_at || r.completed_at))}
          albums={albums}
          onSelect={(roll) => {
            setShowRollSelector(false);
            // open CreatePostModal quickly by setting current view to community and opening modal
            // For now call a simple flow: navigate to community and open CreatePostModal via App-level controls
            // We'll trigger posting screen by setting currentView to community and letting user continue there.
            setCurrentView('community');
            // Slight delay to allow community to mount — not ideal, but functional for now
            setTimeout(() => {
              // if the app had a global modal manager we would open it; as a fallback, set location hash
              const evt = new CustomEvent('filmique.openCreatePostWithRoll', { detail: { rollId: roll.id } });
              window.dispatchEvent(evt);
            }, 300);
          }}
          onClose={() => setShowRollSelector(false)}
        />
      )}
    </div>
  );
};

export default CameraView;