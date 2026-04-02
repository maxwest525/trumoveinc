import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getSupabase() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

function getClientId() { return Deno.env.get("GOOGLE_CLIENT_ID") || Deno.env.get("GSC_CLIENT_ID"); }
function getClientSecret() { return Deno.env.get("GOOGLE_CLIENT_SECRET") || Deno.env.get("GSC_CLIENT_SECRET"); }

async function getValidToken(userId: string) {
  const sb = getSupabase();
  const { data: conn } = await sb.from("ga4_connections").select("*").eq("user_id", userId).single();
  if (!conn) throw new Error("GA4 not connected");
  if (!conn.property_id) throw new Error("No GA4 property selected");
  if (new Date(conn.token_expires_at).getTime() - Date.now() < 5 * 60 * 1000) {
    const res = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: getClientId()!, client_secret: getClientSecret()!, refresh_token: conn.refresh_token, grant_type: "refresh_token" }) });
    if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`);
    const r = await res.json();
    await sb.from("ga4_connections").update({ access_token: r.access_token, token_expires_at: new Date(Date.now() + r.expires_in * 1000).toISOString(), updated_at: new Date().toISOString() }).eq("id", conn.id);
    return { accessToken: r.access_token, propertyId: conn.property_id };
  }
  return { accessToken: conn.access_token, propertyId: conn.property_id };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { action, user_id } = await req.json();

    if (action === "overview") {
      if (!user_id) throw new Error("user_id required");
      const { accessToken, propertyId } = await getValidToken(user_id);
      const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ dateRanges: [{ startDate: "28daysAgo", endDate: "today" }], metrics: [{ name: "sessions" }, { name: "screenPageViews" }, { name: "bounceRate" }, { name: "averageSessionDuration" }, { name: "newUsers" }] }),
      });
      if (!res.ok) throw new Error(`GA4 API error: ${res.status} - ${await res.text()}`);
      const data = await res.json();
      const t = data.totals?.[0]?.metricValues || [];
      return new Response(JSON.stringify({
        sessions: parseInt(t[0]?.value || "0"),
        pageviews: parseInt(t[1]?.value || "0"),
        bounceRate: Math.round(parseFloat(t[2]?.value || "0") * 100),
        avgSessionDuration: Math.round(parseFloat(t[3]?.value || "0")),
        newUsers: parseInt(t[4]?.value || "0"),
        dateRange: "last 28 days",
        propertyId,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "top-pages") {
      if (!user_id) throw new Error("user_id required");
      const { accessToken, propertyId } = await getValidToken(user_id);
      const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ dateRanges: [{ startDate: "28daysAgo", endDate: "today" }], metrics: [{ name: "sessions" }, { name: "screenPageViews" }, { name: "bounceRate" }], dimensions: [{ name: "pagePath" }, { name: "pageTitle" }], orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 10 }),
      });
      if (!res.ok) throw new Error(`GA4 API error: ${res.status} - ${await res.text()}`);
      const data = await res.json();
      return new Response(JSON.stringify({ pages: (data.rows || []).map((r: any) => ({ path: r.dimensionValues[0].value, title: r.dimensionValues[1].value, sessions: parseInt(r.metricValues[0].value || "0"), pageviews: parseInt(r.metricValues[1].value || "0"), bounceRate: Math.round(parseFloat(r.metricValues[2].value || "0") * 100) })) }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error("Invalid action. Use 'overview' or 'top-pages'.");
  } catch (error) {
    console.error("ga4-data error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
