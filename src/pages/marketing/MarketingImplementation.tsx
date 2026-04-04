import { useState } from "react";
import MarketingShell from "@/components/layout/MarketingShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Rocket, CheckCircle2, XCircle, Clock, RotateCcw,
  Eye, ArrowRight, AlertTriangle, Code, FileText, Search, Target
} from "lucide-react";

type ChangeStatus = "pending" | "approved" | "scheduled" | "deployed" | "rejected" | "rolled_back";
type Category = "seo" | "ads" | "content" | "cro" | "technical";

interface Change {
  id: string;
  title: string;
  description: string;
  category: Category;
  status: ChangeStatus;
  source: string;
  priority: "high" | "medium" | "low";
  createdAt: string;
  deployedAt?: string;
  scheduledFor?: string;
  author: string;
  diff?: string;
}

const INITIAL_CHANGES: Change[] = [
  {
    id: "ch-001",
    title: "Update homepage meta title & description",
    description: "Optimized meta tags based on keyword research — targets 'long distance movers' cluster.",
    category: "seo",
    status: "pending",
    source: "Recommendations Engine",
    priority: "high",
    createdAt: "2026-04-03T14:30:00Z",
    author: "AI Engine",
    diff: '<title>TruMove — #1 Long Distance Movers | Free Instant Quote</title>\n<meta name="description" content="Trusted long distance moving company..." />',
  },
  {
    id: "ch-002",
    title: "Swap hero CTA copy on /get-quote",
    description: "A/B test winner — 'Get My Free Quote' outperformed 'Request Estimate' by 18%.",
    category: "cro",
    status: "pending",
    source: "CRO Dashboard",
    priority: "high",
    createdAt: "2026-04-03T10:15:00Z",
    author: "AI Engine",
    diff: '- <Button>Request Estimate</Button>\n+ <Button>Get My Free Quote</Button>',
  },
  {
    id: "ch-003",
    title: "Add FAQ schema to /services page",
    description: "Structured data for 8 FAQ items to improve SERP visibility.",
    category: "seo",
    status: "approved",
    source: "SEO Audit",
    priority: "medium",
    createdAt: "2026-04-02T09:00:00Z",
    author: "Marketing Team",
    diff: '<script type="application/ld+json">\n{"@type":"FAQPage","mainEntity":[...]}\n</script>',
  },
  {
    id: "ch-004",
    title: "Pause underperforming Google Ads group",
    description: "Ad group 'local-movers-generic' has $42 CPA vs $18 target. Recommend pause.",
    category: "ads",
    status: "scheduled",
    scheduledFor: "2026-04-05T08:00:00Z",
    source: "PPC Dashboard",
    priority: "high",
    createdAt: "2026-04-01T16:00:00Z",
    author: "AI Engine",
  },
  {
    id: "ch-005",
    title: "Publish refreshed 'Moving Checklist' blog post",
    description: "Updated content with 2026 data, new internal links, and refreshed images.",
    category: "content",
    status: "deployed",
    deployedAt: "2026-04-01T12:00:00Z",
    source: "Content Center",
    priority: "medium",
    createdAt: "2026-03-29T11:00:00Z",
    author: "Content AI",
  },
  {
    id: "ch-006",
    title: "Redirect /old-services to /services",
    description: "301 redirect to consolidate link equity from deprecated URL.",
    category: "technical",
    status: "deployed",
    deployedAt: "2026-03-28T09:00:00Z",
    source: "SEO Audit",
    priority: "low",
    createdAt: "2026-03-27T14:00:00Z",
    author: "Marketing Team",
  },
  {
    id: "ch-007",
    title: "Update Google Ads bid strategy to tCPA",
    description: "Switch from manual CPC to target CPA bidding at $22.",
    category: "ads",
    status: "rolled_back",
    deployedAt: "2026-03-25T10:00:00Z",
    source: "PPC Dashboard",
    priority: "high",
    createdAt: "2026-03-24T08:00:00Z",
    author: "AI Engine",
  },
];

const STATUS_CONFIG: Record<ChangeStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending: { label: "Pending Review", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
  approved: { label: "Approved", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: CheckCircle2 },
  scheduled: { label: "Scheduled", color: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: Clock },
  deployed: { label: "Deployed", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: Rocket },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  rolled_back: { label: "Rolled Back", color: "bg-orange-500/10 text-orange-600 border-orange-500/20", icon: RotateCcw },
};

const CATEGORY_CONFIG: Record<Category, { label: string; icon: typeof Search }> = {
  seo: { label: "SEO", icon: Search },
  ads: { label: "Ads", icon: Target },
  content: { label: "Content", icon: FileText },
  cro: { label: "CRO", icon: Target },
  technical: { label: "Technical", icon: Code },
};

export default function MarketingImplementation() {
  const [changes, setChanges] = useState<Change[]>(INITIAL_CHANGES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all");

  const handleAction = (id: string, action: "approve" | "reject" | "schedule" | "deploy" | "rollback") => {
    setChanges((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        switch (action) {
          case "approve":
            toast.success(`Approved: ${c.title}`);
            return { ...c, status: "approved" as ChangeStatus };
          case "reject":
            toast.error(`Rejected: ${c.title}`);
            return { ...c, status: "rejected" as ChangeStatus };
          case "schedule":
            toast.info(`Scheduled: ${c.title} for tomorrow 8 AM`);
            return { ...c, status: "scheduled" as ChangeStatus, scheduledFor: new Date(Date.now() + 86400000).toISOString() };
          case "deploy":
            toast.success(`Deployed: ${c.title}`);
            return { ...c, status: "deployed" as ChangeStatus, deployedAt: new Date().toISOString() };
          case "rollback":
            toast.warning(`Rolled back: ${c.title}`);
            return { ...c, status: "rolled_back" as ChangeStatus };
          default:
            return c;
        }
      })
    );
  };

  const queue = changes.filter((c) => ["pending", "approved", "scheduled"].includes(c.status));
  const history = changes.filter((c) => ["deployed", "rejected", "rolled_back"].includes(c.status));
  const selected = changes.find((c) => c.id === selectedId);

  const filteredQueue = filterCategory === "all" ? queue : queue.filter((c) => c.category === filterCategory);
  const filteredHistory = filterCategory === "all" ? history : history.filter((c) => c.category === filterCategory);

  const kpis = [
    { label: "Pending", value: changes.filter((c) => c.status === "pending").length, color: "text-amber-600" },
    { label: "Approved", value: changes.filter((c) => c.status === "approved").length, color: "text-blue-600" },
    { label: "Deployed", value: changes.filter((c) => c.status === "deployed").length, color: "text-emerald-600" },
    { label: "Rolled Back", value: changes.filter((c) => c.status === "rolled_back").length, color: "text-orange-600" },
  ];

  const renderChangeRow = (change: Change) => {
    const statusCfg = STATUS_CONFIG[change.status];
    const catCfg = CATEGORY_CONFIG[change.category];
    const StatusIcon = statusCfg.icon;
    const CatIcon = catCfg.icon;

    return (
      <div
        key={change.id}
        onClick={() => setSelectedId(change.id)}
        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
          selectedId === change.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 hover:bg-muted/30"
        }`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusCfg.color}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusCfg.label}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              <CatIcon className="w-3 h-3 mr-1" />
              {catCfg.label}
            </Badge>
            {change.priority === "high" && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-destructive/10 text-destructive border-destructive/20">
                <AlertTriangle className="w-3 h-3 mr-1" />High
              </Badge>
            )}
          </div>
          <p className="text-sm font-medium text-foreground truncate">{change.title}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{change.description}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {change.status === "pending" && (
            <>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleAction(change.id, "approve"); }}>
                <CheckCircle2 className="w-3 h-3 mr-1" />Approve
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleAction(change.id, "reject"); }}>
                <XCircle className="w-3 h-3 mr-1" />Reject
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleAction(change.id, "schedule"); }}>
                <Clock className="w-3 h-3 mr-1" />Schedule
              </Button>
            </>
          )}
          {change.status === "approved" && (
            <Button size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleAction(change.id, "deploy"); }}>
              <Rocket className="w-3 h-3 mr-1" />Deploy
            </Button>
          )}
          {change.status === "scheduled" && (
            <Button size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleAction(change.id, "deploy"); }}>
              <Rocket className="w-3 h-3 mr-1" />Deploy Now
            </Button>
          )}
          {change.status === "deployed" && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleAction(change.id, "rollback"); }}>
              <RotateCcw className="w-3 h-3 mr-1" />Rollback
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); setSelectedId(change.id); }}>
            <Eye className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <MarketingShell breadcrumbs={[{ label: "Implementation Center" }]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Implementation Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Review, approve, deploy, and rollback marketing changes across all channels.</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="border-border">
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{k.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "seo", "ads", "content", "cro", "technical"] as const).map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={filterCategory === cat ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() => setFilterCategory(cat)}
            >
              {cat === "all" ? "All" : CATEGORY_CONFIG[cat].label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Queue / History */}
          <div className="xl:col-span-2 space-y-4">
            <Tabs defaultValue="queue">
              <TabsList>
                <TabsTrigger value="queue">Queue ({filteredQueue.length})</TabsTrigger>
                <TabsTrigger value="history">History ({filteredHistory.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="queue" className="space-y-2 mt-3">
                {filteredQueue.length === 0 ? (
                  <Card className="border-border"><CardContent className="p-8 text-center text-muted-foreground text-sm">No changes in queue.</CardContent></Card>
                ) : filteredQueue.map(renderChangeRow)}
              </TabsContent>
              <TabsContent value="history" className="space-y-2 mt-3">
                {filteredHistory.length === 0 ? (
                  <Card className="border-border"><CardContent className="p-8 text-center text-muted-foreground text-sm">No deployment history.</CardContent></Card>
                ) : filteredHistory.map(renderChangeRow)}
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div>
            <Card className="border-border sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Preview Panel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selected ? (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">Title</p>
                      <p className="text-sm font-medium">{selected.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Description</p>
                      <p className="text-sm">{selected.description}</p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Source</p>
                        <p className="text-sm">{selected.source}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Author</p>
                        <p className="text-sm">{selected.author}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-sm">{new Date(selected.createdAt).toLocaleDateString()}</p>
                    </div>
                    {selected.scheduledFor && (
                      <div>
                        <p className="text-xs text-muted-foreground">Scheduled For</p>
                        <p className="text-sm">{new Date(selected.scheduledFor).toLocaleString()}</p>
                      </div>
                    )}
                    {selected.deployedAt && (
                      <div>
                        <p className="text-xs text-muted-foreground">Deployed At</p>
                        <p className="text-sm">{new Date(selected.deployedAt).toLocaleString()}</p>
                      </div>
                    )}
                    {selected.diff && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Code Changes</p>
                        <pre className="text-[11px] bg-muted/50 border border-border rounded-lg p-3 overflow-x-auto whitespace-pre-wrap font-mono">
                          {selected.diff}
                        </pre>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2 flex-wrap">
                      {selected.status === "pending" && (
                        <>
                          <Button size="sm" className="h-8 text-xs" onClick={() => handleAction(selected.id, "approve")}>
                            <CheckCircle2 className="w-3 h-3 mr-1" />Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleAction(selected.id, "reject")}>
                            <XCircle className="w-3 h-3 mr-1" />Reject
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleAction(selected.id, "schedule")}>
                            <Clock className="w-3 h-3 mr-1" />Schedule
                          </Button>
                        </>
                      )}
                      {selected.status === "approved" && (
                        <Button size="sm" className="h-8 text-xs" onClick={() => handleAction(selected.id, "deploy")}>
                          <Rocket className="w-3 h-3 mr-1" />Deploy
                        </Button>
                      )}
                      {selected.status === "scheduled" && (
                        <Button size="sm" className="h-8 text-xs" onClick={() => handleAction(selected.id, "deploy")}>
                          <Rocket className="w-3 h-3 mr-1" />Deploy Now
                        </Button>
                      )}
                      {selected.status === "deployed" && (
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleAction(selected.id, "rollback")}>
                          <RotateCcw className="w-3 h-3 mr-1" />Rollback
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <ArrowRight className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Select a change to preview details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
