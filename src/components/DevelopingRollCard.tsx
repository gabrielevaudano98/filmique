import React, { useState, useEffect, useRef } from 'react';
import { Roll } from '../types';
import { useAppContext } from '../context/AppContext';
import { Clock, Zap } from 'lucide-react';
import NegativePhoto from './NegativePhoto';
import FilmCanisterIcon from './FilmCanisterIcon';
import { formatDuration } from '../utils/time';
import { getPhotoAsWebViewPath } from '../utils/fileStorage';
import { LocalPhoto, LocalRoll } from '../integrations/db';
import SyncStatusIcon from './SyncStatusIcon';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const DEVELOPMENT_TIME_MS = 36 * 60 * 60 * 1000;
const SPEED_UP_COST = 25;

const DevelopingRollCard: React.FC<{ roll: Roll }> = ({ roll: baseRoll }) => {
  const { filmStocks, developRoll, speedUpDevelopment } = useAppContext();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState(0);
  const [photoSrcs, setPhotoSrcs] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const roll = baseRoll as LocalRoll;

  useEffect(() => {
    const loadPhotoSrcs = async () => {
      if (roll.photos) {
        const srcs: Record<string, string> = {};
        for (const photo of roll.photos) {
          const localPhoto = photo as LocalPhoto;
          if (localPhoto.local_path) {
            srcs[photo.id] = await getPhotoAsWebViewPath(localPhoto.local_path);
          }
        }
        setPhotoSrcs(srcs);
      }
    };
    loadPhotoSrcs();
  }, [roll.photos]);

  useEffect(() => {
    if (!roll.completed_at) return;

    const calculateProgress = () => {
      const completedTime = new Date(roll.completed_at!).getTime();
      const now = new Date().getTime();
      const elapsed = now - completedTime;
      const remaining = DEVELOPMENT_TIME_MS - elapsed;
      
      setTimeRemaining(remaining);
      setProgress(Math.min(100, (elapsed / DEVELOPMENT_TIME_MS) * 100));
    };

    calculateProgress();
    const interval = setInterval(calculateProgress, 1000 * 60); // Update every minute

    return () => clearInterval(interval);
  }, [roll.completed_at]);

  const filmStripBg = `url("data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='200' height='100' viewBox='0 0 200 100'>
      <defs>
        <linearGradient id='grad' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stop-color='%23a65a2b'/>
          <stop offset='100%' stop-color='%235a2b12'/>
        </linearGradient>
        <pattern id='grain' patternUnits='userSpaceOnUse' width='4' height='4'>
          <rect width='4' height='4' fill='rgba(0,0,0,0.05)'/>
          <circle cx='1' cy='1' r='0.5' fill='rgba(255,255,255,0.04)'/>
        </pattern>
      </defs>
      <rect width='200' height='100' fill='url(%23grad)'/>
      <rect width='200' height='100' fill='url(%23grain)'/>
      <!-- sprocket holes top -->
      ${Array.from({ length: 10 }).map((_,i) =>
        `<rect x='${i*20+4}' y='5' rx='2' ry='2' width='12' height='8' fill='%23000' fill-opacity='0.85'/>`
      ).join('')}
      <!-- sprocket holes bottom -->
      ${Array.from({ length: 10 }).map((_,i) =>
        `<rect x='${i*20+4}' y='87' rx='2' ry='2' width='12' height='8' fill='%23000' fill-opacity='0.85'/>`
      ).join('')}
    </svg>
  `)}")`;

  const filmStock = filmStocks.find(fs => fs.name === roll.film_type);
  const isReadyToDevelop = progress >= 100;

  return (
    <>
      <div className="bg-neutral-800/70 rounded-xl overflow-hidden border border-neutral-700/50 shadow-lg">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-neutral-700/50">
          <div className="flex items-center gap-3">
            <FilmCanisterIcon filmType={roll.film_type} imageUrl={filmStock?.roll_image_url} className="h-10 w-auto" />
            <div>
              <h4 className="font-bold text-white truncate">{roll.title || roll.film_type}</h4>
              <p className="text-xs text-gray-400">{roll.shots_used} photos</p>
            </div>
          </div>
          <SyncStatusIcon status={roll.sync_status} />
        </div>

        {/* Main Content */}
        <div className="p-4 flex flex-col items-center gap-4">
          <div className="text-center">
            <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
              {isReadyToDevelop ? 'Ready' : 'Time Remaining'}
            </p>
            <p className="text-3xl font-bold text-white">{formatDuration(timeRemaining)}</p>
          </div>
          
          <div className="w-full bg-neutral-700 rounded-full h-1.5">
            <div
              className="bg-cyan-400 h-1.5 rounded-full transition-transform duration-1000 origin-left"
              style={{ transform: `scaleX(${progress / 100})` }}
            ></div>
          </div>

          {isReadyToDevelop ? (
            <button 
              onClick={() => developRoll(roll)}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Develop Now</span>
            </button>
          ) : (
            <button 
              onClick={() => setShowConfirm(true)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Speed Up for {SPEED_UP_COST} Credits</span>
            </button>
          )}
        </div>

        {/* Film Strip */}
        <div
          className="overflow-x-auto no-scrollbar py-3"
          style={{
            backgroundImage: filmStripBg,
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'auto 100%',
          }}
        >
          <div className="flex space-x-2 px-4 items-center">
            {roll.photos && roll.photos.length > 0 ? (
              roll.photos.map(photo => (
                photoSrcs[photo.id] ? (
                  <NegativePhoto
                    key={photo.id}
                    src={photoSrcs[photo.id]}
                    className="h-24 w-auto rounded-sm object-cover bg-neutral-700 shrink-0"
                  />
                ) : (
                  <div key={photo.id} className="h-24 w-auto aspect-square rounded-sm bg-neutral-700 shrink-0" />
                )
              ))
            ) : (
              <div className="h-24 flex items-center justify-center text-gray-400 text-sm px-4 shrink-0">
                No photos in this roll.
              </div>
            )}
          </div>
        </div>
      </div>
      {showConfirm && (
        <ConfirmDeleteModal
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={() => {
                speedUpDevelopment(roll);
                setShowConfirm(false);
            }}
            title="Speed Up Development"
            message={`Are you sure you want to spend ${SPEED_UP_COST} credits to finish development immediately?`}
            confirmText="Yes, Speed Up"
        />
      )}
    </>
  );
};

export default DevelopingRollCard;