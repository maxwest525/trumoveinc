import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, AlertTriangle, Link2, Clock } from "lucide-react";
import type { PhaseInfo } from "./types";

const statusColor: Record<string, string> = {
  not_connected: "secondary",
  connected: "default",
  syncing: "default",
  error: "destructive",
  coming_soon: "outline",
};

const statusLabel: Record<string, string> = {
  not_connected: "Not Connected",
  connected: "Connected",
  syncing: "Syncing…",
  error: "Error",
  coming_soon: "Coming Soon",
};

interface SeoOverviewStripProps {
  totalUrls: number;
  totalIssues: number;
  phases: PhaseInfo[];
}

export default function SeoOverviewStrip({ totalUrls, totalIssues, phases }: SeoOverviewStripProps) {
  const connectedCount = phases.filter(p => p.status === "connected" || p.status === "syncing").length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="bg-muted/30">
        <CardContent className="p-4 flex items-center gap-3">
          <Globe className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-2xl font-bold text-foreground">{totalUrls}</p>
            <p className="text-[11px] text-muted-foreground">URLs Crawled</p>
          </div>
        </CardContent>
      </Card>
      <Card className={totalIssues > 0 ? "bg-destructive/5 border-destructive/20" : "bg-muted/30"}>
        <CardContent className="p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <div>
            <p className="text-2xl font-bold text-destructive">{totalIssues}</p>
            <p className="text-[11px] text-muted-foreground">Total Issues</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-muted/30">
        <CardContent className="p-4 flex items-center gap-3">
          <Link2 className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-2xl font-bold text-foreground">{connectedCount}</p>
            <p className="text-[11px] text-muted-foreground">Integrations</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-muted/30">
        <CardContent className="p-4 space-y-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[11px] font-medium text-muted-foreground">Last Sync</p>
          </div>
          <div className="space-y-0.5">
            {phases.map(p => (
              <div key={p.id} className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-muted-foreground truncate">Phase {p.id}</span>
                <Badge variant={statusColor[p.status] as any} className="text-[9px] h-4 px-1.5">
                  {p.lastSync ? new Date(p.lastSync).toLocaleDateString() : statusLabel[p.status]}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
