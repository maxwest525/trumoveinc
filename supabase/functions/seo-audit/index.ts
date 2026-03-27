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
  suggestedCanonical: string | null;
  aiChecklist: string[];
  issueSuggestions: IssueSuggestion[];
  suggestedPrimaryKeyword?: string | null;
  violations?: string[];
  // Two-pass debug fields
  rawTitle?: string | null;
  renderedTitle?: string | null;
  rawDescription?: string | null;
  renderedDescription?: string | null;
  sourceUsed?: "raw" | "rendered";
}

interface ComplianceSettings {
  allowedTerms: string[];
  forbiddenTerms: string[];
  disclaimer: string;
  tone: string;
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
  if (!fetchedTitle) {
    issues.push("Missing title tag");
  } else {
    if (fetchedTitle.length < 30) issues.push(`Title too short (${fetchedTitle.length} chars, aim 50–60)`);
    if (fetchedTitle.length > 70) issues.push(`Title too long (${fetchedTitle.length} chars, aim 50–60)`);
  }
  if (!fetchedDescription) {
    issues.push("Missing meta description");
  } else {
    if (fetchedDescription.length < 100) issues.push(`Meta description too short (${fetchedDescription.length} chars, aim 150–160)`);
    if (fetchedDescription.length > 170) issues.push(`Meta description too long (${fetchedDescription.length} chars, aim 150–160)`);
  }
  if (!fetchedH1) issues.push("Missing H1 heading");
  const h1All = html.match(/<h1[^>]*>/gi);
  if (h1All && h1All.length > 1) issues.push(`Multiple H1 tags found (${h1All.length})`);
  if (!fetchedCanonical) issues.push("Missing canonical tag");

  return { url, fetchedTitle, fetchedDescription, fetchedH1, fetchedCanonical, issues };
}

async function loadComplianceSettings(): Promise<ComplianceSettings> {
  const defaults: ComplianceSettings = {
    allowedTerms: ["long distance", "interstate", "cross-country", "nationwide", "residential relocation", "commercial relocation", "auto transport", "vehicle shipping", "moving broker", "household goods shipping"],
    forbiddenTerms: ["local", "local movers", "near me", "same-day local", "local moving", "local service", "local mover"],
    disclaimer: "",
    tone: "professional",
  };

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) return defaults;

    const sb = createClient(supabaseUrl, serviceKey);
    const { data } = await sb.from("seo_compliance_settings").select("setting_key, setting_value");
    if (!data || data.length === 0) return defaults;

    const map: Record<string, any> = {};
    data.forEach((r: any) => { map[r.setting_key] = r.setting_value; });

    return {
      allowedTerms: map.allowed_service_terms || defaults.allowedTerms,
      forbiddenTerms: map.forbidden_terms || defaults.forbiddenTerms,
      disclaimer: map.required_disclaimer || "",
      tone: map.tone || "professional",
    };
  } catch (e) {
    console.error("Failed to load compliance settings, using defaults:", e);
    return defaults;
  }
}

function containsForbiddenTerm(text: string, forbiddenTerms: string[]): string[] {
  const lower = text.toLowerCase();
  return forbiddenTerms.filter(term => {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "i");
    return regex.test(lower);
  });
}

function buildSystemPrompt(compliance: ComplianceSettings): string {
  const toneDescriptions: Record<string, string> = {
    professional: "Write in a clean, authoritative, professional corporate tone.",
    premium: "Write in a premium, luxury, high-end service tone emphasizing exclusivity and quality.",
    budget: "Write in a value-focused, affordable tone emphasizing cost savings and practical benefits.",
    trust: "Write in a trust-focused tone emphasizing safety, compliance, reliability, and customer protection.",
  };

  const toneInstruction = toneDescriptions[compliance.tone] || toneDescriptions.professional;

  return `You are an SEO expert for trumoveinc.com, a long distance moving brokerage.

TONE: ${toneInstruction}

CRITICAL COMPLIANCE RULES — THESE ARE LEGALLY BINDING:
1. TruMove Inc. is a LONG DISTANCE / INTERSTATE moving broker. They do NOT offer local moving.
2. NEVER use ANY of these forbidden terms in your suggestions: ${compliance.forbiddenTerms.map(t => `"${t}"`).join(", ")}
3. PREFERRED service terms to use: ${compliance.allowedTerms.map(t => `"${t}"`).join(", ")}
4. If the page is about a specific state/region, you may include that location but NEVER imply local-only service.
5. For homepage recommendations, default toward "Long Distance" and "Interstate" language.
${compliance.disclaimer ? `6. Required disclaimer context: ${compliance.disclaimer}` : ""}

SEO RULES:
- Title tags: 50-60 characters, include primary keyword near front, include brand name.
- Meta descriptions: 150-160 characters, compelling, include call-to-action.
- H1: Clear, include keyword naturally, different from title tag.
- Never recommend meta keywords (useless for Google).
- Write for humans first, search engines second.
- Be specific and actionable.
- Never output raw HTML tags. Provide plain-English suggestions only.`;
}

async function getGscQueriesForUrl(pageUrl: string): Promise<string[]> {
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data } = await sb
      .from("gsc_page_data")
      .select("query, clicks, impressions, position")
      .eq("page_url", pageUrl)
      .order("impressions", { ascending: false })
      .limit(10);
    if (!data || data.length === 0) return [];
    return data.map((r: any) => `"${r.query}" (${r.impressions} impr, ${r.clicks} clicks, pos ${r.position})`);
  } catch { return []; }
}

async function getAiSuggestions(
  page: Omit<PageAnalysis, "suggestedTitle" | "suggestedDescription" | "suggestedH1" | "aiChecklist" | "issueSuggestions">,
  apiKey: string,
  compliance: ComplianceSettings,
  attempt = 1,
): Promise<{ suggestedTitle: string; suggestedDescription: string; suggestedH1: string | null; aiChecklist: string[]; issueSuggestions: IssueSuggestion[]; violations: string[]; suggestedPrimaryKeyword: string | null }> {
  const maxAttempts = 3;

  // Fetch GSC queries for context
  const gscQueries = await getGscQueriesForUrl(page.url);
  const gscContext = gscQueries.length > 0
    ? `\n\nGOOGLE SEARCH CONSOLE DATA (real queries for this page, last 28 days):\n${gscQueries.join("\n")}\n\nIMPORTANT: Align your title/description suggestions with the highest-performing queries above. Derive the "suggestedPrimaryKeyword" from these real queries, NOT from guesswork.`
    : "\n\nNo Google Search Console data available for this page. Suggest a primary keyword based on the page content and URL.";

  const prompt = `Analyse this page and give SEO recommendations:
URL: ${page.url}
Current Title: ${page.fetchedTitle || "(empty)"}
Current Meta Description: ${page.fetchedDescription || "(empty)"}
Current H1: ${page.fetchedH1 || "(empty)"}
Canonical: ${page.fetchedCanonical || "(missing)"}
Issues detected: ${page.issues.join("; ") || "none"}
${gscContext}

For EACH issue listed above, provide a specific, actionable suggestion to fix it. Also provide overall title/description/H1 recommendations.

REMINDER: Do NOT use any of these words: ${compliance.forbiddenTerms.join(", ")}. Use terms like: ${compliance.allowedTerms.slice(0, 5).join(", ")} instead.`;


  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: buildSystemPrompt(compliance) },
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
                suggestedPrimaryKeyword: { type: "string", description: "The single best primary keyword for this page, derived from GSC data if available", nullable: true },
                issueSuggestions: {
                  type: "array",
                  description: "One specific suggestion for EACH issue detected.",
                  items: {
                    type: "object",
                    properties: {
                      issue: { type: "string", description: "The exact issue text from the detected issues list" },
                      suggestion: { type: "string", description: "Specific, actionable fix. Include exact copy when possible." },
                      priority: { type: "string", enum: ["high", "medium", "low"] },
                    },
                    required: ["issue", "suggestion", "priority"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["suggestedTitle", "suggestedDescription", "suggestedH1", "checklist", "suggestedPrimaryKeyword", "issueSuggestions"],
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

  // Check all output fields for forbidden terms
  const allText = [
    result.suggestedTitle || "",
    result.suggestedDescription || "",
    result.suggestedH1 || "",
    ...(result.checklist || []),
    ...(result.issueSuggestions || []).map((s: any) => s.suggestion),
  ].join(" ");

  const violations = containsForbiddenTerm(allText, compliance.forbiddenTerms);

  if (violations.length > 0 && attempt < maxAttempts) {
    console.log(`Attempt ${attempt}: Found forbidden terms [${violations.join(", ")}], regenerating...`);
    return getAiSuggestions(page, apiKey, compliance, attempt + 1);
  }

  return {
    suggestedTitle: result.suggestedTitle,
    suggestedDescription: result.suggestedDescription,
    suggestedH1: result.suggestedH1,
    aiChecklist: result.checklist || [],
    issueSuggestions: result.issueSuggestions || [],
    suggestedPrimaryKeyword: result.suggestedPrimaryKeyword || null,
    violations,
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

    // Load compliance settings for all actions that need AI
    const compliance = await loadComplianceSettings();

    if (action === "discover") {
      const baseUrl = url || "https://trumoveinc.com";
      console.log("Discovering URLs for:", baseUrl);

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

      const sitemapCandidates = [
        `${baseUrl}/sitemap.xml`,
        `${baseUrl}/sitemap_index.xml`,
        `${baseUrl}/sitemap-0.xml`,
      ];

      for (const sitemapUrl of sitemapCandidates) {
        try {
          const sitemapRes = await fetch(sitemapUrl, { headers: { "User-Agent": "TruMoveSEOAudit/1.0" } });
          if (sitemapRes.ok) {
            const xml = await sitemapRes.text();
            const sitemapRefs = [...xml.matchAll(/<sitemap>\s*<loc>([\s\S]*?)<\/loc>/gi)].map(m => m[1].trim());
            if (sitemapRefs.length > 0) {
              for (const childUrl of sitemapRefs.slice(0, 5)) {
                try {
                  const childRes = await fetch(childUrl, { headers: { "User-Agent": "TruMoveSEOAudit/1.0" } });
                  if (childRes.ok) {
                    const childXml = await childRes.text();
                    const childUrls = [...childXml.matchAll(/<url>\s*<loc>([\s\S]*?)<\/loc>/gi)].map(m => m[1].trim());
                    discoveredUrls.push(...childUrls);
                  }
                } catch (e) { console.error("Child sitemap error:", e); }
              }
            }
            const directUrls = [...xml.matchAll(/<url>\s*<loc>([\s\S]*?)<\/loc>/gi)].map(m => m[1].trim());
            discoveredUrls.push(...directUrls);
            if (discoveredUrls.length > 0) break;
          }
        } catch (e) { console.log("Sitemap not found at", sitemapUrl); }
      }

      try {
        const mapRes = await fetch("https://api.firecrawl.dev/v1/map", {
          method: "POST",
          headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ url: baseUrl, limit: 100, includeSubdomains: false }),
        });
        const mapData = await mapRes.json();
        discoveredUrls.push(...(mapData?.links || []));
      } catch (e) { console.error("Firecrawl map error:", e); }

      const domain = new URL(baseUrl).hostname;
      const unique = [...new Set(discoveredUrls)]
        .filter(u => { try { return new URL(u).hostname === domain; } catch { return false; } })
        .slice(0, 50);

      return new Response(JSON.stringify({ success: true, urls: unique, source: "sitemap", total: unique.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "analyze") {
      const urlsToAnalyze: string[] = urls || (url ? [url] : []);
      if (!urlsToAnalyze.length) throw new Error("No URLs provided");

      const results: PageAnalysis[] = [];

      for (const pageUrl of urlsToAnalyze.slice(0, 10)) {
        try {
          // Two-pass fetch: rawHtml (Pass A) + rendered html (Pass B) with waitFor
          const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ url: pageUrl, formats: ["rawHtml", "html"], onlyMainContent: false, waitFor: 3000 }),
          });
          const scrapeData = await scrapeRes.json();
          const rawHtml = scrapeData?.data?.rawHtml || scrapeData?.rawHtml || "";
          const renderedHtml = scrapeData?.data?.html || scrapeData?.html || "";

          if (!rawHtml && !renderedHtml) {
            results.push({
              url: pageUrl, fetchedTitle: null, fetchedDescription: null, fetchedH1: null,
              fetchedCanonical: null, issues: ["Failed to fetch page content"],
              suggestedTitle: null, suggestedDescription: null, suggestedH1: null,
              aiChecklist: [], issueSuggestions: [], violations: [],
              rawTitle: null, renderedTitle: null, rawDescription: null, renderedDescription: null, sourceUsed: "raw",
            });
            continue;
          }

          // Parse both passes
          const rawParsed = rawHtml ? parseHtml(rawHtml, pageUrl) : null;
          const renderedParsed = renderedHtml ? parseHtml(renderedHtml, pageUrl) : null;

          // Decide source: use rendered when raw is missing critical tags
          const rawHasCritical = !!(rawParsed?.fetchedTitle || rawParsed?.fetchedDescription);
          const renderedHasCritical = !!(renderedParsed?.fetchedTitle || renderedParsed?.fetchedDescription);

          let sourceUsed: "raw" | "rendered" = "raw";
          let finalParsed = rawParsed || renderedParsed!;

          if (!rawHasCritical && renderedHasCritical) {
            // Raw is empty but rendered has data — use rendered
            sourceUsed = "rendered";
            finalParsed = renderedParsed!;
          } else if (rawParsed && renderedParsed) {
            // Merge: fill in any raw gaps with rendered values
            if (!rawParsed.fetchedTitle && renderedParsed.fetchedTitle) {
              finalParsed = { ...finalParsed, fetchedTitle: renderedParsed.fetchedTitle };
              sourceUsed = "rendered";
            }
            if (!rawParsed.fetchedDescription && renderedParsed.fetchedDescription) {
              finalParsed = { ...finalParsed, fetchedDescription: renderedParsed.fetchedDescription };
              sourceUsed = "rendered";
            }
            if (!rawParsed.fetchedH1 && renderedParsed.fetchedH1) {
              finalParsed = { ...finalParsed, fetchedH1: renderedParsed.fetchedH1 };
              sourceUsed = "rendered";
            }
            if (!rawParsed.fetchedCanonical && renderedParsed.fetchedCanonical) {
              finalParsed = { ...finalParsed, fetchedCanonical: renderedParsed.fetchedCanonical };
            }
          }

          // Re-compute issues based on the final merged data
          const recomputedIssues: string[] = [];
          if (!finalParsed.fetchedTitle) {
            recomputedIssues.push("Missing title tag");
          } else {
            if (finalParsed.fetchedTitle.length < 30) recomputedIssues.push(`Title too short (${finalParsed.fetchedTitle.length} chars, aim 50–60)`);
            if (finalParsed.fetchedTitle.length > 70) recomputedIssues.push(`Title too long (${finalParsed.fetchedTitle.length} chars, aim 50–60)`);
          }
          if (!finalParsed.fetchedDescription) {
            recomputedIssues.push("Missing meta description");
          } else {
            if (finalParsed.fetchedDescription.length < 100) recomputedIssues.push(`Meta description too short (${finalParsed.fetchedDescription.length} chars, aim 150–160)`);
            if (finalParsed.fetchedDescription.length > 170) recomputedIssues.push(`Meta description too long (${finalParsed.fetchedDescription.length} chars, aim 150–160)`);
          }
          if (!finalParsed.fetchedH1) recomputedIssues.push("Missing H1 heading");
          // Check multiple H1s in the source that was used
          const sourceHtml = sourceUsed === "rendered" ? renderedHtml : rawHtml;
          const h1All = sourceHtml.match(/<h1[^>]*>/gi);
          if (h1All && h1All.length > 1) recomputedIssues.push(`Multiple H1 tags found (${h1All.length})`);
          if (!finalParsed.fetchedCanonical) recomputedIssues.push("Missing canonical tag");

          finalParsed.issues = recomputedIssues;

          // Add debug fields
          const debugFields = {
            rawTitle: rawParsed?.fetchedTitle || null,
            renderedTitle: renderedParsed?.fetchedTitle || null,
            rawDescription: rawParsed?.fetchedDescription || null,
            renderedDescription: renderedParsed?.fetchedDescription || null,
            sourceUsed,
          };

          console.log(`[${pageUrl}] source=${sourceUsed} rawTitle=${debugFields.rawTitle} renderedTitle=${debugFields.renderedTitle}`);

          try {
            const ai = await getAiSuggestions(finalParsed, LOVABLE_API_KEY, compliance);
            results.push({ ...finalParsed, ...ai, ...debugFields });
          } catch (aiErr) {
            console.error("AI error for", pageUrl, aiErr);
            results.push({
              ...finalParsed, suggestedTitle: null, suggestedDescription: null,
              suggestedH1: null, aiChecklist: [], issueSuggestions: [], violations: [],
              ...debugFields,
            });
          }
        } catch (err) {
          console.error("Error processing", pageUrl, err);
          results.push({
            url: pageUrl, fetchedTitle: null, fetchedDescription: null, fetchedH1: null,
            fetchedCanonical: null, issues: [`Fetch failed: ${err instanceof Error ? err.message : "Unknown error"}`],
            suggestedTitle: null, suggestedDescription: null, suggestedH1: null,
            aiChecklist: [], issueSuggestions: [], violations: [],
            rawTitle: null, renderedTitle: null, rawDescription: null, renderedDescription: null, sourceUsed: "raw" as const,
          });
        }
      }

      return new Response(JSON.stringify({ success: true, results, batchId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: get-compliance — return current compliance settings to frontend
    if (action === "get-compliance") {
      return new Response(JSON.stringify({ success: true, compliance }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action. Use 'discover', 'analyze', or 'get-compliance'.");
  } catch (error) {
    console.error("seo-audit error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
