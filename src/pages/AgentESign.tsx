import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AgentShell from "@/components/layout/AgentShell";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Send, Loader2, CheckCircle2, ArrowRight,
  Mail, MessageSquare, Package, Phone
} from "lucide-react";
import { toast } from "sonner";
import { getEsignBaseUrl } from "@/lib/esignUrl";
import { Label } from "@/components/ui/label";

type DeliveryMethod = "email" | "sms" | "both";

type SendEsignResponse = {
  success: boolean;
  partialFailure?: boolean;
  email?: { success: true; sentTo: string };
  sms?: { success: true; sentTo: string; provider?: string };
  errors?: Partial<Record<"email" | "sms", string>>;
  errorDetails?: Partial<Record<"email" | "sms", { provider?: string; code?: string }>>;
};

type SendDocumentResult = {
  key: string;
  success: boolean;
  refNumber?: string;
  error?: string;
  warning?: string;
};

function getDeliveryMethodLabel(method: DeliveryMethod) {
  if (method === "both") return "Email & SMS";
  if (method === "email") return "Email";
  return "SMS";
}

function getFriendlyDeliveryError(response?: SendEsignResponse) {
  const smsCode = response?.errorDetails?.sms?.code;
  const smsProvider = response?.errorDetails?.sms?.provider;

  if (smsProvider === "clicksend" && smsCode === "COUNTRY_NOT_ENABLED") {
    return "ClickSend is rejecting US SMS for this account. Enable United States sending in ClickSend first.";
  }

  return response?.errors?.sms || response?.errors?.email || "Failed to send document";
}

const DOC_TYPES = [
  { key: "estimate", label: "Estimate Authorization", icon: FileText },
  { key: "ccach", label: "CC/ACH Authorization", icon: FileText },
  { key: "merchant_payment", label: "Merchant Payment Info", icon: Package },
] as const;

export default function AgentESign() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get("leadId") || "";

  const [leadData, setLeadData] = useState<{ name: string; email: string; phone: string } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("email");

  useEffect(() => {
    if (!leadId) { setLoading(false); return; }
    supabase
      .from("leads")
      .select("first_name, last_name, email, phone")
      .eq("id", leadId)
      .single()
      .then(({ data }) => {
        if (data) {
          setLeadData({
            name: `${data.first_name} ${data.last_name}`.trim(),
            email: data.email || "",
            phone: data.phone || "",
          });
        }
        setLoading(false);
      });
  }, [leadId]);

  const handleSendToClient = async () => {
    if (!leadData) return;

    // Validate based on selected method
    if ((deliveryMethod === "email" || deliveryMethod === "both") && !leadData.email) {
      toast.error("Customer has no email on file");
      return;
    }
    if ((deliveryMethod === "sms" || deliveryMethod === "both") && !leadData.phone) {
      toast.error("Customer has no phone number on file");
      return;
    }

    setIsSending(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      const deliveryLabel = getDeliveryMethodLabel(deliveryMethod);

      const results: SendDocumentResult[] = await Promise.all(
        DOC_TYPES.map(async (doc) => {
          const prefixMap: Record<string, string> = { estimate: "EST", ccach: "CC", merchant_payment: "MP" };
          const refNumber = `${prefixMap[doc.key]}-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
          const signingUrl = `${getEsignBaseUrl()}/esign/${refNumber}`;

          const { data, error } = await supabase.functions.invoke("send-esign-document", {
            body: {
              documentType: doc.key,
              customerName: leadData.name,
              customerEmail: leadData.email || undefined,
              customerPhone: leadData.phone || undefined,
              refNumber,
              deliveryMethod,
              signingUrl,
            },
          });

          const response = data as SendEsignResponse | null;

          if (error) {
            console.error(`Failed to send ${doc.key}:`, error);
            return { key: doc.key, success: false, error: error.message || "Failed to send document" };
          }

          const delivered = Boolean(response?.email?.success || response?.sms?.success);
          if (!delivered) {
            return {
              key: doc.key,
              success: false,
              error: getFriendlyDeliveryError(response || undefined),
            };
          }

          await supabase.from("esign_documents").insert({
            lead_id: leadId,
            document_type: doc.key,
            ref_number: refNumber,
            status: "sent",
            delivery_method: deliveryMethod,
            sent_by: user?.user?.id || null,
          });

          return {
            key: doc.key,
            success: true,
            refNumber,
            warning: response?.partialFailure ? getFriendlyDeliveryError(response || undefined) : undefined,
          };
        })
      );

      const failed = results.filter((r) => !r.success);
      const warnings = results.flatMap((result) => (result.warning ? [result.warning] : []));

      if (failed.length === results.length) {
        toast.error(failed[0]?.error || "Failed to send all documents");
        return;
      } else if (failed.length > 0 || warnings.length > 0) {
        toast.warning(`${results.length - failed.length} of ${results.length} documents sent`);
      } else {
        toast.success(`All documents sent via ${deliveryLabel}`, {
          description: `Sent to ${leadData.name}`,
        });
      }

      navigate(`/agent/customers/${leadId}`);
    } catch (err) {
      console.error("Send error:", err);
      toast.error("Failed to send documents");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <AgentShell breadcrumbs={[{ label: "My Customers", href: "/agent/customers" }, { label: "E-Sign" }]}>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AgentShell>
    );
  }

  if (!leadId || !leadData) {
    return (
      <AgentShell breadcrumbs={[{ label: "My Customers", href: "/agent/customers" }, { label: "E-Sign" }]}>
        <div className="p-6 text-center space-y-3">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">No customer selected</p>
          <Button variant="outline" size="sm" onClick={() => navigate("/agent/customers")}>
            Go to My Customers
          </Button>
        </div>
      </AgentShell>
    );
  }

  return (
    <AgentShell breadcrumbs={[
      { label: "My Customers", href: "/agent/customers" },
      ...(leadId ? [{ label: leadData.first_name + " " + leadData.last_name, href: `/agent/customers/${leadId}` }] : []),
      { label: "E-Sign" },
    ]}>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Workflow breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>New Customer</span>
          <ArrowRight className="w-3 h-3" />
          <span>Move Details</span>
          <ArrowRight className="w-3 h-3" />
          <span>Inventory</span>
          <ArrowRight className="w-3 h-3" />
          <span className="text-primary font-semibold">Send to Client</span>
          <ArrowRight className="w-3 h-3" />
          <span>My Customers</span>
        </div>

        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send Documents to Client
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Send all authorization documents to {leadData.name} for signing
          </p>
        </div>

        {/* Customer info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-foreground/5 border border-border flex items-center justify-center">
                <span className="text-sm font-semibold">{leadData.name.split(" ").map(n => n[0]).join("")}</span>
              </div>
              <div>
                <p className="text-sm font-medium">{leadData.name}</p>
                <p className="text-xs text-muted-foreground">
                  {leadData.email && <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" />{leadData.email}</span>}
                  {leadData.email && leadData.phone && <span className="mx-1.5">•</span>}
                  {leadData.phone && <span className="inline-flex items-center gap-1"><MessageSquare className="w-3 h-3" />{leadData.phone}</span>}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents to send */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documents to Send</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {DOC_TYPES.map((doc) => {
              const Icon = doc.icon;
              return (
                <div key={doc.key} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{doc.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Will be sent via {deliveryMethod === "both" ? "email & SMS" : deliveryMethod === "email" ? "email" : "SMS"}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">Ready</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Delivery Method Selector */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Delivery Method</Label>
            <div className="flex gap-2">
              <Button
                variant={deliveryMethod === "email" ? "default" : "outline"}
                size="sm"
                className="flex-1 gap-2"
                onClick={() => setDeliveryMethod("email")}
                disabled={!leadData.email}
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
              <Button
                variant={deliveryMethod === "sms" ? "default" : "outline"}
                size="sm"
                className="flex-1 gap-2"
                onClick={() => setDeliveryMethod("sms")}
                disabled={!leadData.phone}
              >
                <Phone className="w-4 h-4" />
                SMS
              </Button>
              <Button
                variant={deliveryMethod === "both" ? "default" : "outline"}
                size="sm"
                className="flex-1 gap-2"
                onClick={() => setDeliveryMethod("both")}
                disabled={!leadData.email || !leadData.phone}
              >
                <Send className="w-4 h-4" />
                Both
              </Button>
            </div>
            {!leadData.email && <p className="text-[11px] text-destructive">No email on file — email unavailable</p>}
            {!leadData.phone && <p className="text-[11px] text-destructive">No phone on file — SMS unavailable</p>}
          </CardContent>
        </Card>

        {/* Send button */}
        <Button className="w-full gap-2 h-12 text-base" onClick={handleSendToClient} disabled={isSending}>
          {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          {isSending ? "Sending All Documents..." : `Send via ${deliveryMethod === "both" ? "Email & SMS" : deliveryMethod === "email" ? "Email" : "SMS"}`}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          After sending, you'll be redirected to the customer's profile to track document status
        </p>
      </div>
    </AgentShell>
  );
}
