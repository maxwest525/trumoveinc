import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, RefreshCw, FileText, CheckCircle2, Eye, Clock, AlertTriangle, Rocket } from "lucide-react";

type PipelineStatus = "gap" | "brief" | "draft" | "qa" | "review" | "published" | "needs_refresh";

const STATUS_CONFIG: Record<PipelineStatus, { label: string; color: string }> = {
  gap: { label: "Gap", color: "bg-red-500/10 text-red-600 border-red-500/20" },
  brief: { label: "Brief", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  draft: { label: "Draft", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  qa: { label: "QA", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  review: { label: "Review", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
  published: { label: "Published", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  needs_refresh: { label: "Needs Refresh", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
};

interface ContentItem {
  id: number;
  title: string;
  type: string;
  status: PipelineStatus;
  assignee: string;
  targetKeyword: string;
  updatedAt: string;
}

const ITEMS: ContentItem[] = [
  { id: 1, title: "Long Distance Moving Guide 2025", type: "Blog", status: "published", assignee: "AI Writer", targetKeyword: "long distance movers", updatedAt: "2d ago" },
  { id: 2, title: "NYC to LA Moving Cost Breakdown", type: "Route Page", status: "review", assignee: "MW", targetKeyword: "nyc to la movers", updatedAt: "1d ago" },
  { id: 3, title: "How to Avoid Moving Scams", type: "Trust Page", status: "draft", assignee: "AI Writer", targetKeyword: "moving scam protection", updatedAt: "3h ago" },
  { id: 4, title: "Cross Country Moving Checklist", type: "Blog", status: "brief", assignee: "Unassigned", targetKeyword: "cross country moving checklist", updatedAt: "5d ago" },
  { id: 5, title: "FMCSA Certified Movers Explained", type: "Blog", status: "gap", assignee: "—", targetKeyword: "FMCSA certified movers", updatedAt: "—" },
  { id: 6, title: "Moving Cost Calculator Page", type: "Cost Page", status: "needs_refresh", assignee: "MW", targetKeyword: "moving cost calculator", updatedAt: "30d ago" },
  { id: 7, title: "Chicago Long Distance Movers", type: "Geo Page", status: "qa", assignee: "AI Writer", targetKeyword: "chicago long distance movers", updatedAt: "6h ago" },
];

export default function ContentPipelineTab() {
  const [filter, setFilter] = useState<PipelineStatus | "all">("all");
  const filtered = filter === "all" ? ITEMS : ITEMS.filter((i) => i.status === filter);

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" className="h-7 text-xs" onClick={() => setFilter("all")}>All ({ITEMS.length})</Button>
          {(Object.keys(STATUS_CONFIG) as PipelineStatus[]).map((s) => (
            <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" className="h-7 text-xs" onClick={() => setFilter(s)}>
              {STATUS_CONFIG[s].label} ({ITEMS.filter((i) => i.status === s).length})
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline"><RefreshCw className="w-3.5 h-3.5 mr-1.5" />AI Refresh</Button>
          <Button size="sm"><Plus className="w-3.5 h-3.5 mr-1.5" />New Content</Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Title</th>
              <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Type</th>
              <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Status</th>
              <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Target Keyword</th>
              <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Assignee</th>
              <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Updated</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium">{item.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.type}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={`text-[10px] ${STATUS_CONFIG[item.status].color}`}>
                    {STATUS_CONFIG[item.status].label}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{item.targetKeyword}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.assignee}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{item.updatedAt}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="ghost" className="h-6 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />Generate
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
