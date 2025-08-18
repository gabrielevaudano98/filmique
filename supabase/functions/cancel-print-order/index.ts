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

    const { orderId } = await req.json();
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Missing orderId' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 1. Fetch the order
    const { data: order, error: orderError } = await supabase
      .from('print_orders')
      .select('user_id, roll_id, cost, status')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;
    if (order.status !== 'queued') {
      return new Response(JSON.stringify({ error: 'Order cannot be canceled' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 2. Update order status to 'canceled'
    const { error: cancelError } = await supabase
      .from('print_orders')
      .update({ status: 'canceled' })
      .eq('id', orderId);
    if (cancelError) throw cancelError;

    // 3. Un-mark the roll as printed
    const { error: rollError } = await supabase
      .from('rolls')
      .update({ is_printed: false })
      .eq('id', order.roll_id);
    if (rollError) throw rollError;

    // 4. Refund credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', order.user_id)
      .single();
    if (profileError) throw profileError;

    const newCredits = profile.credits + order.cost;
    const { error: creditError } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', order.user_id);
    if (creditError) throw creditError;

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