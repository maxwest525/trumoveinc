import { Check, FileText, CreditCard, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentType } from "./DocumentTabs";

interface Step {
  key: DocumentType;
  label: string;
  shortLabel: string;
  icon: typeof FileText;
}

const STEPS: Step[] = [
  { key: "estimate", label: "Estimate Authorization", shortLabel: "Estimate", icon: FileText },
  { key: "ccach", label: "CC/ACH Authorization", shortLabel: "CC/ACH", icon: CreditCard },
];

interface ESignStepTrackerProps {
  activeDocument: DocumentType;
  completedDocuments: Record<DocumentType, boolean>;
  onStepClick?: (doc: DocumentType) => void;
}

export function ESignStepTracker({
  activeDocument,
  completedDocuments,
  onStepClick,
}: ESignStepTrackerProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-0 right-0 h-[2px] bg-border mx-12" />
        <div
          className="absolute top-5 left-0 h-[2px] bg-primary transition-all duration-500 mx-12"
          style={{
            width: completedDocuments.estimate
              ? completedDocuments.ccach
                ? "calc(100% - 6rem)"
                : "calc(50% - 3rem)"
              : "0%",
          }}
        />

        {STEPS.map((step, index) => {
          const isActive = activeDocument === step.key;
          const isCompleted = completedDocuments[step.key];
          const Icon = step.icon;

          return (
            <button
              key={step.key}
              onClick={() => onStepClick?.(step.key)}
              className={cn(
                "relative z-10 flex flex-col items-center gap-2 group transition-all",
                onStepClick ? "cursor-pointer" : "cursor-default"
              )}
            >
              {/* Circle */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20"
                    : isActive
                      ? "bg-background border-primary text-primary shadow-md shadow-primary/10"
                      : "bg-muted/50 border-border text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4.5 h-4.5" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              {/* Label */}
              <div className="text-center">
                <p
                  className={cn(
                    "text-[11px] font-semibold transition-colors leading-tight",
                    isCompleted
                      ? "text-primary"
                      : isActive
                        ? "text-foreground"
                        : "text-muted-foreground"
                  )}
                >
                  {step.shortLabel}
                </p>
                <p className="text-[9px] text-muted-foreground hidden sm:block mt-0.5">
                  {isCompleted ? "Completed" : isActive ? "In Progress" : "Pending"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
