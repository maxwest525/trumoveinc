import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, TrendingDown, ArrowUpRight, Rocket } from "lucide-react";
import { useImplementationQueue } from "@/contexts/ImplementationQueueContext";

export default function ResultsContent() {
  const { changes } = useImplementationQueue();
  const deployed = changes.filter((c) => c.status === "deployed");

  if (deployed.length === 0) {
    return (
      <div className="mt-4">
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <Rocket className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No deployed changes yet.</p>
            <p className="text-xs mt-1">Deploy items from the Implementation tab to track results here.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      <p className="text-sm text-muted-foreground">Showing before/after metrics for deployed changes.</p>
      {deployed.map((change) => (
        <Card key={change.id}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-semibold">{change.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{change.description}</p>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 text-[10px]">Deployed</Badge>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="p-2 rounded-lg bg-muted/30 text-center">
                <p className="text-[10px] text-muted-foreground">Before</p>
                <p className="text-sm font-semibold text-muted-foreground">—</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/30 text-center">
                <p className="text-[10px] text-muted-foreground">After</p>
                <p className="text-sm font-semibold text-muted-foreground">—</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/30 text-center">
                <p className="text-[10px] text-muted-foreground">Impact</p>
                <p className="text-sm font-semibold text-muted-foreground">Measuring...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
