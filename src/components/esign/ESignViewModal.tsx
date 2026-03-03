import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { EstimateAuthDocument } from "@/components/esign/EstimateAuthDocument";
import { CCACHDocumentWrapper } from "@/components/esign/CCACHDocumentWrapper";
import { BOLDocumentWrapper } from "@/components/esign/BOLDocumentWrapper";

type SignatureField = "initial1" | "initial2" | "initial3" | "signature";

interface ESignViewModalProps {
  open: boolean;
  onClose: () => void;
  documentType: "estimate" | "ccach" | "bol";
  customerName: string;
  refNumber: string;
}

export function ESignViewModal({
  open,
  onClose,
  documentType,
  customerName,
  refNumber,
}: ESignViewModalProps) {
  const [typedName, setTypedName] = useState(customerName);
  const [typedInitials, setTypedInitials] = useState(
    customerName
      .split(" ")
      .map((w) => w[0] || "")
      .join("")
      .toUpperCase()
  );
  const [signatures, setSignatures] = useState<Record<SignatureField, boolean>>({
    initial1: false,
    initial2: false,
    initial3: false,
    signature: false,
  });
  const [currentField, setCurrentField] = useState<SignatureField>("initial1");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fieldOrder: SignatureField[] = ["initial1", "initial2", "initial3", "signature"];

  const handleSign = (field: SignatureField) => {
    setSignatures((prev) => ({ ...prev, [field]: true }));
    const currentIndex = fieldOrder.indexOf(field);
    const nextUnsigned = fieldOrder.find(
      (f, i) => i > currentIndex && !signatures[f]
    );
    if (nextUnsigned) setCurrentField(nextUnsigned);
  };

  const handleSubmit = () => setIsSubmitted(true);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const label = documentType === "estimate" ? "Estimate Authorization" : documentType === "ccach" ? "CC/ACH Authorization" : "Bill of Lading";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-3">
          <DialogTitle className="flex items-center gap-2">
            {label}
            <Badge variant="outline" className="text-[10px] font-mono">
              {refNumber}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="px-4 pb-6">
            {documentType === "estimate" ? (
              <EstimateAuthDocument
                typedName={typedName}
                typedInitials={typedInitials}
                signatures={signatures}
                currentField={currentField}
                onSign={handleSign}
                onSubmit={handleSubmit}
                isSubmitted={isSubmitted}
                refNumber={refNumber}
                today={today}
              />
            ) : documentType === "ccach" ? (
              <CCACHDocumentWrapper
                typedName={typedName}
                onTypedNameChange={setTypedName}
                isSubmitted={isSubmitted}
                onSubmit={handleSubmit}
              />
            ) : (
              <BOLDocumentWrapper
                typedName={typedName}
                onTypedNameChange={setTypedName}
                isSubmitted={isSubmitted}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
