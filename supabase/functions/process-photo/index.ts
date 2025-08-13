import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { Image } from "https://esm.sh/imagescript@1.2.16";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TARGET_LONG_EDGE = 1920;
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

    const img = await Image.decode(imageBuffer);

    const originalWidth = img.width;
    const originalHeight = img.height;

    // Process full-size image
    img.resize(originalWidth > originalHeight ? TARGET_LONG_EDGE : Image.RESIZE_AUTO, originalHeight > originalWidth ? TARGET_LONG_EDGE : Image.RESIZE_AUTO);
    const fullJpeg = await img.encodeJPEG(85);
    
    // Process thumbnail
    img.resize(originalWidth > originalHeight ? THUMB_LONG_EDGE : Image.RESIZE_AUTO, originalHeight > originalWidth ? THUMB_LONG_EDGE : Image.RESIZE_AUTO);
    const thumbJpeg = await img.encodeJPEG(75);

    const fileId = crypto.randomUUID();
    const fullPath = `photos/${userId}/${rollId}/${fileId}.jpeg`;
    const thumbPath = `photos/${userId}/${rollId}/thumbnails/${fileId}_thumb.jpeg`;

    const { error: fullError } = await supabase.storage.from('photos').upload(fullPath, fullJpeg, { contentType: 'image/jpeg', upsert: true });
    if (fullError) throw fullError;

    const { error: thumbError } = await supabase.storage.from('photos').upload(thumbPath, thumbJpeg, { contentType: 'image/jpeg', upsert: true });
    if (thumbError) throw thumbError;

    const { data: fullUrlData } = supabase.storage.from('photos').getPublicUrl(fullPath);
    const { data: thumbUrlData } = supabase.storage.from('photos').getPublicUrl(thumbPath);

    return new Response(
      JSON.stringify({ 
        url: fullUrlData.publicUrl,
        thumbnailUrl: thumbUrlData.publicUrl,
        width: img.width,
        height: img.height,
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