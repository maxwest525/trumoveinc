import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { call_id, transcript, flagged_keywords, agent_name, client_name, duration_seconds } = await req.json();

    if (!call_id || !transcript) {
      return new Response(JSON.stringify({ error: "call_id and transcript are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const flagInfo = flagged_keywords?.length
      ? `\n\n**Flagged Compliance Keywords:** ${flagged_keywords.join(", ")}`
      : "";

    const durLabel = duration_seconds
      ? `${Math.floor(duration_seconds / 60)}m ${duration_seconds % 60}s`
      : "Unknown";

    const systemPrompt = `You are a compliance-focused call analyst for a moving brokerage. Given a call transcript, produce a concise summary with these sections:
1. **Overview** (1-2 sentences: what the call was about)
2. **Key Takeaways** (3-5 bullet points of the most important items discussed)
3. **Compliance Notes** (any compliance concerns, flagged language, or areas needing review)
4. **Action Items** (any follow-ups or next steps identified)

Be specific and reference actual content from the transcript. Keep it under 250 words total. Use markdown formatting.`;

    const userPrompt = `Summarize this call:

**Agent:** ${agent_name || "Unknown"}
**Client:** ${client_name || "Unknown"}
**Duration:** ${durLabel}${flagInfo}

**Transcript:**
${transcript.slice(0, 8000)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const summary = result.choices?.[0]?.message?.content || "No summary generated.";

    // Save summary to the pulse_calls table
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      await fetch(`${SUPABASE_URL}/rest/v1/pulse_calls?id=eq.${call_id}`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ summary }),
      });
    }

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("pulse-call-summary error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
