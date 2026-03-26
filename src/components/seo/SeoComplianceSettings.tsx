import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Shield, Plus, X, Save, Loader2, AlertTriangle } from "lucide-react";

export type SeoTone = "professional" | "premium" | "budget" | "trust";

export interface ComplianceSettings {
  allowedTerms: string[];
  forbiddenTerms: string[];
  disclaimer: string;
  tone: SeoTone;
}

const TONE_OPTIONS: { value: SeoTone; label: string; desc: string }[] = [
  { value: "professional", label: "Professional", desc: "Clean, authoritative corporate tone" },
  { value: "premium", label: "Premium", desc: "Luxury, high-end service positioning" },
  { value: "budget", label: "Budget", desc: "Value-focused, affordable messaging" },
  { value: "trust", label: "Trust-focused", desc: "Safety, compliance, and reliability emphasis" },
];

interface Props {
  onSettingsChange?: (settings: ComplianceSettings) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function useSeoCompliance() {
  const [settings, setSettings] = useState<ComplianceSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from("seo_compliance_settings" as any)
        .select("setting_key, setting_value") as any;

      if (data && data.length > 0) {
        const map: Record<string, any> = {};
        data.forEach((r: any) => { map[r.setting_key] = r.setting_value; });
        setSettings({
          allowedTerms: map.allowed_service_terms || [],
          forbiddenTerms: map.forbidden_terms || [],
          disclaimer: map.required_disclaimer || "",
          tone: map.tone || "professional",
        });
      } else {
        setSettings({
          allowedTerms: ["long distance", "interstate", "cross-country", "nationwide"],
          forbiddenTerms: ["local", "local movers", "near me", "same-day local", "local moving"],
          disclaimer: "",
          tone: "professional",
        });
      }
    } catch (e) {
      console.error("Failed to load compliance settings:", e);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, reload: loadSettings };
}

export function checkViolations(text: string, forbiddenTerms: string[]): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  return forbiddenTerms.filter(term => {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "i");
    return regex.test(lower);
  });
}

export default function SeoComplianceSettings({ onSettingsChange, open, onOpenChange }: Props) {
  const [allowedTerms, setAllowedTerms] = useState<string[]>([]);
  const [forbiddenTerms, setForbiddenTerms] = useState<string[]>([]);
  const [disclaimer, setDisclaimer] = useState("");
  const [tone, setTone] = useState<SeoTone>("professional");
  const [newAllowed, setNewAllowed] = useState("");
  const [newForbidden, setNewForbidden] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from("seo_compliance_settings" as any)
        .select("setting_key, setting_value") as any;

      if (data && data.length > 0) {
        const map: Record<string, any> = {};
        data.forEach((r: any) => { map[r.setting_key] = r.setting_value; });
        setAllowedTerms(map.allowed_service_terms || []);
        setForbiddenTerms(map.forbidden_terms || []);
        setDisclaimer(map.required_disclaimer || "");
        setTone(map.tone || "professional");
      }
    } catch (e) {
      console.error("Failed to load:", e);
    } finally {
      setLoaded(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        { setting_key: "allowed_service_terms", setting_value: allowedTerms },
        { setting_key: "forbidden_terms", setting_value: forbiddenTerms },
        { setting_key: "required_disclaimer", setting_value: disclaimer },
        { setting_key: "tone", setting_value: tone },
      ];

      for (const u of updates) {
        await supabase
          .from("seo_compliance_settings" as any)
          .upsert(
            { ...u, updated_at: new Date().toISOString() } as any,
            { onConflict: "setting_key" }
          );
      }

      toast.success("Compliance settings saved");
      onSettingsChange?.({ allowedTerms, forbiddenTerms, disclaimer, tone });
      onOpenChange(false);
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const addTerm = (type: "allowed" | "forbidden") => {
    if (type === "allowed" && newAllowed.trim()) {
      setAllowedTerms(prev => [...prev, newAllowed.trim()]);
      setNewAllowed("");
    } else if (type === "forbidden" && newForbidden.trim()) {
      setForbiddenTerms(prev => [...prev, newForbidden.trim()]);
      setNewForbidden("");
    }
  };

  const removeTerm = (type: "allowed" | "forbidden", idx: number) => {
    if (type === "allowed") setAllowedTerms(prev => prev.filter((_, i) => i !== idx));
    else setForbiddenTerms(prev => prev.filter((_, i) => i !== idx));
  };

  if (!loaded) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Shield className="w-4 h-4 text-primary" /> Allowed Claims & Compliance
          </DialogTitle>
          <DialogDescription className="text-xs">
            These rules are enforced on every AI-generated SEO suggestion. Forbidden terms trigger automatic regeneration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Tone selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Tone / Positioning</label>
            <Select value={tone} onValueChange={(v) => setTone(v as SeoTone)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value} className="text-xs">
                    <div>
                      <span className="font-medium">{o.label}</span>
                      <span className="text-muted-foreground ml-2">— {o.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Allowed terms */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Allowed Service Terms</label>
            <p className="text-[10px] text-muted-foreground">AI will prefer these terms in suggestions</p>
            <div className="flex flex-wrap gap-1.5">
              {allowedTerms.map((t, i) => (
                <Badge key={i} variant="default" className="text-[10px] h-5 gap-1 pr-1">
                  {t}
                  <button onClick={() => removeTerm("allowed", i)} className="hover:text-destructive">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-1.5">
              <Input
                value={newAllowed}
                onChange={e => setNewAllowed(e.target.value)}
                placeholder="Add allowed term..."
                className="h-7 text-xs flex-1"
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTerm("allowed"))}
              />
              <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => addTerm("allowed")}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Forbidden terms */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-destructive" /> Forbidden Terms
            </label>
            <p className="text-[10px] text-muted-foreground">If AI output contains any of these, it will automatically regenerate</p>
            <div className="flex flex-wrap gap-1.5">
              {forbiddenTerms.map((t, i) => (
                <Badge key={i} variant="destructive" className="text-[10px] h-5 gap-1 pr-1">
                  {t}
                  <button onClick={() => removeTerm("forbidden", i)} className="hover:text-foreground">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-1.5">
              <Input
                value={newForbidden}
                onChange={e => setNewForbidden(e.target.value)}
                placeholder="Add forbidden term..."
                className="h-7 text-xs flex-1"
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTerm("forbidden"))}
              />
              <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => addTerm("forbidden")}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Required Disclaimer (optional)</label>
            <Textarea
              value={disclaimer}
              onChange={e => setDisclaimer(e.target.value)}
              placeholder="e.g., TruMove Inc. is a licensed moving broker (MC# XXXXX), not a carrier."
              rows={2}
              className="text-xs"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Save Compliance Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
