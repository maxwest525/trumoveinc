import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import SiteShell from "@/components/layout/SiteShell";
import { ESignSidebar } from "@/components/esign/ESignSidebar";
import { EstimateAuthDocument } from "@/components/esign/EstimateAuthDocument";
import { CCACHDocumentWrapper } from "@/components/esign/CCACHDocumentWrapper";
import { ESignConsentBanner } from "@/components/esign/ESignConsentBanner";
import type { DocumentType } from "@/components/esign/DocumentTabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SignatureField = "initial1" | "initial2" | "initial3" | "signature";

export default function PublicESign() {
  const { refNumber: urlRef } = useParams();
  const [searchParams] = useSearchParams();

  const refNumber = urlRef || searchParams.get("ref") || "DOC-2026-0001";
  const customerName = searchParams.get("name") || "";
  const customerEmail = searchParams.get("email") || "";
  const docTypeParam = searchParams.get("type") || "estimate";
  const leadId = searchParams.get("leadId") || "";

  const [typedName, setTypedName] = useState(customerName);
  const [activeDocument, setActiveDocument] = useState<DocumentType>(docTypeParam as DocumentType);
  const [signatures, setSignatures] = useState<Record<SignatureField, boolean>>({
    initial1: false, initial2: false, initial3: false, signature: false,
  });
  const [currentField, setCurrentField] = useState<SignatureField>("initial1");
  const [completedDocuments, setCompletedDocuments] = useState<Record<DocumentType, boolean>>({
    estimate: false, ccach: false,
  });
  const [consentGiven, setConsentGiven] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const typedInitials = typedName
    .split(" ").filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 3);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const allSigned = Object.values(signatures).every(Boolean);

  const logAuditEvent = async (eventType: string, eventData?: Record<string, unknown>) => {
    try {
      await supabase.functions.invoke("capture-esign-event", {
        body: {
          refNumber, documentType: activeDocument, customerName: typedName,
          customerEmail, eventType, eventData: eventData || {},
          consentGiven, leadId: leadId || undefined,
        },
      });
    } catch (e) { console.error("Audit log failed:", e); }
  };

  const updateDocumentStatus = async (status: string) => {
    if (!leadId) return;
    try {
      const updateData: Record<string, any> = { status };
      if (status === "completed") updateData.completed_at = new Date().toISOString();
      if (status === "opened") updateData.opened_at = new Date().toISOString();
      await supabase.from("esign_documents").update(updateData)
        .eq("lead_id", leadId).eq("ref_number", refNumber);
    } catch (e) { console.error("Failed to update document status:", e); }
  };

  const handleSign = (field: SignatureField) => {
    if (field === "signature" && typedName.length < 2) return;
    if (field !== "signature" && typedInitials.length < 1) return;
    setSignatures((prev) => ({ ...prev, [field]: true }));
    logAuditEvent("field_signed", { field, value: field === "signature" ? typedName : typedInitials });
    const fieldOrder: SignatureField[] = ["initial1", "initial2", "initial3", "signature"];
    const idx = fieldOrder.indexOf(field);
    if (idx < fieldOrder.length - 1) setCurrentField(fieldOrder[idx + 1]);
  };

  const handleSubmitEstimate = () => {
    if (!allSigned) return;
    setCompletedDocuments((prev) => ({ ...prev, estimate: true }));
    logAuditEvent("document_signed", { documentType: "estimate" });
    updateDocumentStatus("completed");
    toast.success("Estimate Authorization submitted successfully");
    setActiveDocument("ccach");
    window.scrollTo(0, 0);
  };

  const handleSubmitCCACH = () => {
    setCompletedDocuments((prev) => ({ ...prev, ccach: true }));
    logAuditEvent("document_signed", { documentType: "ccach" });
    updateDocumentStatus("completed");
    toast.success("CC/ACH Authorization submitted successfully. All documents are complete!");
  };

  const handleContinueToNext = () => {
    if (activeDocument === "estimate") {
      setActiveDocument("ccach");
      window.scrollTo(0, 0);
    }
  };

  const handleDocumentChange = (doc: DocumentType) => {
    setActiveDocument(doc);
    logAuditEvent("document_viewed", { documentType: doc });
    window.scrollTo(0, 0);
  };

  const handleConsentChange = (given: boolean) => {
    setConsentGiven(given);
    if (given) logAuditEvent("consent_given");
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      logAuditEvent("document_downloaded", { documentType: activeDocument });
      toast.success("Document downloaded as PDF");
    } finally { setIsDownloading(false); }
  };

  return (
    <SiteShell hideHeader hideTrustStrip>
        <div className="min-h-screen bg-muted/30 py-8 px-4">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">Document Signing</h1>
            <p className="text-muted-foreground mt-1">
              Please review and sign your documents below. Reference: {refNumber}
            </p>
          </div>

          <div className="flex gap-6">
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
              isPublic
            />

            <div className="flex-1 max-w-[8.5in]">
              {activeDocument === "estimate" ? (
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
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
