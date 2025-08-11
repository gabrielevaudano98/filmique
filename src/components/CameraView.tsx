import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { CameraView as NativeCameraView } from 'capacitor-camera-view';
import { useAppContext } from '../context/AppContext';
import FilmSelectionModal from './FilmSelectionModal';
import ValueSelector from './ValueSelector';
import FilmInfo from './FilmInfo';
import ExposureControl from './ExposureControl';
import FocusControl from './FocusControl';
import ShutterControl from './ShutterControl';

const CameraView: React.FC = () => {
  const {
    activeRoll,
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
  const [isFrontCamera, setIsFrontCamera] = useState(false);

  // --- Camera Controls State ---
  const [shutterSpeed, setShutterSpeed] = useState('1/125');
  const [lens, setLens] = useState('1x');
  const [exposure, setExposure] = useState(0);
  const [focus, setFocus] = useState(0.5);
  const [timerOn, setTimerOn] = useState(false);

  const shutterOptions = ['1/30', '1/60', '1/125', '1/250', '1/500', '1/1000'];
  const lensOptions = ['0.5x', '1x', '2x'];

  const frameOptions = useMemo(() => {
    const capacity = activeRoll?.capacity || 0;
    if (capacity === 0) return [0];
    return [...Array(capacity).keys()].map(i => i + 1);
  }, [activeRoll]);

  const currentFrame = activeRoll ? activeRoll.shots_used : 0;

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  // --- Camera Setup (Web & Native) ---
  useEffect(() => {
    const setupCamera = async () => {
      if (isNative) {
        const permissions = await NativeCameraView.checkPermissions();
        if (permissions.camera === 'granted') {
          setHasPermission(true);
          await NativeCameraView.start({});
          document.body.classList.add('camera-running');
        } else {
          setHasPermission(false);
        }
      } else {
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          setStream(newStream);
          setHasPermission(true);
          if (videoRef.current) videoRef.current.srcObject = newStream;
          const settings = newStream.getVideoTracks()[0].getSettings();
          setIsFrontCamera(settings.facingMode === 'user');
        } catch (err) {
          setHasPermission(false);
        }
      }
    };
    setupCamera();
    return () => {
      if (isNative) {
        document.body.classList.remove('camera-running');
        NativeCameraView.stop();
      } else {
        stream?.getTracks().forEach(track => track.stop());
      }
    };
  }, [isNative]);

  // --- Photo Capture ---
  const handleTakePhoto = async () => {
    if (!activeRoll || activeRoll.is_completed) {
      setShowFilmModal(true);
      return;
    }

    let imageBlob: Blob | null = null;

    if (isNative) {
      const result = await NativeCameraView.capture({ quality: 90 });
      const base64Response = await fetch(`data:image/jpeg;base64,${result.photo}`);
      imageBlob = await base64Response.blob();
    } else if (videoRef.current && canvasRef.current) {
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
      }
      imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    }

    if (imageBlob) {
      const metadata = { shutterSpeed, lens, exposure, focus: focus.toFixed(2) };
      await takePhoto(imageBlob, metadata);
    }
  };

  const capacityOptions = useMemo(() => [
    { shots: 12, name: 'Short', price: 1 },
    { shots: 24, name: 'Standard', price: 2 },
    { shots: 36, name: 'Large', price: 3 },
  ], []);

  if (hasPermission === null) return <div className="h-screen w-screen flex items-center justify-center bg-black text-white">Initializing Camera...</div>;
  if (hasPermission === false) return <div className="h-screen w-screen flex items-center justify-center bg-black text-red-400 p-4 text-center">Camera access denied. Please enable camera permissions.</div>;

  return (
    <div className="w-screen h-screen bg-black flex items-stretch justify-center p-4 font-sans text-white overflow-hidden">
      <canvas ref={canvasRef} className="hidden"></canvas>
      
      {/* Left Column */}
      <div className="w-48 flex-shrink-0 flex flex-col gap-4">
        <ValueSelector label="Shutter" options={shutterOptions} value={shutterSpeed} onChange={setShutterSpeed} unit="sec" />
        <ValueSelector label="Lens" options={lensOptions} value={lens} onChange={setLens} unit="mm" />
        <FilmInfo filmName={activeRoll?.film_type || 'None'} iso={100} onClick={() => setShowFilmModal(true)} />
      </div>

      <div className="w-4 flex-shrink-0"></div>

      {/* Center Column */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <ExposureControl value={exposure} onChange={setExposure} />
        <div className={`flex-1 rounded-2xl overflow-hidden relative ${isNative ? 'bg-transparent' : 'bg-neutral-900'}`}>
          {!isNative && (
            <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${isFrontCamera ? 'transform -scale-x-100' : ''}`} />
          )}
        </div>
      </div>

      <div className="w-4 flex-shrink-0"></div>

      {/* Right Column */}
      <div className="w-48 flex-shrink-0 flex flex-col gap-4">
        <ValueSelector label="Frame" options={frameOptions} value={currentFrame} onChange={() => {}} disabled />
        <FocusControl value={focus} onChange={setFocus} />
        <ShutterControl onTakePhoto={handleTakePhoto} timerOn={timerOn} onTimerToggle={() => setTimerOn(!timerOn)} disabled={!activeRoll} />
      </div>

      {showFilmModal && <FilmSelectionModal capacityOptions={capacityOptions} onStartRoll={startNewRoll} onClose={() => setShowFilmModal(false)} />}
    </div>
  );
};

export default CameraView;