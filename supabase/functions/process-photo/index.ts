import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { decode } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { Image } from "https://deno.land/x/imagescript@1.2.17/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('=== process-photo function called ===');
  console.log('Request method:', req.method);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));

  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse JSON body
    const bodyText = await req.text();
    console.log('Raw request body:', bodyText);
    
    if (!bodyText) {
      console.error('No request body provided');
      return new Response(JSON.stringify({ error: 'No request body provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const body = JSON.parse(bodyText);
    console.log('Parsed body:', body);
    
    const { image, userId, rollId } = body;
    
    // Validate required fields
    if (!image || !userId || !rollId) {
      console.error('Missing required fields:', { image: image ? 'present' : 'missing', userId, rollId });
      return new Response(JSON.stringify({ error: 'Missing required fields: image, userId, rollId' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    console.log('All required fields present');
    
    // Decode base64 image
    console.log('Decoding base64 image...');
    const imageContent = decode(image.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''))
    console.log('Image decoded successfully, size:', imageContent.length, 'bytes');

    console.log('Creating Supabase admin client');
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    console.log('Decoding image with ImageScript...');
    const originalImage = await Image.decode(imageContent);
    const { width, height } = originalImage;
    console.log('Image decoded successfully:', { width, height });

    // Create preview (1080px wide)
    console.log('Creating preview image...');
    const previewImage = originalImage.clone().resize(1080, Image.RESIZE_AUTO);
    const previewBuffer = await previewImage.encodeJPEG(90);
    console.log('Preview image created, size:', previewBuffer.length, 'bytes');

    // Create thumbnail (400px wide)
    console.log('Creating thumbnail image...');
    const thumbnailImage = originalImage.clone().resize(400, Image.RESIZE_AUTO);
    const thumbnailBuffer = await thumbnailImage.encodeJPEG(80);
    console.log('Thumbnail image created, size:', thumbnailBuffer.length, 'bytes');

    const timestamp = Date.now();
    const originalPath = `${userId}/${rollId}/${timestamp}_original.jpg`;
    const previewPath = `${userId}/${rollId}/${timestamp}_preview.jpg`;
    const thumbnailPath = `${userId}/${rollId}/${timestamp}_thumbnail.jpg`;

    console.log('Uploading images to storage...');
    // Upload all three versions
    const [originalUpload, previewUpload, thumbnailUpload] = await Promise.all([
      supabaseAdmin.storage.from('photos').upload(originalPath, imageContent, { contentType: 'image/jpeg', upsert: true }),
      supabaseAdmin.storage.from('photos').upload(previewPath, previewBuffer, { contentType: 'image/jpeg', upsert: true }),
      supabaseAdmin.storage.from('photos').upload(thumbnailPath, thumbnailBuffer, { contentType: 'image/jpeg', upsert: true }),
    ]);

    console.log('Upload results:', {
      original: originalUpload.error ? 'ERROR' : 'SUCCESS',
      preview: previewUpload.error ? 'ERROR' : 'SUCCESS',
      thumbnail: thumbnailUpload.error ? 'ERROR' : 'SUCCESS'
    });

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

    console.log('All uploads successful, getting public URLs...');
    // Get public URLs
    const { data: originalUrlData } = supabaseAdmin.storage.from('photos').getPublicUrl(originalPath);
    const { data: previewUrlData } = supabaseAdmin.storage.from('photos').getPublicUrl(previewPath);
    const { data: thumbnailUrlData } = supabaseAdmin.storage.from('photos').getPublicUrl(thumbnailPath);

    console.log('Public URLs generated successfully');
    console.log('Original URL:', originalUrlData.publicUrl);
    console.log('Preview URL:', previewUrlData.publicUrl);
    console.log('Thumbnail URL:', thumbnailUrlData.publicUrl);

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
    console.error('Error stack:', err.stack);
    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})