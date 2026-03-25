import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI service not configured");

    const { url, currentTitle, currentDescription, currentH1, keyword } = await req.json();

    const systemPrompt = `You are an expert SEO consultant for a moving company website (trumoveinc.com).

RULES:
- Meta keywords are useless for Google. Never recommend them.
- Focus ONLY on: title tag, meta description, H1 heading, and clear human-readable copy.
- Title tags should be 50-60 characters, include the primary keyword near the front, and include the brand name.
- Meta descriptions should be 150-160 characters, compelling, and include a call-to-action.
- H1 should be clear, include the keyword naturally, and be different from the title tag.
- Write for humans first, search engines second.
- Be specific and actionable.

Respond with a JSON object using tool calling.`;

    const userPrompt = `Analyse this page and give SEO recommendations:

URL: ${url || "(not provided)"}
Current Title Tag: ${currentTitle || "(empty)"}
Current Meta Description: ${currentDescription || "(empty)"}
Current H1: ${currentH1 || "(empty)"}
Target Keyword: ${keyword || "(none specified)"}

Return your recommendations.`;

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
        tools: [
          {
            type: "function",
            function: {
              name: "seo_recommendations",
              description: "Return structured SEO recommendations",
              parameters: {
                type: "object",
                properties: {
                  suggestedTitle: { type: "string", description: "Suggested title tag (50-60 chars)" },
                  suggestedDescription: { type: "string", description: "Suggested meta description (150-160 chars)" },
                  suggestedH1: { type: "string", description: "Suggested H1, or null if current is fine", nullable: true },
                  checklist: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-6 actionable items to fix first, plain English",
                  },
                },
                required: ["suggestedTitle", "suggestedDescription", "suggestedH1", "checklist"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "seo_recommendations" } },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Add credits in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI service error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No recommendations returned");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("seo-helper error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
