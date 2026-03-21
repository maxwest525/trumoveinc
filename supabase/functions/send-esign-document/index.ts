import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Direct Twilio API (Basic Auth + MessagingServiceSid)

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

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("1") && digits.length === 11) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (phone.startsWith("+")) return phone;
  return `+${digits}`;
}

async function sendEmail(customerEmail: string, customerName: string, documentLabel: string, refNumber: string, signingUrl: string) {
  const emailResponse = await resend.emails.send({
    from: "TruMove <noreply@crm.trumoveinc.com>",
    to: [customerEmail],
    subject: `Action Required: Sign Your ${documentLabel} - ${refNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7C3AED; margin: 0;">TruMove</h1>
          <p style="color: #666; font-size: 14px;">Your Trusted Moving Partner</p>
        </div>
        <div style="background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0 0 10px 0; font-size: 24px;">${documentLabel}</h2>
          <p style="margin: 0; opacity: 0.9;">Reference: ${refNumber}</p>
        </div>
        <p>Hello ${customerName},</p>
        <p>Your <strong>${documentLabel}</strong> is ready for your signature. Please review and sign the document at your earliest convenience to proceed with your move.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${signingUrl}" style="display: inline-block; background: #7C3AED; color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Review & Sign Document
          </a>
        </div>
        <p style="font-size: 14px; color: #666;">
          <strong>Document Details:</strong><br>
          • Type: ${documentLabel}<br>
          • Reference: ${refNumber}<br>
          • Recipient: ${customerName}
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated message from TruMove. If you have questions about this document, please contact your moving coordinator.<br><br>
          <a href="https://trumoveinc.lovable.app" style="color: #7C3AED;">trumoveinc.lovable.app</a>
        </p>
      </body>
      </html>
    `,
  });
  return emailResponse;
}

async function sendSms(customerPhone: string, customerName: string, documentLabel: string, refNumber: string, signingUrl: string) {
  const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
  if (!TWILIO_ACCOUNT_SID) throw new Error("TWILIO_ACCOUNT_SID is not configured");

  const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
  if (!TWILIO_AUTH_TOKEN) throw new Error("TWILIO_AUTH_TOKEN is not configured");

  const TWILIO_MESSAGING_SERVICE_SID = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");
  if (!TWILIO_MESSAGING_SERVICE_SID) throw new Error("TWILIO_MESSAGING_SERVICE_SID is not configured");

  const normalizedPhone = normalizePhone(customerPhone);
  console.log(`Normalizing phone: "${customerPhone}" → "${normalizedPhone}"`);

  const smsBody = `Hi ${customerName}, your ${documentLabel} (${refNumber}) is ready for signature. Please review and sign here: ${signingUrl}`;

  const basicAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: normalizedPhone,
      MessagingServiceSid: TWILIO_MESSAGING_SERVICE_SID,
      Body: smsBody,
    }),
  });

  const data = await response.json();
  console.log("Twilio API response:", JSON.stringify(data));
  if (!response.ok) {
    throw new Error(`Twilio SMS failed [${response.status}]: ${JSON.stringify(data)}`);
  }
  return data;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Send email if method is "email" or "both"
    if (deliveryMethod === "email" || deliveryMethod === "both") {
      if (!customerEmail) {
        errors.email = "Email address is required for email delivery";
      } else {
        try {
          const emailResult = await sendEmail(customerEmail, customerName, documentLabel, refNumber, signingUrl);
          results.email = { success: true, messageId: emailResult.data?.id, sentTo: customerEmail };
          console.log("E-Sign email sent successfully:", emailResult);
        } catch (err: any) {
          console.error("Email send failed:", err.message);
          errors.email = err.message;
        }
      }
    }

    // Send SMS if method is "sms" or "both"
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
