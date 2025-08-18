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

const DEVELOPMENT_TIME_MS = 36 * 60 * 60 * 1000;
const SPEED_UP_COST = 25;

const DevelopingRollCard: React.FC<{ roll: Roll }> = ({ roll: baseRoll }) => {
  const { filmStocks, developRoll, setRollToSpeedUp } = useAppContext();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [photoSrcs, setPhotoSrcs] = useState<Record<string, string>>({});
  const roll = baseRoll as LocalRoll;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const canisterRef = useRef<HTMLDivElement>(null);

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

    const calculateTime = () => {
      const completedTime = new Date(roll.completed_at!).getTime();
      const now = new Date().getTime();
      const elapsed = now - completedTime;
      const remaining = DEVELOPMENT_TIME_MS - elapsed;
      setTimeRemaining(remaining);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000 * 60); // Update every minute

    return () => clearInterval(interval);
  }, [roll.completed_at]);

  const handleParallaxScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (canisterRef.current) {
      const scrollLeft = event.currentTarget.scrollLeft;
      canisterRef.current.style.transform = `translateX(${scrollLeft * 0.6}px)`;
    }
  };

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
  const isReadyToDevelop = timeRemaining <= 0;

  return (
    <div className="bg-warm-800/50 rounded-xl overflow-hidden border border-warm-700/30 shadow-lg">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-white truncate">{roll.film_type}</h4>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-400">{roll.shots_used} photos</p>
              <SyncStatusIcon status={roll.sync_status} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isReadyToDevelop ? (
              <button 
                onClick={() => developRoll(roll)}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Develop</span>
              </button>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm text-cyan-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(timeRemaining)}</span>
                </div>
                <button 
                    onClick={() => setRollToSpeedUp(roll)}
                    className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold py-1 px-2 rounded-full flex items-center space-x-1"
                >
                    <Zap className="w-3 h-3" />
                    <span>{SPEED_UP_COST}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        onScroll={handleParallaxScroll}
        className="overflow-x-auto no-scrollbar py-3"
        style={{
          backgroundImage: filmStripBg,
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'auto 100%',
        }}
      >
        <div className="flex space-x-2 px-4 items-center">
          <div ref={canisterRef} className="z-10">
            <FilmCanisterIcon
              filmType={roll.film_type}
              imageUrl={filmStock?.roll_image_url}
              className="h-24 w-auto shrink-0 mr-1"
            />
          </div>
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
  );
};

export default DevelopingRollCard;