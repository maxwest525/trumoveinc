import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendDocumentRequest {
  documentType: "estimate" | "ccach" | "bol" | "merchant_payment";
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  refNumber: string;
  deliveryMethod: "email" | "sms" | "both";
  signingUrl: string;
}

const DOCUMENT_LABELS: Record<string, string> = {
  estimate: "Estimate Authorization",
  ccach: "CC/ACH Authorization",
  bol: "Bill of Lading",
  merchant_payment: "Merchant Payment Info",
};

// Map document types to their transactional email template names
const TEMPLATE_MAP: Record<string, string> = {
  estimate: "esign-request",
  ccach: "ccach-authorization",
  merchant_payment: "esign-request",
};

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("1") && digits.length === 11) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (phone.startsWith("+")) return phone;
  return `+${digits}`;
}

async function sendSms(customerPhone: string, customerName: string, documentLabel: string, refNumber: string, signingUrl: string) {
  const CLICKSEND_USERNAME = Deno.env.get("CLICKSEND_USERNAME");
  if (!CLICKSEND_USERNAME) throw new Error("CLICKSEND_USERNAME is not configured");

  const CLICKSEND_API_KEY = Deno.env.get("CLICKSEND_API_KEY");
  if (!CLICKSEND_API_KEY) throw new Error("CLICKSEND_API_KEY is not configured");

  const normalizedPhone = normalizePhone(customerPhone);
  console.log(`Normalizing phone: "${customerPhone}" → "${normalizedPhone}"`);

  const smsBody = `Hi ${customerName}, your ${documentLabel} (${refNumber}) is ready for signature. Please review and sign here: ${signingUrl}`;

  const basicAuth = btoa(`${CLICKSEND_USERNAME}:${CLICKSEND_API_KEY}`);

  const response = await fetch("https://rest.clicksend.com/v3/sms/send", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          to: normalizedPhone,
          body: smsBody,
          source: "trumove",
        },
      ],
    }),
  });

  const data = await response.json();
  console.log("ClickSend API response:", JSON.stringify(data));
  if (!response.ok) {
    throw new Error(`ClickSend SMS failed [${response.status}]: ${JSON.stringify(data)}`);
  }
  return data;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const {
      documentType,
      customerName,
      customerEmail,
      customerPhone,
      refNumber,
      deliveryMethod,
      signingUrl,
    }: SendDocumentRequest = await req.json();

    if (!documentType || !customerName || !refNumber) {
      throw new Error("Missing required fields: documentType, customerName, refNumber");
    }

    const documentLabel = DOCUMENT_LABELS[documentType] || documentType;
    const results: Record<string, any> = {};
    const errors: Record<string, string> = {};

    // Send email via built-in transactional email system
    if (deliveryMethod === "email" || deliveryMethod === "both") {
      if (!customerEmail) {
        errors.email = "Email address is required for email delivery";
      } else {
        try {
          const templateName = TEMPLATE_MAP[documentType] || "esign-request";
          const { data, error } = await supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName,
              recipientEmail: customerEmail,
              idempotencyKey: `esign-${refNumber}-${documentType}`,
              templateData: {
                customerName,
                documentLabel,
                refNumber,
                signingUrl,
              },
            },
          });

          if (error) {
            throw new Error(error.message || "Failed to send email");
          }
          results.email = { success: true, sentTo: customerEmail };
          console.log("E-Sign email enqueued successfully via transactional system");
        } catch (err: any) {
          console.error("Email send failed:", err.message);
          errors.email = err.message;
        }
      }
    }

    // Send SMS via Twilio (unchanged)
    if (deliveryMethod === "sms" || deliveryMethod === "both") {
      if (!customerPhone) {
        errors.sms = "Phone number is required for SMS delivery";
      } else {
        try {
          const smsResult = await sendSms(customerPhone, customerName, documentLabel, refNumber, signingUrl);
          results.sms = { success: true, messageSid: smsResult.sid, sentTo: customerPhone };
          console.log("SMS sent successfully via Twilio:", smsResult.sid);
        } catch (err: any) {
          console.error("SMS send failed:", err.message);
          errors.sms = err.message;
        }
      }
    }

    // If nothing succeeded at all, return error
    if (!results.email && !results.sms) {
      const errorMsg = Object.entries(errors).map(([k, v]) => `${k}: ${v}`).join("; ");
      throw new Error(errorMsg || "Invalid delivery method");
    }

    return new Response(
      JSON.stringify({ success: true, method: deliveryMethod, ...results, errors: Object.keys(errors).length > 0 ? errors : undefined }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-esign-document function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
