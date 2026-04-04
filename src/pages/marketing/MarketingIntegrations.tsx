import { useState } from "react";
import MarketingShell from "@/components/layout/MarketingShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Plug, CheckCircle2, XCircle, RefreshCw, ExternalLink, AlertTriangle,
  BarChart3, Search, Target, FileText, Share2, Code, Megaphone, Link2
} from "lucide-react";

type ConnectionStatus = "connected" | "disconnected" | "error" | "syncing";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: typeof BarChart3;
  status: ConnectionStatus;
  category: string;
  lastSync?: string;
  syncHealth?: number;
  dataPoints?: string;
}

const INTEGRATIONS: Integration[] = [
  { id: "ga4", name: "Google Analytics 4", description: "Website traffic, sessions, conversions", icon: BarChart3, status: "connected", category: "Analytics", lastSync: "2 min ago", syncHealth: 98, dataPoints: "142K events/day" },
  { id: "gsc", name: "Search Console", description: "Search performance, indexing, crawl data", icon: Search, status: "connected", category: "SEO", lastSync: "15 min ago", syncHealth: 95, dataPoints: "2.4K queries" },
  { id: "gads", name: "Google Ads", description: "Campaign performance, spend, conversions", icon: Target, status: "connected", category: "Ads", lastSync: "5 min ago", syncHealth: 100, dataPoints: "12 campaigns" },
  { id: "meta", name: "Meta Ads", description: "Facebook & Instagram ad performance", icon: Share2, status: "disconnected", category: "Ads" },
  { id: "gtm", name: "Google Tag Manager", description: "Tag deployment, triggers, variables", icon: Code, status: "connected", category: "Analytics", lastSync: "1 hr ago", syncHealth: 88, dataPoints: "34 tags" },
  { id: "semrush", name: "SEMrush", description: "Keyword rankings, competitor analysis", icon: Search, status: "disconnected", category: "SEO" },
  { id: "ahrefs", name: "Ahrefs", description: "Backlink profiles, domain authority", icon: Link2, status: "error", category: "SEO", lastSync: "Failed 2hr ago", syncHealth: 0 },
  { id: "mailchimp", name: "Mailchimp", description: "Email campaigns, automation, lists", icon: FileText, status: "connected", category: "Email", lastSync: "30 min ago", syncHealth: 92, dataPoints: "8.2K contacts" },
  { id: "hotjar", name: "Hotjar", description: "Heatmaps, recordings, surveys", icon: Target, status: "disconnected", category: "CRO" },
  { id: "hubspot", name: "HubSpot CRM", description: "Contact sync, deal tracking", icon: Megaphone, status: "disconnected", category: "CRM" },
];

const STATUS_BADGE: Record<ConnectionStatus, { label: string; cls: string }> = {
  connected: { label: "Connected", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  disconnected: { label: "Not Connected", cls: "bg-muted text-muted-foreground border-border" },
  error: { label: "Error", cls: "bg-destructive/10 text-destructive border-destructive/20" },
  syncing: { label: "Syncing…", cls: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
};

export default function MarketingIntegrations() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [tab, setTab] = useState("all");

  const handleConnect = (id: string) => {
    setIntegrations((prev) => prev.map((i) => i.id === id ? { ...i, status: "connected" as ConnectionStatus, lastSync: "Just now", syncHealth: 100, dataPoints: "Syncing..." } : i));
    toast.success("Integration connected successfully");
  };

  const handleSync = (id: string) => {
    setIntegrations((prev) => prev.map((i) => i.id === id ? { ...i, status: "syncing" as ConnectionStatus } : i));
    toast.info("Syncing data…");
    setTimeout(() => {
      setIntegrations((prev) => prev.map((i) => i.id === id ? { ...i, status: "connected" as ConnectionStatus, lastSync: "Just now", syncHealth: 100 } : i));
      toast.success("Sync complete");
    }, 2000);
  };

  const handleReconnect = (id: string) => {
    setIntegrations((prev) => prev.map((i) => i.id === id ? { ...i, status: "connected" as ConnectionStatus, lastSync: "Just now", syncHealth: 95 } : i));
    toast.success("Reconnected successfully");
  };

  const filtered = tab === "all" ? integrations
    : tab === "connected" ? integrations.filter((i) => i.status === "connected" || i.status === "syncing")
    : integrations.filter((i) => i.status === "disconnected" || i.status === "error");

  const connectedCount = integrations.filter((i) => i.status === "connected" || i.status === "syncing").length;

  return (
    <MarketingShell breadcrumbs={[{ label: "Integrations" }]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Integrations Hub</h1>
            <p className="text-sm text-muted-foreground mt-1">{connectedCount} of {integrations.length} platforms connected</p>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" />{connectedCount} Active
          </Badge>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All ({integrations.length})</TabsTrigger>
            <TabsTrigger value="connected">Connected ({connectedCount})</TabsTrigger>
            <TabsTrigger value="available">Available ({integrations.length - connectedCount})</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((integration) => {
                const Icon = integration.icon;
                const badge = STATUS_BADGE[integration.status];
                return (
                  <Card key={integration.id} className="border-border hover:border-primary/30 transition-colors">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <Icon className="w-5 h-5 text-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{integration.name}</p>
                            <p className="text-xs text-muted-foreground">{integration.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${badge.cls}`}>{badge.label}</Badge>
                      </div>

                      {(integration.status === "connected" || integration.status === "syncing") && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Sync Health</span>
                            <span className="font-medium">{integration.syncHealth}%</span>
                          </div>
                          <Progress value={integration.syncHealth} className="h-1.5" />
                          <div className="flex justify-between text-[11px] text-muted-foreground">
                            <span>Last sync: {integration.lastSync}</span>
                            {integration.dataPoints && <span>{integration.dataPoints}</span>}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-1">
                        {integration.status === "disconnected" && (
                          <Button size="sm" className="h-7 text-xs flex-1" onClick={() => handleConnect(integration.id)}>
                            <Plug className="w-3 h-3 mr-1" />Connect
                          </Button>
                        )}
                        {integration.status === "error" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => handleReconnect(integration.id)}>
                            <AlertTriangle className="w-3 h-3 mr-1" />Reconnect
                          </Button>
                        )}
                        {(integration.status === "connected") && (
                          <>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleSync(integration.id)}>
                              <RefreshCw className="w-3 h-3 mr-1" />Sync
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs">
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                        {integration.status === "syncing" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" disabled>
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />Syncing…
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MarketingShell>
  );
}
