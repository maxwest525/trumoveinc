import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Rocket, CheckCircle2, XCircle, Clock, RotateCcw,
  Eye, ArrowRight, AlertTriangle, Code, FileText, Search, Target
} from "lucide-react";
import { useImplementationQueue, type ChangeStatus, type ChangeCategory, type ImplementationChange } from "@/contexts/ImplementationQueueContext";

const STATUS_CONFIG: Record<ChangeStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending: { label: "Pending Review", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
  approved: { label: "Approved", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: CheckCircle2 },
  scheduled: { label: "Scheduled", color: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: Clock },
  deployed: { label: "Deployed", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: Rocket },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  rolled_back: { label: "Rolled Back", color: "bg-orange-500/10 text-orange-600 border-orange-500/20", icon: RotateCcw },
};

const CATEGORY_CONFIG: Record<ChangeCategory, { label: string; icon: typeof Search }> = {
  seo: { label: "SEO", icon: Search },
  ads: { label: "Ads", icon: Target },
  content: { label: "Content", icon: FileText },
  cro: { label: "CRO", icon: Target },
  technical: { label: "Technical", icon: Code },
};

export default function ImplementationContent() {
  const { changes, updateChange } = useImplementationQueue();
  const [previewId, setPreviewId] = useState<string | null>(null);
  const preview = changes.find((c) => c.id === previewId);

  const statusCounts = changes.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4 mt-4">
      {/* Status summary */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(STATUS_CONFIG) as ChangeStatus[]).map((s) => (
          <Badge key={s} variant="outline" className={`${STATUS_CONFIG[s].color} text-xs`}>
            {STATUS_CONFIG[s].label}: {statusCounts[s] || 0}
          </Badge>
        ))}
      </div>

      {changes.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <Rocket className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No items in the implementation queue.</p>
            <p className="text-xs mt-1">Approve recommendations to add them here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Queue list */}
          <div className="space-y-2">
            {changes.map((change) => {
              const statusCfg = STATUS_CONFIG[change.status];
              const catCfg = CATEGORY_CONFIG[change.category];
              const StatusIcon = statusCfg.icon;
              const CatIcon = catCfg.icon;
              return (
                <div
                  key={change.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${previewId === change.id ? "border-primary bg-primary/5" : "hover:bg-muted/30"}`}
                  onClick={() => setPreviewId(change.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={`text-[10px] ${statusCfg.color}`}>
                      <StatusIcon className="w-3 h-3 mr-0.5" />{statusCfg.label}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      <CatIcon className="w-3 h-3 mr-0.5" />{catCfg.label}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{change.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{change.description}</p>
                </div>
              );
            })}
          </div>

          {/* Preview panel */}
          {preview && (
            <Card>
              <CardContent className="pt-4 space-y-4">
                <h3 className="text-sm font-semibold">{preview.title}</h3>
                <p className="text-xs text-muted-foreground">{preview.description}</p>
                <div className="flex gap-2 flex-wrap">
                  {preview.status === "pending" && (
                    <>
                      <Button size="sm" className="h-7 text-xs" onClick={() => { updateStatus(preview.id, "approved"); toast.success("Approved"); }}>Approve</Button>
                      <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => { updateStatus(preview.id, "rejected"); toast.info("Rejected"); }}>Reject</Button>
                    </>
                  )}
                  {preview.status === "approved" && (
                    <Button size="sm" className="h-7 text-xs" onClick={() => { updateStatus(preview.id, "deployed"); toast.success("Deployed"); }}>
                      <Rocket className="w-3 h-3 mr-1" />Deploy
                    </Button>
                  )}
                  {preview.status === "deployed" && (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { updateStatus(preview.id, "rolled_back"); toast.info("Rolled back"); }}>
                      <RotateCcw className="w-3 h-3 mr-1" />Roll Back
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
