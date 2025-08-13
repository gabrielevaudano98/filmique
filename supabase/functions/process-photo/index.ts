import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { decode } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { Image } from "https://deno.land/x/imagescript@1.2.17/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse JSON body
    const body = await req.text();
    if (!body) {
      return new Response(JSON.stringify({ error: 'No request body provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const { image, userId, rollId } = JSON.parse(body)
    
    // Validate required fields
    if (!image || !userId || !rollId) {
      return new Response(JSON.stringify({ error: 'Missing required fields: image, userId, rollId' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const imageContent = decode(image.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''))

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const originalImage = await Image.decode(imageContent);
    const { width, height } = originalImage;

    // Create preview (1080px wide)
    const previewImage = originalImage.clone().resize(1080, Image.RESIZE_AUTO);
    const previewBuffer = await previewImage.encodeJPEG(90);

    // Create thumbnail (400px wide)
    const thumbnailImage = originalImage.clone().resize(400, Image.RESIZE_AUTO);
    const thumbnailBuffer = await thumbnailImage.encodeJPEG(80);

    const timestamp = Date.now();
    const originalPath = `${userId}/${rollId}/${timestamp}_original.jpg`;
    const previewPath = `${userId}/${rollId}/${timestamp}_preview.jpg`;
    const thumbnailPath = `${userId}/${rollId}/${timestamp}_thumbnail.jpg`;

    // Upload all three versions
    const [originalUpload, previewUpload, thumbnailUpload] = await Promise.all([
      supabaseAdmin.storage.from('photos').upload(originalPath, imageContent, { contentType: 'image/jpeg', upsert: true }),
      supabaseAdmin.storage.from('photos').upload(previewPath, previewBuffer, { contentType: 'image/jpeg', upsert: true }),
      supabaseAdmin.storage.from('photos').upload(thumbnailPath, thumbnailBuffer, { contentType: 'image/jpeg', upsert: true }),
    ]);

    if (originalUpload.error) {
      console.error('Original upload error:', originalUpload.error);
      throw originalUpload.error;
    }
    if (previewUpload.error) {
      console.error('Preview upload error:', previewUpload.error);
      throw previewUpload.error;
    }
    if (thumbnailUpload.error) {
      console.error('Thumbnail upload error:', thumbnailUpload.error);
      throw thumbnailUpload.error;
    }

    // Get public URLs
    const { data: originalUrlData } = supabaseAdmin.storage.from('photos').getPublicUrl(originalPath);
    const { data: previewUrlData } = supabaseAdmin.storage.from('photos').getPublicUrl(previewPath);
    const { data: thumbnailUrlData } = supabaseAdmin.storage.from('photos').getPublicUrl(thumbnailPath);

    return new Response(JSON.stringify({
      url: originalUrlData.publicUrl,
      previewUrl: previewUrlData.publicUrl,
      thumbnailUrl: thumbnailUrlData.publicUrl,
      width,
      height,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Error in process-photo function:', err);
    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})