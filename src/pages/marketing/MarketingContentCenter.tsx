import { useState } from "react";
import MarketingShell from "@/components/layout/MarketingShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  FileText, PenTool, Sparkles, RefreshCw, Calendar, Rocket, Clock,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, XCircle,
  Eye, ArrowRight, Plus, ChevronRight, Zap, Send, BookOpen,
  LayoutGrid, List, ArrowUpRight, ArrowDownRight, Loader2,
  FileEdit, Globe, Target, BarChart3, Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// --- Mock Data ---
const CONTENT_CALENDAR = [
  { id: 1, title: "Long-Distance Moving Costs 2026 Guide", type: "blog" as const, status: "published" as const, date: "2026-03-28", author: "AI + Editor", performance: 92, traffic: 4200, keywords: 18 },
  { id: 2, title: "Interstate Moving Checklist", type: "blog" as const, status: "scheduled" as const, date: "2026-04-07", author: "AI Draft", performance: null, traffic: null, keywords: 12 },
  { id: 3, title: "Cross-Country Moving Tips for Families", type: "blog" as const, status: "draft" as const, date: "2026-04-10", author: "AI Draft", performance: null, traffic: null, keywords: 15 },
  { id: 4, title: "Military PCS Moving Guide", type: "landing" as const, status: "published" as const, date: "2026-03-15", author: "Marketing", performance: 78, traffic: 1850, keywords: 8 },
  { id: 5, title: "Senior Moving Services", type: "landing" as const, status: "needs_refresh" as const, date: "2025-11-20", author: "Marketing", performance: 45, traffic: 620, keywords: 6 },
  { id: 6, title: "How to Pack for a Long-Distance Move", type: "blog" as const, status: "needs_refresh" as const, date: "2025-09-12", author: "Editor", performance: 38, traffic: 340, keywords: 9 },
  { id: 7, title: "Moving FAQ: Everything You Need to Know", type: "faq" as const, status: "published" as const, date: "2026-02-01", author: "AI + Editor", performance: 85, traffic: 3100, keywords: 22 },
  { id: 8, title: "Compare Moving Quotes: What to Look For", type: "blog" as const, status: "in_review" as const, date: "2026-04-05", author: "AI Draft", performance: null, traffic: null, keywords: 11 },
];

const REFRESH_RECOMMENDATIONS = [
  { id: 1, page: "/blog/long-distance-moving-costs", title: "Long-Distance Moving Costs", reason: "Content is 6 months old, traffic declining 22%", priority: "high" as const, currentTraffic: 4200, projectedLift: "+35%", decayRate: -22, lastUpdated: "2025-10-15", suggestedChanges: ["Update pricing data for 2026", "Add new cost calculator widget", "Refresh competitor comparison table"] },
  { id: 2, page: "/blog/packing-tips", title: "How to Pack for a Long-Distance Move", reason: "Dropped from position 4 to 11 for 'packing tips moving'", priority: "high" as const, currentTraffic: 340, projectedLift: "+60%", decayRate: -45, lastUpdated: "2025-09-12", suggestedChanges: ["Expand with video embed", "Add room-by-room packing checklist", "Include supply cost estimates"] },
  { id: 3, page: "/senior-moving", title: "Senior Moving Services", reason: "Thin content, only 450 words. Competitors average 2,200", priority: "medium" as const, currentTraffic: 620, projectedLift: "+40%", decayRate: -18, lastUpdated: "2025-11-20", suggestedChanges: ["Expand to 2,000+ words", "Add FAQ schema markup", "Include testimonials from senior moves"] },
  { id: 4, page: "/blog/moving-checklist", title: "Interstate Moving Checklist", reason: "Missing structured data and internal links", priority: "medium" as const, currentTraffic: 1200, projectedLift: "+20%", decayRate: -8, lastUpdated: "2026-01-10", suggestedChanges: ["Add HowTo schema", "Insert 5 internal links", "Add downloadable PDF checklist"] },
  { id: 5, page: "/pricing", title: "Moving Pricing Page", reason: "High bounce rate (62%), weak CTA section", priority: "low" as const, currentTraffic: 2800, projectedLift: "+15%", decayRate: -5, lastUpdated: "2026-02-28", suggestedChanges: ["Redesign pricing comparison table", "Add trust badges near CTA", "Include real customer savings examples"] },
];

const CONTENT_BRIEFS = [
  { id: 1, title: "Best Time to Move Cross-Country", targetKeyword: "best time to move cross country", searchVolume: 2400, difficulty: 35, wordCount: "2,000-2,500", status: "ready" as const, outline: ["Seasonal cost analysis", "Weather considerations", "Housing market timing", "School calendar alignment", "TruMove booking data insights"] },
  { id: 2, title: "How Much Does It Cost to Move Out of State", targetKeyword: "cost to move out of state", searchVolume: 6800, difficulty: 52, wordCount: "2,500-3,000", status: "ready" as const, outline: ["Average costs by distance", "Factors affecting price", "Hidden fees to watch for", "How to save money", "TruMove transparent pricing"] },
  { id: 3, title: "Moving Insurance: What's Covered?", targetKeyword: "moving insurance coverage", searchVolume: 1800, difficulty: 28, wordCount: "1,800-2,200", status: "generating" as const, outline: ["Types of moving insurance", "What's typically covered", "Filing a claim", "TruMove protection plans"] },
];

type ContentStatus = "published" | "scheduled" | "draft" | "needs_refresh" | "in_review";
type ContentType = "blog" | "landing" | "faq";

const statusConfig: Record<ContentStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  published: { label: "Published", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle2 },
  scheduled: { label: "Scheduled", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Clock },
  draft: { label: "Draft", color: "bg-muted text-muted-foreground border-border", icon: FileEdit },
  needs_refresh: { label: "Needs Refresh", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: RefreshCw },
  in_review: { label: "In Review", color: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: Eye },
};

const typeLabels: Record<ContentType, string> = { blog: "Blog Post", landing: "Landing Page", faq: "FAQ" };

export default function MarketingContentCenter() {
  const [writerPrompt, setWriterPrompt] = useState("");
  const [writerOutput, setWriterOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar");
  const [deployQueue, setDeployQueue] = useState<number[]>([]);

  const handleGenerate = async () => {
    if (!writerPrompt.trim()) return;
    setIsGenerating(true);
    setWriterOutput("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/marketing-ai-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              { role: "user", content: `Write marketing content for TruMove (long-distance moving broker). Request: ${writerPrompt}. Write in a professional, trust-building tone. Include SEO-friendly headings and a clear CTA.` },
            ],
          }),
        }
      );

      if (!response.ok) throw new Error("AI generation failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ") || line.trim() === "") continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") break;
            try {
              const parsed = JSON.parse(json);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                result += content;
                setWriterOutput(result);
              }
            } catch { /* partial chunk */ }
          }
        }
      }
      toast.success("Content generated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproveRefresh = (id: number) => {
    setDeployQueue(prev => [...prev, id]);
    toast.success("Content refresh approved", { description: "Added to deployment queue" });
  };

  const handleDeployAll = () => {
    toast.success(`Deploying ${deployQueue.length} content updates`, { description: "Changes will be live within 5 minutes" });
    setDeployQueue([]);
  };

  const kpis = [
    { label: "Total Content", value: CONTENT_CALENDAR.length.toString(), icon: FileText, sub: `${CONTENT_CALENDAR.filter(c => c.status === "published").length} published` },
    { label: "Organic Traffic", value: "14.3K", icon: TrendingUp, sub: "+18% vs last month", trend: "up" },
    { label: "Needs Refresh", value: REFRESH_RECOMMENDATIONS.length.toString(), icon: RefreshCw, sub: "Projected +32% avg lift", trend: "warn" },
    { label: "Deploy Queue", value: deployQueue.length.toString(), icon: Rocket, sub: deployQueue.length > 0 ? "Ready to push live" : "No pending updates" },
  ];

  return (
    <MarketingShell breadcrumbs={[{ label: "Content Center" }]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Content Center</h1>
            <p className="text-xs text-muted-foreground mt-0.5">AI writer, content calendar, refresh recommendations & deployment</p>
          </div>
          <div className="flex items-center gap-2">
            {deployQueue.length > 0 && (
              <Button size="sm" onClick={handleDeployAll} className="gap-1.5" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))" }}>
                <Rocket className="w-3.5 h-3.5" />
                Deploy {deployQueue.length} Updates
              </Button>
            )}
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> New Content
            </Button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map(kpi => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{kpi.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                      <p className={`text-[10px] mt-1 ${kpi.trend === "up" ? "text-green-600" : kpi.trend === "warn" ? "text-amber-600" : "text-muted-foreground"}`}>{kpi.sub}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="calendar" className="gap-1.5 text-xs"><Calendar className="w-3.5 h-3.5" />Calendar</TabsTrigger>
            <TabsTrigger value="writer" className="gap-1.5 text-xs"><PenTool className="w-3.5 h-3.5" />AI Writer</TabsTrigger>
            <TabsTrigger value="briefs" className="gap-1.5 text-xs"><BookOpen className="w-3.5 h-3.5" />Briefs</TabsTrigger>
            <TabsTrigger value="refresh" className="gap-1.5 text-xs"><RefreshCw className="w-3.5 h-3.5" />Refresh</TabsTrigger>
            <TabsTrigger value="deploy" className="gap-1.5 text-xs"><Rocket className="w-3.5 h-3.5" />Deploy</TabsTrigger>
          </TabsList>

          {/* Content Calendar */}
          <TabsContent value="calendar" className="mt-4 space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />Content Calendar</CardTitle>
                <CardDescription className="text-xs">All content assets across blog, landing pages, and FAQs</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px]">Title</TableHead>
                      <TableHead className="text-[10px]">Type</TableHead>
                      <TableHead className="text-[10px]">Status</TableHead>
                      <TableHead className="text-[10px]">Date</TableHead>
                      <TableHead className="text-[10px] text-right">Traffic</TableHead>
                      <TableHead className="text-[10px] text-right">Keywords</TableHead>
                      <TableHead className="text-[10px] text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {CONTENT_CALENDAR.map(item => {
                      const sc = statusConfig[item.status];
                      const StatusIcon = sc.icon;
                      return (
                        <TableRow key={item.id} className="group">
                          <TableCell className="font-medium text-xs max-w-[240px] truncate">{item.title}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[9px]">{typeLabels[item.type]}</Badge></TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-[9px] gap-1 ${sc.color}`}>
                              <StatusIcon className="w-3 h-3" />{sc.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{item.date}</TableCell>
                          <TableCell className="text-xs text-right">{item.traffic != null ? item.traffic.toLocaleString() : "—"}</TableCell>
                          <TableCell className="text-xs text-right">{item.keywords}</TableCell>
                          <TableCell className="text-right">
                            {item.performance != null ? (
                              <div className="flex items-center justify-end gap-2">
                                <Progress value={item.performance} className="w-12 h-1.5" />
                                <span className={`text-[10px] font-medium ${item.performance >= 80 ? "text-green-600" : item.performance >= 60 ? "text-amber-600" : "text-red-500"}`}>{item.performance}</span>
                              </div>
                            ) : <span className="text-[10px] text-muted-foreground">—</span>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Writer */}
          <TabsContent value="writer" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Input Panel */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />AI Content Writer</CardTitle>
                  <CardDescription className="text-xs">Generate blog posts, landing pages, metadata, FAQs, and more</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {["Blog Post", "Landing Page", "Meta Description", "FAQ Section", "Service Page", "Email Copy"].map(tag => (
                      <button key={tag} onClick={() => setWriterPrompt(`Write a ${tag.toLowerCase()} about `)} className="px-2.5 py-1 rounded-full text-[10px] font-medium border border-border bg-background hover:border-primary hover:text-primary transition-colors">
                        {tag}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={writerPrompt}
                    onChange={e => setWriterPrompt(e.target.value)}
                    placeholder="Describe what content you want to create... e.g., 'Write a 2000-word blog post about the best time to move cross-country, targeting families with children'"
                    className="min-h-[140px] text-xs"
                    disabled={isGenerating}
                  />
                  <Button onClick={handleGenerate} disabled={!writerPrompt.trim() || isGenerating} className="w-full gap-2" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))" }}>
                    {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4" />Generate Content</>}
                  </Button>
                </CardContent>
              </Card>

              {/* Output Panel */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />Generated Content</CardTitle>
                    {writerOutput && (
                      <div className="flex items-center gap-1.5">
                        <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => { navigator.clipboard.writeText(writerOutput); toast.success("Copied to clipboard"); }}>
                          Copy
                        </Button>
                        <Button size="sm" className="h-7 text-[10px] gap-1" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))" }}>
                          <Rocket className="w-3 h-3" /> Publish
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {writerOutput ? (
                    <div className="prose prose-sm max-w-none text-xs text-foreground bg-muted/30 rounded-lg p-4 max-h-[400px] overflow-y-auto whitespace-pre-wrap">
                      {writerOutput}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                      <PenTool className="w-8 h-8 mb-3 opacity-30" />
                      <p className="text-xs">Your generated content will appear here</p>
                      <p className="text-[10px] mt-1">Powered by Lovable AI</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Briefs */}
          <TabsContent value="briefs" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {CONTENT_BRIEFS.map(brief => (
                <Card key={brief.id} className="border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className={`text-[9px] ${brief.status === "ready" ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}`}>
                        {brief.status === "ready" ? "Ready" : "Generating..."}
                      </Badge>
                      <Badge variant="outline" className="text-[9px]">{brief.wordCount} words</Badge>
                    </div>
                    <CardTitle className="text-sm mt-2">{brief.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/30 rounded-lg p-2">
                        <p className="text-[9px] text-muted-foreground uppercase">Keyword</p>
                        <p className="text-[11px] font-medium text-foreground truncate">{brief.targetKeyword}</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-2">
                        <p className="text-[9px] text-muted-foreground uppercase">Volume</p>
                        <p className="text-[11px] font-medium text-foreground">{brief.searchVolume.toLocaleString()}/mo</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase mb-1.5">Outline</p>
                      <ul className="space-y-1">
                        {brief.outline.map((item, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[10px] text-foreground">
                            <ChevronRight className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <Button size="sm" className="flex-1 h-7 text-[10px] gap-1" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))" }}>
                        <Sparkles className="w-3 h-3" /> Generate Article
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-[10px]">Edit</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="border-dashed border-2 border-border">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Lightbulb className="w-6 h-6 text-muted-foreground mb-2 opacity-40" />
                <p className="text-xs text-muted-foreground">AI suggests 12 more content opportunities based on your keyword gaps</p>
                <Button size="sm" variant="outline" className="mt-3 gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5" /> Generate More Briefs
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Refresh Recommendations */}
          <TabsContent value="refresh" className="mt-4 space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><RefreshCw className="w-4 h-4 text-primary" />Content Refresh Recommendations</CardTitle>
                <CardDescription className="text-xs">AI-identified pages that need updates to recover or grow traffic</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {REFRESH_RECOMMENDATIONS.map(rec => (
                  <div key={rec.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={`text-[9px] ${rec.priority === "high" ? "bg-red-500/10 text-red-600 border-red-500/20" : rec.priority === "medium" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-muted text-muted-foreground"}`}>
                            {rec.priority} priority
                          </Badge>
                          <Badge variant="outline" className="text-[9px] bg-green-500/10 text-green-600 border-green-500/20">
                            Est. {rec.projectedLift} lift
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground">{rec.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{rec.page}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-foreground">{rec.currentTraffic.toLocaleString()}</p>
                        <p className="text-[10px] text-red-500 flex items-center justify-end gap-0.5">
                          <ArrowDownRight className="w-3 h-3" />{rec.decayRate}%
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground bg-muted/30 rounded-md p-2.5">
                      <AlertTriangle className="w-3 h-3 inline mr-1 text-amber-500" />{rec.reason}
                    </p>
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase mb-1">Suggested Changes</p>
                      <ul className="space-y-0.5">
                        {rec.suggestedChanges.map((ch, i) => (
                          <li key={i} className="text-[10px] text-foreground flex items-start gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-primary mt-0.5 shrink-0" />{ch}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Button size="sm" className="h-7 text-[10px] gap-1" onClick={() => handleApproveRefresh(rec.id)} disabled={deployQueue.includes(rec.id)} style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))" }}>
                        {deployQueue.includes(rec.id) ? <><CheckCircle2 className="w-3 h-3" />Approved</> : <><Sparkles className="w-3 h-3" />AI Refresh &amp; Approve</>}
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-[10px]">Preview Changes</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-[10px] text-muted-foreground">Dismiss</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deploy */}
          <TabsContent value="deploy" className="mt-4 space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Rocket className="w-4 h-4 text-primary" />Deployment Queue</CardTitle>
                <CardDescription className="text-xs">Review, approve, and push content changes live</CardDescription>
              </CardHeader>
              <CardContent>
                {deployQueue.length > 0 ? (
                  <div className="space-y-3">
                    {deployQueue.map(id => {
                      const rec = REFRESH_RECOMMENDATIONS.find(r => r.id === id);
                      if (!rec) return null;
                      return (
                        <div key={id} className="flex items-center justify-between border border-border rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-foreground">{rec.title}</p>
                              <p className="text-[10px] text-muted-foreground">{rec.suggestedChanges.length} changes • Est. {rec.projectedLift} lift</p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="h-7 text-[10px] text-red-500" onClick={() => setDeployQueue(prev => prev.filter(i => i !== id))}>
                            Remove
                          </Button>
                        </div>
                      );
                    })}
                    <Button onClick={handleDeployAll} className="w-full gap-2 mt-2" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))" }}>
                      <Rocket className="w-4 h-4" />Deploy All ({deployQueue.length}) Updates to Website
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Rocket className="w-8 h-8 mb-3 opacity-30" />
                    <p className="text-xs">No pending deployments</p>
                    <p className="text-[10px] mt-1">Approve content refreshes or new content to add to the queue</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Deployments */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" />Recent Deployments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { title: "Long-Distance Moving Costs 2026 Guide", date: "Mar 28, 2026", status: "live", changes: 3 },
                    { title: "Moving FAQ: Everything You Need to Know", date: "Feb 1, 2026", status: "live", changes: 5 },
                    { title: "Military PCS Moving Guide", date: "Mar 15, 2026", status: "live", changes: 2 },
                  ].map((dep, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <div>
                          <p className="text-xs font-medium text-foreground">{dep.title}</p>
                          <p className="text-[10px] text-muted-foreground">{dep.changes} changes • {dep.date}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] text-muted-foreground">Rollback</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MarketingShell>
  );
}
