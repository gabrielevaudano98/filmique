/**
 * Storage helpers
 *
 * Small helpers to consistently convert between public URLs and storage paths,
 * and to safely compute filenames. Centralizing this logic prevents subtle bugs
 * when deleting files or updating cache-busting query params.
 */

export const extractStoragePathFromPublicUrl = (publicUrl: string): string | null => {
  try {
    // Supabase public URLs typically look like:
    // https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path/to/file>
    const url = new URL(publicUrl);
    const segments = url.pathname.split('/').filter(Boolean);
    // find 'object' then 'public' then bucket and the rest
    const objectIdx = segments.indexOf('object');
    if (objectIdx !== -1 && segments[objectIdx + 1] === 'public') {
      // path segments following 'public' are [bucket, ...path]
      const entry = segments.slice(objectIdx + 2);
      if (entry.length >= 2) {
        // remove bucket and join path
        return entry.slice(1).join('/');
      }
    }

    // Fallback: attempt to find '/storage/v1/object/public/<bucket>/' pattern
    const pubIndex = segments.indexOf('public');
    if (pubIndex !== -1) {
      return segments.slice(pubIndex + 2).join('/');
    }

    return null;
  } catch (e) {
    // Return null on any parse problems; callers should handle null.
    return null;
  }
};

export const filenameFromUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const frag = pathname.split('/').pop() || '';
    return decodeURIComponent(frag);
  } catch {
    // fallback naive
    const parts = url.split('/');
    return parts[parts.length - 1] || 'file';
  }
};