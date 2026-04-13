import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, XCircle, RefreshCw, AlertTriangle,
  BarChart3, Search, Target, FileText, Megaphone, Link2, ChevronRight
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
  { id: "google_ads", name: "Google Ads", description: "PPC campaigns, keywords, spend data", icon: Target, status: "connected", category: "Advertising", lastSync: "5 min ago", syncHealth: 100, dataPoints: "12 campaigns" },
  { id: "meta_ads", name: "Meta Ads", description: "Facebook & Instagram ad campaigns", icon: Megaphone, status: "disconnected", category: "Advertising" },
  { id: "semrush", name: "SEMrush", description: "Keyword research, competitor analysis", icon: Search, status: "disconnected", category: "SEO" },
  { id: "ahrefs", name: "Ahrefs", description: "Backlink monitoring, domain authority", icon: Link2, status: "disconnected", category: "SEO" },
  { id: "hotjar", name: "Hotjar", description: "Heatmaps, session recordings", icon: Target, status: "disconnected", category: "CRO" },
  { id: "mailchimp", name: "Mailchimp", description: "Email marketing automation", icon: FileText, status: "disconnected", category: "Email" },
];

const STATUS_STYLES: Record<ConnectionStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  connected: { label: "Connected", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  disconnected: { label: "Not Connected", color: "text-muted-foreground bg-muted border-border", icon: XCircle },
  error: { label: "Error", color: "text-red-600 bg-red-50 border-red-200", icon: AlertTriangle },
  syncing: { label: "Syncing", color: "text-blue-600 bg-blue-50 border-blue-200", icon: RefreshCw },
};

export default function IntegrationsContent() {
  const [selectedId, setSelectedId] = useState<string>(INTEGRATIONS[0].id);
  const selected = INTEGRATIONS.find((i) => i.id === selectedId)!;
  const status = STATUS_STYLES[selected.status];
  const StatusIcon = status.icon;
  const SelectedIcon = selected.icon;

  return (
    <div className="flex gap-0 mt-4 border rounded-lg overflow-hidden bg-card">
      {/* Secondary vertical sidebar */}
      <div className="w-56 shrink-0 border-r bg-muted/30">
        <div className="px-3 py-2.5 border-b">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Integrations</p>
        </div>
        <nav className="py-1">
          {INTEGRATIONS.map((integration) => {
            const Icon = integration.icon;
            const s = STATUS_STYLES[integration.status];
            const active = integration.id === selectedId;
            return (
              <button
                key={integration.id}
                onClick={() => setSelectedId(integration.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors",
                  active
                    ? "bg-background border-l-[3px] border-primary pl-[9px] text-foreground font-medium"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1 truncate">{integration.name}</span>
                {integration.status === "connected" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Detail panel */}
      <div className="flex-1 p-5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-muted shrink-0">
            <SelectedIcon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold">{selected.name}</h2>
              <Badge variant="outline" className={`text-[10px] ${status.color}`}>
                <StatusIcon className="w-3 h-3 mr-0.5" />{status.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{selected.description}</p>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">{selected.category}</p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <Switch checked={selected.status === "connected"} />
          </div>
        </div>

        {/* Connected details */}
        {selected.status === "connected" && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="py-3 px-4">
                  <p className="text-[10px] text-muted-foreground">Last Sync</p>
                  <p className="text-sm font-semibold mt-0.5">{selected.lastSync}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-3 px-4">
                  <p className="text-[10px] text-muted-foreground">Sync Health</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Progress value={selected.syncHealth} className="h-1.5 flex-1" />
                    <span className="text-sm font-semibold">{selected.syncHealth}%</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-3 px-4">
                  <p className="text-[10px] text-muted-foreground">Data Points</p>
                  <p className="text-sm font-semibold mt-0.5">{selected.dataPoints}</p>
                </CardContent>
              </Card>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs h-8">
                <RefreshCw className="w-3 h-3 mr-1.5" />Sync Now
              </Button>
              <Button size="sm" variant="outline" className="text-xs h-8">
                Configure
              </Button>
              <Button size="sm" variant="ghost" className="text-xs h-8 text-destructive hover:text-destructive">
                Disconnect
              </Button>
            </div>
          </div>
        )}

        {/* Disconnected state */}
        {selected.status === "disconnected" && (
          <div className="mt-6 text-center py-6">
            <SelectedIcon className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium">Connect {selected.name}</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Link your {selected.name} account to pull {selected.description.toLowerCase()} into your marketing dashboard.
            </p>
            <Button size="sm" className="mt-4 text-xs">
              Connect {selected.name}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
