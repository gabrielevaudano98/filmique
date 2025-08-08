import { Roll } from '../context/AppContext';

// A roll is considered "developed" if it has a developed_at timestamp,
// OR if 36 hours have passed since it was completed.
export const isRollDeveloped = (roll: Roll): boolean => {
  if (!roll.is_completed || !roll.completed_at) {
    return false;
  }
  if (roll.developed_at) {
    return true;
  }
  const completedTime = new Date(roll.completed_at).getTime();
  const developmentPeriod = 36 * 60 * 60 * 1000; 
  return new Date().getTime() >= completedTime + developmentPeriod;
};

// A roll is "developing" if it's completed but not yet developed.
export const isRollDeveloping = (roll: Roll): boolean => {
  return roll.is_completed && !isRollDeveloped(roll);
};