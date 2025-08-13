import { useState, useEffect, useCallback, useRef } from 'react';
import { addToQueue, getNextFromQueue, removeFromQueue } from '../utils/db';
import * as api from '../services/api';
import { supabase } from '../integrations/supabase/client';

export const usePhotoQueue = (profile: any) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const workerRef = useRef<Worker>();

  useEffect(() => {
    workerRef.current = new Worker(new URL('../photo.worker.ts', import.meta.url), { type: 'module' });
    
    workerRef.current.onmessage = async (event) => {
      const { status, fullBlob, thumbBlob, width, height, error, queueItem } = event.data;
      
      if (status === 'success') {
        try {
          const fileId = crypto.randomUUID();
          const fullPath = `photos/${queueItem.userId}/${queueItem.rollId}/${fileId}.jpeg`;
          const thumbPath = `photos/${queueItem.userId}/${queueItem.rollId}/thumbnails/${fileId}_thumb.jpeg`;

          await api.uploadPhotoToStorage(fullPath, fullBlob, 'image/jpeg');
          await api.uploadPhotoToStorage(thumbPath, thumbBlob, 'image/jpeg');

          const { data: fullUrlData } = api.getPublicUrl('photos', fullPath);
          const { data: thumbUrlData } = api.getPublicUrl('photos', thumbPath);

          await api.createPhotoRecord(
            queueItem.userId,
            queueItem.rollId,
            fullUrlData.publicUrl,
            thumbUrlData.publicUrl,
            { ...queueItem.metadata, width, height }
          );

          await removeFromQueue(queueItem.id);
        } catch (uploadError) {
          console.error("Upload failed, will retry later:", uploadError);
        }
      } else {
        console.error("Processing failed:", error);
      }

      setIsProcessing(false);
      processQueue(); // Try to process the next item
    };

    // Start processing on mount
    processQueue();

    return () => {
      workerRef.current?.terminate();
    };
  }, [profile]); // Re-init if profile changes

  const processQueue = useCallback(async () => {
    if (isProcessing || !navigator.onLine) {
      return;
    }

    const nextItem = await getNextFromQueue();
    if (!nextItem) {
      return;
    }

    setIsProcessing(true);
    
    // Pass the full queue item to the worker so it can be returned
    workerRef.current?.postMessage({ 
      imageBlob: nextItem.imageBlob,
      queueItem: {
        id: nextItem.id,
        userId: nextItem.userId,
        rollId: nextItem.rollId,
        metadata: nextItem.metadata
      }
    });
  }, [isProcessing]);

  useEffect(() => {
    window.addEventListener('online', processQueue);
    return () => {
      window.removeEventListener('online', processQueue);
    };
  }, [processQueue]);

  const addPhotoToQueue = useCallback(async (imageBlob: Blob, metadata: any, userId: string, rollId: string, filmName: string) => {
    const item = {
      id: crypto.randomUUID(),
      imageBlob,
      metadata,
      userId,
      rollId,
      filmName,
      timestamp: Date.now(),
    };
    await addToQueue(item);
    processQueue(); // Kick off processing immediately if not already running
  }, [processQueue]);

  return { addPhotoToQueue, processQueue };
};