import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getSupabase() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

function getClientId() {
  return Deno.env.get("GOOGLE_CLIENT_ID") || Deno.env.get("GSC_CLIENT_ID");
}

function getClientSecret() {
  return Deno.env.get("GOOGLE_CLIENT_SECRET") || Deno.env.get("GSC_CLIENT_SECRET");
}

async function refreshAccessToken(rt: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: getClientId()!, client_secret: getClientSecret()!, refresh_token: rt, grant_type: "refresh_token" }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`);
  return await res.json();
}

async function getValidToken(userId: string) {
  const sb = getSupabase();
  const { data: conn } = await sb.from("ga4_connections").select("*").eq("user_id", userId).single();
  if (!conn) throw new Error("GA4 not connected");
  if (!conn.property_id) throw new Error("No GA4 property selected");
  if (new Date(conn.token_expires_at).getTime() - Date.now() < 5 * 60 * 1000) {
    const r = await refreshAccessToken(conn.refresh_token);
    await sb.from("ga4_connections").update({ access_token: r.access_token, token_expires_at: new Date(Date.now() + r.expires_in * 1000).toISOString(), updated_at: new Date().toISOString() }).eq("id", conn.id);
    return { accessToken: r.access_token, propertyId: conn.property_id };
  }
  return { accessToken: conn.access_token, propertyId: conn.property_id };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const clientId = getClientId();
    const clientSecret = getClientSecret();
    if (!clientId || !clientSecret) throw new Error("Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (or GSC_CLIENT_ID/GSC_CLIENT_SECRET) to Supabase secrets.");
    const { action, code, redirect_uri, user_id, property_id } = await req.json();

    if (action === "get-auth-url") {
      if (!redirect_uri) throw new Error("redirect_uri required");
      const p = new URLSearchParams({ client_id: clientId, redirect_uri, response_type: "code", scope: "https://www.googleapis.com/auth/analytics.readonly", access_type: "offline", prompt: "consent select_account" });
      return new Response(JSON.stringify({ url: `https://accounts.google.com/o/oauth2/v2/auth?${p}` }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "exchange-code") {
      if (!code || !redirect_uri || !user_id) throw new Error("code, redirect_uri, and user_id required");
      const tr = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code, grant_type: "authorization_code", redirect_uri }) });
      if (!tr.ok) throw new Error(`Token exchange failed: ${await tr.text()}`);
      const tokens = await tr.json();
      const sb = getSupabase();
      await sb.from("ga4_connections").delete().eq("user_id", user_id);
      await sb.from("ga4_connections").insert({ user_id, access_token: tokens.access_token, refresh_token: tokens.refresh_token, token_expires_at: new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString(), connected_at: new Date().toISOString() });
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "list-properties") {
      if (!user_id) throw new Error("user_id required");
      const { accessToken } = await getValidToken(user_id);
      const res = await fetch("https://analyticsadmin.googleapis.com/v1beta/accountSummaries", { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!res.ok) throw new Error(`Failed to list properties: ${await res.text()}`);
      const data = await res.json();
      const properties: any[] = [];
      (data.accountSummaries || []).forEach((a: any) => (a.propertySummaries || []).forEach((p: any) => properties.push({ propertyId: p.property.replace("properties/", ""), displayName: p.displayName, accountName: a.displayName })));
      return new Response(JSON.stringify({ properties }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "select-property") {
      if (!user_id || !property_id) throw new Error("user_id and property_id required");
      await getSupabase().from("ga4_connections").update({ property_id, updated_at: new Date().toISOString() }).eq("user_id", user_id);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "status") {
      if (!user_id) throw new Error("user_id required");
      const { data: conn } = await getSupabase().from("ga4_connections").select("id, property_id, connected_at").eq("user_id", user_id).single();
      return new Response(JSON.stringify({ connected: !!conn, propertyId: conn?.property_id || null, connectedAt: conn?.connected_at || null }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "disconnect") {
      if (!user_id) throw new Error("user_id required");
      await getSupabase().from("ga4_connections").delete().eq("user_id", user_id);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error("Invalid action");
  } catch (error) {
    console.error("ga4-auth error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
