import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { decode } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { Image } from "https://deno.land/x/imagescript@1.2.17/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { image, userId, rollId } = body;

    if (!image || !userId || !rollId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: image, userId, rollId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Server configuration missing SUPABASE env variables" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize base64 string (remove data URL prefix if present)
    const normalizedBase64 = typeof image === "string" ? image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "") : null;
    if (!normalizedBase64) {
      return new Response(
        JSON.stringify({ error: "Image must be a base64 string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decode base64 -> Uint8Array
    const imgBytes = decode(normalizedBase64);

    // Decode image via imagescript
    const originalImage = await Image.decode(imgBytes);
    const { width, height } = originalImage;

    // Prepare resized versions
    const preview = originalImage.clone().resize(1080, Image.RESIZE_AUTO);
    const thumbnail = originalImage.clone().resize(400, Image.RESIZE_AUTO);

    const previewBuf = await preview.encodeJPEG(90);
    const thumbnailBuf = await thumbnail.encodeJPEG(80);
    const originalBuf = await originalImage.encodeJPEG(95);

    const timestamp = Date.now();
    const originalPath = `${userId}/${rollId}/${timestamp}_original.jpg`;
    const previewPath = `${userId}/${rollId}/${timestamp}_preview.jpg`;
    const thumbnailPath = `${userId}/${rollId}/${timestamp}_thumbnail.jpg`;

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Upload (upsert true to be safe)
    const [oRes, pRes, tRes] = await Promise.all([
      supabaseAdmin.storage.from("photos").upload(originalPath, originalBuf, { contentType: "image/jpeg", upsert: true }),
      supabaseAdmin.storage.from("photos").upload(previewPath, previewBuf, { contentType: "image/jpeg", upsert: true }),
      supabaseAdmin.storage.from("photos").upload(thumbnailPath, thumbnailBuf, { contentType: "image/jpeg", upsert: true }),
    ]);

    if (oRes.error || pRes.error || tRes.error) {
      const message = oRes.error?.message || pRes.error?.message || tRes.error?.message || "Upload failed";
      return new Response(
        JSON.stringify({ error: message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: originalData } = supabaseAdmin.storage.from("photos").getPublicUrl(originalPath);
    const { data: previewData } = supabaseAdmin.storage.from("photos").getPublicUrl(previewPath);
    const { data: thumbnailData } = supabaseAdmin.storage.from("photos").getPublicUrl(thumbnailPath);

    return new Response(
      JSON.stringify({
        url: originalData.publicUrl,
        previewUrl: previewData.publicUrl,
        thumbnailUrl: thumbnailData.publicUrl,
        width,
        height,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});