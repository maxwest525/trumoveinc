import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PageAnalysis {
  url: string;
  fetchedTitle: string | null;
  fetchedDescription: string | null;
  fetchedH1: string | null;
  fetchedCanonical: string | null;
  issues: string[];
  suggestedTitle: string | null;
  suggestedDescription: string | null;
  suggestedH1: string | null;
  aiChecklist: string[];
}

function parseHtml(html: string, url: string): Omit<PageAnalysis, "suggestedTitle" | "suggestedDescription" | "suggestedH1" | "aiChecklist"> {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descMatch =
    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i) ||
    html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["']/i);
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([\s\S]*?)["']/i);

  const fetchedTitle = titleMatch?.[1]?.trim() || null;
  const fetchedDescription = descMatch?.[1]?.trim() || null;
  const fetchedH1 = h1Match?.[1]?.replace(/<[^>]*>/g, "").trim() || null;
  const fetchedCanonical = canonicalMatch?.[1]?.trim() || null;

  const issues: string[] = [];

  // Title checks
  if (!fetchedTitle) {
    issues.push("Missing title tag");
  } else {
    if (fetchedTitle.length < 30) issues.push(`Title too short (${fetchedTitle.length} chars, aim 50–60)`);
    if (fetchedTitle.length > 70) issues.push(`Title too long (${fetchedTitle.length} chars, aim 50–60)`);
  }

  // Description checks
  if (!fetchedDescription) {
    issues.push("Missing meta description");
  } else {
    if (fetchedDescription.length < 100) issues.push(`Meta description too short (${fetchedDescription.length} chars, aim 150–160)`);
    if (fetchedDescription.length > 170) issues.push(`Meta description too long (${fetchedDescription.length} chars, aim 150–160)`);
  }

  // H1 checks
  if (!fetchedH1) {
    issues.push("Missing H1 heading");
  }
  const h1All = html.match(/<h1[^>]*>/gi);
  if (h1All && h1All.length > 1) {
    issues.push(`Multiple H1 tags found (${h1All.length})`);
  }

  // Canonical check
  if (!fetchedCanonical) {
    issues.push("Missing canonical tag");
  }

  return { url, fetchedTitle, fetchedDescription, fetchedH1, fetchedCanonical, issues };
}

async function getAiSuggestions(
  page: Omit<PageAnalysis, "suggestedTitle" | "suggestedDescription" | "suggestedH1" | "aiChecklist">,
  apiKey: string
): Promise<{ suggestedTitle: string; suggestedDescription: string; suggestedH1: string | null; aiChecklist: string[] }> {
  const prompt = `Analyse this page and give SEO recommendations:
URL: ${page.url}
Current Title: ${page.fetchedTitle || "(empty)"}
Current Meta Description: ${page.fetchedDescription || "(empty)"}
Current H1: ${page.fetchedH1 || "(empty)"}
Canonical: ${page.fetchedCanonical || "(missing)"}
Issues detected: ${page.issues.join("; ") || "none"}

Return recommendations for a moving company website (trumoveinc.com).`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content: `You are an SEO expert for trumoveinc.com, a moving company. Focus on title tag (50-60 chars), meta description (150-160 chars), H1, and actionable fixes. Never recommend meta keywords. Write for humans first. Be specific and actionable.`,
        },
        { role: "user", content: prompt },
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
                suggestedH1: { type: "string", description: "Suggested H1 or null if current is fine", nullable: true },
                checklist: { type: "array", items: { type: "string" }, description: "3-6 actionable items" },
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
    throw new Error(`AI service error (${response.status})`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("No recommendations returned");

  const result = JSON.parse(toolCall.function.arguments);
  return {
    suggestedTitle: result.suggestedTitle,
    suggestedDescription: result.suggestedDescription,
    suggestedH1: result.suggestedH1,
    aiChecklist: result.checklist || [],
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI service not configured");

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("Firecrawl connector not configured");

    const { action, url, urls, batchId } = await req.json();

    // ACTION: discover - get list of URLs from sitemap/crawl
    if (action === "discover") {
      console.log("Discovering URLs for:", url);

      // Try sitemap first via firecrawl map
      const mapRes = await fetch("https://api.firecrawl.dev/v1/map", {
        method: "POST",
        headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ url, limit: 50, includeSubdomains: false }),
      });

      const mapData = await mapRes.json();
      const links = mapData?.links || [];

      return new Response(JSON.stringify({ success: true, urls: links.slice(0, 50) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: analyze - fetch and analyze a single URL or batch
    if (action === "analyze") {
      const urlsToAnalyze: string[] = urls || (url ? [url] : []);
      if (!urlsToAnalyze.length) throw new Error("No URLs provided");

      const results: PageAnalysis[] = [];

      for (const pageUrl of urlsToAnalyze.slice(0, 10)) {
        try {
          console.log("Fetching:", pageUrl);
          const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ url: pageUrl, formats: ["html"], onlyMainContent: false }),
          });

          const scrapeData = await scrapeRes.json();
          const html = scrapeData?.data?.html || scrapeData?.html || "";

          if (!html) {
            results.push({
              url: pageUrl,
              fetchedTitle: null,
              fetchedDescription: null,
              fetchedH1: null,
              fetchedCanonical: null,
              issues: ["Failed to fetch page content"],
              suggestedTitle: null,
              suggestedDescription: null,
              suggestedH1: null,
              aiChecklist: [],
            });
            continue;
          }

          const parsed = parseHtml(html, pageUrl);

          // Get AI suggestions
          try {
            const ai = await getAiSuggestions(parsed, LOVABLE_API_KEY);
            results.push({ ...parsed, ...ai });
          } catch (aiErr) {
            console.error("AI error for", pageUrl, aiErr);
            results.push({
              ...parsed,
              suggestedTitle: null,
              suggestedDescription: null,
              suggestedH1: null,
              aiChecklist: [],
            });
          }
        } catch (err) {
          console.error("Error processing", pageUrl, err);
          results.push({
            url: pageUrl,
            fetchedTitle: null,
            fetchedDescription: null,
            fetchedH1: null,
            fetchedCanonical: null,
            issues: [`Fetch failed: ${err instanceof Error ? err.message : "Unknown error"}`],
            suggestedTitle: null,
            suggestedDescription: null,
            suggestedH1: null,
            aiChecklist: [],
          });
        }
      }

      return new Response(JSON.stringify({ success: true, results, batchId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action. Use 'discover' or 'analyze'.");
  } catch (error) {
    console.error("seo-audit error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
