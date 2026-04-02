import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getSupabase() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: Deno.env.get("GSC_CLIENT_ID")!, client_secret: Deno.env.get("GSC_CLIENT_SECRET")!, refresh_token: refreshToken, grant_type: "refresh_token" }) });
  if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`);
  return await res.json();
}

async function getValidToken(userId: string): Promise<{ accessToken: string; property: string }> {
  const sb = getSupabase();
  const { data: conn } = await sb.from("gsc_connections").select("*").eq("user_id", userId).single();
  if (!conn) throw new Error("GSC not connected");
  if (!conn.selected_property) throw new Error("No GSC property selected");
  if (new Date(conn.token_expires_at).getTime() - Date.now() < 5 * 60 * 1000) {
    const r = await refreshAccessToken(conn.refresh_token);
    await sb.from("gsc_connections").update({ access_token: r.access_token, token_expires_at: new Date(Date.now() + r.expires_in * 1000).toISOString(), updated_at: new Date().toISOString() }).eq("id", conn.id);
    return { accessToken: r.access_token, property: conn.selected_property };
  }
  return { accessToken: conn.access_token, property: conn.selected_property };
}

interface QueryRow { keys: string[]; clicks: number; impressions: number; ctr: number; position: number; }

function normalizeUrl(raw: string, propertyOrigin?: string): string {
  let url = raw.trim();
  if (url.startsWith("/") && propertyOrigin) url = propertyOrigin.replace(/\/$/, "") + url;
  try {
    const parsed = new URL(url);
    parsed.hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    parsed.hash = "";
    ["utm_source","utm_medium","utm_campaign","utm_term","utm_content","gclid","fbclid"].forEach(p => parsed.searchParams.delete(p));
    parsed.protocol = "https:";
    let path = parsed.pathname;
    if (path !== "/" && path.endsWith("/")) path = path.slice(0, -1);
    const search = parsed.searchParams.toString();
    return `https://${parsed.hostname}${path}${search ? "?" + search : ""}`;
  } catch { return url.toLowerCase().replace(/\/+$/, "") || "/"; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { action, user_id, page_url, urls } = await req.json();

    // site-overview: aggregate KPIs + trend + top pages for KPI dashboard
    if (action === "site-overview") {
      if (!user_id) throw new Error("user_id required");
      const { accessToken, property } = await getValidToken(user_id);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 28);
      const ds = (d: Date) => d.toISOString().split("T")[0];
      const apiUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`;
      const h = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
      const base = { startDate: ds(startDate), endDate: ds(endDate), dataState: "final" };
      const [totRes, trendRes, pagesRes] = await Promise.all([
        fetch(apiUrl, { method: "POST", headers: h, body: JSON.stringify({ ...base, rowLimit: 1 }) }),
        fetch(apiUrl, { method: "POST", headers: h, body: JSON.stringify({ ...base, dimensions: ["date"], rowLimit: 28 }) }),
        fetch(apiUrl, { method: "POST", headers: h, body: JSON.stringify({ ...base, dimensions: ["page"], rowLimit: 5 }) }),
      ]);
      let clicks = 0, impressions = 0, ctr = 0, avgPosition = 0;
      if (totRes.ok) { const d = await totRes.json(); const r = d.rows?.[0]; if (r) { clicks = r.clicks; impressions = r.impressions; ctr = Math.round(r.ctr * 10000) / 100; avgPosition = Math.round(r.position * 10) / 10; } }
      let trend: any[] = [];
      if (trendRes.ok) { const d = await trendRes.json(); trend = (d.rows || []).map((r: QueryRow) => ({ date: r.keys[0], clicks: r.clicks, impressions: r.impressions })); }
      let topPages: any[] = [];
      if (pagesRes.ok) { const d = await pagesRes.json(); topPages = (d.rows || []).map((r: QueryRow) => ({ url: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: Math.round(r.ctr * 10000) / 100, position: Math.round(r.position * 10) / 10 })); }
      return new Response(JSON.stringify({ clicks, impressions, ctr, avgPosition, trend, topPages, dateRange: "last 28 days", property }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // fetch-page-queries
    if (action === "fetch-page-queries") {
      if (!user_id || !page_url) throw new Error("user_id and page_url required");
      const { accessToken, property } = await getValidToken(user_id);
      let propertyOrigin = property;
      try { const pu = new URL(property.startsWith("sc-domain:") ? `https://${property.replace("sc-domain:", "")}` : property); propertyOrigin = pu.origin; } catch { /* keep */ }
      let absolutePageUrl = page_url;
      if (page_url.startsWith("/")) absolutePageUrl = propertyOrigin.replace(/\/$/, "") + page_url;
      const endDate = new Date(); const startDate = new Date(); startDate.setDate(startDate.getDate() - 28);
      const apiUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`;
      const res = await fetch(apiUrl, { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ startDate: startDate.toISOString().split("T")[0], endDate: endDate.toISOString().split("T")[0], dimensions: ["query"], dimensionFilterGroups: [{ filters: [{ dimension: "page", operator: "equals", expression: absolutePageUrl }] }], rowLimit: 20, dataState: "final" }) });
      if (!res.ok) { const t = await res.text(); if (res.status === 403) throw new Error("Permission denied."); throw new Error(`GSC API error: ${res.status}`); }
      const data = await res.json();
      const queries = (data.rows || []).map((r: QueryRow) => ({ query: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: Math.round(r.ctr * 10000) / 100, position: Math.round(r.position * 10) / 10 }));
      const sb = getSupabase();
      if (queries.length > 0) {
        await sb.from("gsc_page_data").delete().eq("page_url", page_url).eq("property", property);
        await sb.from("gsc_page_data").insert(queries.map((q: any) => ({ property, page_url, query: q.query, clicks: q.clicks, impressions: q.impressions, ctr: q.ctr, position: q.position, fetched_at: new Date().toISOString(), date_range_start: startDate.toISOString().split("T")[0], date_range_end: endDate.toISOString().split("T")[0] })));
      }
      return new Response(JSON.stringify({ queries, page_url }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // fetch-all-pages
    if (action === "fetch-all-pages") {
      if (!user_id || !urls || !Array.isArray(urls)) throw new Error("user_id and urls[] required");
      const { accessToken, property } = await getValidToken(user_id);
      const endDate = new Date(); const startDate = new Date(); startDate.setDate(startDate.getDate() - 28);
      const apiUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`;
      const res = await fetch(apiUrl, { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ startDate: startDate.toISOString().split("T")[0], endDate: endDate.toISOString().split("T")[0], dimensions: ["page"], rowLimit: 500, dataState: "final" }) });
      if (!res.ok) throw new Error(`GSC API error: ${res.status} - ${await res.text()}`);
      const data = await res.json();
      let propertyOrigin = property;
      try { const pu = new URL(property.startsWith("sc-domain:") ? `https://${property.replace("sc-domain:", "")}` : property); propertyOrigin = pu.origin; } catch { /* keep */ }
      const gscNormMap: Record<string, any> = {};
      (data.rows || []).forEach((r: QueryRow) => { const k = normalizeUrl(r.keys[0]); gscNormMap[k] = { clicks: r.clicks, impressions: r.impressions, ctr: Math.round(r.ctr * 10000) / 100, position: Math.round(r.position * 10) / 10, gsc_url_raw: r.keys[0] }; });
      const results = urls.map((u: string) => {
        const k = normalizeUrl(u, propertyOrigin); const d = gscNormMap[k];
        if (!d) return { url: u, clicks: 0, impressions: 0, ctr: 0, position: 0, fixPriority: 0 };
        let p = 0;
        if (d.impressions > 100) p += Math.min(d.impressions / 500, 30);
        if (d.ctr < 5 && d.impressions > 50) p += (5 - d.ctr) * 5;
        if (d.position >= 5 && d.position <= 20) p += (20 - d.position) * 2;
        if (d.position > 20) p += 5;
        return { url: u, clicks: d.clicks, impressions: d.impressions, ctr: d.ctr, position: d.position, fixPriority: Math.round(p) };
      });
      return new Response(JSON.stringify({ results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // get-cached
    if (action === "get-cached") {
      if (!page_url) throw new Error("page_url required");
      const { data } = await getSupabase().from("gsc_page_data").select("*").eq("page_url", page_url).order("impressions", { ascending: false }).limit(20);
      return new Response(JSON.stringify({ queries: data || [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error("Invalid action. Use 'site-overview', 'fetch-page-queries', 'fetch-all-pages', or 'get-cached'.");
  } catch (error) {
    console.error("gsc-data error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
