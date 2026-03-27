import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, AlertTriangle, Link2, RefreshCw, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import type { PhaseInfo } from "./types";

interface Integration {
  name: string;
  connected: boolean;
  helpUrl: string;
}

interface SeoOverviewStripProps {
  totalUrls: number;
  totalIssues: number;
  phases: PhaseInfo[];
  integrations: Integration[];
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function SeoOverviewStrip({ totalUrls, totalIssues, integrations, onRefresh, refreshing }: SeoOverviewStripProps) {
  const connectedCount = integrations.filter(i => i.connected).length;

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
        <CardContent className="p-4 flex items-start gap-3">
          <Link2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">{connectedCount}/{integrations.length} Connected</p>
              {onRefresh && (
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onRefresh} disabled={refreshing}>
                  <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
                </Button>
              )}
            </div>
            {integrations.map((int) => (
              <div key={int.name} className="flex items-center gap-1.5 text-[11px]">
                {int.connected ? (
                  <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                ) : (
                  <XCircle className="w-3 h-3 text-muted-foreground shrink-0" />
                )}
                <span className={int.connected ? "text-foreground" : "text-muted-foreground"}>
                  {int.name}
                </span>
                {!int.connected && (
                  <a
                    href={int.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-0.5 ml-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <HelpCircle className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
