const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return `+${digits}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channel, to, subject, body, customer_name } = await req.json();

    if (!channel || !to || !body) {
      return new Response(JSON.stringify({ error: 'channel, to, and body are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (channel === 'sms') {
      const GATEWAY_URL = 'https://connector-gateway.lovable.dev/twilio';
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');
      const TWILIO_API_KEY = Deno.env.get('TWILIO_API_KEY');
      if (!TWILIO_API_KEY) throw new Error('TWILIO_API_KEY is not configured');

      const TWILIO_MESSAGING_SERVICE_SID = Deno.env.get('TWILIO_MESSAGING_SERVICE_SID');
      const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

      const normalizedPhone = normalizePhone(to);
      const params = new URLSearchParams({ To: normalizedPhone, Body: body });

      if (TWILIO_PHONE_NUMBER) {
        params.set('From', TWILIO_PHONE_NUMBER);
      } else if (TWILIO_MESSAGING_SERVICE_SID) {
        params.set('MessagingServiceSid', TWILIO_MESSAGING_SERVICE_SID);
      } else {
        throw new Error('Neither TWILIO_PHONE_NUMBER nor TWILIO_MESSAGING_SERVICE_SID is configured');
      }

      const resp = await fetch(`${GATEWAY_URL}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'X-Connection-Api-Key': TWILIO_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(`Twilio SMS failed [${resp.status}]: ${JSON.stringify(data)}`);

      return new Response(JSON.stringify({ success: true, channel: 'sms' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (channel === 'email') {
      // Use the transactional email system
      const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
      const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

      const { createClient } = await import('npm:@supabase/supabase-js@2');
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      // Enqueue a transactional email
      const payload = {
        purpose: 'transactional',
        templateName: 'customer-message',
        to,
        data: {
          customer_name: customer_name || 'Valued Customer',
          subject: subject || 'Message from TruMove',
          message_body: body,
        },
      };

      const { data: msgId, error } = await supabase.rpc('enqueue_email', {
        queue_name: 'transactional_emails',
        payload,
      });

      if (error) throw new Error(`Email enqueue failed: ${error.message}`);

      return new Response(JSON.stringify({ success: true, channel: 'email' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: `Unknown channel: ${channel}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('send-customer-message error:', err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
