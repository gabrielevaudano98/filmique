import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { Image } from "https://esm.sh/imagescript@1.2.16";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FULL_LONG_EDGE = 1920;
const PREVIEW_LONG_EDGE = 1080;
const THUMB_LONG_EDGE = 400;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { image, userId, rollId } = await req.json();
    
    if (!image || !userId || !rollId) {
      throw new Error("Missing required parameters: image, userId, or rollId");
    }

    const base64 = image.split(',')[1];
    const decodedImage = atob(base64);
    const imageBuffer = new Uint8Array(decodedImage.length);
    for (let i = 0; i < decodedImage.length; i++) {
      imageBuffer[i] = decodedImage.charCodeAt(i);
    }

    const originalImage = await Image.decode(imageBuffer);
    const { width: originalWidth, height: originalHeight } = originalImage;

    // Create copies for each size to process independently
    const fullImage = originalImage.clone();
    const previewImage = originalImage.clone();
    const thumbImage = originalImage.clone();

    // Process full-size image
    fullImage.resize(originalWidth > originalHeight ? FULL_LONG_EDGE : Image.RESIZE_AUTO, originalHeight > originalWidth ? FULL_LONG_EDGE : Image.RESIZE_AUTO);
    const fullJpeg = await fullImage.encodeJPEG(90);
    
    // Process preview-size image
    previewImage.resize(originalWidth > originalHeight ? PREVIEW_LONG_EDGE : Image.RESIZE_AUTO, originalHeight > originalWidth ? PREVIEW_LONG_EDGE : Image.RESIZE_AUTO);
    const previewJpeg = await previewImage.encodeJPEG(85);

    // Process thumbnail
    thumbImage.resize(originalWidth > originalHeight ? THUMB_LONG_EDGE : Image.RESIZE_AUTO, originalHeight > originalWidth ? THUMB_LONG_EDGE : Image.RESIZE_AUTO);
    const thumbJpeg = await thumbImage.encodeJPEG(75);

    const fileId = crypto.randomUUID();
    const basePath = `photos/${userId}/${rollId}`;
    const fullPath = `${basePath}/full/${fileId}.jpeg`;
    const previewPath = `${basePath}/preview/${fileId}_preview.jpeg`;
    const thumbPath = `${basePath}/thumbnail/${fileId}_thumb.jpeg`;

    // Upload all three images in parallel
    const [fullResult, previewResult, thumbResult] = await Promise.all([
      supabase.storage.from('photos').upload(fullPath, fullJpeg, { contentType: 'image/jpeg', upsert: true }),
      supabase.storage.from('photos').upload(previewPath, previewJpeg, { contentType: 'image/jpeg', upsert: true }),
      supabase.storage.from('photos').upload(thumbPath, thumbJpeg, { contentType: 'image/jpeg', upsert: true })
    ]);

    if (fullResult.error) throw fullResult.error;
    if (previewResult.error) throw previewResult.error;
    if (thumbResult.error) throw thumbResult.error;

    const { data: fullUrlData } = supabase.storage.from('photos').getPublicUrl(fullPath);
    const { data: previewUrlData } = supabase.storage.from('photos').getPublicUrl(previewPath);
    const { data: thumbUrlData } = supabase.storage.from('photos').getPublicUrl(thumbPath);

    return new Response(
      JSON.stringify({ 
        url: fullUrlData.publicUrl,
        previewUrl: previewUrlData.publicUrl,
        thumbnailUrl: thumbUrlData.publicUrl,
        width: fullImage.width,
        height: fullImage.height,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})