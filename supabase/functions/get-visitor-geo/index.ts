import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get visitor IP from headers (Supabase edge functions provide this)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    // Skip geolocation for private/local IPs
    if (
      ip === "unknown" ||
      ip.startsWith("127.") ||
      ip.startsWith("10.") ||
      ip.startsWith("192.168.") ||
      ip === "::1"
    ) {
      return new Response(
        JSON.stringify({ city: null, region: null, country: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use ip-api.com (free, no key required, 45 req/min)
    const geoRes = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,city,regionName,country`
    );
    const geo = await geoRes.json();

    if (geo.status !== "success") {
      return new Response(
        JSON.stringify({ city: null, region: null, country: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        city: geo.city || null,
        region: geo.regionName || null,
        country: geo.country || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Geo lookup error:", error);
    return new Response(
      JSON.stringify({ city: null, region: null, country: null }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
