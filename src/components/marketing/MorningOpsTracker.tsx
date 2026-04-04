import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sun, CheckCircle2, Circle, AlertTriangle, ChevronDown, ChevronUp,
  ExternalLink, Clock, Rocket, Lightbulb, FileText, BarChart3, Plug, Search
} from "lucide-react";
import { useImplementationQueue } from "@/contexts/ImplementationQueueContext";
import { useNavigate } from "react-router-dom";

type OpsItemStatus = "pending" | "done" | "alert" | "skipped";
type OpsCategory = "critical" | "recommendations" | "content" | "data" | "routine";

interface OpsItem {
  id: string;
  title: string;
  category: OpsCategory;
  status: OpsItemStatus;
  source: string;
  link: string;
  timestamp?: string;
  description?: string;
}

const CATEGORY_CONFIG: Record<OpsCategory, { label: string; icon: React.ElementType; color: string }> = {
  critical: { label: "Critical", icon: AlertTriangle, color: "text-red-500" },
  recommendations: { label: "AI Recs", icon: Lightbulb, color: "text-amber-500" },
  content: { label: "Content", icon: FileText, color: "text-blue-500" },
  data: { label: "Data", icon: Plug, color: "text-purple-500" },
  routine: { label: "Routine", icon: BarChart3, color: "text-emerald-500" },
};

interface ActivityItem {
  section: string;
  last_updated: string;
  label: string;
}

export default function MorningOpsTracker({ activityLog }: { activityLog: ActivityItem[] }) {
  const { changes } = useImplementationQueue();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [completedTimestamps, setCompletedTimestamps] = useState<Record<string, string>>({});

  const items = useMemo<OpsItem[]>(() => {
    const list: OpsItem[] = [];

    // 1 — Critical: pending/approved implementation items + rolled back
    changes
      .filter((c) => c.status === "pending" || c.status === "approved" || c.status === "rolled_back")
      .forEach((c) => {
        list.push({
          id: `impl-${c.id}`,
          title: c.status === "rolled_back" ? `Rolled-back: ${c.title}` : `Review: ${c.title}`,
          category: "critical",
          status: c.status === "rolled_back" ? "alert" : "pending",
          source: "Implementation Center",
          link: "/marketing/implementation",
          description: c.description,
        });
      });

    // 2 — AI Recommendations (seed items — in production these come from the engine)
    list.push({
      id: "rec-check",
      title: "Review AI recommendations queue",
      category: "recommendations",
      status: "pending",
      source: "Recommendations Engine",
      link: "/marketing/recommendations",
      description: "Check for new high-priority opportunities and quick wins.",
    });

    // 3 — Content
    list.push({
      id: "content-calendar",
      title: "Check content calendar & scheduled posts",
      category: "content",
      status: "pending",
      source: "Content Center",
      link: "/marketing/content",
      description: "Verify upcoming publish dates and review drafts.",
    });

    // 4 — Data freshness from activity log
    const staleThreshold = 7;
    activityLog.forEach((item) => {
      const days = Math.floor((Date.now() - new Date(item.last_updated).getTime()) / (1000 * 60 * 60 * 24));
      if (days > staleThreshold) {
        list.push({
          id: `stale-${item.section}`,
          title: `${item.label} data is ${days} days old`,
          category: "data",
          status: "alert",
          source: "Activity Tracker",
          link: "/marketing/dashboard",
          description: `Last updated ${days} days ago — refresh recommended.`,
        });
      }
    });

    // 5 — Routine checks
    const routines: Omit<OpsItem, "status">[] = [
      { id: "routine-ads", title: "Review ad performance & spend", category: "routine", source: "PPC Dashboard", link: "/marketing/seo", description: "Check CTR, CPA, and budget pacing." },
      { id: "routine-seo", title: "Check SEO rankings & crawl health", category: "routine", source: "SEO Module", link: "/marketing/seo", description: "Verify keyword positions and crawl status." },
      { id: "routine-cro", title: "Review CRO experiments & conversion rates", category: "routine", source: "CRO Dashboard", link: "/marketing/cro", description: "Check running A/B tests and funnel metrics." },
      { id: "routine-integrations", title: "Verify integration sync health", category: "routine", source: "Integrations Hub", link: "/marketing/integrations", description: "Ensure all data sources are syncing." },
    ];
    routines.forEach((r) => list.push({ ...r, status: "pending" } as OpsItem));

    return list;
  }, [changes, activityLog]);

  const toggleItem = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setCompletedTimestamps((t) => { const n = { ...t }; delete n[id]; return n; });
      } else {
        next.add(id);
        setCompletedTimestamps((t) => ({ ...t, [id]: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }));
      }
      return next;
    });
  };

  const doneCount = items.filter((i) => completed.has(i.id)).length;
  const progress = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-card to-card/80 overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sun className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Morning Ops</h2>
              <p className="text-xs text-muted-foreground">{today}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 min-w-[180px]">
              <Progress value={progress} className="h-2" />
              <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                {doneCount}/{items.length}
              </span>
            </div>
            {progress === 100 && (
              <Badge variant="default" className="bg-emerald-500/90 text-white text-xs">All clear ✓</Badge>
            )}
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent>
          <CardContent className="pt-2 pb-4 px-5">
            <div className="space-y-1">
              {items.map((item, idx) => {
                const isDone = completed.has(item.id);
                const cfg = CATEGORY_CONFIG[item.category];
                const CatIcon = cfg.icon;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors group ${
                      isDone ? "bg-muted/40 opacity-60" : item.status === "alert" ? "bg-destructive/5" : "hover:bg-muted/30"
                    }`}
                  >
                    {/* Step number */}
                    <span className="text-xs font-bold text-muted-foreground w-5 text-right shrink-0">{idx + 1}</span>

                    {/* Checkbox */}
                    <button onClick={() => toggleItem(item.id)} className="shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : item.status === "alert" ? (
                        <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground/40 hover:text-primary transition-colors" />
                      )}
                    </button>

                    {/* Category badge */}
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${cfg.color} border-current/20`}>
                      <CatIcon className="w-3 h-3 mr-0.5" />
                      {cfg.label}
                    </Badge>

                    {/* Title + description */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isDone ? "line-through" : ""}`}>{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                      )}
                    </div>

                    {/* Source */}
                    <span className="text-[10px] text-muted-foreground hidden lg:block shrink-0">{item.source}</span>

                    {/* Timestamp */}
                    {isDone && completedTimestamps[item.id] && (
                      <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 shrink-0">
                        <Clock className="w-3 h-3" />
                        {completedTimestamps[item.id]}
                      </span>
                    )}

                    {/* Link */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={() => navigate(item.link)}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
