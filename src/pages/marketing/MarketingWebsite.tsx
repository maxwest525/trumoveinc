import MarketingShell from "@/components/layout/MarketingShell";
import {
  Globe, ArrowUpRight, ArrowDownRight, Smartphone, Monitor,
  Zap, CheckCircle2, Clock, BarChart3, MousePointerClick,
  Layers, FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SITE_METRICS = [
  { label: "Page Views", value: "28,341", trend: "+14%", up: true },
  { label: "Bounce Rate", value: "38.2%", trend: "-4.1pt", up: true },
  { label: "Avg. Session", value: "3m 42s", trend: "+18s", up: true },
  { label: "Conv. Rate", value: "4.2%", trend: "+0.6pt", up: true },
  { label: "Mobile Score", value: "94", trend: "+3", up: true },
  { label: "Core Web Vitals", value: "Pass", trend: "All green", up: true },
];

const AB_TESTS = [
  { name: "Hero CTA — 'Get Quote' vs 'Start Moving'", status: "winner", winner: "Variant B", lift: "+18%" },
  { name: "Trust badges placement — above vs below form", status: "running", daysLeft: 4, lift: "+6% so far" },
  { name: "Pricing page layout — cards vs table", status: "queued", daysLeft: null, lift: "—" },
];

const OPTIMIZATIONS = [
  { text: "Compressed hero images — 340KB saved", time: "2h ago", done: true },
  { text: "Lazy-loaded below-fold sections", time: "4h ago", done: true },
  { text: "Added structured data to FAQ page", time: "1d ago", done: true },
  { text: "Redesigning /online-estimate for better conversion", time: "In progress", done: false },
  { text: "Adding exit-intent popup with offer", time: "Queued", done: false },
];

const PAGES_PERF = [
  { page: "/", views: "8,240", convRate: "3.8%", speed: "1.2s" },
  { page: "/online-estimate", views: "4,120", convRate: "8.1%", speed: "1.8s" },
  { page: "/site/about", views: "2,340", convRate: "1.2%", speed: "0.9s" },
  { page: "/site/faq", views: "1,890", convRate: "2.4%", speed: "1.1s" },
  { page: "/site/track", views: "1,560", convRate: "0.8%", speed: "2.1s" },
];

export default function MarketingWebsite() {
  return (
    <MarketingShell breadcrumb=" / Website Agent">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Website Agent</h1>
              <p className="text-xs text-muted-foreground">Pixel-perfect, optimized websites that convert</p>
            </div>
          </div>
          <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            Agent Idle
          </span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-border rounded-xl overflow-hidden">
          {SITE_METRICS.map((m) => (
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
          {/* A/B Tests */}
          <div className="bg-card rounded-xl border border-border">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <FlaskConical className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-bold text-foreground">A/B Tests</h2>
            </div>
            <div className="divide-y divide-border/30">
              {AB_TESTS.map((t, i) => (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-foreground">{t.name}</span>
                    <span className={cn(
                      "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded",
                      t.status === "winner" ? "text-emerald-600 bg-emerald-500/10"
                        : t.status === "running" ? "text-blue-600 bg-blue-500/10"
                        : "text-muted-foreground bg-muted"
                    )}>{t.status}</span>
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    {t.winner && <span>Winner: <span className="font-bold text-emerald-600">{t.winner}</span> · </span>}
                    Lift: <span className="font-medium text-foreground">{t.lift}</span>
                    {t.daysLeft && <span> · {t.daysLeft} days left</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Optimizations */}
          <div className="bg-card rounded-xl border border-border">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <Zap className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs font-bold text-foreground">Optimizations</h2>
            </div>
            <div className="divide-y divide-border/30">
              {OPTIMIZATIONS.map((o, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {o.done ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    ) : (
                      <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                    )}
                    <span className="text-[11px] text-foreground truncate">{o.text}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground whitespace-nowrap shrink-0 ml-2">{o.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Layers className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold text-foreground">Top Pages Performance</h2>
          </div>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="py-2 px-4 text-left text-[10px] text-muted-foreground font-semibold">Page</th>
                <th className="py-2 px-3 text-right text-[10px] text-muted-foreground font-semibold">Views</th>
                <th className="py-2 px-3 text-right text-[10px] text-muted-foreground font-semibold">Conv. Rate</th>
                <th className="py-2 px-3 text-right text-[10px] text-muted-foreground font-semibold">Load Time</th>
              </tr>
            </thead>
            <tbody>
              {PAGES_PERF.map((p, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-muted/10">
                  <td className="py-2 px-4 font-medium text-foreground font-mono text-[10px]">{p.page}</td>
                  <td className="py-2 px-3 text-right text-foreground">{p.views}</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-600">{p.convRate}</td>
                  <td className={cn("py-2 px-3 text-right", parseFloat(p.speed) > 2 ? "text-amber-600" : "text-foreground")}>{p.speed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MarketingShell>
  );
}
