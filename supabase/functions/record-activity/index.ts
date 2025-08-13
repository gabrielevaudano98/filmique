import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// --- Gamification Rules ---
const XP_REWARDS = {
  GIVE_LIKE: 1,
  RECEIVE_LIKE: 5,
  GIVE_COMMENT: 5,
  RECEIVE_COMMENT: 10,
  NEW_POST: 25,
  NEW_FOLLOWER: 15,
};

const getLevelFromXp = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { activityType, actorId, entityId, entityOwnerId } = await req.json();

    if (!activityType || !actorId) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- 1. Award XP and update profiles ---
    const awardXp = async (userId: string, amount: number) => {
      const { data: profile, error } = await supabase.from('profiles').select('xp').eq('id', userId).single();
      if (error || !profile) return;

      const newXp = profile.xp + amount;
      const newLevel = getLevelFromXp(newXp);
      
      await supabase.from('profiles').update({ xp: newXp, level: newLevel }).eq('id', userId);
    };

    switch (activityType) {
      case 'like':
        await awardXp(actorId, XP_REWARDS.GIVE_LIKE);
        if (entityOwnerId) await awardXp(entityOwnerId, XP_REWARDS.RECEIVE_LIKE);
        break;
      case 'comment':
        await awardXp(actorId, XP_REWARDS.GIVE_COMMENT);
        if (entityOwnerId) await awardXp(entityOwnerId, XP_REWARDS.RECEIVE_COMMENT);
        break;
      case 'post':
        await awardXp(actorId, XP_REWARDS.NEW_POST);
        break;
      case 'follow':
        if (entityOwnerId) await awardXp(entityOwnerId, XP_REWARDS.NEW_FOLLOWER);
        break;
    }

    // --- 2. Create Notification ---
    if (entityOwnerId && actorId !== entityOwnerId) {
      await supabase.from('notifications').insert({
        user_id: entityOwnerId,
        actor_id: actorId,
        type: activityType,
        entity_id: entityId,
      });
    }

    // --- 3. Check for Badges (Simplified for now) ---
    // A full implementation would check counts against badge criteria here.
    // This is a good place for future expansion.

    return new Response(JSON.stringify({ success: true }), {
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