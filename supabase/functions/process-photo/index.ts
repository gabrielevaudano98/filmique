import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { decode } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { Image } from "https://deno.land/x/imagescript@1.2.17/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('--- process-photo: Request received ---');
  console.log(`Method: ${req.method}, URL: ${req.url}`);

  if (req.method === 'OPTIONS') {
    console.log('--- process-photo: Handling OPTIONS preflight request ---');
    return new Response(null, {
      status: 204, // No Content
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();
    console.log('--- process-photo: Parsed request body ---');
    
    const { image, userId, rollId } = body;
    
    if (!image || !userId || !rollId) {
      console.error('--- process-photo: ERROR - Missing required fields ---');
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('--- process-photo: Decoding base64 image... ---');
    const imageContent = decode(image.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''));
    
    console.log('--- process-photo: Creating Supabase admin client... ---');
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('--- process-photo: Processing images (original, preview, thumb)... ---');
    const originalImage = await Image.decode(imageContent);
    const { width, height } = originalImage;

    const previewImage = originalImage.clone().resize(1080, Image.RESIZE_AUTO);
    const previewBuffer = await previewImage.encodeJPEG(90);

    const thumbnailImage = originalImage.clone().resize(400, Image.RESIZE_AUTO);
    const thumbnailBuffer = await thumbnailImage.encodeJPEG(80);

    const timestamp = Date.now();
    const originalPath = `${userId}/${rollId}/${timestamp}_original.jpg`;
    const previewPath = `${userId}/${rollId}/${timestamp}_preview.jpg`;
    const thumbnailPath = `${userId}/${rollId}/${timestamp}_thumbnail.jpg`;

    console.log('--- process-photo: Uploading images to storage... ---');
    const [originalUpload, previewUpload, thumbnailUpload] = await Promise.all([
      supabaseAdmin.storage.from('photos').upload(originalPath, imageContent, { contentType: 'image/jpeg', upsert: true }),
      supabaseAdmin.storage.from('photos').upload(previewPath, previewBuffer, { contentType: 'image/jpeg', upsert: true }),
      supabaseAdmin.storage.from('photos').upload(thumbnailPath, thumbnailBuffer, { contentType: 'image/jpeg', upsert: true }),
    ]);

    if (originalUpload.error) throw originalUpload.error;
    if (previewUpload.error) throw previewUpload.error;
    if (thumbnailUpload.error) throw thumbnailUpload.error;

    console.log('--- process-photo: Getting public URLs... ---');
    const { data: originalUrlData } = supabaseAdmin.storage.from('photos').getPublicUrl(originalPath);
    const { data: previewUrlData } = supabaseAdmin.storage.from('photos').getPublicUrl(previewPath);
    const { data: thumbnailUrlData } = supabaseAdmin.storage.from('photos').getPublicUrl(thumbnailPath);

    console.log('--- process-photo: Successfully processed. Returning URLs. ---');
    return new Response(JSON.stringify({
      url: originalUrlData.publicUrl,
      previewUrl: previewUrlData.publicUrl,
      thumbnailUrl: thumbnailUrlData.publicUrl,
      width,
      height,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('--- process-photo: FATAL ERROR ---', err.message, err.stack);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})