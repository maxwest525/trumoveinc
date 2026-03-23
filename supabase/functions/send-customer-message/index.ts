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
      const CLICKSEND_USERNAME = Deno.env.get('CLICKSEND_USERNAME');
      const CLICKSEND_API_KEY = Deno.env.get('CLICKSEND_API_KEY');
      if (!CLICKSEND_USERNAME || !CLICKSEND_API_KEY) {
        throw new Error('ClickSend credentials not configured');
      }

      const normalizedPhone = normalizePhone(to);
      const basicAuth = btoa(`${CLICKSEND_USERNAME}:${CLICKSEND_API_KEY}`);

      const resp = await fetch('https://rest.clicksend.com/v3/sms/send', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${basicAuth}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ body, to: normalizedPhone, source: 'sdk' }] }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(`ClickSend SMS failed [${resp.status}]: ${JSON.stringify(data)}`);

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
