import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface KpiSnapshot {
  // Free-form numeric/text KPIs from the marketing dashboard
  // e.g. { organicTraffic: 420, paidSpend: 8400, cpl: 142, bookedRate: 0.31, ... }
  [key: string]: unknown;
}

interface RequestBody {
  kpis?: KpiSnapshot;
  context?: string; // optional extra context (channels, goals, etc.)
  count?: number;   // desired number of recommendations (default 6)
}

const SYSTEM_PROMPT = `You are TruMove's Marketing Strategy AI. Given a snapshot of current marketing KPIs, you produce a focused list of recommended next actions a marketing operator should take this week.

Rules:
- Be specific and operationally realistic for a household-goods moving brokerage.
- Prefer actions that move the needle: pause wasteful spend, fix tracking, ship a CRO test, publish/refresh content, build authority, fix technical SEO.
- Each action must be self-contained: title, short description, why it matters (reasoning grounded in the KPIs), expected lift, priority, effort, category.
- Never invent KPI values not provided. If a KPI is missing, infer from context but be conservative.
- Avoid generic fluff ("post on social media"). Be concrete.
- Output ONLY via the provided tool call.`;

const TOOL = {
  type: "function",
  function: {
    name: "emit_action_items",
    description: "Return a list of recommended marketing action items derived from KPIs.",
    parameters: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string", description: "Short imperative action title (max 90 chars)" },
              description: { type: "string", description: "1-2 sentences describing what to do" },
              category: {
                type: "string",
                enum: ["seo", "ads", "cro", "content", "technical", "backlinks"],
              },
              priority: {
                type: "string",
                enum: ["critical", "high", "medium", "low"],
              },
              effort: {
                type: "string",
                enum: ["quick", "moderate", "strategic"],
              },
              expectedLift: {
                type: "string",
                description: "Quantified expected impact, e.g. '+15% CTR', 'Save $600/mo'",
              },
              reasoning: {
                type: "string",
                description: "Why this matters, referencing the KPIs provided",
              },
            },
            required: [
              "title",
              "description",
              "category",
              "priority",
              "effort",
              "expectedLift",
              "reasoning",
            ],
            additionalProperties: false,
          },
        },
      },
      required: ["items"],
      additionalProperties: false,
    },
  },
} as const;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const kpis = body.kpis ?? {};
    const context = body.context?.toString() ?? "";
    const count = Math.min(Math.max(body.count ?? 6, 3), 10);

    const userPrompt = [
      `Generate ${count} prioritized marketing action items for TruMove based on the following KPI snapshot.`,
      "",
      "KPI Snapshot (JSON):",
      "```json",
      JSON.stringify(kpis, null, 2),
      "```",
      context ? `\nAdditional context:\n${context}` : "",
      "",
      "Return them via the emit_action_items tool. Order by priority (critical first), then by ROI.",
    ].join("\n");

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "emit_action_items" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI credits exhausted. Add funds in Settings → Workspace → Usage.",
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    const argsRaw = toolCall?.function?.arguments;

    if (!argsRaw) {
      console.error("No tool call in AI response", JSON.stringify(data).slice(0, 500));
      return new Response(
        JSON.stringify({ error: "AI did not return structured items" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let parsed: { items: unknown[] };
    try {
      parsed = JSON.parse(argsRaw);
    } catch (e) {
      console.error("Failed to parse tool args", e);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ items: parsed.items ?? [] }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-marketing-action-items error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
