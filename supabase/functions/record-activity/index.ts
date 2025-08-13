import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('--- record-activity: Request received ---');
  console.log(`Method: ${req.method}, URL: ${req.url}`);

  if (req.method === 'OPTIONS') {
    console.log('--- record-activity: Handling OPTIONS preflight request ---');
    return new Response(null, {
      status: 204, // No Content
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();
    console.log('--- record-activity: Parsed request body ---', body);
    
    const { activityType, actorId, entityId, entityOwnerId } = body;

    if (!activityType || !actorId || !entityId) {
      console.error('--- record-activity: ERROR - Missing required fields ---');
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (actorId === entityOwnerId) {
      console.log('--- record-activity: Self-activity detected, skipping notification. ---');
      return new Response(JSON.stringify({ message: 'Self-activity, no notification needed.' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('--- record-activity: Creating Supabase client to insert notification. ---');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { error } = await supabase.from('notifications').insert({
      user_id: entityOwnerId,
      actor_id: actorId,
      type: activityType,
      entity_id: entityId,
    });

    if (error) {
      console.error('--- record-activity: ERROR - Supabase insert failed ---', error);
      throw error;
    }

    console.log('--- record-activity: Notification inserted successfully. ---');
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('--- record-activity: FATAL ERROR ---', err.message, err.stack);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})