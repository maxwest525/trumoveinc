import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useImplementationQueue } from "@/contexts/ImplementationQueueContext";
import {
  Sparkles, CheckCircle2, XCircle, Search, Megaphone, Target,
  PenTool, Link2, Wrench, Loader2, RefreshCw, Pencil, Save, X, Activity,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { buildCurrentKpiSnapshot } from "@/lib/marketingKpiSnapshot";
import { PULSE_ACTION_DRAFT_KEY } from "@/components/pulse/dashboard/PulseCallOutcomeStats";

type Priority = "critical" | "high" | "medium" | "low";
type Category = "seo" | "ads" | "cro" | "content" | "technical" | "backlinks";
type Effort = "quick" | "moderate" | "strategic";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  effort: Effort;
  expectedLift: string;
  reasoning: string;
  status: "pending" | "approved" | "dismissed" | "scheduled";
  kpiContext?: {
    label: string;
    metrics: { label: string; value: string | number }[];
    sourceLabel?: string;
  };
}

// Seed examples shown before the user generates fresh items.
const SEED: Recommendation[] = [
  { id: "seed-1", title: "Add FAQ schema to top 5 landing pages", description: "Implement FAQPage structured data", category: "seo", priority: "high", effort: "quick", expectedLift: "+15% CTR", reasoning: "Pages missing FAQ schema lose rich snippet eligibility", status: "pending" },
  { id: "seed-2", title: "Pause 3 underperforming ad groups", description: "Ad groups with $0 conversions and $200+ spend", category: "ads", priority: "critical", effort: "quick", expectedLift: "Save $600/mo", reasoning: "Wasted spend detected", status: "pending" },
  { id: "seed-3", title: "A/B test CTA button color on /get-quote", description: "Test green vs orange CTA", category: "cro", priority: "medium", effort: "quick", expectedLift: "+5-8% conversions", reasoning: "Current CTA has low visibility", status: "pending" },
];

// KPI snapshot is pulled live from the Metrics Dashboard data source
// via buildCurrentKpiSnapshot() at generation time.

const CAT_ICONS: Record<Category, React.ElementType> = {
  seo: Search, ads: Megaphone, cro: Target, content: PenTool, technical: Wrench, backlinks: Link2,
};
const PRIORITY_COLORS: Record<Priority, string> = {
  critical: "text-red-600 bg-red-50",
  high: "text-amber-600 bg-amber-50",
  medium: "text-blue-600 bg-blue-50",
  low: "text-gray-600 bg-gray-50",
};
const EFFORT_LABELS: Record<Effort, string> = {
  quick: "⚡ Quick Win", moderate: "🔧 Moderate", strategic: "🎯 Strategic",
};

const CATEGORIES: Category[] = ["seo", "ads", "cro", "content", "technical", "backlinks"];
const PRIORITIES: Priority[] = ["critical", "high", "medium", "low"];
const EFFORTS: Effort[] = ["quick", "moderate", "strategic"];

export default function RecommendationsContent() {
  const { addChange } = useImplementationQueue();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [sort, setSort] = useState<"priority" | "quick" | "roi">("priority");
  const [recs, setRecs] = useState<Recommendation[]>(SEED);
  const [generating, setGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Recommendation | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const filtered = useMemo(() => {
    let list = filter === "all" ? recs : recs.filter((r) => r.category === filter);
    if (sort === "quick") list = [...list].sort((a, b) => (a.effort === "quick" ? -1 : 1));
    if (sort === "roi") {
      const rank = { critical: 0, high: 1, medium: 2, low: 3 } as const;
      list = [...list].sort((a, b) => rank[a.priority] - rank[b.priority]);
    }
    return list;
  }, [recs, filter, sort]);

  async function generate() {
    setGenerating(true);
    try {
      const kpis = buildCurrentKpiSnapshot();
      const { data, error } = await supabase.functions.invoke(
        "generate-marketing-action-items",
        { body: { kpis, count: 6 } },
      );
      if (error) throw error;
      const items = (data?.items ?? []) as Omit<Recommendation, "id" | "status">[];
      if (!items.length) throw new Error("No items returned");

      const fresh: Recommendation[] = items.map((it, i) => ({
        ...it,
        id: `ai-${Date.now()}-${i}`,
        status: "pending",
      }));
      setRecs(fresh);
      setHasGenerated(true);
      toast({
        title: "Action items generated",
        description: `${fresh.length} recommendations created from current KPIs.`,
      });
    } catch (e: any) {
      const msg = e?.message || "Failed to generate action items";
      toast({
        title: "Generation failed",
        description: msg.includes("402")
          ? "AI credits exhausted. Add funds in Settings → Workspace → Usage."
          : msg.includes("429")
          ? "Rate limit reached. Try again in a moment."
          : msg,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  }

  function startEdit(rec: Recommendation) {
    setEditingId(rec.id);
    setDraft({ ...rec });
  }
  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
  }
  function saveEdit() {
    if (!draft) return;
    setRecs((prev) => prev.map((r) => (r.id === draft.id ? draft : r)));
    setEditingId(null);
    setDraft(null);
    toast({ title: "Action item updated" });
  }

  function approve(rec: Recommendation) {
    addChange({
      id: `rec-${rec.id}-${Date.now()}`,
      title: rec.title,
      description: rec.description,
      category:
        rec.category === "ads" ? "ads"
        : rec.category === "cro" ? "cro"
        : rec.category === "technical" ? "technical"
        : rec.category === "content" ? "content"
        : "seo",
      status: "pending",
      source: "AI Recommendations",
      priority:
        rec.priority === "critical" ? "high"
        : rec.priority === "high" ? "high"
        : rec.priority === "medium" ? "medium"
        : "low",
      createdAt: new Date().toISOString(),
      author: "AI Engine",
    });
    setRecs((prev) => prev.map((r) => (r.id === rec.id ? { ...r, status: "approved" } : r)));
  }

  return (
    <div className="space-y-4 mt-4">
      {/* Generate / Refresh bar */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium">AI-generated next steps</p>
              <p className="text-xs text-muted-foreground">
                Builds a fresh list from your current marketing KPIs.
              </p>
            </div>
          </div>
          <Button size="sm" onClick={generate} disabled={generating} className="h-8 gap-1.5">
            {generating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : hasGenerated ? (
              <RefreshCw className="w-3.5 h-3.5" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {generating ? "Generating…" : hasGenerated ? "Refresh action items" : "Generate action items"}
          </Button>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", ...CATEGORIES] as const).map((cat) => (
          <Button
            key={cat}
            variant={filter === cat ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs capitalize"
            onClick={() => setFilter(cat)}
          >
            {cat === "all" ? "All" : cat}
          </Button>
        ))}
        <div className="ml-auto flex gap-1.5">
          {(["priority", "quick", "roi"] as const).map((s) => (
            <Button
              key={s}
              variant={sort === s ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs capitalize"
              onClick={() => setSort(s)}
            >
              {s === "quick" ? "Quick Wins" : s === "roi" ? "Highest ROI" : "Priority"}
            </Button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((rec) => {
          const CatIcon = CAT_ICONS[rec.category];
          const isEditing = editingId === rec.id && draft;

          return (
            <Card key={rec.id} className={rec.status !== "pending" ? "opacity-60" : ""}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted shrink-0">
                    <CatIcon className="w-4 h-4 text-muted-foreground" />
                  </div>

                  {isEditing && draft ? (
                    <div className="flex-1 min-w-0 space-y-2">
                      <Input
                        value={draft.title}
                        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                        className="h-8 text-sm font-semibold"
                        placeholder="Title"
                      />
                      <Textarea
                        value={draft.description}
                        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                        className="text-xs min-h-[60px]"
                        placeholder="Description"
                      />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v as Category })}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="text-xs capitalize">{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select value={draft.priority} onValueChange={(v) => setDraft({ ...draft, priority: v as Priority })}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {PRIORITIES.map((p) => <SelectItem key={p} value={p} className="text-xs capitalize">{p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select value={draft.effort} onValueChange={(v) => setDraft({ ...draft, effort: v as Effort })}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {EFFORTS.map((e) => <SelectItem key={e} value={e} className="text-xs capitalize">{e}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Input
                          value={draft.expectedLift}
                          onChange={(e) => setDraft({ ...draft, expectedLift: e.target.value })}
                          className="h-8 text-xs"
                          placeholder="Expected lift"
                        />
                      </div>
                      <Textarea
                        value={draft.reasoning}
                        onChange={(e) => setDraft({ ...draft, reasoning: e.target.value })}
                        className="text-xs min-h-[50px]"
                        placeholder="Reasoning"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold">{rec.title}</h3>
                        <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLORS[rec.priority]}`}>
                          {rec.priority}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{EFFORT_LABELS[rec.effort]}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs font-medium text-emerald-600">{rec.expectedLift}</span>
                        <span className="text-[10px] text-muted-foreground">{rec.reasoning}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-1.5 shrink-0">
                    {isEditing ? (
                      <>
                        <Button size="sm" className="h-7 text-xs gap-1" onClick={saveEdit}>
                          <Save className="w-3 h-3" /> Save
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={cancelEdit}>
                          <X className="w-3 h-3" /> Cancel
                        </Button>
                      </>
                    ) : rec.status === "pending" ? (
                      <>
                        <Button size="sm" className="h-7 text-xs" onClick={() => approve(rec)}>
                          Approve & Apply
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => startEdit(rec)}>
                          <Pencil className="w-3 h-3" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => setRecs((p) => p.map((r) => (r.id === rec.id ? { ...r, status: "dismissed" as const } : r)))}
                        >
                          Dismiss
                        </Button>
                      </>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        {rec.status === "approved" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {rec.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            No action items in this category. Try "Generate action items".
          </p>
        )}
      </div>
    </div>
  );
}
