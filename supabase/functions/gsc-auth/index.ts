import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

async function authenticateCaller(req: Request): Promise<{ userId: string } | { error: Response }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }),
    };
  }
  const token = authHeader.replace("Bearer ", "");
  const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data, error } = await anon.auth.getUser(token);
  if (error || !data?.user) {
    return {
      error: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }),
    };
  }
  return { userId: data.user.id };
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

async function getValidToken(userId: string): Promise<{ accessToken: string; connection: any }> {
  const sb = getServiceClient();
  const { data: conn } = await sb
    .from("gsc_connections")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!conn) throw new Error("GSC not connected");

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

    return { accessToken: refreshed.access_token, connection: { ...conn, access_token: refreshed.access_token } };
  }

  return { accessToken: conn.access_token, connection: conn };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get("GSC_CLIENT_ID");
    const clientSecret = Deno.env.get("GSC_CLIENT_SECRET");
    if (!clientId || !clientSecret) {
      throw new Error("Google OAuth credentials not configured. Add GSC_CLIENT_ID and GSC_CLIENT_SECRET.");
    }

    const body = await req.json();
    const { action, code, redirect_uri, property, state } = body;

    // get-auth-url is the only action that does NOT require an authenticated user
    // (it just builds a public Google OAuth URL with no user-specific data).
    if (action === "get-auth-url") {
      if (!redirect_uri) throw new Error("redirect_uri required");
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirect_uri,
        response_type: "code",
        scope: "https://www.googleapis.com/auth/webmasters.readonly",
        access_type: "offline",
        prompt: "consent select_account",
      });
      if (state) params.set("state", state);
      const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
      return new Response(JSON.stringify({ url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // All other actions require a verified caller. The user_id is derived from
    // the JWT — never trusted from the request body.
    const auth = await authenticateCaller(req);
    if ("error" in auth) return auth.error;
    const userId = auth.userId;

    if (action === "exchange-code") {
      if (!code || !redirect_uri) throw new Error("code and redirect_uri required");

      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri,
        }),
      });

      if (!tokenRes.ok) {
        const t = await tokenRes.text();
        console.error("Token exchange failed:", t);
        throw new Error("Failed to exchange authorization code");
      }

      const tokens = await tokenRes.json();
      const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000);

      const sb = getServiceClient();

      await sb.from("gsc_connections").delete().eq("user_id", userId);

      await sb.from("gsc_connections").insert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt.toISOString(),
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list-properties") {
      const { accessToken } = await getValidToken(userId);

      const res = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Failed to list properties: ${t}`);
      }
      const data = await res.json();
      const sites = (data.siteEntry || []).map((s: any) => ({
        siteUrl: s.siteUrl,
        permissionLevel: s.permissionLevel,
      }));

      return new Response(JSON.stringify({ sites }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "select-property") {
      if (!property) throw new Error("property required");
      const sb = getServiceClient();
      await sb.from("gsc_connections").update({
        selected_property: property,
        updated_at: new Date().toISOString(),
      }).eq("user_id", userId);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "status") {
      const sb = getServiceClient();
      const { data: conn } = await sb
        .from("gsc_connections")
        .select("id, selected_property, connected_at, updated_at")
        .eq("user_id", userId)
        .single();

      return new Response(JSON.stringify({
        connected: !!conn,
        property: conn?.selected_property || null,
        connectedAt: conn?.connected_at || null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "disconnect") {
      const sb = getServiceClient();
      // Look up the user's selected property so we only clear THEIR cached page data.
      const { data: conn } = await sb
        .from("gsc_connections")
        .select("selected_property")
        .eq("user_id", userId)
        .single();

      await sb.from("gsc_connections").delete().eq("user_id", userId);

      if (conn?.selected_property) {
        await sb.from("gsc_page_data").delete().eq("property", conn.selected_property);
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action");
  } catch (error) {
    console.error("gsc-auth error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
