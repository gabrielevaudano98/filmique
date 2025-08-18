import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { userId, rollId, cost } = await req.json();

    if (!userId || !rollId || typeof cost === 'undefined') {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 1. Fetch user's profile including experience_mode
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits, experience_mode')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;
    if (!profile) return new Response(JSON.stringify({ error: 'User profile not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // 2. Check if they can afford it
    if (profile.credits < cost) {
      return new Response(JSON.stringify({ error: 'Insufficient credits' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 3. Deduct credits
    const newCredits = profile.credits - cost;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId);
    if (updateError) throw updateError;

    // 4. Create the print order record
    const { error: orderError } = await supabase
      .from('print_orders')
      .insert({ user_id: userId, roll_id: rollId, cost });
    if (orderError) throw orderError;

    // 5. Mark the roll as printed AND set lock status if in authentic mode
    const rollUpdateData: { is_printed: boolean; is_locked?: boolean; unlock_code?: string } = {
      is_printed: true,
    };

    if (profile.experience_mode === 'authentic') {
      const unlockCode = Math.floor(1000 + Math.random() * 9000).toString();
      rollUpdateData.is_locked = true;
      rollUpdateData.unlock_code = unlockCode;
    }

    const { error: rollError } = await supabase
      .from('rolls')
      .update(rollUpdateData)
      .eq('id', rollId);
    if (rollError) throw rollError;

    return new Response(JSON.stringify({ success: true, newBalance: newCredits }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})