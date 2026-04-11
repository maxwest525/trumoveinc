import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  const connected = INTEGRATIONS.filter((i) => i.status === "connected").length;

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-xs">
          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
          {connected}/{INTEGRATIONS.length} connected
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {INTEGRATIONS.map((integration) => {
          const status = STATUS_STYLES[integration.status];
          const StatusIcon = status.icon;
          const Icon = integration.icon;
          return (
            <Card key={integration.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{integration.name}</h3>
                      <Badge variant="outline" className={`text-[10px] ${status.color}`}>
                        <StatusIcon className="w-3 h-3 mr-0.5" />{status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{integration.description}</p>
                    {integration.lastSync && (
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-muted-foreground">Last sync: {integration.lastSync}</span>
                        {integration.syncHealth && (
                          <div className="flex items-center gap-1">
                            <Progress value={integration.syncHealth} className="h-1 w-12" />
                            <span className="text-[10px] text-muted-foreground">{integration.syncHealth}%</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant={integration.status === "connected" ? "outline" : "default"} className="h-7 text-xs shrink-0">
                    {integration.status === "connected" ? "Manage" : "Connect"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
