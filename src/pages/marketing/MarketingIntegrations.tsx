import { useState } from "react";
import MarketingShell from "@/components/layout/MarketingShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Plug, CheckCircle2, XCircle, AlertTriangle, RefreshCw,
  ExternalLink, Settings, Clock, Zap, Shield, Activity,
  Globe, BarChart3, Search, Megaphone, Tag, MapPin,
  Video, Monitor, Phone, Database, MousePointerClick, Mail,
  TrendingUp, Users, Eye, ArrowUpRight, Loader2
} from "lucide-react";
import { toast } from "sonner";

type ConnectionStatus = "connected" | "disconnected" | "error" | "syncing";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: typeof Globe;
  category: "analytics" | "ads" | "seo" | "tracking" | "cms" | "crm" | "other";
  status: ConnectionStatus;
  lastSync?: string;
  syncHealth?: number;
  dataPoints?: string;
  permissions?: string[];
  setupSteps?: string[];
}

const INTEGRATIONS: Integration[] = [
  {
    id: "google-analytics",
    name: "Google Analytics 4",
    description: "Website traffic, user behavior, conversion tracking, and audience insights",
    icon: BarChart3,
    category: "analytics",
    status: "connected",
    lastSync: "2 min ago",
    syncHealth: 98,
    dataPoints: "142K events/day",
    permissions: ["Read analytics data", "Read audience reports", "Read conversion data"],
  },
  {
    id: "google-search-console",
    name: "Google Search Console",
    description: "Search performance, indexing status, keyword rankings, and crawl data",
    icon: Search,
    category: "seo",
    status: "connected",
    lastSync: "15 min ago",
    syncHealth: 95,
    dataPoints: "1,847 queries tracked",
    permissions: ["Read search analytics", "Read URL inspection", "Read sitemaps"],
  },
  {
    id: "google-ads",
    name: "Google Ads",
    description: "Campaign performance, spend tracking, keyword bidding, and conversion imports",
    icon: Megaphone,
    category: "ads",
    status: "disconnected",
    setupSteps: ["Sign in to Google Ads", "Select account", "Grant read/write access", "Choose campaigns to sync"],
  },
  {
    id: "meta-ads",
    name: "Meta Ads (Facebook & Instagram)",
    description: "Ad campaigns, audience targeting, creative performance, and pixel data",
    icon: Users,
    category: "ads",
    status: "disconnected",
    setupSteps: ["Connect Facebook Business account", "Select ad accounts", "Grant campaign access", "Enable pixel sync"],
  },
  {
    id: "google-tag-manager",
    name: "Google Tag Manager",
    description: "Tag deployment, trigger management, pixel installation, and conversion tracking",
    icon: Tag,
    category: "tracking",
    status: "connected",
    lastSync: "1 hr ago",
    syncHealth: 100,
    dataPoints: "23 active tags",
    permissions: ["Read containers", "Manage tags", "Publish changes"],
  },
  {
    id: "google-business-profile",
    name: "Google Business Profile",
    description: "Local SEO, reviews, business listings, and location performance",
    icon: MapPin,
    category: "seo",
    status: "error",
    lastSync: "3 days ago",
    syncHealth: 12,
    dataPoints: "Sync failed",
    permissions: ["Read reviews", "Read insights", "Manage posts"],
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Video performance, channel analytics, and audience engagement metrics",
    icon: Video,
    category: "analytics",
    status: "disconnected",
    setupSteps: ["Connect YouTube channel", "Grant analytics access", "Select channels to track"],
  },
  {
    id: "microsoft-ads",
    name: "Microsoft Ads (Bing)",
    description: "Bing campaign performance, spend tracking, and audience data",
    icon: Monitor,
    category: "ads",
    status: "disconnected",
    setupSteps: ["Sign in to Microsoft Advertising", "Select account", "Grant API access"],
  },
  {
    id: "linkedin-ads",
    name: "LinkedIn Ads",
    description: "B2B campaign performance, lead gen forms, and professional audience targeting",
    icon: Users,
    category: "ads",
    status: "disconnected",
    setupSteps: ["Connect LinkedIn Campaign Manager", "Select ad accounts", "Grant reporting access"],
  },
  {
    id: "tiktok-ads",
    name: "TikTok Ads",
    description: "Short-form video campaign performance, creative analytics, and audience insights",
    icon: Video,
    category: "ads",
    status: "disconnected",
    setupSteps: ["Connect TikTok Business Center", "Select advertiser account", "Grant data access"],
  },
  {
    id: "call-tracking",
    name: "Call Tracking",
    description: "Inbound call attribution, call recording sync, and lead source tracking",
    icon: Phone,
    category: "crm",
    status: "connected",
    lastSync: "5 min ago",
    syncHealth: 92,
    dataPoints: "847 calls this month",
    permissions: ["Read call logs", "Read recordings", "Source attribution"],
  },
  {
    id: "cms-website",
    name: "Website / CMS",
    description: "Direct website connection for content deployment, page updates, and SEO changes",
    icon: Globe,
    category: "cms",
    status: "connected",
    lastSync: "Just now",
    syncHealth: 100,
    dataPoints: "42 pages managed",
    permissions: ["Read pages", "Write content", "Deploy changes", "Manage redirects"],
  },
  {
    id: "crm-sync",
    name: "CRM (Internal)",
    description: "Lead data sync, deal pipeline integration, and conversion attribution",
    icon: Database,
    category: "crm",
    status: "connected",
    lastSync: "Real-time",
    syncHealth: 100,
    dataPoints: "2,847 leads synced",
    permissions: ["Read leads", "Write attribution", "Read deals"],
  },
  {
    id: "heatmap-tools",
    name: "Heatmap & Session Tools",
    description: "User session recordings, heatmaps, and behavior analytics integration",
    icon: MousePointerClick,
    category: "analytics",
    status: "disconnected",
    setupSteps: ["Install tracking script via GTM", "Connect Hotjar/FullStory account", "Enable session recording"],
  },
  {
    id: "email-platform",
    name: "Email Marketing",
    description: "Email campaign performance, list management, and automation triggers",
    icon: Mail,
    category: "other",
    status: "connected",
    lastSync: "30 min ago",
    syncHealth: 88,
    dataPoints: "12.4K subscribers",
    permissions: ["Read campaigns", "Read analytics", "Manage lists"],
  },
  {
    id: "seo-tools",
    name: "SEO / Backlink Provider",
    description: "Domain authority, backlink data, keyword difficulty, and competitor metrics",
    icon: TrendingUp,
    category: "seo",
    status: "disconnected",
    setupSteps: ["Enter Ahrefs/SEMrush/Moz API key", "Select domain to monitor", "Enable daily crawl sync"],
  },
];

const categoryLabels: Record<string, { label: string; icon: typeof Globe }> = {
  analytics: { label: "Analytics & Tracking", icon: BarChart3 },
  ads: { label: "Ad Platforms", icon: Megaphone },
  seo: { label: "SEO & Search", icon: Search },
  tracking: { label: "Tag Management", icon: Tag },
  cms: { label: "Website & CMS", icon: Globe },
  crm: { label: "CRM & Data", icon: Database },
  other: { label: "Other Tools", icon: Plug },
};

const statusConfig: Record<ConnectionStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  connected: { label: "Connected", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle2 },
  disconnected: { label: "Not Connected", color: "bg-muted text-muted-foreground border-border", icon: XCircle },
  error: { label: "Error", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: AlertTriangle },
  syncing: { label: "Syncing...", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: RefreshCw },
};

export default function MarketingIntegrations() {
  const [filter, setFilter] = useState("all");
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const connectedCount = INTEGRATIONS.filter(i => i.status === "connected").length;
  const errorCount = INTEGRATIONS.filter(i => i.status === "error").length;
  const avgHealth = Math.round(
    INTEGRATIONS.filter(i => i.syncHealth != null).reduce((s, i) => s + (i.syncHealth ?? 0), 0) /
    INTEGRATIONS.filter(i => i.syncHealth != null).length
  );

  const filtered = filter === "all"
    ? INTEGRATIONS
    : filter === "connected"
      ? INTEGRATIONS.filter(i => i.status === "connected")
      : filter === "disconnected"
        ? INTEGRATIONS.filter(i => i.status === "disconnected" || i.status === "error")
        : INTEGRATIONS.filter(i => i.category === filter);

  const handleConnect = (id: string) => {
    setConnectingId(id);
    setTimeout(() => {
      setConnectingId(null);
      toast.success("Connection initiated", { description: "Follow the authorization flow to complete setup" });
    }, 1500);
  };

  const handleReconnect = (id: string) => {
    toast.info("Reconnecting...", { description: "Re-authorizing your connection" });
  };

  const handleSync = (name: string) => {
    toast.success(`Syncing ${name}`, { description: "Data refresh in progress..." });
  };

  const grouped = Object.entries(categoryLabels).map(([key, val]) => ({
    category: key,
    ...val,
    items: filtered.filter(i => i.category === key),
  })).filter(g => g.items.length > 0);

  return (
    <MarketingShell breadcrumbs={[{ label: "Integrations" }]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Integrations Hub</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Connect your marketing platforms for unified data and execution</p>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Connected", value: `${connectedCount}/${INTEGRATIONS.length}`, icon: Plug, sub: `${INTEGRATIONS.length - connectedCount} available`, color: "text-green-600" },
            { label: "Sync Health", value: `${avgHealth}%`, icon: Activity, sub: "Average across sources", color: avgHealth >= 90 ? "text-green-600" : "text-amber-600" },
            { label: "Errors", value: errorCount.toString(), icon: AlertTriangle, sub: errorCount > 0 ? "Needs attention" : "All systems healthy", color: errorCount > 0 ? "text-red-500" : "text-green-600" },
            { label: "Data Sources", value: connectedCount.toString(), icon: Database, sub: "Active data feeds", color: "text-primary" },
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

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="all" className="text-[11px]">All ({INTEGRATIONS.length})</TabsTrigger>
            <TabsTrigger value="connected" className="text-[11px]">Connected ({connectedCount})</TabsTrigger>
            <TabsTrigger value="disconnected" className="text-[11px]">Available ({INTEGRATIONS.length - connectedCount})</TabsTrigger>
            {Object.entries(categoryLabels).map(([key, val]) => (
              <TabsTrigger key={key} value={key} className="text-[11px] gap-1">
                <val.icon className="w-3 h-3" />{val.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Integration Groups */}
        <div className="space-y-6">
          {grouped.map(group => {
            const GroupIcon = group.icon;
            return (
              <div key={group.category}>
                <div className="flex items-center gap-2 mb-3">
                  <GroupIcon className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">{group.label}</h2>
                  <Badge variant="outline" className="text-[9px]">{group.items.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {group.items.map(integration => {
                    const IntIcon = integration.icon;
                    const sc = statusConfig[integration.status];
                    const StatusIcon = sc.icon;
                    const isConnecting = connectingId === integration.id;

                    return (
                      <Card key={integration.id} className={`border-border transition-all hover:shadow-md ${integration.status === "error" ? "border-red-500/30" : ""}`}>
                        <CardContent className="p-4 space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                integration.status === "connected" ? "bg-primary/10" : integration.status === "error" ? "bg-red-500/10" : "bg-muted"
                              }`}>
                                <IntIcon className={`w-5 h-5 ${
                                  integration.status === "connected" ? "text-primary" : integration.status === "error" ? "text-red-500" : "text-muted-foreground"
                                }`} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground leading-tight">{integration.name}</p>
                                <Badge variant="outline" className={`text-[9px] gap-1 mt-1 ${sc.color}`}>
                                  <StatusIcon className="w-3 h-3" />{sc.label}
                                </Badge>
                              </div>
                            </div>
                            {integration.status === "connected" && (
                              <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                                <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{integration.description}</p>

                          {/* Connected State */}
                          {integration.status === "connected" && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground">Sync Health</span>
                                <span className={`text-[10px] font-medium ${(integration.syncHealth ?? 0) >= 90 ? "text-green-600" : (integration.syncHealth ?? 0) >= 70 ? "text-amber-600" : "text-red-500"}`}>
                                  {integration.syncHealth}%
                                </span>
                              </div>
                              <Progress value={integration.syncHealth} className="h-1.5" />
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{integration.lastSync}</span>
                                <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{integration.dataPoints}</span>
                              </div>
                              {integration.permissions && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {integration.permissions.slice(0, 3).map(p => (
                                    <Badge key={p} variant="outline" className="text-[8px] h-4 bg-muted/30">{p}</Badge>
                                  ))}
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 pt-1">
                                <Button size="sm" variant="outline" className="flex-1 h-7 text-[10px] gap-1" onClick={() => handleSync(integration.name)}>
                                  <RefreshCw className="w-3 h-3" />Sync Now
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 text-[10px] text-muted-foreground gap-1">
                                  <ExternalLink className="w-3 h-3" />Open
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Error State */}
                          {integration.status === "error" && (
                            <div className="space-y-2">
                              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-2.5">
                                <p className="text-[10px] text-red-600 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 shrink-0" />
                                  Authorization expired. Reconnect to restore data sync.
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Button size="sm" className="flex-1 h-7 text-[10px] gap-1" onClick={() => handleReconnect(integration.id)}
                                  style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))" }}>
                                  <RefreshCw className="w-3 h-3" />Reconnect
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 text-[10px] text-muted-foreground">Dismiss</Button>
                              </div>
                            </div>
                          )}

                          {/* Disconnected State */}
                          {integration.status === "disconnected" && (
                            <div className="space-y-2">
                              {integration.setupSteps && (
                                <div className="space-y-1">
                                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Setup Steps</p>
                                  {integration.setupSteps.map((step, i) => (
                                    <div key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                                      <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-medium shrink-0 mt-0.5">{i + 1}</span>
                                      {step}
                                    </div>
                                  ))}
                                </div>
                              )}
                              <Button size="sm" className="w-full h-8 text-[11px] gap-1.5" onClick={() => handleConnect(integration.id)} disabled={isConnecting}
                                style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))" }}>
                                {isConnecting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Connecting...</> : <><Plug className="w-3.5 h-3.5" />Connect {integration.name}</>}
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Data Architecture Note */}
        <Card className="border-dashed border-2 border-border">
          <CardContent className="flex items-center justify-between py-4 px-5">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground opacity-40" />
              <div>
                <p className="text-xs font-medium text-foreground">Secure Data Architecture</p>
                <p className="text-[10px] text-muted-foreground">All integrations use OAuth 2.0 with encrypted token storage. Data is synced server-side and never exposed to the client.</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[9px] bg-green-500/10 text-green-600 border-green-500/20 shrink-0">
              <Shield className="w-3 h-3 mr-1" />SOC 2 Ready
            </Badge>
          </CardContent>
        </Card>
      </div>
    </MarketingShell>
  );
}
