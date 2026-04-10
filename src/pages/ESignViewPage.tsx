import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AgentShell from "@/components/layout/AgentShell";
import { ESignSidebar } from "@/components/esign/ESignSidebar";
import { EstimateAuthDocument } from "@/components/esign/EstimateAuthDocument";
import { CCACHDocumentWrapper } from "@/components/esign/CCACHDocumentWrapper";
import { BOLDocumentWrapper } from "@/components/esign/BOLDocumentWrapper";
import { ESignConsentBanner } from "@/components/esign/ESignConsentBanner";
import { ESignStepTracker } from "@/components/esign/ESignStepTracker";
import { type DocumentType } from "@/components/esign/DocumentTabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, Download, FileText, Loader2 } from "lucide-react";

type SignatureField = "initial1" | "initial2" | "initial3" | "signature";

export default function ESignViewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const customerName = searchParams.get("name") || "Customer";
  const customerEmail = searchParams.get("email") || "";
  const refNumber = searchParams.get("ref") || "DOC-2026-0001";
  const docTypeParam = searchParams.get("type") || "estimate";
  const leadId = searchParams.get("leadId") || "";
  const docStatus = searchParams.get("status") || "";
  const isCompleted = docStatus === "completed";
  const isBol = docTypeParam === "bol";

  const [typedName, setTypedName] = useState(customerName);
  const [activeDocument, setActiveDocument] = useState<DocumentType>(
    isBol ? "estimate" : (docTypeParam as DocumentType)
  );
  const [signatures, setSignatures] = useState<Record<SignatureField, boolean>>({
    initial1: false, initial2: false, initial3: false, signature: false,
  });
  const [currentField, setCurrentField] = useState<SignatureField>("initial1");
  const [completedDocuments, setCompletedDocuments] = useState<Record<DocumentType, boolean>>({
    estimate: false, ccach: false,
  });
  const [consentGiven, setConsentGiven] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  useEffect(() => {
    if (!leadId) return;
    supabase
      .from("leads")
      .select("phone, origin_address")
      .eq("id", leadId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.phone) setCustomerPhone(data.phone);
        if (data?.origin_address) setCustomerAddress(data.origin_address);
      });
  }, [leadId]);

  const typedInitials = typedName
    .split(" ").filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 3);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const allSigned = Object.values(signatures).every(Boolean);

  const generateDocHash = useCallback(() => {
    const content = `${refNumber}|${typedName}|${docTypeParam}|${new Date().toISOString().split("T")[0]}`;
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return `SHA256-SIM-${Math.abs(hash).toString(16).toUpperCase().padStart(8, "0")}`;
  }, [refNumber, typedName, docTypeParam]);

  const logAuditEvent = useCallback(async (eventType: string, eventData?: Record<string, unknown>) => {
    try {
      await supabase.functions.invoke("capture-esign-event", {
        body: {
          refNumber, documentType: activeDocument, customerName: typedName,
          customerEmail, eventType, eventData: eventData || {},
          documentHash: generateDocHash(), consentGiven,
          consentText: consentGiven
            ? "I consent to conduct this transaction electronically and agree that my electronic signature is legally binding under the ESIGN Act and UETA."
            : undefined,
          leadId: leadId || undefined,
        },
      });
    } catch (e) { console.error("Audit log failed:", e); }
  }, [refNumber, activeDocument, typedName, customerEmail, generateDocHash, consentGiven, leadId]);

  useState(() => {
    logAuditEvent("document_opened", { documentType: docTypeParam });
  });

  const updateDocumentStatus = useCallback(async (status: string, docType: string) => {
    if (!leadId) return;
    try {
      const updateData: Record<string, any> = { status };
      if (status === "completed") updateData.completed_at = new Date().toISOString();
      if (status === "opened") updateData.opened_at = new Date().toISOString();
      await supabase
        .from("esign_documents")
        .update(updateData)
        .eq("lead_id", leadId)
        .eq("ref_number", refNumber);
    } catch (e) { console.error("Failed to update document status:", e); }
  }, [leadId, refNumber]);

  const handleSign = (field: SignatureField) => {
    if (field === "signature" && typedName.length < 2) return;
    if (field !== "signature" && typedInitials.length < 1) return;
    setSignatures((prev) => ({ ...prev, [field]: true }));
    logAuditEvent("field_signed", { field, value: field === "signature" ? typedName : typedInitials });
    const fieldOrder: SignatureField[] = ["initial1", "initial2", "initial3", "signature"];
    const currentIndex = fieldOrder.indexOf(field);
    if (currentIndex < fieldOrder.length - 1) {
      setCurrentField(fieldOrder[currentIndex + 1]);
    }
  };

  const handleSubmitEstimate = () => {
    if (Object.values(signatures).every(Boolean)) {
      setCompletedDocuments((prev) => ({ ...prev, estimate: true }));
      logAuditEvent("document_signed", { documentType: "estimate", documentHash: generateDocHash() });
      updateDocumentStatus("completed", "estimate");
      toast.success("Estimate Authorization submitted successfully");
      // Reset signatures for next document
      setSignatures({ initial1: false, initial2: false, initial3: false, signature: false });
      setCurrentField("initial1");
      setActiveDocument("ccach");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmitCCACH = () => {
    setCompletedDocuments((prev) => ({ ...prev, ccach: true }));
    logAuditEvent("document_signed", { documentType: "ccach", documentHash: generateDocHash() });
    updateDocumentStatus("completed", "ccach");
    toast.success("CC/ACH Authorization submitted — proceeding to payment");
    const paramLeadId = searchParams.get("leadId") || "";
    navigate(`/agent/payment?name=${encodeURIComponent(typedName)}&email=${encodeURIComponent(customerEmail)}&leadId=${paramLeadId}`);
  };

  const handleSubmitBOL = () => {
    logAuditEvent("document_signed", { documentType: "bol", documentHash: generateDocHash() });
    updateDocumentStatus("completed", "bol");
    toast.success("Merchant Payment submitted successfully");
  };

  const handleContinueToNext = () => {
    if (activeDocument === "estimate") {
      setActiveDocument("ccach");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDocumentChange = (doc: DocumentType) => {
    setActiveDocument(doc);
    logAuditEvent("document_viewed", { documentType: doc });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      logAuditEvent("document_downloaded", { documentType: activeDocument });
      toast.success("Document downloaded as PDF");
    } finally { setIsDownloading(false); }
  };

  const handleConsentChange = (given: boolean) => {
    setConsentGiven(given);
    if (given) {
      logAuditEvent("consent_given", {
        consentText: "I consent to conduct this transaction electronically and agree that my electronic signature is legally binding under the ESIGN Act and UETA.",
      });
    }
  };

  return (
    <AgentShell breadcrumbs={[
      { label: "My Customers", href: "/agent/customers" },
      ...(leadId ? [{ label: customerName, href: `/agent/customers/${leadId}` }] : []),
      { label: "E-Sign", href: leadId ? `/agent/esign?leadId=${leadId}` : "/agent/customers" },
      { label: "View Document" },
    ]}>
      <div className="min-h-screen bg-muted/30 py-6 md:py-8 px-3 md:px-4">
        <div className="max-w-[1200px] mx-auto">
          <button
            onClick={() => leadId ? navigate(`/agent/customers/${leadId}?tab=documents`) : navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Customer
          </button>

          {isCompleted ? (
            <div className="max-w-2xl mx-auto space-y-6">
              <Card className="border border-border bg-card">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Signed Document</h2>
                      <p className="text-sm text-muted-foreground">This document has been signed and completed</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-5 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Document Type</span>
                      <Badge variant="outline" className="capitalize">{docTypeParam === "ccach" ? "CC/ACH Authorization" : docTypeParam === "bol" ? "Merchant Payment" : "Estimate Authorization"}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Reference</span>
                      <span className="font-mono text-xs">{refNumber}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Customer</span>
                      <span className="font-medium">{customerName}</span>
                    </div>
                    {customerEmail && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Email</span>
                        <span>{customerEmail}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                      </Badge>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-8 min-h-[400px] flex flex-col items-center justify-center text-center space-y-4">
                    <FileText className="w-16 h-16 text-muted-foreground/20" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Signed Document PDF</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {docTypeParam === "ccach" ? "CC/ACH Authorization" : docTypeParam === "bol" ? "Merchant Payment" : "Estimate Authorization"} — {refNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 gap-2" onClick={handleDownloadPdf} disabled={isDownloading}>
                      {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      {isDownloading ? "Downloading..." : "Download PDF"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {/* Step Tracker - top of page */}
              {!isBol && (
                <div className="max-w-md mx-auto mb-8">
                  <ESignStepTracker
                    activeDocument={activeDocument}
                    completedDocuments={completedDocuments}
                    onStepClick={handleDocumentChange}
                  />
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                {!isBol && (
                  <ESignSidebar
                    typedName={typedName}
                    onTypedNameChange={setTypedName}
                    typedInitials={typedInitials}
                    signatures={signatures}
                    activeDocument={activeDocument}
                    onDocumentChange={handleDocumentChange}
                    completedDocuments={completedDocuments}
                    allSigned={allSigned}
                    recipientEmail={customerEmail}
                    refNumber={refNumber}
                    onDownloadPdf={handleDownloadPdf}
                    isDownloading={isDownloading}
                  />
                )}

                <div className="flex-1 max-w-full lg:max-w-[8.5in]">
                  {isBol ? (
                    <BOLDocumentWrapper
                      typedName={typedName}
                      onTypedNameChange={setTypedName}
                      isSubmitted={false}
                      onSubmit={handleSubmitBOL}
                    />
                  ) : activeDocument === "estimate" ? (
                    <EstimateAuthDocument
                      typedName={typedName}
                      typedInitials={typedInitials}
                      signatures={signatures}
                      currentField={currentField}
                      onSign={handleSign}
                      onSubmit={handleSubmitEstimate}
                      onContinueToNext={handleContinueToNext}
                      isSubmitted={completedDocuments.estimate}
                      refNumber={refNumber}
                      today={today}
                      consentGiven={consentGiven}
                      onConsentChange={handleConsentChange}
                    />
                  ) : (
                    <CCACHDocumentWrapper
                      typedName={typedName}
                      onTypedNameChange={setTypedName}
                      isSubmitted={completedDocuments.ccach}
                      onSubmit={handleSubmitCCACH}
                      customerEmail={customerEmail}
                      customerPhone={customerPhone}
                      customerAddress={customerAddress}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AgentShell>
  );
}
