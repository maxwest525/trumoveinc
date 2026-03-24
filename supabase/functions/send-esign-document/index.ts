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

interface DeliveryErrorDetail {
  provider?: "clicksend" | "twilio";
  code?: string;
}

class DeliveryError extends Error {
  provider?: "clicksend" | "twilio";
  code?: string;

  constructor(message: string, detail?: DeliveryErrorDetail) {
    super(message);
    this.name = "DeliveryError";
    this.provider = detail?.provider;
    this.code = detail?.code;
  }
}

const DOCUMENT_LABELS: Record<string, string> = {
  estimate: "Estimate Authorization",
  ccach: "CC/ACH Authorization",
  bol: "Bill of Lading",
  merchant_payment: "Merchant Payment Info",
};

const TEMPLATE_MAP: Record<string, string> = {
  estimate: "esign-request",
  ccach: "esign-request",
  merchant_payment: "esign-request",
};

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("1") && digits.length === 11) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (phone.startsWith("+")) return phone;
  return `+${digits}`;
}

function buildSmsBody(documentLabel: string, refNumber: string, signingUrl: string) {
  return `Action Required: Sign Your ${documentLabel} – ${refNumber}\n\n${signingUrl}\n\nReply STOP to opt out`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown delivery error";
}

function getErrorDetail(error: unknown): DeliveryErrorDetail | undefined {
  if (error instanceof DeliveryError) {
    return {
      provider: error.provider,
      code: error.code,
    };
  }

  return undefined;
}

async function sendSmsViaTwilioGateway(customerPhone: string, smsBody: string) {
  const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
  if (!TWILIO_API_KEY) throw new Error("TWILIO_API_KEY is not configured");

  const TWILIO_MESSAGING_SERVICE_SID = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");
  const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

  const normalizedPhone = normalizePhone(customerPhone);
  console.log(`Normalizing phone for Twilio: "${customerPhone}" → "${normalizedPhone}"`);

  const params = new URLSearchParams({
    To: normalizedPhone,
    Body: smsBody,
  });

  if (TWILIO_MESSAGING_SERVICE_SID) {
    params.set("MessagingServiceSid", TWILIO_MESSAGING_SERVICE_SID);
  } else if (TWILIO_PHONE_NUMBER) {
    params.set("From", TWILIO_PHONE_NUMBER);
  } else {
    throw new Error("Neither TWILIO_MESSAGING_SERVICE_SID nor TWILIO_PHONE_NUMBER is configured");
  }

  const response = await fetch(`${GATEWAY_URL}/Messages.json`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": TWILIO_API_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await response.json();
  console.log("Twilio Gateway response:", JSON.stringify(data));

  if (!response.ok) {
    throw new DeliveryError(`Twilio SMS failed [${response.status}]: ${JSON.stringify(data)}`, {
      provider: "twilio",
      code: data?.code?.toString() || response.status.toString(),
    });
  }

  return { provider: "twilio", data };
}

async function sendSms(customerPhone: string, documentLabel: string, refNumber: string, signingUrl: string) {
  const smsBody = buildSmsBody(documentLabel, refNumber, signingUrl);
  console.log(`SMS body (${smsBody.length} chars): ${smsBody}`);

  return await sendSmsViaTwilioGateway(customerPhone, smsBody);
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
    const errorDetails: Record<string, DeliveryErrorDetail> = {};

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

          if (data?.success === false) {
            throw new Error(data?.reason || "Email send was rejected");
          }

          results.email = { success: true, sentTo: customerEmail };
          console.log("E-Sign email enqueued successfully via app email system");
        } catch (err: any) {
          const message = getErrorMessage(err);
          console.error("Email send failed:", message);
          errors.email = message;
        }
      }
    }

    if (deliveryMethod === "sms" || deliveryMethod === "both") {
      if (!customerPhone) {
        errors.sms = "Phone number is required for SMS delivery";
      } else {
        try {
          const smsResult = await sendSms(customerPhone, documentLabel, refNumber, signingUrl);
          results.sms = {
            success: true,
            sentTo: customerPhone,
            provider: smsResult.provider,
            fallbackFrom: smsResult.fallbackFrom,
          };
          console.log(`SMS sent successfully via ${smsResult.provider}`);
        } catch (err: any) {
          const message = getErrorMessage(err);
          console.error("SMS send failed:", message);
          errors.sms = message;

          const detail = getErrorDetail(err);
          if (detail) {
            errorDetails.sms = detail;
          }
        }
      }
    }

    const hasSuccess = Boolean(results.email || results.sms);

    return new Response(
      JSON.stringify({
        success: hasSuccess,
        partialFailure: hasSuccess && Object.keys(errors).length > 0,
        method: deliveryMethod,
        ...results,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
        errorDetails: Object.keys(errorDetails).length > 0 ? errorDetails : undefined,
      }),
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
