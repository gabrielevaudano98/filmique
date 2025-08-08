import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { CameraView as NativeCameraView } from 'capacitor-camera-view';
import { RefreshCw, Film, Lock, Camera } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import FilmSelectionModal from './FilmSelectionModal';
import RangeSelector from './RangeSelector';

type ProControl = 'iso' | 'shutterSpeed' | 'focus';

// Helper to format shutter speed for display
const formatShutterSpeed = (seconds: number): string => {
  if (seconds >= 1) return `${seconds}"`;
  return `1/${Math.round(1 / seconds)}`;
};

const CameraView: React.FC = () => {
  const {
    cameraMode,
    setCameraMode,
    activeRoll,
    profile,
    startNewRoll,
    showFilmModal,
    setShowFilmModal,
    takePhoto,
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
    shutterSpeed: 1 / 125, // Stored as seconds
    focus: 1, // Stored as meters
  });

  const [debugLabel, setDebugLabel] = useState('Initializing...');

  const updateDebug = (message: string) => {
    console.log(`[CameraView Debug] ${message}`);
    setDebugLabel(message);
  };

  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    setIsNative(native);
    updateDebug(`Platform detected: ${native ? 'Native' : 'Web'}`);
  }, []);

  // Effect for NATIVE camera
  useEffect(() => {
    if (!isNative) return;
    updateDebug('Native camera effect triggered.');

    const startNativeCamera = async () => {
      updateDebug('Starting native camera setup...');
      
      try {
        updateDebug('Checking native permissions...');
        const permissions = await NativeCameraView.checkPermissions();
        updateDebug(`Initial permission status: ${permissions.camera}`);

        if (permissions.camera === 'granted') {
          setHasPermission(true);
          updateDebug('Permission already granted. Starting camera...');
          await NativeCameraView.start({});
          document.body.classList.add('camera-running');
          updateDebug('Native camera started and body class added.');
        } else {
          updateDebug('Requesting camera permissions...');
          const request = await NativeCameraView.requestPermissions();
          updateDebug(`Permission request result: ${request.camera}`);
          if (request.camera === 'granted') {
            setHasPermission(true);
            updateDebug('Permission granted after request. Restarting camera setup.');
            startNativeCamera(); // Recurse to start camera
          } else {
            setHasPermission(false);
            updateDebug('Permission denied.');
          }
        }
      } catch (e) {
        updateDebug(`Error in native camera setup: ${e}`);
      }
    };

    startNativeCamera();

    return () => {
      updateDebug('Cleaning up native camera effect.');
      document.body.classList.remove('camera-running');
      NativeCameraView.stop().then(() => updateDebug('Native camera stopped.'));
      updateDebug('Body class removed.');
    };
  }, [isNative]);

  // Effect for WEB camera
  useEffect(() => {
    if (isNative) return;
    updateDebug('Web camera effect triggered.');

    const setupCamera = async () => {
      updateDebug('Setting up web camera...');
      if (stream) {
        updateDebug('Stopping existing stream.');
        stream.getTracks().forEach(track => track.stop());
      }

      try {
        const constraints: MediaStreamConstraints = {
          video: { deviceId: activeCameraId ? { exact: activeCameraId } : undefined },
        };
        updateDebug(`Requesting media with constraints: ${JSON.stringify(constraints)}`);
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        updateDebug('Got user media stream.');
        setStream(newStream);
        setHasPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          updateDebug('Stream attached to video element.');
        }

        const videoTrack = newStream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        updateDebug(`Video track settings: ${JSON.stringify(settings)}`);
        setIsFrontCamera(settings.facingMode === 'user');

        const trackCapabilities = videoTrack.getCapabilities();
        setCapabilities(trackCapabilities);
        updateDebug(`Track capabilities: ${JSON.stringify(trackCapabilities)}`);

        if (trackCapabilities.zoom?.max && trackCapabilities.zoom.max > 1) {
          const { min, max } = trackCapabilities.zoom;
          const levels = [min, min + (max - min) * 0.25, min + (max - min) * 0.5, min + (max - min) * 0.75, max].map(z => parseFloat(z.toFixed(1)));
          setZoomLevels(levels);
          setZoom(min);
          updateDebug(`Zoom levels set: ${JSON.stringify(levels)}`);
        } else {
          setZoomLevels([1]);
          setZoom(1);
          updateDebug('Zoom not supported or max zoom is 1.');
        }

        if (cameras.length === 0) {
          updateDebug('Enumerating devices...');
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(d => d.kind === 'videoinput');
          setCameras(videoDevices);
          updateDebug(`Found ${videoDevices.length} video devices.`);
          if (!activeCameraId && videoDevices.length > 0) {
            setActiveCameraId(videoDevices[0].deviceId);
            updateDebug(`Set active camera to first device: ${videoDevices[0].deviceId}`);
          }
        }
      } catch (err) {
        updateDebug(`Error accessing web camera: ${err}`);
        setHasPermission(false);
      }
    };

    setupCamera();

    return () => {
      updateDebug('Cleaning up web camera effect.');
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [isNative, activeCameraId]);

  const switchCamera = () => {
    updateDebug('switchCamera called.');
    if (isNative) {
      updateDebug('Flipping native camera.');
      NativeCameraView.flipCamera();
    } else {
      if (cameras.length > 1) {
        const currentIndex = cameras.findIndex(c => c.deviceId === activeCameraId);
        const nextIndex = (currentIndex + 1) % cameras.length;
        updateDebug(`Switching web camera from index ${currentIndex} to ${nextIndex}`);
        setActiveCameraId(cameras[nextIndex].deviceId);
      } else {
        updateDebug('Cannot switch web camera, only one device found.');
      }
    }
  };

  const cycleZoom = () => {
    updateDebug('cycleZoom called.');
    if (isNative) {
      updateDebug('Zoom not supported on native.');
      return;
    }
    if (zoomLevels.length > 1) {
      const currentIndex = zoomLevels.indexOf(zoom);
      const nextIndex = (currentIndex + 1) % zoomLevels.length;
      const newZoom = zoomLevels[nextIndex];
      setZoom(newZoom);
      updateDebug(`Cycling zoom to ${newZoom}`);

      const videoTrack = stream?.getVideoTracks()[0];
      if (videoTrack && capabilities?.zoom) {
        videoTrack.applyConstraints({ advanced: [{ zoom: newZoom }] });
        updateDebug('Applied zoom constraint to video track.');
      }
    }
  };

  const handleTakePhoto = async () => {
    updateDebug('handleTakePhoto called.');
    if (!activeRoll || activeRoll.is_completed) {
      updateDebug('No active roll or roll completed. Showing film modal.');
      setShowFilmModal(true);
      return;
    }

    let imageBlob: Blob | null = null;
    updateDebug(`Capturing photo on ${isNative ? 'native' : 'web'} platform.`);

    if (isNative) {
      try {
        const result = await NativeCameraView.capture({ quality: 90 });
        updateDebug('Native capture successful. Converting base64 to blob.');
        const base64Response = await fetch(`data:image/jpeg;base64,${result.photo}`);
        imageBlob = await base64Response.blob();
        updateDebug(`Blob created, size: ${imageBlob.size} bytes.`);
      } catch (e) {
        updateDebug(`Error during native capture: ${e}`);
      }
    } else {
      if (!videoRef.current || !canvasRef.current) {
        updateDebug("Error: Video or canvas ref not available for web capture.");
        return;
      }
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        if (isFrontCamera) {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        updateDebug('Drew video frame to canvas.');
      }
      await new Promise<void>(resolve => {
        canvas.toBlob(blob => {
          imageBlob = blob;
          updateDebug(`Web blob created, size: ${blob?.size || 0} bytes.`);
          resolve();
        }, 'image/jpeg', 0.9);
      });
    }

    if (imageBlob) {
      updateDebug('Image blob is available. Preparing metadata.');
      const metadata = {
        iso: cameraMode === 'pro' && !isNative ? manualSettings.iso : 400,
        aperture: 'N/A',
        shutterSpeed: cameraMode === 'pro' && !isNative ? formatShutterSpeed(manualSettings.shutterSpeed) : '1/125',
        focal: cameraMode === 'pro' && !isNative ? `${manualSettings.focus}m` : 'auto',
        zoom: `${zoom}x`,
        timestamp: new Date().toISOString(),
      };
      updateDebug(`Metadata: ${JSON.stringify(metadata)}`);
      updateDebug('Calling takePhoto context function...');
      await takePhoto(imageBlob, metadata);
      updateDebug('takePhoto context function finished.');
    } else {
      updateDebug('Failed to create image blob. Photo not taken.');
    }
  };

  const filmTypes = useMemo(() => {
    if (!profile) return [];
    return [
      { name: 'Kodak Gold 200', capacity: 24, price: 0, unlocked: true },
      { name: 'Kodak Portra 400', capacity: 36, price: 0, unlocked: true },
      { name: 'Ilford HP5 Plus', capacity: 36, price: 5, unlocked: profile.level >= 3 },
      { name: 'Kodak Tri-X 400', capacity: 36, price: 5, unlocked: profile.level >= 5 },
    ];
  }, [profile]);

  const capacityOptions = useMemo(() => [
    { shots: 4, name: 'Mini', price: 0 },
    { shots: 12, name: 'Short', price: 1 },
    { shots: 24, name: 'Standard', price: 2 },
    { shots: 36, name: 'Large', price: 3 },
    { shots: 64, name: 'Bulk', price: 5 },
  ], []);

  useEffect(() => {
    if (!activeRoll && !showFilmModal) {
      updateDebug('No active roll found, forcing film selection modal.');
      setShowFilmModal(true);
    }
  }, [activeRoll, showFilmModal, setShowFilmModal]);

  const proControls = [
    capabilities?.iso && { id: 'iso', label: 'ISO', value: manualSettings.iso },
    capabilities?.exposureTime && { id: 'shutterSpeed', label: 'S', value: formatShutterSpeed(manualSettings.shutterSpeed) },
    capabilities?.focusDistance && { id: 'focus', label: 'F', value: `${manualSettings.focus}m` },
  ].filter(Boolean) as { id: ProControl; label: string; value: string | number }[];

  const generateNumericOptions = (min: number, max: number, steps: number) => {
    const options = [];
    const step = (max - min) / (steps - 1);
    for (let i = 0; i < steps; i++) {
      options.push(min + i * step);
    }
    return options;
  };

  if (hasPermission === null) {
    return <div className="flex-1 flex items-center justify-center bg-black text-white">Initializing Camera...</div>;
  }
  if (hasPermission === false) {
    return <div className="flex-1 flex items-center justify-center bg-black text-red-400 p-4 text-center">Camera access denied. Please enable camera permissions in your browser or device settings.</div>;
  }

  return (
    <div className={`flex-1 flex flex-col overflow-hidden text-white camera-modal ${isNative ? '' : 'bg-black'}`}>
      <div className="absolute top-20 left-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded-md z-50 max-w-xs">
        Debug: {debugLabel}
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
      <div className="flex-1 relative flex items-center justify-center">
        {!isNative && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover transition-transform duration-300 ${isFrontCamera ? 'transform -scale-x-100' : ''}`}
          />
        )}
        {activeRoll && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black bg-opacity-30 rounded-full px-3 py-1 text-xs font-mono">
            {activeRoll.film_type} &middot; {activeRoll.shots_used}/{activeRoll.capacity}
          </div>
        )}
      </div>

      <div className={`${isNative ? '' : 'bg-black bg-opacity-50'} pt-4 pb-safe select-none`}>
        <div className="flex flex-col items-center space-y-3">
          {cameraMode === 'pro' && !isNative && (
            <div className="w-full flex flex-col items-center gap-2 px-2 min-h-[80px]">
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

          <div className="w-full flex items-center justify-between px-6 mt-6">
            <button onClick={cycleZoom} disabled={isNative || zoomLevels.length <= 1} className="w-10 h-10 rounded-full bg-neutral-800 text-white flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-50">
              {!isNative && `${zoom.toFixed(1)}x`}
            </button>

            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center justify-center space-x-6 font-sans text-base py-4">
                <button onClick={() => setCameraMode('simple')} className={cameraMode === 'simple' ? 'text-amber-400 font-bold' : 'text-white'}>PHOTO</button>
                {!isNative && <button onClick={() => setCameraMode('pro')} className={cameraMode === 'pro' ? 'text-amber-400 font-bold' : 'text-white'}>PRO</button>}
              </div>
              <div className="w-[88px] h-[88px] bg-neutral-800 rounded-full flex items-center justify-center ring-4 ring-neutral-700 mb-4">
                <button onClick={handleTakePhoto} disabled={activeRoll?.is_completed} aria-label="Take Photo" className="w-20 h-20 rounded-full bg-white flex items-center justify-center transition-transform active:scale-95 disabled:bg-gray-200">
                  {activeRoll?.is_completed && <Lock className="w-8 h-8 text-gray-500" />}
                </button>
              </div>
            </div>

            <button onClick={switchCamera} disabled={!isNative && cameras.length <= 1} className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-50">
              <RefreshCw className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {showFilmModal && <FilmSelectionModal filmTypes={filmTypes} capacityOptions={capacityOptions} onStartRoll={startNewRoll} onClose={() => setShowFilmModal(false)} />}
    </div>
  );
};

export default CameraView;