import { useState } from "react";
import MarketingShell from "@/components/layout/MarketingShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Rocket, CheckCircle2, XCircle, Clock, Eye, RotateCcw,
  ChevronRight, AlertTriangle, Calendar, Play, Pause, Undo2,
  FileCode, Globe, Search, Megaphone, PenTool, Shield, ArrowUpRight,
  Loader2, ExternalLink, History, Filter
} from "lucide-react";
import { toast } from "sonner";

type ChangeStatus = "pending" | "approved" | "rejected" | "scheduled" | "deployed" | "rolled_back";
type ChangeCategory = "seo" | "ads" | "content" | "cro" | "technical";

interface Change {
  id: string;
  title: string;
  description: string;
  category: ChangeCategory;
  status: ChangeStatus;
  source: string;
  impact: string;
  risk: "low" | "medium" | "high";
  createdAt: string;
  scheduledFor?: string;
  deployedAt?: string;
  rolledBackAt?: string;
  preview?: string;
  changes: string[];
}

const MOCK_CHANGES: Change[] = [
  {
    id: "ch-001", title: "Update homepage meta title & description", description: "AI-recommended SEO update to improve CTR from 2.1% to estimated 3.8%",
    category: "seo", status: "pending", source: "AI Recommendation", impact: "+82% CTR improvement", risk: "low",
    createdAt: "2 hours ago", preview: "Title: \"Licensed Long-Distance Movers | Free Instant Quote | TruMove\"",
    changes: ["Meta title updated (58 chars)", "Meta description updated (148 chars)", "OG tags synchronized"],
  },
  {
    id: "ch-002", title: "Pause underperforming Google Ads campaign", description: "Campaign 'Generic Movers' has $42 CPA vs $18 target. Recommended pause and budget reallocation.",
    category: "ads", status: "approved", source: "AI Recommendation", impact: "Save $1,200/mo", risk: "medium",
    createdAt: "5 hours ago", changes: ["Pause campaign ID: gc-4821", "Reallocate $800 to 'Long Distance' campaign", "Update bid strategy"],
  },
  {
    id: "ch-003", title: "Deploy refreshed 'Moving Checklist' blog post", description: "Content refresh with updated stats, new FAQ schema, and internal links",
    category: "content", status: "scheduled", source: "Content Center", impact: "+340 monthly visits", risk: "low",
    createdAt: "1 day ago", scheduledFor: "Tomorrow 6:00 AM",
    changes: ["Updated 12 statistics", "Added FAQ schema (8 questions)", "Added 4 internal links", "Updated featured image"],
  },
  {
    id: "ch-004", title: "A/B test: New CTA button on quote page", description: "Test 'Get My Free Quote' vs 'See My Price Now' with orange gradient button",
    category: "cro", status: "deployed", source: "CRO Dashboard", impact: "+12% conversion lift", risk: "low",
    createdAt: "3 days ago", deployedAt: "2 days ago",
    changes: ["CTA text variant created", "Button style variant created", "Traffic split: 50/50", "Goal: form_submit"],
  },
  {
    id: "ch-005", title: "Core Web Vitals fix: lazy-load hero images", description: "LCP improvement from 3.2s to 1.8s by implementing lazy loading and WebP conversion",
    category: "technical", status: "deployed", source: "Technical Audit", impact: "LCP -44%", risk: "medium",
    createdAt: "5 days ago", deployedAt: "4 days ago",
    changes: ["Added loading='lazy' to 8 images", "Converted PNG to WebP", "Added width/height attributes", "Preconnect hints added"],
  },
  {
    id: "ch-006", title: "Add FAQ schema to 15 service pages", description: "Structured data implementation for rich snippets across service pages",
    category: "seo", status: "pending", source: "SEO Manager", impact: "+25% SERP visibility", risk: "low",
    createdAt: "6 hours ago",
    changes: ["FAQ JSON-LD generated for 15 pages", "Validated with Schema.org validator", "Average 5 questions per page"],
  },
  {
    id: "ch-007", title: "Meta Ads creative refresh — Video testimonial", description: "New video creative using customer testimonial for retargeting audience",
    category: "ads", status: "rejected", source: "AI Recommendation", impact: "+18% engagement", risk: "medium",
    createdAt: "2 days ago",
    changes: ["New 30s video creative", "Updated ad copy", "Retargeting audience update"],
  },
  {
    id: "ch-008", title: "Rollback: Header navigation restructure", description: "Navigation change caused 8% bounce rate increase — rolled back to previous version",
    category: "cro", status: "rolled_back", source: "CRO Dashboard", impact: "Bounce +8%", risk: "high",
    createdAt: "1 week ago", deployedAt: "6 days ago", rolledBackAt: "5 days ago",
    changes: ["Nav structure reverted", "Dropdown menus restored", "Mobile menu restored"],
  },
];

const DEPLOYMENT_LOG = [
  { id: "dl-1", action: "Deployed", item: "Core Web Vitals fix", user: "System (Auto)", timestamp: "Apr 2, 2026 — 2:15 PM", status: "success" as const },
  { id: "dl-2", action: "Rolled Back", item: "Header navigation restructure", user: "Sarah M.", timestamp: "Apr 1, 2026 — 9:30 AM", status: "rollback" as const },
  { id: "dl-3", action: "Deployed", item: "A/B test: New CTA button", user: "System (Auto)", timestamp: "Mar 31, 2026 — 6:00 AM", status: "success" as const },
  { id: "dl-4", action: "Deployed", item: "Blog post: Moving Costs 2026", user: "Alex R.", timestamp: "Mar 29, 2026 — 10:00 AM", status: "success" as const },
  { id: "dl-5", action: "Rejected", item: "Meta Ads creative refresh", user: "Sarah M.", timestamp: "Mar 28, 2026 — 4:45 PM", status: "rejected" as const },
  { id: "dl-6", action: "Deployed", item: "Schema markup on 10 pages", user: "System (Auto)", timestamp: "Mar 27, 2026 — 6:00 AM", status: "success" as const },
  { id: "dl-7", action: "Scheduled", item: "Moving Checklist refresh", user: "Alex R.", timestamp: "Mar 26, 2026 — 11:20 AM", status: "scheduled" as const },
];

const statusConfig: Record<ChangeStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending: { label: "Pending Review", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
  approved: { label: "Approved", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: XCircle },
  scheduled: { label: "Scheduled", color: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: Calendar },
  deployed: { label: "Deployed", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: Rocket },
  rolled_back: { label: "Rolled Back", color: "bg-orange-500/10 text-orange-600 border-orange-500/20", icon: RotateCcw },
};

const categoryConfig: Record<ChangeCategory, { label: string; icon: typeof Globe; color: string }> = {
  seo: { label: "SEO", icon: Search, color: "text-blue-600" },
  ads: { label: "Ads", icon: Megaphone, color: "text-purple-600" },
  content: { label: "Content", icon: PenTool, color: "text-emerald-600" },
  cro: { label: "CRO", icon: ArrowUpRight, color: "text-amber-600" },
  technical: { label: "Technical", icon: FileCode, color: "text-cyan-600" },
};

const riskColors = { low: "text-green-600 bg-green-500/10", medium: "text-amber-600 bg-amber-500/10", high: "text-red-600 bg-red-500/10" };

export default function MarketingImplementation() {
  const [tab, setTab] = useState("queue");
  const [selectedChange, setSelectedChange] = useState<Change | null>(null);
  const [catFilter, setCatFilter] = useState<string>("all");
  const [changes, setChanges] = useState(MOCK_CHANGES);

  const pendingCount = changes.filter(c => c.status === "pending").length;
  const approvedCount = changes.filter(c => c.status === "approved").length;
  const deployedCount = changes.filter(c => c.status === "deployed").length;
  const scheduledCount = changes.filter(c => c.status === "scheduled").length;

  const queueItems = changes.filter(c => ["pending", "approved", "scheduled"].includes(c.status));
  const historyItems = changes.filter(c => ["deployed", "rejected", "rolled_back"].includes(c.status));

  const filteredQueue = catFilter === "all" ? queueItems : queueItems.filter(c => c.category === catFilter);
  const filteredHistory = catFilter === "all" ? historyItems : historyItems.filter(c => c.category === catFilter);

  const handleAction = (id: string, action: "approve" | "reject" | "schedule" | "deploy" | "rollback") => {
    const labels: Record<string, { status: ChangeStatus; msg: string }> = {
      approve: { status: "approved", msg: "Change approved" },
      reject: { status: "rejected", msg: "Change rejected" },
      schedule: { status: "scheduled", msg: "Change scheduled" },
      deploy: { status: "deployed", msg: "Change deployed" },
      rollback: { status: "rolled_back", msg: "Change rolled back" },
    };
    const { status, msg } = labels[action];
    setChanges(prev => prev.map(c => c.id === id ? {
      ...c, status,
      ...(status === "deployed" ? { deployedAt: "Just now" } : {}),
      ...(status === "rolled_back" ? { rolledBackAt: "Just now" } : {}),
      ...(status === "scheduled" ? { scheduledFor: "Tomorrow 6:00 AM" } : {}),
    } : c));
    if (selectedChange?.id === id) setSelectedChange(null);
    toast.success(msg);
  };

  const renderChangeCard = (change: Change) => {
    const sc = statusConfig[change.status];
    const cc = categoryConfig[change.category];
    const StatusIcon = sc.icon;
    const CatIcon = cc.icon;
    const isSelected = selectedChange?.id === change.id;

    return (
      <Card
        key={change.id}
        className={`border-border cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary/40 border-primary/30" : ""}`}
        onClick={() => setSelectedChange(isSelected ? null : change)}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-muted`}>
                <CatIcon className={`w-3.5 h-3.5 ${cc.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight truncate">{change.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant="outline" className={`text-[8px] gap-0.5 ${sc.color}`}><StatusIcon className="w-2.5 h-2.5" />{sc.label}</Badge>
                  <Badge variant="outline" className={`text-[8px] ${riskColors[change.risk]}`}>{change.risk} risk</Badge>
                </div>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isSelected ? "rotate-90" : ""}`} />
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">{change.description}</p>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{change.createdAt}</span>
            <span className="font-medium text-primary">{change.impact}</span>
          </div>
          {change.scheduledFor && (
            <div className="flex items-center gap-1 text-[10px] text-purple-600 bg-purple-500/5 rounded px-2 py-1">
              <Calendar className="w-3 h-3" />Scheduled: {change.scheduledFor}
            </div>
          )}

          {/* Action buttons for pending/approved */}
          {change.status === "pending" && (
            <div className="flex items-center gap-1.5 pt-1" onClick={e => e.stopPropagation()}>
              <Button size="sm" className="flex-1 h-7 text-[10px] gap-1" onClick={() => handleAction(change.id, "approve")}
                style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))" }}>
                <CheckCircle2 className="w-3 h-3" />Approve
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => handleAction(change.id, "schedule")}>
                <Calendar className="w-3 h-3" />Schedule
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-[10px] gap-1 text-red-500 hover:text-red-600" onClick={() => handleAction(change.id, "reject")}>
                <XCircle className="w-3 h-3" />Reject
              </Button>
            </div>
          )}
          {change.status === "approved" && (
            <div className="flex items-center gap-1.5 pt-1" onClick={e => e.stopPropagation()}>
              <Button size="sm" className="flex-1 h-7 text-[10px] gap-1" onClick={() => handleAction(change.id, "deploy")}
                style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))" }}>
                <Rocket className="w-3 h-3" />Deploy Now
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => handleAction(change.id, "schedule")}>
                <Calendar className="w-3 h-3" />Schedule
              </Button>
            </div>
          )}
          {change.status === "scheduled" && (
            <div className="flex items-center gap-1.5 pt-1" onClick={e => e.stopPropagation()}>
              <Button size="sm" className="flex-1 h-7 text-[10px] gap-1" onClick={() => handleAction(change.id, "deploy")}
                style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))" }}>
                <Play className="w-3 h-3" />Deploy Now
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-[10px] gap-1 text-muted-foreground" onClick={() => handleAction(change.id, "reject")}>
                <Pause className="w-3 h-3" />Cancel
              </Button>
            </div>
          )}
          {change.status === "deployed" && (
            <div className="flex items-center gap-1.5 pt-1" onClick={e => e.stopPropagation()}>
              <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 text-orange-600 border-orange-500/30 hover:bg-orange-500/5" onClick={() => handleAction(change.id, "rollback")}>
                <RotateCcw className="w-3 h-3" />Rollback
              </Button>
              <span className="text-[9px] text-muted-foreground ml-1">Deployed {change.deployedAt}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <MarketingShell breadcrumbs={[{ label: "Implementation Center" }]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Implementation Center</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Review, approve, deploy, and track all marketing changes in one place</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Pending Review", value: pendingCount, icon: Clock, color: "text-amber-600", sub: "Awaiting approval" },
            { label: "Approved", value: approvedCount, icon: CheckCircle2, color: "text-blue-600", sub: "Ready to deploy" },
            { label: "Scheduled", value: scheduledCount, icon: Calendar, color: "text-purple-600", sub: "Queued for deployment" },
            { label: "Deployed", value: deployedCount, icon: Rocket, color: "text-green-600", sub: "Live changes" },
          ].map(kpi => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{kpi.label}</p>
                      <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{kpi.sub}</p>
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

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1" />
          {[{ key: "all", label: "All" }, ...Object.entries(categoryConfig).map(([k, v]) => ({ key: k, label: v.label }))].map(f => (
            <Button key={f.key} size="sm" variant={catFilter === f.key ? "default" : "outline"}
              className="h-6 text-[10px] px-2.5" onClick={() => setCatFilter(f.key)}>
              {f.label}
            </Button>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="queue" className="text-[11px] gap-1"><Clock className="w-3 h-3" />Change Queue ({filteredQueue.length})</TabsTrigger>
            <TabsTrigger value="history" className="text-[11px] gap-1"><History className="w-3 h-3" />Deployment History ({filteredHistory.length})</TabsTrigger>
            <TabsTrigger value="log" className="text-[11px] gap-1"><FileCode className="w-3 h-3" />Activity Log</TabsTrigger>
          </TabsList>

          {/* Change Queue */}
          <TabsContent value="queue">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Queue List */}
              <div className={`space-y-3 ${selectedChange ? "lg:col-span-2" : "lg:col-span-3"}`}>
                {filteredQueue.length === 0 ? (
                  <Card className="border-dashed border-2"><CardContent className="py-12 text-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium text-foreground">Queue is clear</p>
                    <p className="text-[11px] text-muted-foreground">No pending changes to review</p>
                  </CardContent></Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredQueue.map(renderChangeCard)}
                  </div>
                )}
              </div>

              {/* Preview Panel */}
              {selectedChange && (
                <div className="lg:col-span-1">
                  <Card className="border-border sticky top-4">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Change Preview</CardTitle>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setSelectedChange(null)}>
                          <XCircle className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{selectedChange.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{selectedChange.description}</p>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Details</p>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div><span className="text-muted-foreground">Source:</span> <span className="font-medium text-foreground">{selectedChange.source}</span></div>
                          <div><span className="text-muted-foreground">Category:</span> <span className="font-medium text-foreground">{categoryConfig[selectedChange.category].label}</span></div>
                          <div><span className="text-muted-foreground">Risk:</span> <Badge variant="outline" className={`text-[8px] ${riskColors[selectedChange.risk]}`}>{selectedChange.risk}</Badge></div>
                          <div><span className="text-muted-foreground">Impact:</span> <span className="font-medium text-primary">{selectedChange.impact}</span></div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Changes ({selectedChange.changes.length})</p>
                        <div className="space-y-1">
                          {selectedChange.changes.map((ch, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-[10px] text-foreground bg-muted/30 rounded px-2 py-1.5">
                              <ChevronRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />{ch}
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedChange.preview && (
                        <div className="space-y-1.5">
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Preview</p>
                          <div className="bg-muted/50 rounded-lg p-3 text-[10px] text-foreground font-mono border border-border">
                            {selectedChange.preview}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Deployment History */}
          <TabsContent value="history">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredHistory.length === 0 ? (
                <Card className="border-dashed border-2 col-span-full"><CardContent className="py-12 text-center">
                  <History className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-foreground">No history yet</p>
                </CardContent></Card>
              ) : filteredHistory.map(renderChangeCard)}
            </div>
          </TabsContent>

          {/* Activity Log */}
          <TabsContent value="log">
            <Card className="border-border">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {DEPLOYMENT_LOG.map(log => {
                    const logColors = {
                      success: "bg-green-500",
                      rollback: "bg-orange-500",
                      rejected: "bg-red-500",
                      scheduled: "bg-purple-500",
                    };
                    return (
                      <div key={log.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${logColors[log.status]}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-foreground">{log.action}</span>
                            <span className="text-[11px] text-muted-foreground truncate">— {log.item}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                            <span>{log.user}</span>
                            <span>•</span>
                            <span>{log.timestamp}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="h-6 text-[9px] text-muted-foreground gap-1">
                          <Eye className="w-3 h-3" />Details
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MarketingShell>
  );
}
