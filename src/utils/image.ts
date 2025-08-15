const SUPABASE_PROJECT_URL = 'https://ewziosmlinxqywlvegee.supabase.co';

interface TransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  resize?: 'cover' | 'contain' | 'fill';
}

export const getTransformedUrl = (publicUrl: string, options: TransformOptions): string => {
  if (!publicUrl || !publicUrl.includes(SUPABASE_PROJECT_URL)) {
    return publicUrl; // Return original if it's not a Supabase URL
  }

  const transformParams = [];
  if (options.width) transformParams.push(`width=${options.width}`);
  if (options.height) transformParams.push(`height=${options.height}`);
  if (options.quality) transformParams.push(`quality=${options.quality}`);
  if (options.resize) transformParams.push(`resize=${options.resize}`);

  if (transformParams.length === 0) {
    return publicUrl;
  }

  const path = publicUrl.split('/public/')[1];
  if (!path) return publicUrl;

  return `${SUPABASE_PROJECT_URL}/storage/v1/render/image/public/${path}?${transformParams.join('&')}`;
};