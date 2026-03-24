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

function looksTollFree(phone?: string | null): boolean {
  return Boolean(phone && /^\+18(00|33|44|55|66|77|88)/.test(phone));
}

async function resolveTwilioSender(LOVABLE_API_KEY: string, TWILIO_API_KEY: string) {
  const GATEWAY_URL = 'https://connector-gateway.lovable.dev/twilio';
  const configuredPhone = Deno.env.get('TWILIO_PHONE_NUMBER');
  const configuredMessagingServiceSid = Deno.env.get('TWILIO_MESSAGING_SERVICE_SID');

  if (configuredPhone && !looksTollFree(configuredPhone)) {
    return { type: 'phone' as const, value: configuredPhone };
  }

  const response = await fetch(`${GATEWAY_URL}/IncomingPhoneNumbers.json`, {
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': TWILIO_API_KEY,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`Twilio number lookup failed [${response.status}]: ${JSON.stringify(data)}`);

  const smsCapableNumbers = (data?.incoming_phone_numbers ?? []).filter((phone: any) => phone?.capabilities?.sms);
  const preferredLocalNumber = smsCapableNumbers.find((phone: any) => !looksTollFree(phone?.phone_number));

  if (preferredLocalNumber?.phone_number) {
    return { type: 'phone' as const, value: preferredLocalNumber.phone_number };
  }

  if (configuredPhone) {
    return { type: 'phone' as const, value: configuredPhone };
  }

  if (configuredMessagingServiceSid) {
    return { type: 'messaging_service' as const, value: configuredMessagingServiceSid };
  }

  throw new Error('No SMS-capable Twilio sender is configured');
}

async function fetchTwilioMessageStatus(LOVABLE_API_KEY: string, TWILIO_API_KEY: string, messageSid: string) {
  const GATEWAY_URL = 'https://connector-gateway.lovable.dev/twilio';
  const response = await fetch(`${GATEWAY_URL}/Messages/${messageSid}.json`, {
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': TWILIO_API_KEY,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`Twilio status lookup failed [${response.status}]: ${JSON.stringify(data)}`);
  return data;
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

      const normalizedPhone = normalizePhone(to);
      const sender = await resolveTwilioSender(LOVABLE_API_KEY, TWILIO_API_KEY);
      const params = new URLSearchParams({ To: normalizedPhone, Body: body });

      if (sender.type === 'phone') {
        params.set('From', sender.value);
      } else {
        params.set('MessagingServiceSid', sender.value);
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

      if (data?.sid) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const statusData = await fetchTwilioMessageStatus(LOVABLE_API_KEY, TWILIO_API_KEY, data.sid);
        if (['failed', 'undelivered'].includes(statusData?.status)) {
          throw new Error(`Twilio SMS ${statusData.status}${statusData?.error_code ? ` (${statusData.error_code})` : ''}`);
        }
      }

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
