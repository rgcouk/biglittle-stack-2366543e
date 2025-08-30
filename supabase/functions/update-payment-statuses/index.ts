import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    console.log('Starting payment status update process...')

    // Update overdue payments
    const { error: updateError } = await supabaseClient.rpc('update_payment_statuses')
    if (updateError) {
      console.error('Error updating payment statuses:', updateError)
      throw updateError
    }

    // Generate monthly payments for active bookings
    const { error: generateError } = await supabaseClient.rpc('generate_monthly_payments')
    if (generateError) {
      console.error('Error generating monthly payments:', generateError)
      throw generateError
    }

    console.log('Payment status update completed successfully')

    return new Response(
      JSON.stringify({ success: true, message: 'Payment statuses updated successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in update-payment-statuses function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})