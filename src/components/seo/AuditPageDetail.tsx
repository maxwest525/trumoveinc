import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2, AlertCircle, XCircle, Pencil, RefreshCw, Eye, EyeOff,
} from "lucide-react";

type FieldStatus = "pending" | "approved" | "edited" | "ignored";

interface FieldDecision {
  status: FieldStatus;
  editedValue?: string;
}

export interface PageDecisions {
  title: FieldDecision;
  description: FieldDecision;
  h1: FieldDecision;
}

interface AuditPage {
  url: string;
  fetchedTitle: string | null;
  fetchedDescription: string | null;
  fetchedH1: string | null;
  fetchedCanonical: string | null;
  issues: string[];
  suggestedTitle: string | null;
  suggestedDescription: string | null;
  suggestedH1: string | null;
  aiChecklist: string[];
}

interface Props {
  page: AuditPage;
  decisions: PageDecisions;
  onDecisionChange: (url: string, decisions: PageDecisions) => void;
  onRegenerate: (url: string) => void;
  regenerating?: boolean;
}

const charInfo = (text: string | null, min: number, max: number) => {
  if (!text) return { len: 0, ok: false, label: "Missing" };
  const len = text.length;
  return { len, ok: len >= min && len <= max, label: `${len} chars` };
};

function StatusIcon({ status }: { status: FieldStatus }) {
  switch (status) {
    case "approved": return <CheckCircle2 className="w-3.5 h-3.5 text-primary" />;
    case "edited": return <Pencil className="w-3.5 h-3.5 text-amber-500" />;
    case "ignored": return <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />;
    default: return <Eye className="w-3.5 h-3.5 text-muted-foreground" />;
  }
}

function FieldRow({
  label,
  current,
  suggested,
  charMin,
  charMax,
  decision,
  onUpdate,
  multiline,
}: {
  label: string;
  current: string | null;
  suggested: string | null;
  charMin: number;
  charMax: number;
  decision: FieldDecision;
  onUpdate: (d: FieldDecision) => void;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(decision.editedValue || suggested || "");

  const currentInfo = charInfo(current, charMin, charMax);
  const suggestedInfo = charInfo(suggested, charMin, charMax);
  const finalValue = decision.status === "edited" ? decision.editedValue : suggested;
  const finalInfo = charInfo(finalValue || null, charMin, charMax);

  const handleApprove = () => {
    onUpdate({ status: "approved", editedValue: undefined });
    setEditing(false);
  };
  const handleIgnore = () => {
    onUpdate({ status: "ignored", editedValue: undefined });
    setEditing(false);
  };
  const handleSaveEdit = () => {
    onUpdate({ status: "edited", editedValue: draft });
    setEditing(false);
  };
  const handleStartEdit = () => {
    setDraft(decision.editedValue || suggested || current || "");
    setEditing(true);
  };

  if (decision.status === "ignored") {
    return (
      <div className="rounded-lg border border-border bg-muted/20 p-3 opacity-60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon status="ignored" />
            <span className="text-xs font-semibold text-muted-foreground">{label}</span>
            <Badge variant="secondary" className="text-[10px]">Ignored</Badge>
          </div>
          <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => onUpdate({ status: "pending" })}>
            Undo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-3 space-y-2.5 ${
      decision.status === "approved" ? "border-primary/30 bg-primary/5" :
      decision.status === "edited" ? "border-amber-500/30 bg-amber-500/5" :
      "border-border bg-background"
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon status={decision.status} />
          <span className="text-xs font-semibold text-foreground">{label}</span>
          {decision.status !== "pending" && (
            <Badge
              variant={decision.status === "approved" ? "default" : "secondary"}
              className="text-[10px]"
            >
              {decision.status === "approved" ? "Approved" : "Edited"}
            </Badge>
          )}
        </div>
      </div>

      {/* Current value */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Current</span>
          <Badge variant={currentInfo.ok ? "default" : "destructive"} className="text-[9px] h-4 px-1.5">
            {currentInfo.label}{!currentInfo.ok && current ? ` (aim ${charMin}–${charMax})` : ""}
          </Badge>
        </div>
        <div className="text-xs text-foreground bg-muted/40 rounded px-2.5 py-1.5 border border-border/50">
          {current || <span className="text-destructive italic">Not set</span>}
        </div>
      </div>

      {/* Suggested / Edited value */}
      {suggested && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-primary uppercase tracking-wide">
              {decision.status === "edited" ? "Your Edit" : "AI Suggestion"}
            </span>
            <Badge variant={finalInfo.ok ? "default" : "secondary"} className="text-[9px] h-4 px-1.5">
              {finalInfo.label}{!finalInfo.ok && finalValue ? ` (aim ${charMin}–${charMax})` : ""}
            </Badge>
          </div>
          {editing ? (
            <div className="space-y-1.5">
              {multiline ? (
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  className="text-xs font-mono"
                />
              ) : (
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="text-xs font-mono h-8"
                />
              )}
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="text-[9px]">{draft.length} chars</Badge>
                <div className="flex gap-1 ml-auto">
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button size="sm" className="h-6 text-[10px] px-2" onClick={handleSaveEdit}>Save</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-foreground font-mono bg-primary/5 rounded px-2.5 py-1.5 border border-primary/10">
              {finalValue}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      {!editing && suggested && (
        <div className="flex items-center gap-1.5 pt-0.5">
          {decision.status !== "approved" && (
            <Button variant="default" size="sm" className="h-6 text-[10px] px-2.5 gap-1" onClick={handleApprove}>
              <CheckCircle2 className="w-3 h-3" /> Approve
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-6 text-[10px] px-2.5 gap-1" onClick={handleStartEdit}>
            <Pencil className="w-3 h-3" /> Edit
          </Button>
          <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2.5 gap-1 text-muted-foreground" onClick={handleIgnore}>
            <XCircle className="w-3 h-3" /> Ignore
          </Button>
          {decision.status === "approved" && (
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2.5 gap-1 text-muted-foreground" onClick={() => onUpdate({ status: "pending" })}>
              Undo
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function AuditPageDetail({ page, decisions, onDecisionChange, onRegenerate, regenerating }: Props) {
  const updateField = (field: keyof PageDecisions) => (d: FieldDecision) => {
    onDecisionChange(page.url, { ...decisions, [field]: d });
  };

  return (
    <div className="space-y-4">
      {/* Issues banner */}
      {page.issues.length > 0 && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 space-y-1.5">
          <span className="text-xs font-semibold text-destructive flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            {page.issues.length} Issue{page.issues.length > 1 ? "s" : ""} Detected
          </span>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {page.issues.map((issue, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                <span className="text-destructive mt-0.5">•</span>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Canonical info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium">Canonical:</span>
        {page.fetchedCanonical ? (
          <span className="font-mono truncate">{page.fetchedCanonical}</span>
        ) : (
          <Badge variant="destructive" className="text-[9px]">Missing</Badge>
        )}
      </div>

      {/* Per-field rows */}
      <div className="space-y-3">
        <FieldRow
          label="Title Tag"
          current={page.fetchedTitle}
          suggested={page.suggestedTitle}
          charMin={50}
          charMax={60}
          decision={decisions.title}
          onUpdate={updateField("title")}
        />
        <FieldRow
          label="Meta Description"
          current={page.fetchedDescription}
          suggested={page.suggestedDescription}
          charMin={150}
          charMax={160}
          decision={decisions.description}
          onUpdate={updateField("description")}
          multiline
        />
        <FieldRow
          label="H1 Heading"
          current={page.fetchedH1}
          suggested={page.suggestedH1}
          charMin={20}
          charMax={70}
          decision={decisions.h1}
          onUpdate={updateField("h1")}
        />
      </div>

      {/* Checklist */}
      {page.aiChecklist.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1.5">
          <span className="text-xs font-semibold text-foreground">Fix-First Checklist</span>
          <ul className="space-y-1">
            {page.aiChecklist.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                <CheckCircle2 className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Regenerate */}
      <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={() => onRegenerate(page.url)} disabled={regenerating}>
        <RefreshCw className={`w-3 h-3 ${regenerating ? "animate-spin" : ""}`} /> New AI Suggestions
      </Button>
    </div>
  );
}
