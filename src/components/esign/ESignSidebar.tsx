import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserPlus, Check } from "lucide-react";
import { DocumentTabs, type DocumentType } from "./DocumentTabs";
import { ESignStatusCard } from "./ESignStatusCard";
import { ClientSearchModal, type ClientData } from "@/components/agent/ClientSearchModal";

type SignatureField = "initial1" | "initial2" | "initial3" | "signature";

interface ESignSidebarProps {
  typedName: string;
  onTypedNameChange: (name: string) => void;
  typedInitials: string;
  signatures: Record<SignatureField, boolean>;
  activeDocument: DocumentType;
  onDocumentChange: (doc: DocumentType) => void;
  completedDocuments: Record<DocumentType, boolean>;
  onSendPdfEmail?: () => Promise<void>;
  onDownloadPdf?: () => Promise<void>;
  isSendingEmail?: boolean;
  isDownloading?: boolean;
  allSigned?: boolean;
  recipientEmail?: string;
  refNumber?: string;
  /** When true, hides agent-only tools (Send SMS/Email, Verbal Verification, Import) */
  isPublic?: boolean;
}

export function ESignSidebar({
  typedName,
  onTypedNameChange,
  typedInitials,
  signatures,
  activeDocument,
  onDocumentChange,
  completedDocuments,
  onSendPdfEmail,
  onDownloadPdf,
  isSendingEmail = false,
  isDownloading = false,
  allSigned = false,
  recipientEmail,
  refNumber = "DOC-2026-0001",
  isPublic = false,
}: ESignSidebarProps) {
  const [showClientSearch, setShowClientSearch] = useState(false);

  const handleClientSelect = (client: ClientData) => {
    onTypedNameChange(client.name);
  };

  const fieldOrder: SignatureField[] = ["initial1", "initial2", "initial3", "signature"];
  const signedCount = fieldOrder.filter((f) => signatures[f]).length;

  return (
    <div className="w-full lg:w-72 flex-shrink-0 space-y-3">
      <ClientSearchModal
        open={showClientSearch}
        onClose={() => setShowClientSearch(false)}
        onSelect={handleClientSelect}
      />

      {/* Customer Name — compact */}
      <Card className="border border-border bg-background shadow-sm">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Full Legal Name</label>
            {!isPublic && (
              <Button onClick={() => setShowClientSearch(true)} variant="ghost" size="sm" className="h-5 px-1.5 text-[9px] gap-0.5">
                <UserPlus className="w-2.5 h-2.5" />
                Import
              </Button>
            )}
          </div>
          <Input
            placeholder="e.g. John Smith"
            value={typedName}
            onChange={(e) => onTypedNameChange(e.target.value)}
            className="bg-background border-foreground/20 h-8 text-sm"
          />

          {/* Signature/Initials Preview — compact */}
          <div className="flex gap-2">
            <div className="flex-1 border border-foreground/20 rounded px-2 py-1 bg-muted/10">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wide block">Signature</span>
              <div className="text-sm text-foreground truncate min-h-[1.2rem]" style={{ fontFamily: "'Dancing Script', cursive" }}>
                {typedName || <span className="text-muted-foreground/50 text-xs">—</span>}
              </div>
            </div>
            <div className="w-14 border border-foreground/20 rounded px-2 py-1 bg-muted/10">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wide block">Initials</span>
              <div className="text-sm text-foreground min-h-[1.2rem]" style={{ fontFamily: "'Dancing Script', cursive" }}>
                {typedInitials || <span className="text-muted-foreground/50 text-xs">—</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Sign — minimal */}
      <div className="px-1 space-y-1 text-[11px] text-muted-foreground">
        <p className="font-medium text-foreground text-[10px] uppercase tracking-wide">How to sign</p>
        <p>1. Enter your name above</p>
        <p>2. Click each <span className="font-mono text-[10px] border px-0.5 rounded">initial</span> / <span className="font-mono text-[10px] border px-0.5 rounded">sign</span> box</p>
        <p>3. Submit at the bottom</p>
      </div>

      {/* Documents to Sign */}
      <Card className="border border-border bg-background shadow-sm">
        <CardContent className="p-3 space-y-2">
          <h3 className="font-medium text-[10px] uppercase tracking-wider text-muted-foreground">Documents to Sign</h3>
          <DocumentTabs
            activeDocument={activeDocument}
            onDocumentChange={onDocumentChange}
            completedDocuments={completedDocuments}
          />
        </CardContent>
      </Card>

      {/* Document Status Card - Agent-facing only */}
      {!isPublic && (
        <ESignStatusCard
          documentTitle={
            activeDocument === "estimate" 
              ? "Estimate Authorization" 
              : activeDocument === "ccach" 
              ? "CC/ACH Authorization" 
              : "Merchant Payment"
          }
          recipientEmail={recipientEmail}
          recipientName={typedName}
          isSigned={allSigned}
          refNumber={refNumber}
        />
      )}
    </div>
  );
}
