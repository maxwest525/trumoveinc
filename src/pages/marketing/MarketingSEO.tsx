import MarketingShell from "@/components/layout/MarketingShell";
import {
  Search, FileText, Link2, Wrench, TrendingUp, ArrowUpRight,
  ArrowDownRight, CheckCircle2, Clock, BarChart3, Globe, Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SEO_METRICS = [
  { label: "Organic Sessions", value: "12,847", trend: "+18%", up: true },
  { label: "Keywords in Top 10", value: "89", trend: "+12", up: true },
  { label: "Backlinks Acquired", value: "34", trend: "+8", up: true },
  { label: "Domain Authority", value: "42", trend: "+3", up: true },
  { label: "Pages Indexed", value: "127", trend: "+14", up: true },
  { label: "Avg. Position", value: "14.2", trend: "-2.1", up: true },
];

const CONTENT_QUEUE = [
  { title: "Best Long Distance Moving Companies 2026", status: "published", date: "Mar 24" },
  { title: "How to Prepare for an Interstate Move", status: "published", date: "Mar 22" },
  { title: "Moving Cost Calculator Guide", status: "writing", date: "In progress" },
  { title: "State-by-State Moving Regulations", status: "research", date: "Queued" },
  { title: "Moving Checklist: Ultimate Guide", status: "research", date: "Queued" },
];

const TECH_SEO = [
  { issue: "3 broken internal links fixed", severity: "fixed", date: "1h ago" },
  { issue: "Schema markup added to 5 service pages", severity: "fixed", date: "3h ago" },
  { issue: "Page speed improved on /online-estimate", severity: "fixed", date: "1d ago" },
  { issue: "2 pages with thin content flagged", severity: "warning", date: "Pending" },
  { issue: "Mobile usability issue on /faq", severity: "warning", date: "Pending" },
];

const BACKLINKS = [
  { domain: "movingauthority.com", da: 58, type: "Guest post", date: "Mar 23" },
  { domain: "consumeraffairs.com", da: 72, type: "Directory", date: "Mar 21" },
  { domain: "moving.tips", da: 45, type: "Resource page", date: "Mar 19" },
];

export default function MarketingSEO() {
  return (
    <MarketingShell breadcrumb=" / SEO & GEO Agent">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Search className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">SEO & GEO Agent</h1>
              <p className="text-xs text-muted-foreground">Data-driven research & content for exceptional SEO results</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Agent Active
          </span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-border rounded-xl overflow-hidden">
          {SEO_METRICS.map((m) => (
            <div key={m.label} className="bg-card px-3 py-3">
              <div className="text-[10px] text-muted-foreground">{m.label}</div>
              <div className="text-lg font-bold text-foreground leading-tight">{m.value}</div>
              <div className={cn("text-[10px] flex items-center gap-0.5 mt-0.5", m.up ? "text-emerald-600" : "text-red-500")}>
                {m.up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                {m.trend}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Content Pipeline */}
          <div className="bg-card rounded-xl border border-border">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <FileText className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-bold text-foreground">Content Pipeline</h2>
            </div>
            <div className="divide-y divide-border/30">
              {CONTENT_QUEUE.map((c, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[11px] text-foreground truncate mr-2">{c.title}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded",
                      c.status === "published" ? "text-emerald-600 bg-emerald-500/10"
                        : c.status === "writing" ? "text-blue-600 bg-blue-500/10"
                        : "text-muted-foreground bg-muted"
                    )}>{c.status}</span>
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">{c.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical SEO */}
          <div className="bg-card rounded-xl border border-border">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <Wrench className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-bold text-foreground">Technical SEO</h2>
            </div>
            <div className="divide-y divide-border/30">
              {TECH_SEO.map((t, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {t.severity === "fixed" ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    ) : (
                      <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                    )}
                    <span className="text-[11px] text-foreground truncate">{t.issue}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground whitespace-nowrap shrink-0 ml-2">{t.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Backlinks */}
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Link2 className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold text-foreground">Recent Backlinks Acquired</h2>
          </div>
          <div className="divide-y divide-border/30">
            {BACKLINKS.map((b, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                  <div>
                    <div className="text-[11px] font-medium text-foreground">{b.domain}</div>
                    <div className="text-[9px] text-muted-foreground">{b.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-foreground">DA {b.da}</span>
                  <span className="text-[9px] text-muted-foreground">{b.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
