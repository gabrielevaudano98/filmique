import { openDB, DBSchema } from 'idb';

interface PhotoQueueItem {
  id: string;
  imageBlob: Blob;
  metadata: any;
  userId: string;
  rollId: string;
  filmName: string;
  timestamp: number;
}

interface FilmiqueDB extends DBSchema {
  'photo-queue': {
    key: string;
    value: PhotoQueueItem;
  };
}

const dbPromise = openDB<FilmiqueDB>('filmique-db', 1, {
  upgrade(db) {
    db.createObjectStore('photo-queue', { keyPath: 'id' });
  },
});

export async function addToQueue(item: PhotoQueueItem) {
  return (await dbPromise).add('photo-queue', item);
}

export async function getNextFromQueue() {
  const items = await (await dbPromise).getAll('photo-queue');
  if (items.length === 0) return null;
  // Sort by timestamp to process the oldest first
  items.sort((a, b) => a.timestamp - b.timestamp);
  return items[0];
}

export async function removeFromQueue(id: string) {
  return (await dbPromise).delete('photo-queue', id);
}

export async function countQueue() {
  return (await dbPromise).count('photo-queue');
}