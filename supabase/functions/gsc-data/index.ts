import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: Deno.env.get("GSC_CLIENT_ID")!,
      client_secret: Deno.env.get("GSC_CLIENT_SECRET")!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Token refresh failed: ${t}`);
  }
  return await res.json();
}

async function getValidToken(userId: string): Promise<{ accessToken: string; property: string }> {
  const sb = getSupabase();
  const { data: conn } = await sb
    .from("gsc_connections")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!conn) throw new Error("GSC not connected");
  if (!conn.selected_property) throw new Error("No GSC property selected");

  const expiresAt = new Date(conn.token_expires_at);
  const now = new Date();

  if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    const refreshed = await refreshAccessToken(conn.refresh_token);
    const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000);
    await sb.from("gsc_connections").update({
      access_token: refreshed.access_token,
      token_expires_at: newExpiry.toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", conn.id);
    return { accessToken: refreshed.access_token, property: conn.selected_property };
  }

  return { accessToken: conn.access_token, property: conn.selected_property };
}

interface QueryRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

/** Normalize a URL to a canonical key for matching */
function normalizeUrl(raw: string, propertyOrigin?: string): string {
  let url = raw.trim();

  // If path-only (starts with /), convert to absolute using property origin
  if (url.startsWith("/") && propertyOrigin) {
    url = propertyOrigin.replace(/\/$/, "") + url;
  }

  try {
    const parsed = new URL(url);
    // Lowercase host
    parsed.hostname = parsed.hostname.toLowerCase();
    // Remove www
    parsed.hostname = parsed.hostname.replace(/^www\./, "");
    // Remove hash
    parsed.hash = "";
    // Remove tracking params
    const trackingParams = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
    trackingParams.forEach(p => parsed.searchParams.delete(p));
    // Normalize protocol to https
    parsed.protocol = "https:";
    // Build path: remove trailing slash except for root
    let path = parsed.pathname;
    if (path !== "/" && path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    // Reconstruct: origin + path + sorted search params
    const search = parsed.searchParams.toString();
    return `https://${parsed.hostname}${path}${search ? "?" + search : ""}`;
  } catch {
    // If URL parsing fails, just lowercase and trim slashes
    return url.toLowerCase().replace(/\/+$/, "") || "/";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, user_id, page_url, urls } = await req.json();

    // ACTION: fetch-page-queries — get top queries for a specific page URL
    if (action === "fetch-page-queries") {
      if (!user_id || !page_url) throw new Error("user_id and page_url required");

      const { accessToken, property } = await getValidToken(user_id);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 28);

      const apiUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`;

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          dimensions: ["query"],
          dimensionFilterGroups: [{
            filters: [{
              dimension: "page",
              operator: "equals",
              expression: page_url,
            }],
          }],
          rowLimit: 20,
          dataState: "final",
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        console.error("GSC API error:", res.status, t);
        if (res.status === 403) throw new Error("Permission denied. Verify the property is accessible.");
        throw new Error(`GSC API error: ${res.status}`);
      }

      const data = await res.json();
      const queries = (data.rows || []).map((r: QueryRow) => ({
        query: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: Math.round(r.ctr * 10000) / 100,
        position: Math.round(r.position * 10) / 10,
      }));

      // Cache the data
      const sb = getSupabase();
      if (queries.length > 0) {
        // Clear old data for this page
        await sb.from("gsc_page_data").delete().eq("page_url", page_url).eq("property", property);
        // Insert fresh data
        const rows = queries.map((q: any) => ({
          property,
          page_url,
          query: q.query,
          clicks: q.clicks,
          impressions: q.impressions,
          ctr: q.ctr,
          position: q.position,
          fetched_at: new Date().toISOString(),
          date_range_start: startDate.toISOString().split("T")[0],
          date_range_end: endDate.toISOString().split("T")[0],
        }));
        await sb.from("gsc_page_data").insert(rows);
      }

      return new Response(JSON.stringify({ queries, page_url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: fetch-all-pages — get totals for multiple pages
    if (action === "fetch-all-pages") {
      if (!user_id || !urls || !Array.isArray(urls)) throw new Error("user_id and urls[] required");

      const { accessToken, property } = await getValidToken(user_id);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 28);

      const apiUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`;

      // Fetch page-level totals
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          dimensions: ["page"],
          rowLimit: 500,
          dataState: "final",
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`GSC API error: ${res.status} - ${t}`);
      }

      const data = await res.json();

      // Derive property origin for path→absolute conversion
      let propertyOrigin = property;
      try {
        const pu = new URL(property.startsWith("sc-domain:") ? `https://${property.replace("sc-domain:", "")}` : property);
        propertyOrigin = pu.origin;
      } catch { /* keep as-is */ }

      // Build normalized lookup from GSC response
      const gscNormMap: Record<string, { clicks: number; impressions: number; ctr: number; position: number; gsc_url_raw: string }> = {};

      (data.rows || []).forEach((r: QueryRow) => {
        const gscUrl = r.keys[0];
        const normKey = normalizeUrl(gscUrl);
        gscNormMap[normKey] = {
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: Math.round(r.ctr * 10000) / 100,
          position: Math.round(r.position * 10) / 10,
          gsc_url_raw: gscUrl,
        };
      });

      // Calculate fix priority for each audit URL
      const results = urls.map((u: string) => {
        const normKey = normalizeUrl(u, propertyOrigin);
        const d = gscNormMap[normKey];

        const debug = {
          audit_url_raw: u,
          gsc_url_raw: d?.gsc_url_raw || null,
          normalized_key: normKey,
          matched: !!d,
        };

        if (!d) return { url: u, clicks: 0, impressions: 0, ctr: 0, position: 0, fixPriority: 0, _debug: debug };

        // Priority scoring: high impressions + low CTR + position 5-20
        let priority = 0;
        if (d.impressions > 100) priority += Math.min(d.impressions / 500, 30);
        if (d.ctr < 5 && d.impressions > 50) priority += (5 - d.ctr) * 5;
        if (d.position >= 5 && d.position <= 20) priority += (20 - d.position) * 2;
        if (d.position > 20) priority += 5;

        return {
          url: u,
          clicks: d.clicks,
          impressions: d.impressions,
          ctr: d.ctr,
          position: d.position,
          fixPriority: Math.round(priority),
          _debug: debug,
        };
      });

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: get-cached — return cached GSC data from DB
    if (action === "get-cached") {
      if (!page_url) throw new Error("page_url required");
      const sb = getSupabase();
      const { data } = await sb
        .from("gsc_page_data")
        .select("*")
        .eq("page_url", page_url)
        .order("impressions", { ascending: false })
        .limit(20);

      return new Response(JSON.stringify({ queries: data || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action. Use 'fetch-page-queries', 'fetch-all-pages', or 'get-cached'.");
  } catch (error) {
    console.error("gsc-data error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
