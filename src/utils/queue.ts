import { Preferences } from '@capacitor/preferences';
import { QueuedAction } from '../types';
import * as api from '../services/api';

const QUEUE_KEY = 'filmique_action_queue';

export const addActionToQueue = async (action: QueuedAction) => {
  const { value } = await Preferences.get({ key: QUEUE_KEY });
  const queue: QueuedAction[] = value ? JSON.parse(value) : [];
  queue.push(action);
  await Preferences.set({ key: QUEUE_KEY, value: JSON.stringify(queue) });
};

export const processActionQueue = async () => {
  const { value } = await Preferences.get({ key: QUEUE_KEY });
  if (!value) return { success: true, processedCount: 0 };

  let queue: QueuedAction[] = JSON.parse(value);
  if (queue.length === 0) return { success: true, processedCount: 0 };

  let processedCount = 0;
  const failedActions: QueuedAction[] = [];

  for (const action of queue) {
    let success = false;
    try {
      switch (action.type) {
        case 'like':
          await api.likePost(action.payload.userId, action.payload.postId);
          success = true;
          break;
        case 'unlike':
          await api.unlikePost(action.payload.userId, action.payload.postId);
          success = true;
          break;
        case 'follow':
          await api.followUser(action.payload.followerId, action.payload.followingId);
          success = true;
          break;
        case 'unfollow':
          await api.unfollowUser(action.payload.followerId, action.payload.followingId);
          success = true;
          break;
        case 'addComment':
          await api.addComment(action.payload.userId, action.payload.postId, action.payload.content);
          success = true;
          break;
      }
    } catch (error) {
      console.error(`Failed to process queued action: ${action.type}`, error);
    }

    if (success) {
      processedCount++;
    } else {
      failedActions.push(action);
    }
  }

  // Save any actions that failed back to the queue
  await Preferences.set({ key: QUEUE_KEY, value: JSON.stringify(failedActions) });

  return { success: failedActions.length === 0, processedCount };
};