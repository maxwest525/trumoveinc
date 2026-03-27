import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, AlertTriangle, Link2, RefreshCw } from "lucide-react";
import type { PhaseInfo } from "./types";

interface SeoOverviewStripProps {
  totalUrls: number;
  totalIssues: number;
  phases: PhaseInfo[];
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function SeoOverviewStrip({ totalUrls, totalIssues, phases, onRefresh, refreshing }: SeoOverviewStripProps) {
  // Count integrations (phases 2+) that are connected
  const integrationPhases = phases.filter(p => p.integrationName);
  const connectedIntegrations = integrationPhases.filter(p => p.status === "connected" || p.status === "syncing").length;

  return (
    <div className="grid grid-cols-3 gap-3">
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
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold text-foreground">{connectedIntegrations}/{integrationPhases.length}</p>
            <p className="text-[11px] text-muted-foreground">Integrations Connected</p>
          </div>
          {onRefresh && (
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onRefresh} disabled={refreshing}>
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
