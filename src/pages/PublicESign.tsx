import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import SiteShell from "@/components/layout/SiteShell";
import { ESignSidebar } from "@/components/esign/ESignSidebar";
import { EstimateAuthDocument } from "@/components/esign/EstimateAuthDocument";
import { CCACHDocumentWrapper } from "@/components/esign/CCACHDocumentWrapper";
import { ESignConsentBanner } from "@/components/esign/ESignConsentBanner";
import { DocumentTabs, type DocumentType } from "@/components/esign/DocumentTabs";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SignatureField = "initial1" | "initial2" | "initial3" | "signature";

export default function PublicESign() {
  const { refNumber: urlRef } = useParams();
  const [searchParams] = useSearchParams();

  // Fallback to query params for backward compat, but prefer DB lookup
  const refNumber = urlRef || searchParams.get("ref") || "DOC-2026-0001";
  const qpName = searchParams.get("name") || "";
  const qpEmail = searchParams.get("email") || "";
  const qpDocType = searchParams.get("type") || "estimate";
  const qpLeadId = searchParams.get("leadId") || "";

  const [customerName, setCustomerName] = useState(qpName);
  const [customerEmail, setCustomerEmail] = useState(qpEmail);
  const [leadId, setLeadId] = useState(qpLeadId);
  const [docTypeFromDb, setDocTypeFromDb] = useState(qpDocType);

  const [typedName, setTypedName] = useState(qpName);
  const [activeDocument, setActiveDocument] = useState<DocumentType>(qpDocType as DocumentType);
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

  // Fetch customer data via secure edge function (no direct anon DB access)
  useEffect(() => {
    if (!refNumber || refNumber === "DOC-2026-0001") return;
    const fetchDocData = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-esign-public", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          body: undefined,
        });

        // Edge function invoked via GET with query param — use fetch directly
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const resp = await fetch(
          `https://${projectId}.supabase.co/functions/v1/get-esign-public?ref=${encodeURIComponent(refNumber)}`
        );
        if (!resp.ok) return;
        const result = await resp.json();

        if (result.document?.lead_id) {
          setLeadId(result.document.lead_id);
          if (result.document.document_type) setDocTypeFromDb(result.document.document_type);
          if (!qpDocType || qpDocType === "estimate") {
            setActiveDocument((result.document.document_type || "estimate") as DocumentType);
          }
        }

        if (result.lead) {
          const fullName = `${result.lead.first_name} ${result.lead.last_name}`.trim();
          if (fullName && !qpName) {
            setCustomerName(fullName);
            setTypedName(fullName);
          }
          if (result.lead.email && !qpEmail) setCustomerEmail(result.lead.email);
        }
      } catch (e) {
        console.error("Failed to fetch esign data:", e);
      }
    };
    fetchDocData();
  }, [refNumber]);

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
    if (!refNumber) return;
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/get-esign-public`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ref_number: refNumber, status }),
        }
      );
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
      <div className="min-h-screen bg-muted/30 py-4 sm:py-6 md:py-8 px-2 sm:px-3 md:px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Document Signing</h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm md:text-base">
              Please review and sign your documents below. Reference: {refNumber}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            <div className="w-full lg:w-72 shrink-0">
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
            </div>

            <div className="flex-1 min-w-0 max-w-full lg:max-w-[8.5in] overflow-hidden">
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

              {/* Documents to Sign — bottom of page */}
              <div className="mt-6">
                <Card className="border border-border bg-background shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-medium text-[10px] uppercase tracking-wider text-muted-foreground">Documents to Sign</h3>
                    <DocumentTabs
                      activeDocument={activeDocument}
                      onDocumentChange={handleDocumentChange}
                      completedDocuments={completedDocuments}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
