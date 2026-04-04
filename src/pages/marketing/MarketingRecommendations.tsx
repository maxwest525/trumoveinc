import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MarketingShell from "@/components/layout/MarketingShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useImplementationQueue, type ChangeCategory } from "@/contexts/ImplementationQueueContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, Zap, TrendingUp, AlertTriangle, CheckCircle2,
  XCircle, Clock, ChevronRight, ArrowUpRight, Search, Megaphone,
  Target, PenTool, Link2, Shield, Eye, Filter, BarChart3,
  CalendarClock, ThumbsUp, ThumbsDown, RotateCcw, Lightbulb,
  Flame, Trophy, Wrench, Globe, ArrowRight, ExternalLink
} from "lucide-react";

type Priority = "critical" | "high" | "medium" | "low";
type Category = "seo" | "ads" | "cro" | "content" | "technical" | "backlinks";
type Status = "pending" | "approved" | "dismissed" | "scheduled";
type Effort = "quick" | "moderate" | "strategic";

interface Recommendation {
  id: number;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  effort: Effort;
  expectedLift: string;
  expectedROI: string;
  affectedPages: string[];
  affectedCampaigns?: string[];
  status: Status;
  scheduledDate?: string;
  aiConfidence: number;
  metric: string;
  currentValue: string;
  targetValue: string;
}

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 1, title: "Fix critical Core Web Vitals on /get-quote", description: "LCP is 4.8s (target <2.5s). Lazy-load hero image, defer non-critical JS, and preload critical fonts. This page drives 34% of all conversions.",
    category: "technical", priority: "critical", effort: "moderate", expectedLift: "+12-18% conversions", expectedROI: "$2,400/mo", affectedPages: ["/get-quote"], status: "pending", aiConfidence: 94,
    metric: "LCP", currentValue: "4.8s", targetValue: "2.5s"
  },
  {
    id: 2, title: "Pause underperforming ad group 'Generic Movers'", description: "CPA is $142 vs account avg of $38. This ad group has spent $2,800 in 14 days with only 2 conversions. Budget should shift to 'Long Distance Interstate' group.",
    category: "ads", priority: "critical", effort: "quick", expectedLift: "Save $2,800/mo", expectedROI: "$2,800/mo", affectedCampaigns: ["Google Ads - Brand"], status: "pending", aiConfidence: 97,
    metric: "CPA", currentValue: "$142", targetValue: "$38", affectedPages: []
  },
  {
    id: 3, title: "Add exit-intent popup on quote funnel", description: "32% of visitors abandon after starting the quote form. An exit-intent popup offering a callback or instant estimate can recover 8-12% of abandoners.",
    category: "cro", priority: "high", effort: "quick", expectedLift: "+8-12% recovery", expectedROI: "$1,800/mo", affectedPages: ["/get-quote"], status: "pending", aiConfidence: 88,
    metric: "Abandonment", currentValue: "32%", targetValue: "22%"
  },
  {
    id: 4, title: "Create 'Interstate Moving Cost Guide' pillar page", description: "Keyword cluster 'how much does interstate moving cost' has 18,100 monthly searches with 0 ranking pages. Competitors rank with thin content — opportunity for a comprehensive guide.",
    category: "content", priority: "high", effort: "strategic", expectedLift: "+2,400 organic visits/mo", expectedROI: "$3,600/mo", affectedPages: ["/blog"], status: "pending", aiConfidence: 82,
    metric: "Organic Traffic", currentValue: "0", targetValue: "2,400/mo"
  },
  {
    id: 5, title: "Fix missing meta descriptions on 12 service pages", description: "12 pages have auto-generated or missing meta descriptions. Custom descriptions improve CTR by 5-10% on average. Affected pages include all city-specific landing pages.",
    category: "seo", priority: "high", effort: "quick", expectedLift: "+5-10% organic CTR", expectedROI: "$900/mo", affectedPages: ["/long-distance", "/cross-country", "/california", "/texas", "/florida", "/new-york"], status: "pending", aiConfidence: 91,
    metric: "Meta Descriptions", currentValue: "12 missing", targetValue: "0 missing"
  },
  {
    id: 6, title: "Acquire backlinks from 3 moving industry directories", description: "Domain authority is 24 — below competitor avg of 38. Three high-authority directories (MovingAuthority, MoveBuddha, MyMovingReviews) accept free listings with DA 50+.",
    category: "backlinks", priority: "high", effort: "moderate", expectedLift: "+4-6 DA points", expectedROI: "$1,200/mo", affectedPages: ["/"], status: "pending", aiConfidence: 78,
    metric: "Domain Authority", currentValue: "24", targetValue: "30+"
  },
  {
    id: 7, title: "Reduce quote form from 8 to 5 fields", description: "Each additional form field reduces completion by ~4%. Remove company name, preferred date range, and move size initially — collect after lead capture.",
    category: "cro", priority: "high", effort: "moderate", expectedLift: "+15-20% form completion", expectedROI: "$2,100/mo", affectedPages: ["/get-quote"], status: "pending", aiConfidence: 90,
    metric: "Form Completion", currentValue: "42%", targetValue: "55%"
  },
  {
    id: 8, title: "Launch retargeting campaign for quote abandoners", description: "1,860 visitors started quotes but didn't complete in the last 30 days. A Meta retargeting campaign with $15/day budget typically recovers 3-5% of abandoners.",
    category: "ads", priority: "medium", effort: "moderate", expectedLift: "+56-93 leads/mo", expectedROI: "$1,400/mo", affectedCampaigns: ["Meta Retargeting"], status: "pending", aiConfidence: 85,
    metric: "Recovered Leads", currentValue: "0", targetValue: "56-93/mo", affectedPages: []
  },
  {
    id: 9, title: "Update stale blog posts (6 posts, 90+ days old)", description: "6 blog posts haven't been updated in 90+ days and are losing rankings. Refreshing with current data, new internal links, and updated CTAs can recover lost positions.",
    category: "content", priority: "medium", effort: "moderate", expectedLift: "+800 organic visits/mo", expectedROI: "$600/mo", affectedPages: ["/blog/moving-checklist", "/blog/packing-tips", "/blog/moving-costs"], status: "pending", aiConfidence: 76,
    metric: "Content Freshness", currentValue: "6 stale", targetValue: "0 stale"
  },
  {
    id: 10, title: "Add FAQ schema to top 5 service pages", description: "Competitor pages with FAQ schema earn rich snippets, increasing CTR by 15-25%. Your top 5 pages have no structured data for FAQs.",
    category: "seo", priority: "medium", effort: "quick", expectedLift: "+15-25% CTR", expectedROI: "$750/mo", affectedPages: ["/long-distance", "/cross-country", "/get-quote", "/pricing", "/about"], status: "pending", aiConfidence: 87,
    metric: "Rich Snippets", currentValue: "0 pages", targetValue: "5 pages"
  },
  {
    id: 11, title: "A/B test hero headline on homepage", description: "Current headline 'Premium Moving Solutions' is generic. Test 'Move Anywhere in the U.S. — Get Your Free Estimate in 60 Seconds' which targets intent and urgency.",
    category: "cro", priority: "medium", effort: "quick", expectedLift: "+6-10% hero CTR", expectedROI: "$500/mo", affectedPages: ["/"], status: "pending", aiConfidence: 72,
    metric: "Hero CTR", currentValue: "4.2%", targetValue: "5.5%"
  },
  {
    id: 12, title: "Add social proof counter to sticky CTA bar", description: "Display '2,847 moves completed this year' in the sticky bar. Live counters increase trust and urgency, typically boosting CTA clicks by 8-15%.",
    category: "cro", priority: "low", effort: "quick", expectedLift: "+8-15% CTA clicks", expectedROI: "$400/mo", affectedPages: ["/", "/get-quote", "/long-distance"], status: "pending", aiConfidence: 70,
    metric: "CTA Clicks", currentValue: "baseline", targetValue: "+8-15%"
  },
];

const categoryConfig: Record<Category, { icon: any; label: string; color: string }> = {
  seo: { icon: Search, label: "SEO", color: "text-blue-500" },
  ads: { icon: Megaphone, label: "Ads", color: "text-purple-500" },
  cro: { icon: Target, label: "CRO", color: "text-emerald-500" },
  content: { icon: PenTool, label: "Content", color: "text-amber-500" },
  technical: { icon: Wrench, label: "Technical", color: "text-red-500" },
  backlinks: { icon: Link2, label: "Backlinks", color: "text-cyan-500" },
};

const priorityConfig: Record<Priority, { label: string; variant: "destructive" | "default" | "secondary" | "outline"; icon: any }> = {
  critical: { label: "Critical", variant: "destructive", icon: Flame },
  high: { label: "High", variant: "default", icon: AlertTriangle },
  medium: { label: "Medium", variant: "secondary", icon: TrendingUp },
  low: { label: "Low", variant: "outline", icon: Lightbulb },
};

const effortConfig: Record<Effort, { label: string; color: string }> = {
  quick: { label: "Quick Win", color: "text-emerald-600" },
  moderate: { label: "Moderate", color: "text-amber-600" },
  strategic: { label: "Strategic", color: "text-blue-600" },
};

function SummaryCards({ recommendations }: { recommendations: Recommendation[] }) {
  const pending = recommendations.filter(r => r.status === "pending").length;
  const quickWins = recommendations.filter(r => r.effort === "quick" && r.status === "pending").length;
  const criticals = recommendations.filter(r => r.priority === "critical" && r.status === "pending").length;
  const totalROI = recommendations
    .filter(r => r.status === "pending")
    .reduce((sum, r) => {
      const match = r.expectedROI.match(/\$([\d,]+)/);
      return sum + (match ? parseInt(match[1].replace(",", "")) : 0);
    }, 0);

  const cards = [
    { title: "Pending Actions", value: String(pending), icon: Clock, change: `${quickWins} quick wins`, dir: "up" as const },
    { title: "Critical Issues", value: String(criticals), icon: Flame, change: "Needs attention", dir: criticals > 0 ? "down" as const : "up" as const },
    { title: "Quick Wins Available", value: String(quickWins), icon: Zap, change: "Low effort, high impact", dir: "up" as const },
    { title: "Est. Monthly ROI", value: `$${totalROI.toLocaleString()}`, icon: Trophy, change: "If all applied", dir: "up" as const },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <Card key={c.title}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <c.icon className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{c.value}</div>
            <div className="text-xs text-muted-foreground">{c.title}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{c.change}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RecommendationCard({ rec, onAction }: { rec: Recommendation; onAction: (id: number, action: Status) => void }) {
  const cat = categoryConfig[rec.category];
  const pri = priorityConfig[rec.priority];
  const eff = effortConfig[rec.effort];
  const CatIcon = cat.icon;
  const PriIcon = pri.icon;

  return (
    <div className="p-4 rounded-xl border border-border hover:border-primary/30 transition-all bg-card">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-muted shrink-0 ${cat.color}`}>
          <CatIcon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-semibold text-foreground">{rec.title}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={pri.variant} className="text-[10px] gap-0.5">
              <PriIcon className="w-3 h-3" /> {pri.label}
            </Badge>
            <Badge variant="outline" className={`text-[10px] ${eff.color}`}>
              {eff.label}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {cat.label}
            </Badge>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs font-bold text-foreground">{rec.expectedROI}</div>
          <div className="text-[10px] text-muted-foreground">est. ROI/mo</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{rec.description}</p>

      {/* Metrics Row */}
      <div className="flex items-center gap-4 mb-3 p-2.5 rounded-lg bg-muted/50">
        <div className="flex-1">
          <div className="text-[10px] text-muted-foreground mb-0.5">Current</div>
          <div className="text-xs font-semibold text-foreground">{rec.currentValue}</div>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
        <div className="flex-1">
          <div className="text-[10px] text-muted-foreground mb-0.5">Target</div>
          <div className="text-xs font-semibold text-emerald-600">{rec.targetValue}</div>
        </div>
        <div className="flex-1">
          <div className="text-[10px] text-muted-foreground mb-0.5">Expected Lift</div>
          <div className="text-xs font-semibold text-foreground">{rec.expectedLift}</div>
        </div>
        <div className="flex-1">
          <div className="text-[10px] text-muted-foreground mb-0.5">AI Confidence</div>
          <div className="flex items-center gap-1.5">
            <Progress value={rec.aiConfidence} className="h-1.5 flex-1" />
            <span className="text-[10px] font-semibold text-foreground">{rec.aiConfidence}%</span>
          </div>
        </div>
      </div>

      {/* Affected Pages */}
      {rec.affectedPages.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <Globe className="w-3 h-3 text-muted-foreground" />
          {rec.affectedPages.slice(0, 3).map((p) => (
            <Badge key={p} variant="outline" className="text-[10px] font-mono">{p}</Badge>
          ))}
          {rec.affectedPages.length > 3 && (
            <span className="text-[10px] text-muted-foreground">+{rec.affectedPages.length - 3} more</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-8 gap-1 text-muted-foreground"
          onClick={() => onAction(rec.id, "dismissed")}
        >
          <ThumbsDown className="w-3 h-3" /> Dismiss
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8 gap-1"
          onClick={() => onAction(rec.id, "scheduled")}
        >
          <CalendarClock className="w-3 h-3" /> Schedule
        </Button>
        <div className="flex-1" />
        <Button
          size="sm"
          className="text-xs h-8 gap-1"
          onClick={() => onAction(rec.id, "approved")}
        >
          <ThumbsUp className="w-3 h-3" /> Approve & Apply
        </Button>
      </div>
    </div>
  );
}

function ActionedCard({ rec, onUndo }: { rec: Recommendation; onUndo: (id: number) => void }) {
  const isApproved = rec.status === "approved";
  const isScheduled = rec.status === "scheduled";
  return (
    <div className="p-3 rounded-lg border border-border bg-muted/30 flex items-center gap-3">
      {isApproved && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      {rec.status === "dismissed" && <XCircle className="w-4 h-4 text-muted-foreground shrink-0" />}
      {isScheduled && <CalendarClock className="w-4 h-4 text-primary shrink-0" />}
      <div className="flex-1 min-w-0">
        <span className={`text-xs font-medium ${rec.status === "dismissed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
          {rec.title}
        </span>
        <div className="text-[10px] text-muted-foreground">
          {isApproved && "Approved — queued for implementation"}
          {rec.status === "dismissed" && "Dismissed"}
          {isScheduled && "Scheduled for next sprint"}
        </div>
      </div>
      <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" onClick={() => onUndo(rec.id)}>
        <RotateCcw className="w-3 h-3" /> Undo
      </Button>
    </div>
  );
}

const CATEGORY_MAP: Record<Category, ChangeCategory> = {
  seo: "seo",
  ads: "ads",
  cro: "cro",
  content: "content",
  technical: "technical",
  backlinks: "seo",
};

export default function MarketingRecommendations() {
  const [recs, setRecs] = useState<Recommendation[]>(RECOMMENDATIONS);
  const [activeTab, setActiveTab] = useState("all");
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all");
  const { addChange } = useImplementationQueue();
  const navigate = useNavigate();

  const handleAction = (id: number, action: Status) => {
    const rec = recs.find((r) => r.id === id);
    setRecs(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));

    if (rec && (action === "approved" || action === "scheduled")) {
      addChange({
        id: `rec-${rec.id}`,
        title: rec.title,
        description: rec.description,
        category: CATEGORY_MAP[rec.category] || "technical",
        status: action === "approved" ? "pending" : "scheduled",
        source: "Recommendations Engine",
        priority: rec.priority === "critical" ? "high" : rec.priority === "low" ? "low" : rec.priority as "high" | "medium" | "low",
        createdAt: new Date().toISOString(),
        scheduledFor: action === "scheduled" ? new Date(Date.now() + 86400000).toISOString() : undefined,
        author: "AI Engine",
      });
    }
  };

  const handleUndo = (id: number) => {
    setRecs(prev => prev.map(r => r.id === id ? { ...r, status: "pending" } : r));
  };

  const pending = useMemo(() => {
    let filtered = recs.filter(r => r.status === "pending");
    if (filterCategory !== "all") filtered = filtered.filter(r => r.category === filterCategory);
    return filtered;
  }, [recs, filterCategory]);

  const actioned = useMemo(() => recs.filter(r => r.status !== "pending"), [recs]);

  const quickWins = useMemo(() => pending.filter(r => r.effort === "quick"), [pending]);
  const highROI = useMemo(() => [...pending].sort((a, b) => {
    const getROI = (r: Recommendation) => { const m = r.expectedROI.match(/\$([\d,]+)/); return m ? parseInt(m[1].replace(",", "")) : 0; };
    return getROI(b) - getROI(a);
  }), [pending]);
  const critical = useMemo(() => pending.filter(r => r.priority === "critical"), [pending]);

  const tabItems: { value: string; label: string; count: number }[] = [
    { value: "all", label: "All", count: pending.length },
    { value: "quick", label: "Quick Wins", count: quickWins.length },
    { value: "roi", label: "Highest ROI", count: highROI.length },
    { value: "critical", label: "Urgent", count: critical.length },
    { value: "actioned", label: "Actioned", count: actioned.length },
  ];

  const displayRecs = activeTab === "quick" ? quickWins
    : activeTab === "roi" ? highROI
    : activeTab === "critical" ? critical
    : activeTab === "actioned" ? []
    : pending;

  return (
    <MarketingShell breadcrumb="Recommendations">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Recommendations Engine
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Prioritized actions across SEO, ads, CRO, content & technical — powered by performance data
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <BarChart3 className="w-3 h-3" /> Impact Report
            </Button>
            <Button size="sm" className="text-xs gap-1">
              <Sparkles className="w-3 h-3" /> Refresh Analysis
            </Button>
          </div>
        </div>

        <SummaryCards recommendations={recs} />

        {/* Category Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <Button variant={filterCategory === "all" ? "default" : "outline"} size="sm" className="text-xs h-7"
            onClick={() => setFilterCategory("all")}>All</Button>
          {(Object.entries(categoryConfig) as [Category, typeof categoryConfig[Category]][]).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <Button key={key} variant={filterCategory === key ? "default" : "outline"} size="sm" className="text-xs h-7 gap-1"
                onClick={() => setFilterCategory(key)}>
                <Icon className="w-3 h-3" /> {cfg.label}
              </Button>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {tabItems.map(t => (
              <TabsTrigger key={t.value} value={t.value} className="text-xs gap-1">
                {t.label}
                <Badge variant="secondary" className="text-[10px] ml-1 h-4 min-w-[16px] px-1">{t.count}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Pending tabs */}
          {["all", "quick", "roi", "critical"].map(tab => (
            <TabsContent key={tab} value={tab} className="space-y-3 mt-4">
              {displayRecs.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">All caught up!</p>
                    <p className="text-xs text-muted-foreground">No pending recommendations in this category.</p>
                  </CardContent>
                </Card>
              ) : (
                displayRecs.map(rec => (
                  <RecommendationCard key={rec.id} rec={rec} onAction={handleAction} />
                ))
              )}
            </TabsContent>
          ))}

          {/* Actioned tab */}
          <TabsContent value="actioned" className="space-y-2 mt-4">
            {actioned.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">No actions taken yet</p>
                  <p className="text-xs text-muted-foreground">Approve, dismiss, or schedule recommendations to see them here.</p>
                </CardContent>
              </Card>
            ) : (
              actioned.map(rec => (
                <ActionedCard key={rec.id} rec={rec} onUndo={handleUndo} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MarketingShell>
  );
}
