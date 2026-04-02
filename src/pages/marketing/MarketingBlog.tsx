import MarketingShell from "@/components/layout/MarketingShell";
import { PenTool, FileText, Clock, CheckCircle } from "lucide-react";

const contentBriefs = [
  { title: "Best Long Distance Moving Companies 2026", status: "Ready to Write", priority: "High", estimatedTraffic: "1,200/mo", wordCount: 2500 },
  { title: "How Much Does Long Distance Moving Cost?", status: "Ready to Write", priority: "High", estimatedTraffic: "900/mo", wordCount: 2000 },
  { title: "Long Distance Moving Checklist", status: "In Progress", priority: "Medium", estimatedTraffic: "600/mo", wordCount: 1800 },
  { title: "Moving From NYC to Miami: Complete Guide", status: "Draft", priority: "Medium", estimatedTraffic: "430/mo", wordCount: 2200 },
  { title: "TruMove vs. Other Moving Companies", status: "Ready to Write", priority: "High", estimatedTraffic: "320/mo", wordCount: 1500 },
];

const statusColors: Record<string, string> = {
  "Ready to Write": "bg-green-100 text-green-700",
  "In Progress": "bg-blue-100 text-blue-700",
  "Draft": "bg-yellow-100 text-yellow-700",
  "Published": "bg-purple-100 text-purple-700",
};

export default function MarketingBlog() {
  return (
    <MarketingShell breadcrumb="Blog & Content">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <PenTool className="w-5 h-5 text-primary" />
              Blog & Content
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">SEO content briefs, drafts, and publishing pipeline for trumoveinc.com</p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            + New Brief
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Content Briefs</span>
            </div>
            <div className="text-2xl font-bold">5</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">In Progress</span>
            </div>
            <div className="text-2xl font-bold">1</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Published</span>
            </div>
            <div className="text-2xl font-bold">0</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Content Pipeline</h2>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Title</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Status</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Priority</th>
                <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Est. Traffic</th>
                <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Words</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {contentBriefs.map((brief) => (
                <tr key={brief.title} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium max-w-xs truncate">{brief.title}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[brief.status] ?? "bg-muted text-muted-foreground"}`}>
                      {brief.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold ${brief.priority === "High" ? "text-red-600" : "text-yellow-600"}`}>
                      {brief.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{brief.estimatedTraffic}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{brief.wordCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-primary hover:underline text-[11px] font-medium">Open</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MarketingShell>
  );
}
