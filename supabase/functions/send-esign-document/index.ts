import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendDocumentRequest {
  documentType: "estimate" | "ccach" | "bol";
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  refNumber: string;
  deliveryMethod: "email" | "sms";
  signingUrl: string;
}

const DOCUMENT_LABELS: Record<string, string> = {
  estimate: "Estimate Authorization",
  ccach: "CC/ACH Authorization",
  bol: "Bill of Lading",
};

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
      signingUrl 
    }: SendDocumentRequest = await req.json();

    // Validate required fields
    if (!documentType || !customerName || !refNumber) {
      throw new Error("Missing required fields: documentType, customerName, refNumber");
    }

    if (deliveryMethod === "email" && !customerEmail) {
      throw new Error("Email address is required for email delivery");
    }

    const documentLabel = DOCUMENT_LABELS[documentType] || documentType;

    // For email delivery, send via Resend
    if (deliveryMethod === "email") {
      const emailResponse = await resend.emails.send({
        from: "TruMove <noreply@trumove.lovable.app>",
        to: [customerEmail],
        subject: `Action Required: Sign Your ${documentLabel} - ${refNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
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
              <a href="https://trumove.lovable.app" style="color: #7C3AED;">trumove.lovable.app</a>
            </p>
          </body>
          </html>
        `,
      });

      console.log("E-Sign email sent successfully:", emailResponse);

      return new Response(
        JSON.stringify({ 
          success: true, 
          method: "email",
          messageId: emailResponse.data?.id,
          sentTo: customerEmail 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // For SMS delivery, send via Twilio connector gateway
    if (deliveryMethod === "sms") {
      if (!customerPhone) {
        throw new Error("Phone number is required for SMS delivery");
      }

      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

      const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
      if (!TWILIO_API_KEY) throw new Error("TWILIO_API_KEY is not configured");

      const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");
      if (!TWILIO_PHONE_NUMBER) throw new Error("TWILIO_PHONE_NUMBER is not configured");

      const smsBody = `Hi ${customerName}, your ${documentLabel} (${refNumber}) is ready for signature. Please review and sign here: ${signingUrl}`;

      const twilioResponse = await fetch("https://connector-gateway.lovable.dev/twilio/Messages.json", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": TWILIO_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: customerPhone,
          From: TWILIO_PHONE_NUMBER,
          Body: smsBody,
        }),
      });

      const twilioData = await twilioResponse.json();
      if (!twilioResponse.ok) {
        console.error("Twilio API error:", twilioData);
        throw new Error(`Twilio SMS failed [${twilioResponse.status}]: ${JSON.stringify(twilioData)}`);
      }

      console.log("SMS sent successfully via Twilio:", twilioData.sid);

      return new Response(
        JSON.stringify({ 
          success: true, 
          method: "sms",
          messageSid: twilioData.sid,
          sentTo: customerPhone,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    throw new Error("Invalid delivery method");

  } catch (error: any) {
    console.error("Error in send-esign-document function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
