import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotifyRequest {
  channel: "email" | "slack" | "webhook" | "sms" | "teams";
  keyword: string;
  matched: string;
  context: string;
  timestamp: string;
  agent_name?: string;
  to_email?: string;
  slack_webhook_urls?: string;
  webhook_url?: string;
  phone_number?: string;
  teams_webhook_url?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: NotifyRequest = await req.json();
    const { channel, keyword, matched, context, timestamp, agent_name } = body;

    if (!channel || !keyword) {
      throw new Error("Missing required fields: channel, keyword");
    }

    const agentLabel = agent_name || 'Unknown Agent';
    const alertPayload = { keyword, matched, context, timestamp, agent_name: agentLabel };

    // ── Webhook ──
    if (channel === "webhook") {
      if (!body.webhook_url) throw new Error("webhook_url is required");
      let webhookUrl = body.webhook_url;
      if (!/^https?:\/\//i.test(webhookUrl)) webhookUrl = "https://" + webhookUrl;
      try { new URL(webhookUrl); } catch {
        throw new Error(`Invalid webhook URL: "${body.webhook_url}"`);
      }
      const resp = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alertPayload),
      });
      return new Response(
        JSON.stringify({ success: true, status: resp.status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Email via built-in transactional system ──
    if (channel === "email") {
      if (!body.to_email) throw new Error("to_email is required");

      const recipients = body.to_email.split(',').map((e: string) => e.trim()).filter(Boolean);
      if (!recipients.length) throw new Error("No valid email addresses provided");

      const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Send to first recipient (transactional = 1:1)
      const { error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "keyword-alert",
          recipientEmail: recipients[0],
          idempotencyKey: `keyword-alert-${keyword}-${Date.now()}`,
          templateData: {
            keyword,
            matched,
            context,
            timestamp,
            agentName: agentLabel,
          },
        },
      });

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: `Email send failed: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Slack ──
    if (channel === "slack") {
      if (!body.slack_webhook_urls) throw new Error("slack_webhook_urls is required");
      const urls = body.slack_webhook_urls.split(/[\n,]/).map((u: string) => u.trim()).filter(Boolean);
      if (!urls.length) throw new Error("No valid Slack webhook URLs provided");

      const slackPayload = {
        text: `🚨 *Keyword Alert:* \`${keyword}\` — Agent: ${agentLabel}`,
        blocks: [
          { type: "header", text: { type: "plain_text", text: "🚨 Keyword Detected", emoji: true } },
          { type: "section", fields: [
            { type: "mrkdwn", text: `*Agent:*\n${agentLabel}` },
            { type: "mrkdwn", text: `*Keyword:*\n\`${keyword}\`` },
            { type: "mrkdwn", text: `*Matched:*\n\`${matched}\`` },
            { type: "mrkdwn", text: `*Time:*\n${timestamp}` },
          ]},
          { type: "section", text: { type: "mrkdwn", text: `*Context:*\n> ${context.slice(0, 200)}` } },
        ],
      };

      const results = await Promise.allSettled(
        urls.map(async (url: string) => {
          let webhookUrl = url;
          if (!/^https?:\/\//i.test(webhookUrl)) webhookUrl = "https://" + webhookUrl;
          try { new URL(webhookUrl); } catch { throw new Error(`Invalid Slack webhook URL: "${url}"`); }
          const resp = await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(slackPayload) });
          if (!resp.ok) { const text = await resp.text(); throw new Error(`Slack webhook failed [${resp.status}]: ${text}`); }
          return { url: webhookUrl, status: resp.status };
        })
      );
      const failures = results.filter((r) => r.status === "rejected");
      if (failures.length === urls.length) throw new Error(`All Slack webhooks failed`);
      return new Response(
        JSON.stringify({ success: true, sent: urls.length - failures.length, failed: failures.length }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── SMS via ClickSend ──
    if (channel === "sms") {
      if (!body.phone_number) throw new Error("phone_number is required");
      const CLICKSEND_USERNAME = Deno.env.get("CLICKSEND_USERNAME");
      if (!CLICKSEND_USERNAME) throw new Error("CLICKSEND_USERNAME is not configured");
      const CLICKSEND_API_KEY = Deno.env.get("CLICKSEND_API_KEY");
      if (!CLICKSEND_API_KEY) throw new Error("CLICKSEND_API_KEY is not configured");

      const digits = body.phone_number.replace(/\D/g, "");
      const normalizedPhone = digits.startsWith("1") && digits.length === 11 ? `+${digits}` : digits.length === 10 ? `+1${digits}` : body.phone_number.startsWith("+") ? body.phone_number : `+${digits}`;

      const smsBody = `🚨 Keyword Alert: "${keyword}" detected — Agent: ${agentLabel}. Context: ${context.slice(0, 120)}`;
      const basicAuth = btoa(`${CLICKSEND_USERNAME}:${CLICKSEND_API_KEY}`);

      const resp = await fetch("https://rest.clicksend.com/v3/sms/send", {
        method: "POST",
        headers: { "Authorization": `Basic ${basicAuth}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ to: normalizedPhone, body: smsBody, source: "trumove-pulse" }] }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(`ClickSend SMS failed [${resp.status}]: ${JSON.stringify(data)}`);
      return new Response(
        JSON.stringify({ success: true, status: resp.status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Microsoft Teams ──
    if (channel === "teams") {
      if (!body.teams_webhook_url) throw new Error("teams_webhook_url is required");
      let webhookUrl = body.teams_webhook_url;
      if (!/^https?:\/\//i.test(webhookUrl)) webhookUrl = "https://" + webhookUrl;
      try { new URL(webhookUrl); } catch { throw new Error(`Invalid Teams webhook URL`); }
      const teamsPayload = {
        "@type": "MessageCard", "@context": "http://schema.org/extensions", themeColor: "dc2626",
        summary: `Keyword Alert: "${keyword}"`,
        sections: [{ activityTitle: `🚨 Keyword Detected: \`${keyword}\``,
          facts: [{ name: "Agent", value: agentLabel }, { name: "Keyword", value: keyword }, { name: "Matched", value: matched }, { name: "Time", value: timestamp }],
          text: `**Context:** ${context.slice(0, 200)}`,
        }],
      };
      const resp = await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(teamsPayload) });
      if (!resp.ok) { const text = await resp.text(); throw new Error(`Teams webhook failed [${resp.status}]: ${text}`); }
      return new Response(
        JSON.stringify({ success: true, status: resp.status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error(`Unknown channel: ${channel}`);
  } catch (error: unknown) {
    console.error("Notification error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
