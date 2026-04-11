import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useImplementationQueue } from "@/contexts/ImplementationQueueContext";
import {
  Sparkles, Zap, TrendingUp, AlertTriangle, CheckCircle2,
  XCircle, Clock, Search, Megaphone, Target, PenTool, Link2,
  Shield, Filter, Lightbulb, Flame, Trophy, Wrench, Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Priority = "critical" | "high" | "medium" | "low";
type Category = "seo" | "ads" | "cro" | "content" | "technical" | "backlinks";
type Effort = "quick" | "moderate" | "strategic";

interface Recommendation {
  id: number;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  effort: Effort;
  expectedLift: string;
  reasoning: string;
  status: "pending" | "approved" | "dismissed" | "scheduled";
}

const RECS: Recommendation[] = [
  { id: 1, title: "Add FAQ schema to top 5 landing pages", description: "Implement FAQPage structured data", category: "seo", priority: "high", effort: "quick", expectedLift: "+15% CTR", reasoning: "Pages missing FAQ schema lose rich snippet eligibility", status: "pending" },
  { id: 2, title: "Pause 3 underperforming ad groups", description: "Ad groups with $0 conversions and $200+ spend", category: "ads", priority: "critical", effort: "quick", expectedLift: "Save $600/mo", reasoning: "Wasted spend detected", status: "pending" },
  { id: 3, title: "A/B test CTA button color on /get-quote", description: "Test green vs orange CTA", category: "cro", priority: "medium", effort: "quick", expectedLift: "+5-8% conversions", reasoning: "Current CTA has low visibility", status: "pending" },
  { id: 4, title: "Create 'Moving Cost Calculator' interactive page", description: "Linkable asset for backlink acquisition", category: "content", priority: "high", effort: "strategic", expectedLift: "+20 backlinks", reasoning: "Top competitors have calculator pages ranking in top 3", status: "pending" },
  { id: 5, title: "Fix 12 broken internal links", description: "Crawl found 12 404s from internal links", category: "technical", priority: "high", effort: "moderate", expectedLift: "Improved crawl efficiency", reasoning: "Broken links waste crawl budget", status: "pending" },
  { id: 6, title: "Submit to 5 FMCSA-related directories", description: "High-DA niche directories for backlinks", category: "backlinks", priority: "medium", effort: "moderate", expectedLift: "+3-5 DA points", reasoning: "Low-hanging backlink opportunities", status: "pending" },
];

const CAT_ICONS: Record<Category, React.ElementType> = { seo: Search, ads: Megaphone, cro: Target, content: PenTool, technical: Wrench, backlinks: Link2 };
const PRIORITY_COLORS: Record<Priority, string> = { critical: "text-red-600 bg-red-50", high: "text-amber-600 bg-amber-50", medium: "text-blue-600 bg-blue-50", low: "text-gray-600 bg-gray-50" };
const EFFORT_LABELS: Record<Effort, string> = { quick: "⚡ Quick Win", moderate: "🔧 Moderate", strategic: "🎯 Strategic" };

export default function RecommendationsContent() {
  const { addChange } = useImplementationQueue();
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [sort, setSort] = useState<"priority" | "quick" | "roi">("priority");
  const [recs, setRecs] = useState(RECS);

  const filtered = useMemo(() => {
    let list = filter === "all" ? recs : recs.filter((r) => r.category === filter);
    if (sort === "quick") list = [...list].sort((a, b) => (a.effort === "quick" ? -1 : 1));
    if (sort === "roi") list = [...list].sort((a, b) => (a.priority === "critical" ? -1 : a.priority === "high" ? 0 : 1));
    return list;
  }, [recs, filter, sort]);

  function approve(rec: Recommendation) {
    addChange({
      title: rec.title,
      description: rec.description,
      category: rec.category === "ads" ? "ads" : rec.category === "cro" ? "cro" : rec.category === "technical" ? "technical" : rec.category === "content" ? "content" : "seo",
      status: "pending",
    });
    setRecs((prev) => prev.map((r) => (r.id === rec.id ? { ...r, status: "approved" as const } : r)));
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "seo", "ads", "cro", "content", "technical", "backlinks"] as const).map((cat) => (
          <Button key={cat} variant={filter === cat ? "default" : "outline"} size="sm" className="h-7 text-xs capitalize" onClick={() => setFilter(cat)}>
            {cat === "all" ? "All" : cat}
          </Button>
        ))}
        <div className="ml-auto flex gap-1.5">
          {(["priority", "quick", "roi"] as const).map((s) => (
            <Button key={s} variant={sort === s ? "secondary" : "ghost"} size="sm" className="h-7 text-xs capitalize" onClick={() => setSort(s)}>
              {s === "quick" ? "Quick Wins" : s === "roi" ? "Highest ROI" : "Priority"}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((rec) => {
          const CatIcon = CAT_ICONS[rec.category];
          return (
            <Card key={rec.id} className={rec.status !== "pending" ? "opacity-60" : ""}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted shrink-0">
                    <CatIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold">{rec.title}</h3>
                      <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLORS[rec.priority]}`}>{rec.priority}</Badge>
                      <span className="text-[10px] text-muted-foreground">{EFFORT_LABELS[rec.effort]}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs font-medium text-emerald-600">{rec.expectedLift}</span>
                      <span className="text-[10px] text-muted-foreground">{rec.reasoning}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {rec.status === "pending" ? (
                      <>
                        <Button size="sm" className="h-7 text-xs" onClick={() => approve(rec)}>Approve & Apply</Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setRecs((p) => p.map((r) => (r.id === rec.id ? { ...r, status: "dismissed" as const } : r)))}>Dismiss</Button>
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
      </div>
    </div>
  );
}
