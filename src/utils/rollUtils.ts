import { Roll } from '../context/AppContext';

// A roll is considered "developed" if the development period has passed.
export const isRollDeveloped = (roll: Roll): boolean => {
  if (!roll.is_completed || !roll.completed_at) {
    return false;
  }
  if (roll.developed_at) {
    return true;
  }
  const completedTime = new Date(roll.completed_at).getTime();
  // 7 days for printed rolls, 3 days for digital-only
  const developmentPeriod = roll.is_printed
    ? 7 * 24 * 60 * 60 * 1000
    : 3 * 24 * 60 * 60 * 1000;
  return new Date().getTime() >= completedTime + developmentPeriod;
};

// A roll is "developing" if it's completed but not yet developed.
export const isRollDeveloping = (roll: Roll): boolean => {
  return roll.is_completed && !isRollDeveloped(roll);
};