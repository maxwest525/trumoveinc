import { Card, CardContent } from "@/components/ui/card";
import { Globe, AlertTriangle, Link2 } from "lucide-react";
import type { PhaseInfo } from "./types";

interface SeoOverviewStripProps {
  totalUrls: number;
  totalIssues: number;
  phases: PhaseInfo[];
}

export default function SeoOverviewStrip({ totalUrls, totalIssues, phases }: SeoOverviewStripProps) {
  const connectedCount = phases.filter(p => p.status === "connected" || p.status === "syncing").length;

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
          <div>
            <p className="text-2xl font-bold text-foreground">{connectedCount}/{phases.length}</p>
            <p className="text-[11px] text-muted-foreground">Integrations Active</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
