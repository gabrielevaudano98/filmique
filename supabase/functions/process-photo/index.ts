import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, userId, rollId, metadata } = await req.json();

    if (!imageBase64 || !userId || !rollId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role key for storage operations
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const imageBuffer = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));

    // --- IMPORTANT: Placeholder for actual AVIF conversion logic ---
    // Deno does not have a built-in AVIF encoder. To truly convert to AVIF,
    // you would need to integrate a Deno-compatible image processing library
    // that supports AVIF encoding here, or use an external image processing service.
    // For now, this will simply re-upload the JPEG data with an .avif extension.
    const finalImageBuffer = imageBuffer; // Replace with actual AVIF buffer after conversion
    const fileExtension = 'avif'; // Force .avif extension for storage

    const filePath = `${userId}/${rollId}/${Date.now()}.${fileExtension}`;

    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('photos')
      .upload(filePath, finalImageBuffer, {
        contentType: `image/${fileExtension}`,
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(JSON.stringify({ error: uploadError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const { data: publicUrlData } = supabaseClient.storage.from('photos').getPublicUrl(filePath);

    // Record photo metadata in the database
    const { error: dbError } = await supabaseClient.from('photos').insert({
      user_id: userId,
      roll_id: rollId,
      url: publicUrlData.publicUrl,
      thumbnail_url: publicUrlData.publicUrl, // For simplicity, thumbnail is same as full image
      metadata: metadata,
    });

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Consider adding logic here to delete the uploaded file if the DB insert fails
      return new Response(JSON.stringify({ error: dbError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ publicUrl: publicUrlData.publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});