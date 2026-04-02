import { useState } from "react";
import DispatchShell from "@/components/layout/DispatchShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText, Send, Loader2, CheckCircle2, ArrowRight,
  Mail, MessageSquare, Search, Plus, Clock,
  Truck, ClipboardCheck, ChevronRight, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type DocType = "carrier_agreement" | "bill_of_lading";
type DeliveryMethod = "email" | "sms" | "both";
type DocStatus = "draft" | "sent" | "opened" | "signed" | "expired";

interface ESignDocument {
  id: string;
  refNumber: string;
  docType: DocType;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  status: DocStatus;
  jobId?: string;
  sentAt?: string;
  signedAt?: string;
}

const DOC_TYPES: { key: DocType; label: string; icon: typeof FileText; description: string }[] = [
  { key: "carrier_agreement", label: "Carrier Agreement", icon: ClipboardCheck, description: "Binding agreement between broker and carrier for shipment terms, rates, and liability" },
  { key: "bill_of_lading", label: "Bill of Lading", icon: FileText, description: "Official shipping document detailing cargo, origin, destination, and delivery terms" },
];

const RECENT_DOCS: ESignDocument[] = [
  { id: "1", refNumber: "CA-2026-0041", docType: "carrier_agreement", recipientName: "FastHaul Logistics", recipientEmail: "dispatch@fasthaul.com", recipientPhone: "(972) 555-0188", status: "signed", jobId: "J-4817", sentAt: "Apr 1, 2:30 PM", signedAt: "Apr 1, 4:15 PM" },
  { id: "2", refNumber: "BOL-2026-0039", docType: "bill_of_lading", recipientName: "Mike Torres", recipientEmail: "mike.t@trucrew.com", recipientPhone: "(214) 555-0142", status: "signed", jobId: "J-4817", sentAt: "Apr 1, 2:35 PM", signedAt: "Apr 1, 3:00 PM" },
  { id: "3", refNumber: "CA-2026-0042", docType: "carrier_agreement", recipientName: "Premier Moving Co", recipientEmail: "ops@premiermoving.com", recipientPhone: "(713) 555-0231", status: "sent", jobId: "J-4819", sentAt: "Apr 2, 8:00 AM" },
  { id: "4", refNumber: "BOL-2026-0040", docType: "bill_of_lading", recipientName: "Ana Gomez", recipientEmail: "ana.g@trucrew.com", recipientPhone: "(214) 555-0198", status: "opened", jobId: "J-4819", sentAt: "Apr 2, 8:05 AM" },
  { id: "5", refNumber: "CA-2026-0043", docType: "carrier_agreement", recipientName: "Lone Star Freight", recipientEmail: "admin@lonestarfreight.com", recipientPhone: "(817) 555-0309", status: "draft", jobId: "J-4823" },
];

const statusConfig: Record<DocStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  draft: { label: "Draft", variant: "outline", color: "text-muted-foreground" },
  sent: { label: "Sent", variant: "secondary", color: "text-chart-4" },
  opened: { label: "Opened", variant: "secondary", color: "text-primary" },
  signed: { label: "Signed", variant: "default", color: "text-chart-2" },
  expired: { label: "Expired", variant: "destructive", color: "text-destructive" },
};

export default function DispatchESign() {
  const [tab, setTab] = useState<"send" | "history">("send");
  const [selectedDocs, setSelectedDocs] = useState<DocType[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("email");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [jobId, setJobId] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [search, setSearch] = useState("");

  const toggleDoc = (key: DocType) => {
    setSelectedDocs((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  };

  const handleSend = async () => {
    if (!recipientName || selectedDocs.length === 0) {
      toast.error("Select at least one document and enter recipient name");
      return;
    }
    if (deliveryMethod !== "sms" && !recipientEmail) {
      toast.error("Email is required for email delivery");
      return;
    }
    if (deliveryMethod !== "email" && !recipientPhone) {
      toast.error("Phone is required for SMS delivery");
      return;
    }

    setIsSending(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1500));
    setIsSending(false);

    const docLabels = selectedDocs.map((k) => DOC_TYPES.find((d) => d.key === k)?.label).join(" & ");
    toast.success(`${docLabels} sent to ${recipientName}`);
    setSelectedDocs([]);
    setRecipientName("");
    setRecipientEmail("");
    setRecipientPhone("");
    setJobId("");
  };

  const filteredDocs = RECENT_DOCS.filter((d) => {
    if (!search) return true;
    return `${d.refNumber} ${d.recipientName} ${d.jobId}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <DispatchShell breadcrumb=" / E-Sign">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Dispatch E-Sign</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Send carrier agreements and bills of lading for electronic signature</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
          {([
            { key: "send" as const, label: "Send Documents", icon: Send },
            { key: "history" as const, label: "Document History", icon: Clock },
          ]).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  tab === t.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === "send" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Document selection */}
            <div className="lg:col-span-3 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Select Documents to Send</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {DOC_TYPES.map((doc) => {
                    const Icon = doc.icon;
                    const isSelected = selectedDocs.includes(doc.key);
                    return (
                      <button
                        key={doc.key}
                        onClick={() => toggleDoc(doc.key)}
                        className={cn(
                          "w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left",
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground">{doc.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{doc.description}</p>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />}
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Delivery method */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Delivery Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {([
                      { key: "email" as DeliveryMethod, label: "Email", icon: Mail },
                      { key: "sms" as DeliveryMethod, label: "SMS", icon: MessageSquare },
                      { key: "both" as DeliveryMethod, label: "Both", icon: Send },
                    ]).map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.key}
                          onClick={() => setDeliveryMethod(m.key)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors",
                            deliveryMethod === m.key
                              ? "bg-foreground text-background border-foreground"
                              : "border-border text-muted-foreground hover:border-foreground/30"
                          )}
                        >
                          <Icon className="w-3.5 h-3.5" /> {m.label}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Recipient form */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Recipient Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Job Reference (optional)</Label>
                    <Input
                      placeholder="e.g. J-4823"
                      value={jobId}
                      onChange={(e) => setJobId(e.target.value)}
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Carrier / Recipient Name *</Label>
                    <Input
                      placeholder="e.g. FastHaul Logistics"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                  {deliveryMethod !== "sms" && (
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Email *</Label>
                      <Input
                        type="email"
                        placeholder="dispatch@carrier.com"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                  )}
                  {deliveryMethod !== "email" && (
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Phone *</Label>
                      <Input
                        type="tel"
                        placeholder="(555) 555-0100"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Summary & send */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2 mb-4">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Summary</p>
                    {selectedDocs.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No documents selected</p>
                    ) : (
                      selectedDocs.map((key) => {
                        const doc = DOC_TYPES.find((d) => d.key === key)!;
                        return (
                          <div key={key} className="flex items-center gap-2 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-chart-2" />
                            <span className="text-foreground">{doc.label}</span>
                          </div>
                        );
                      })
                    )}
                    {recipientName && (
                      <p className="text-[10px] text-muted-foreground">
                        To: <span className="text-foreground font-medium">{recipientName}</span>
                        {jobId && <> • {jobId}</>}
                      </p>
                    )}
                  </div>
                  <Button
                    className="w-full gap-1.5"
                    disabled={selectedDocs.length === 0 || !recipientName || isSending}
                    onClick={handleSend}
                  >
                    {isSending ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="w-3.5 h-3.5" /> Send for Signature</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {tab === "history" && (
          <div className="space-y-4">
            {/* KPI strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Sent", value: RECENT_DOCS.filter(d => d.status !== "draft").length, color: "text-primary" },
                { label: "Awaiting Signature", value: RECENT_DOCS.filter(d => d.status === "sent" || d.status === "opened").length, color: "text-chart-4" },
                { label: "Signed", value: RECENT_DOCS.filter(d => d.status === "signed").length, color: "text-chart-2" },
                { label: "Drafts", value: RECENT_DOCS.filter(d => d.status === "draft").length, color: "text-muted-foreground" },
              ].map((k) => (
                <Card key={k.label}>
                  <CardContent className="p-3 text-center">
                    <p className={cn("text-xl font-bold", k.color)}>{k.value}</p>
                    <p className="text-[10px] text-muted-foreground">{k.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
              </div>
            </div>

            <div className="space-y-3">
              {filteredDocs.map((doc) => {
                const cfg = statusConfig[doc.status];
                const typeInfo = DOC_TYPES.find((d) => d.key === doc.docType)!;
                const TypeIcon = typeInfo.icon;
                return (
                  <Card key={doc.id} className="hover:border-primary/30 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <TypeIcon className="w-4 h-4 text-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-foreground">{doc.refNumber}</span>
                              <Badge variant={cfg.variant} className="text-[10px]">{cfg.label}</Badge>
                              {doc.jobId && <Badge variant="outline" className="text-[10px]">{doc.jobId}</Badge>}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{typeInfo.label}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> {doc.recipientName}</span>
                              <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {doc.recipientEmail}</span>
                              {doc.sentAt && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Sent {doc.sentAt}</span>}
                              {doc.signedAt && <span className="flex items-center gap-1 text-chart-2"><CheckCircle2 className="w-3 h-3" /> Signed {doc.signedAt}</span>}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DispatchShell>
  );
}
