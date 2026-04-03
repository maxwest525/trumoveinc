import { useState } from "react";
import MarketingShell from "@/components/layout/MarketingShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Target, TrendingUp, TrendingDown, ArrowRight, AlertTriangle,
  Lightbulb, FlaskConical, BarChart3, MousePointerClick, FormInput,
  Layout, Eye, Zap, CheckCircle2, XCircle, Clock, ChevronRight,
  ArrowUpRight, ArrowDownRight, Play, Pause, Plus, Sparkles
} from "lucide-react";

// --- Mock Data ---
const FUNNEL_STAGES = [
  { stage: "Visitors", count: 24800, rate: 100, color: "hsl(var(--primary))" },
  { stage: "Quote Started", count: 6200, rate: 25.0, color: "hsl(var(--primary) / 0.85)" },
  { stage: "Inventory Added", count: 3720, rate: 60.0, color: "hsl(var(--primary) / 0.7)" },
  { stage: "Contact Info", count: 2604, rate: 70.0, color: "hsl(var(--primary) / 0.55)" },
  { stage: "Quote Received", count: 1823, rate: 70.0, color: "hsl(var(--primary) / 0.4)" },
  { stage: "Booked", count: 547, rate: 30.0, color: "hsl(var(--primary) / 0.25)" },
];

const LANDING_PAGES = [
  { url: "/get-quote", name: "Get a Quote", visitors: 8420, conversions: 1263, rate: 15.0, bounce: 32, avgTime: "2:45", trend: "up" as const, score: 92 },
  { url: "/long-distance", name: "Long Distance Moving", visitors: 5130, conversions: 462, rate: 9.0, bounce: 45, avgTime: "1:58", trend: "up" as const, score: 78 },
  { url: "/", name: "Homepage", visitors: 12400, conversions: 744, rate: 6.0, bounce: 52, avgTime: "1:22", trend: "down" as const, score: 65 },
  { url: "/cross-country", name: "Cross Country Movers", visitors: 3200, conversions: 224, rate: 7.0, bounce: 48, avgTime: "1:35", trend: "stable" as const, score: 70 },
  { url: "/pricing", name: "Pricing Page", visitors: 2800, conversions: 308, rate: 11.0, bounce: 38, avgTime: "2:12", trend: "up" as const, score: 84 },
  { url: "/reviews", name: "Customer Reviews", visitors: 1950, conversions: 117, rate: 6.0, bounce: 55, avgTime: "1:10", trend: "down" as const, score: 58 },
];

const EXPERIMENTS = [
  { id: 1, name: "Quote CTA: Green vs Purple", page: "/get-quote", status: "running" as const, confidence: 87, lift: "+14.2%", winner: "Variant B", visitors: 4200, daysRunning: 12 },
  { id: 2, name: "Hero headline test", page: "/", status: "running" as const, confidence: 62, lift: "+6.8%", winner: "-", visitors: 8100, daysRunning: 5 },
  { id: 3, name: "Form: 3-step vs 5-step", page: "/get-quote", status: "completed" as const, confidence: 96, lift: "+22.1%", winner: "3-Step (Variant A)", visitors: 6800, daysRunning: 21 },
  { id: 4, name: "Trust badges above fold", page: "/long-distance", status: "completed" as const, confidence: 94, lift: "+11.5%", winner: "With Badges", visitors: 3400, daysRunning: 14 },
  { id: 5, name: "Sticky CTA bar mobile", page: "/", status: "paused" as const, confidence: 45, lift: "+3.2%", winner: "-", visitors: 2100, daysRunning: 8 },
];

const RECOMMENDATIONS = [
  { id: 1, title: "Add exit-intent popup on /get-quote", impact: "high" as const, effort: "low" as const, expectedLift: "+8-12%", category: "CTA", reason: "32% of visitors leave without completing. Exit-intent can recover 8-12% of abandoners.", pages: ["/get-quote"] },
  { id: 2, title: "Reduce form fields from 8 to 5", impact: "high" as const, effort: "medium" as const, expectedLift: "+15-20%", category: "Form", reason: "Each additional field reduces completion by ~4%. Remove company, move size, and preferred date initially.", pages: ["/get-quote"] },
  { id: 3, title: "Add social proof counter to hero", impact: "medium" as const, effort: "low" as const, expectedLift: "+5-8%", category: "Trust", reason: "Pages with live social proof ('2,847 moves completed') convert 5-8% higher.", pages: ["/", "/long-distance"] },
  { id: 4, title: "Implement sticky mobile CTA", impact: "high" as const, effort: "low" as const, expectedLift: "+10-15%", category: "CTA", reason: "Mobile bounce rate is 62%. A persistent CTA keeps action visible during scroll.", pages: ["/", "/long-distance", "/cross-country"] },
  { id: 5, title: "Add video testimonial to reviews page", impact: "medium" as const, effort: "medium" as const, expectedLift: "+6-10%", category: "Trust", reason: "Video testimonials increase conversion 2x vs text-only. Reviews page has lowest conversion rate.", pages: ["/reviews"] },
  { id: 6, title: "Speed up /long-distance (LCP 4.2s → 2.5s)", impact: "high" as const, effort: "high" as const, expectedLift: "+7-12%", category: "Performance", reason: "Every 100ms delay reduces conversions by 1%. Current LCP is 1.7s above target.", pages: ["/long-distance"] },
];

const CTA_PERFORMANCE = [
  { label: "Get Free Quote", clicks: 3842, convRate: 18.2, position: "Hero", page: "/", trend: "up" as const },
  { label: "Start My Estimate", clicks: 2190, convRate: 22.5, position: "Sticky Bar", page: "/get-quote", trend: "up" as const },
  { label: "Call Now", clicks: 1456, convRate: 31.0, position: "Header", page: "Global", trend: "stable" as const },
  { label: "View Pricing", clicks: 982, convRate: 8.4, position: "Mid-page", page: "/long-distance", trend: "down" as const },
  { label: "Schedule Survey", clicks: 567, convRate: 14.8, position: "Below fold", page: "/get-quote", trend: "up" as const },
];

function MetricCard({ title, value, change, changeDir, icon: Icon, subtitle }: {
  title: string; value: string; change: string; changeDir: "up" | "down"; icon: any; subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <Badge variant={changeDir === "up" ? "default" : "destructive"} className="text-[10px] gap-0.5">
            {changeDir === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </Badge>
        </div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{title}</div>
        {subtitle && <div className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</div>}
      </CardContent>
    </Card>
  );
}

function FunnelVisualization() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Conversion Funnel
        </CardTitle>
        <CardDescription className="text-xs">Last 30 days · All traffic sources</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {FUNNEL_STAGES.map((stage, i) => {
          const widthPct = (stage.count / FUNNEL_STAGES[0].count) * 100;
          const dropoff = i > 0 ? FUNNEL_STAGES[i - 1].count - stage.count : 0;
          const dropPct = i > 0 ? ((dropoff / FUNNEL_STAGES[i - 1].count) * 100).toFixed(0) : null;
          return (
            <div key={stage.stage}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-foreground">{stage.stage}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{stage.count.toLocaleString()}</span>
                  {dropPct && (
                    <span className="text-destructive text-[10px] flex items-center gap-0.5">
                      <TrendingDown className="w-3 h-3" /> -{dropPct}%
                    </span>
                  )}
                </div>
              </div>
              <div className="h-6 rounded-md bg-muted overflow-hidden">
                <div
                  className="h-full rounded-md transition-all duration-500"
                  style={{ width: `${widthPct}%`, backgroundColor: stage.color }}
                />
              </div>
              {i < FUNNEL_STAGES.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
            </div>
          );
        })}
        <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Biggest Drop-off
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Quote Received → Booked</strong> loses 70% of users. Consider adding urgency, price anchoring, or a callback CTA at this stage.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function LandingPageAnalysis() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Layout className="w-4 h-4 text-primary" />
            Landing Page Performance
          </CardTitle>
          <Button variant="outline" size="sm" className="text-xs gap-1">
            <Plus className="w-3 h-3" /> Add Page
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Page</TableHead>
              <TableHead className="text-xs text-right">Visitors</TableHead>
              <TableHead className="text-xs text-right">Conv.</TableHead>
              <TableHead className="text-xs text-right">Rate</TableHead>
              <TableHead className="text-xs text-right">Bounce</TableHead>
              <TableHead className="text-xs text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {LANDING_PAGES.map((page) => (
              <TableRow key={page.url} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <div>
                    <div className="text-xs font-medium text-foreground">{page.name}</div>
                    <div className="text-[10px] text-muted-foreground">{page.url}</div>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-right font-medium">{page.visitors.toLocaleString()}</TableCell>
                <TableCell className="text-xs text-right">{page.conversions.toLocaleString()}</TableCell>
                <TableCell className="text-xs text-right">
                  <div className="flex items-center justify-end gap-1">
                    {page.trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                    {page.trend === "down" && <TrendingDown className="w-3 h-3 text-destructive" />}
                    <span className={page.rate >= 10 ? "text-emerald-600 font-semibold" : ""}>{page.rate}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-right">{page.bounce}%</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={page.score >= 80 ? "default" : page.score >= 65 ? "secondary" : "destructive"}
                    className="text-[10px]"
                  >
                    {page.score}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ExperimentsPanel() {
  const statusConfig = {
    running: { icon: Play, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Running" },
    completed: { icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10", label: "Completed" },
    paused: { icon: Pause, color: "text-amber-500", bg: "bg-amber-500/10", label: "Paused" },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-primary" />
            A/B Tests & Experiments
          </CardTitle>
          <Button size="sm" className="text-xs gap-1">
            <Plus className="w-3 h-3" /> New Experiment
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {EXPERIMENTS.map((exp) => {
          const cfg = statusConfig[exp.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={exp.id} className="p-3 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-foreground truncate">{exp.name}</span>
                    <Badge variant="outline" className={`text-[10px] gap-0.5 ${cfg.color}`}>
                      <StatusIcon className="w-3 h-3" /> {cfg.label}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{exp.page} · {exp.visitors.toLocaleString()} visitors · {exp.daysRunning} days</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground mt-0.5" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Confidence</span>
                    <span className={exp.confidence >= 95 ? "text-emerald-600 font-semibold" : ""}>{exp.confidence}%</span>
                  </div>
                  <Progress value={exp.confidence} className="h-1.5" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-foreground">{exp.lift}</div>
                  <div className="text-[10px] text-muted-foreground">Lift</div>
                </div>
                {exp.winner !== "-" && (
                  <Badge variant="default" className="text-[10px]">
                    Winner: {exp.winner}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function CTAPerformance() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <MousePointerClick className="w-4 h-4 text-primary" />
          CTA Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {CTA_PERFORMANCE.map((cta, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium text-foreground truncate">{cta.label}</span>
                  <span className="text-[10px] text-muted-foreground">{cta.position}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{cta.clicks.toLocaleString()} clicks</span>
                  <span>{cta.page}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs font-semibold">
                  {cta.trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                  {cta.trend === "down" && <TrendingDown className="w-3 h-3 text-destructive" />}
                  {cta.convRate}%
                </div>
                <div className="text-[10px] text-muted-foreground">conv. rate</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecommendationsPanel() {
  const impactColors = { high: "destructive" as const, medium: "secondary" as const, low: "outline" as const };
  const effortLabels = { low: "Quick Win", medium: "Moderate", high: "Strategic" };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Optimization Recommendations
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">{RECOMMENDATIONS.length} actions</Badge>
        </div>
        <CardDescription className="text-xs">Prioritized by expected impact and effort</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {RECOMMENDATIONS.map((rec) => (
          <div key={rec.id} className="p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="text-xs font-semibold text-foreground">{rec.title}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{rec.reason}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant={impactColors[rec.impact]} className="text-[10px]">
                {rec.impact} impact
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {effortLabels[rec.effort]}
              </Badge>
              <Badge variant="outline" className="text-[10px] text-emerald-600">
                {rec.expectedLift} lift
              </Badge>
              <div className="flex-1" />
              <Button variant="ghost" size="sm" className="text-xs h-7">Dismiss</Button>
              <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
                <Zap className="w-3 h-3" /> Apply
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function FormOptimization() {
  const forms = [
    { name: "Main Quote Form", starts: 6200, completions: 2604, rate: 42.0, avgTime: "1:48", fields: 8, dropField: "Move Date" },
    { name: "Quick Estimate", starts: 3100, completions: 2170, rate: 70.0, avgTime: "0:32", fields: 3, dropField: "Phone" },
    { name: "Contact Form", starts: 890, completions: 534, rate: 60.0, avgTime: "0:45", fields: 5, dropField: "Message" },
    { name: "Video Survey Booking", starts: 420, completions: 252, rate: 60.0, avgTime: "1:12", fields: 6, dropField: "Preferred Time" },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <FormInput className="w-4 h-4 text-primary" />
          Form Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {forms.map((form, i) => (
          <div key={i} className="p-3 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-foreground">{form.name}</span>
              <span className="text-xs text-muted-foreground">{form.fields} fields</span>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex-1">
                <Progress value={form.rate} className="h-2" />
              </div>
              <span className="text-xs font-bold text-foreground">{form.rate}%</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span>{form.starts.toLocaleString()} starts</span>
              <span>{form.completions.toLocaleString()} completions</span>
              <span>Avg {form.avgTime}</span>
              <span className="text-destructive">Drop: {form.dropField}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function MarketingCRO() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <MarketingShell breadcrumb="CRO & Optimization">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              CRO & Optimization
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Conversion funnel audits, landing page analysis, experiments & recommendations
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <Eye className="w-3 h-3" /> Heatmaps
            </Button>
            <Button size="sm" className="text-xs gap-1">
              <FlaskConical className="w-3 h-3" /> New Experiment
            </Button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard title="Overall Conv. Rate" value="2.21%" change="+0.18%" changeDir="up" icon={Target} subtitle="vs 2.03% last month" />
          <MetricCard title="Quote Completions" value="2,604" change="+12.4%" changeDir="up" icon={CheckCircle2} />
          <MetricCard title="Avg. Bounce Rate" value="42.3%" change="-3.1%" changeDir="up" icon={XCircle} subtitle="Lower is better" />
          <MetricCard title="Active Experiments" value="2" change="+1" changeDir="up" icon={FlaskConical} subtitle="3 completed this month" />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="experiments" className="text-xs">Experiments</TabsTrigger>
            <TabsTrigger value="pages" className="text-xs">Pages</TabsTrigger>
            <TabsTrigger value="recommendations" className="text-xs">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FunnelVisualization />
              <CTAPerformance />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormOptimization />
              <ExperimentsPanel />
            </div>
          </TabsContent>

          <TabsContent value="experiments" className="space-y-4 mt-4">
            <ExperimentsPanel />
          </TabsContent>

          <TabsContent value="pages" className="space-y-4 mt-4">
            <LandingPageAnalysis />
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4 mt-4">
            <RecommendationsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </MarketingShell>
  );
}
