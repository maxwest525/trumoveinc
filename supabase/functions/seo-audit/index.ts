import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface IssueSuggestion {
  issue: string;
  suggestion: string;
  priority: "high" | "medium" | "low";
}

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
  issueSuggestions: IssueSuggestion[];
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
  page: Omit<PageAnalysis, "suggestedTitle" | "suggestedDescription" | "suggestedH1" | "aiChecklist" | "issueSuggestions">,
  apiKey: string
): Promise<{ suggestedTitle: string; suggestedDescription: string; suggestedH1: string | null; aiChecklist: string[]; issueSuggestions: IssueSuggestion[] }> {
  const prompt = `Analyse this page and give SEO recommendations:
URL: ${page.url}
Current Title: ${page.fetchedTitle || "(empty)"}
Current Meta Description: ${page.fetchedDescription || "(empty)"}
Current H1: ${page.fetchedH1 || "(empty)"}
Canonical: ${page.fetchedCanonical || "(missing)"}
Issues detected: ${page.issues.join("; ") || "none"}

For EACH issue listed above, provide a specific, actionable suggestion to fix it. Also provide overall title/description/H1 recommendations.`;

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
          content: `You are an SEO expert for trumoveinc.com, a long distance moving brokerage. Focus on title tag (50-60 chars), meta description (150-160 chars), H1, and actionable fixes. Never recommend meta keywords. Write for humans first. Be specific and actionable.

CRITICAL RULE — TruMove Inc. is a LONG DISTANCE / INTERSTATE moving broker. They do NOT offer local moving services. NEVER use the word "local" in any suggestion. Allowed terms: long distance movers, interstate moving, cross-country moving, nationwide moving, residential relocation, commercial relocation, auto transport, vehicle shipping, moving broker, household goods shipping. Never describe TruMove as a "local mover", "local moving company", or suggest local SEO strategies (city pages, local service area, etc.) unless specifically about long-distance service availability FROM that city.`,
        },
        { role: "user", content: prompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "seo_recommendations",
            description: "Return structured SEO recommendations with per-issue suggestions",
            parameters: {
              type: "object",
              properties: {
                suggestedTitle: { type: "string", description: "Suggested title tag (50-60 chars)" },
                suggestedDescription: { type: "string", description: "Suggested meta description (150-160 chars)" },
                suggestedH1: { type: "string", description: "Suggested H1 or null if current is fine", nullable: true },
                checklist: { type: "array", items: { type: "string" }, description: "3-6 actionable items" },
                issueSuggestions: {
                  type: "array",
                  description: "One specific suggestion for EACH issue detected. Must match issues 1:1.",
                  items: {
                    type: "object",
                    properties: {
                      issue: { type: "string", description: "The exact issue text from the detected issues list" },
                      suggestion: { type: "string", description: "Specific, actionable fix for this issue. Include exact copy/code when possible." },
                      priority: { type: "string", enum: ["high", "medium", "low"], description: "Impact priority" },
                    },
                    required: ["issue", "suggestion", "priority"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["suggestedTitle", "suggestedDescription", "suggestedH1", "checklist", "issueSuggestions"],
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
    issueSuggestions: result.issueSuggestions || [],
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
      const baseUrl = url || "https://trumoveinc.com";
      console.log("Discovering URLs for:", baseUrl);

      // Known pages for trumoveinc.com (ensures we always audit these)
      const knownPages: string[] = [
        "https://trumoveinc.com",
        "https://trumoveinc.com/online-estimate",
        "https://trumoveinc.com/scan-room",
        "https://trumoveinc.com/auto-transport",
        "https://trumoveinc.com/track",
        "https://trumoveinc.com/vetting",
        "https://trumoveinc.com/customer-service",
        "https://trumoveinc.com/book",
        "https://trumoveinc.com/about",
        "https://trumoveinc.com/faq",
        "https://trumoveinc.com/privacy",
        "https://trumoveinc.com/terms",
        "https://trumoveinc.com/property-lookup",
        "https://trumoveinc.com/classic",
      ];

      let discoveredUrls: string[] = [...knownPages];

      // Step 1: Try sitemap.xml first (direct fetch, no Firecrawl credits)
      const sitemapCandidates = [
        `${baseUrl}/sitemap.xml`,
        `${baseUrl}/sitemap_index.xml`,
        `${baseUrl}/sitemap-0.xml`,
      ];

      for (const sitemapUrl of sitemapCandidates) {
        try {
          console.log("Trying sitemap:", sitemapUrl);
          const sitemapRes = await fetch(sitemapUrl, {
            headers: { "User-Agent": "TruMoveSEOAudit/1.0" },
          });
          if (sitemapRes.ok) {
            const xml = await sitemapRes.text();
            // Check if it's a sitemap index (contains other sitemaps)
            const sitemapRefs = [...xml.matchAll(/<sitemap>\s*<loc>([\s\S]*?)<\/loc>/gi)].map(m => m[1].trim());
            if (sitemapRefs.length > 0) {
              console.log(`Found sitemap index with ${sitemapRefs.length} child sitemaps`);
              // Fetch each child sitemap
              for (const childUrl of sitemapRefs.slice(0, 5)) {
                try {
                  const childRes = await fetch(childUrl, { headers: { "User-Agent": "TruMoveSEOAudit/1.0" } });
                  if (childRes.ok) {
                    const childXml = await childRes.text();
                    const childUrls = [...childXml.matchAll(/<url>\s*<loc>([\s\S]*?)<\/loc>/gi)].map(m => m[1].trim());
                    discoveredUrls.push(...childUrls);
                  }
                } catch (e) {
                  console.error("Child sitemap fetch error:", e);
                }
              }
            }
            // Also parse direct <url><loc> entries
            const directUrls = [...xml.matchAll(/<url>\s*<loc>([\s\S]*?)<\/loc>/gi)].map(m => m[1].trim());
            discoveredUrls.push(...directUrls);

            if (discoveredUrls.length > 0) {
              console.log(`Sitemap yielded ${discoveredUrls.length} URLs`);
              break;
            }
          }
        } catch (e) {
          console.log("Sitemap not found at", sitemapUrl);
        }
      }

      // Step 2: ALWAYS use Firecrawl map to supplement — sitemaps are often incomplete
      console.log(`Sitemap found ${discoveredUrls.length} URLs, supplementing with Firecrawl link discovery`);
      try {
        const mapRes = await fetch("https://api.firecrawl.dev/v1/map", {
          method: "POST",
          headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ url: baseUrl, limit: 100, includeSubdomains: false }),
        });
        const mapData = await mapRes.json();
        const crawledUrls = mapData?.links || [];
        console.log(`Firecrawl map found ${crawledUrls.length} additional URLs`);
        discoveredUrls.push(...crawledUrls);
      } catch (e) {
        console.error("Firecrawl map error:", e);
      }

      // Deduplicate, filter to same domain, limit to 50
      const domain = new URL(baseUrl).hostname;
      const unique = [...new Set(discoveredUrls)]
        .filter(u => { try { return new URL(u).hostname === domain; } catch { return false; } })
        .slice(0, 50);

      const source = unique.length > 0 && discoveredUrls.length > 0 ? "sitemap" : "crawl";
      return new Response(JSON.stringify({ success: true, urls: unique, source, total: unique.length }), {
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
              issueSuggestions: [],
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
