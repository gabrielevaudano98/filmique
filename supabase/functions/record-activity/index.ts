import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('=== record-activity function called ===');
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
    
    const { activityType, actorId, entityId, entityOwnerId } = body;

    // Validate required fields
    if (!activityType || !actorId || !entityId) {
      console.error('Missing required fields:', { activityType, actorId, entityId });
      return new Response(JSON.stringify({ error: 'Missing required fields: activityType, actorId, entityId' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    console.log('All required fields present:', { activityType, actorId, entityId, entityOwnerId });

    // Don't send notifications for self-activity
    if (actorId === entityOwnerId) {
      console.log('Self-activity detected, skipping notification');
      return new Response(JSON.stringify({ message: 'Self-activity, no notification needed.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log('Creating Supabase client with auth header');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    console.log('Attempting to insert notification');
    const { error } = await supabase.from('notifications').insert({
      user_id: entityOwnerId,
      actor_id: actorId,
      type: activityType,
      entity_id: entityId,
    })

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    console.log('Notification inserted successfully');
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Error in record-activity function:', err);
    console.error('Error stack:', err.stack);
    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})