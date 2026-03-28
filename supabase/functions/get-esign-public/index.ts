import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const refNumber = url.searchParams.get("ref");

    if (!refNumber || typeof refNumber !== "string" || refNumber.length > 50) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid ref parameter" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Only allow alphanumeric, hyphens, underscores
    if (!/^[A-Za-z0-9\-_]+$/.test(refNumber)) {
      return new Response(
        JSON.stringify({ error: "Invalid ref format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch only the esign document matching the ref
    const { data: doc, error: docError } = await supabase
      .from("esign_documents")
      .select("lead_id, document_type, status, ref_number")
      .eq("ref_number", refNumber)
      .maybeSingle();

    if (docError || !doc) {
      return new Response(
        JSON.stringify({ error: "Document not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch only the minimal lead fields needed for signing
    let lead = null;
    if (doc.lead_id) {
      const { data: leadData } = await supabase
        .from("leads")
        .select("first_name, last_name, email, phone, origin_address")
        .eq("id", doc.lead_id)
        .maybeSingle();
      lead = leadData;
    }

    return new Response(
      JSON.stringify({
        document: {
          lead_id: doc.lead_id,
          document_type: doc.document_type,
          status: doc.status,
          ref_number: doc.ref_number,
        },
        lead: lead
          ? {
              first_name: lead.first_name,
              last_name: lead.last_name,
              email: lead.email,
              phone: lead.phone,
              origin_address: lead.origin_address,
            }
          : null,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error in get-esign-public:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
