/**
 * Small validation utilities used by the app.
 * Keep these focused and side-effect free so they're easy to test.
 */

export const isNonEmptyString = (v: unknown): v is string => {
  return typeof v === 'string' && v.trim().length > 0;
};

export const isEmail = (value: string): boolean => {
  // Simple but robust-enough RFC-5322-ish regex for common email validation.
  // We intentionally keep this client-side validation lightweight — server-side should re-validate.
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return re.test(value);
};

export const clampNumber = (n: number, min: number, max: number) => {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
};