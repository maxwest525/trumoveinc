import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function isValidRef(ref: unknown): ref is string {
  return typeof ref === "string" && ref.length > 0 && ref.length <= 50 && /^[A-Za-z0-9\-_]+$/.test(ref);
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // GET: return only document metadata (no PII until verified)
    if (req.method === "GET") {
      const url = new URL(req.url);
      const refNumber = url.searchParams.get("ref");

      if (!isValidRef(refNumber)) {
        return new Response(
          JSON.stringify({ error: "Missing or invalid ref parameter" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const { data: doc } = await supabase
        .from("esign_documents")
        .select("lead_id, document_type, status, ref_number")
        .eq("ref_number", refNumber)
        .maybeSingle();

      if (!doc) {
        return new Response(
          JSON.stringify({ error: "Document not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Only return non-sensitive document metadata; lead PII requires verification
      return new Response(
        JSON.stringify({
          document: {
            lead_id: doc.lead_id,
            document_type: doc.document_type,
            status: doc.status,
            ref_number: doc.ref_number,
          },
          requires_verification: true,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // POST: verify identity OR update document status
    if (req.method === "POST") {
      const body = await req.json();
      const { action } = body;

      // ── Identity verification ──
      if (action === "verify") {
        const { ref_number, first_name, last_name } = body;

        if (!isValidRef(ref_number)) {
          return new Response(
            JSON.stringify({ error: "Invalid ref_number" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        if (
          typeof first_name !== "string" || first_name.trim().length === 0 ||
          typeof last_name !== "string" || last_name.trim().length === 0
        ) {
          return new Response(
            JSON.stringify({ error: "First and last name are required" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        // Look up document
        const { data: doc } = await supabase
          .from("esign_documents")
          .select("lead_id, document_type, status, ref_number")
          .eq("ref_number", ref_number)
          .maybeSingle();

        if (!doc || !doc.lead_id) {
          return new Response(
            JSON.stringify({ verified: false, error: "Document not found" }),
            { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        // Look up lead
        const { data: lead } = await supabase
          .from("leads")
          .select("first_name, last_name, email, phone, origin_address")
          .eq("id", doc.lead_id)
          .maybeSingle();

        if (!lead) {
          return new Response(
            JSON.stringify({ verified: false, error: "Record not found" }),
            { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        // Case-insensitive comparison
        const firstMatch = normalize(first_name) === normalize(lead.first_name);
        const lastMatch = normalize(last_name) === normalize(lead.last_name);

        if (!firstMatch || !lastMatch) {
          return new Response(
            JSON.stringify({ verified: false, error: "Name does not match our records" }),
            { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        // Verified — return full data
        return new Response(
          JSON.stringify({
            verified: true,
            document: {
              lead_id: doc.lead_id,
              document_type: doc.document_type,
              status: doc.status,
              ref_number: doc.ref_number,
            },
            lead: {
              first_name: lead.first_name,
              last_name: lead.last_name,
              email: lead.email,
              phone: lead.phone,
              origin_address: lead.origin_address,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // ── Update document status (existing flow) ──
      const { ref_number, status } = body;

      if (!isValidRef(ref_number)) {
        return new Response(
          JSON.stringify({ error: "Invalid ref_number" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const allowedStatuses = ["opened", "completed"];
      if (!allowedStatuses.includes(status)) {
        return new Response(
          JSON.stringify({ error: "Invalid status. Allowed: opened, completed" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const updateData: Record<string, string> = { status };
      if (status === "completed") updateData.completed_at = new Date().toISOString();
      if (status === "opened") updateData.opened_at = new Date().toISOString();

      const { error } = await supabase
        .from("esign_documents")
        .update(updateData)
        .eq("ref_number", ref_number);

      if (error) {
        console.error("Failed to update esign status:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update status" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error in get-esign-public:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
