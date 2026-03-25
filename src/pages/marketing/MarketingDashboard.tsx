import MarketingShell from "@/components/layout/MarketingShell";
import {
  ArrowUpRight, ArrowDownRight, Search, Megaphone, Globe,
  CheckCircle2, Clock, Zap, TrendingUp, Eye, MousePointerClick,
  FileText, Link2, BarChart3, Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const METRICS = [
  { label: "Organic Traffic", value: "12,847", trend: "+18%", up: true, icon: Eye },
  { label: "Keywords Ranked", value: "342", trend: "+24", up: true, icon: Search },
  { label: "Ad Clicks", value: "8,291", trend: "+12%", up: true, icon: MousePointerClick },
  { label: "Conversions", value: "156", trend: "+8%", up: true, icon: TrendingUp },
  { label: "Ad Spend", value: "$4,820", trend: "-6%", up: true, icon: BarChart3 },
  { label: "Cost/Conv.", value: "$30.90", trend: "-$3.10", up: true, icon: Zap },
];

const AGENTS = [
  {
    name: "SEO & GEO Agent",
    icon: Search,
    status: "active",
    tasksCompleted: 47,
    tasksInProgress: 3,
    lastAction: "Published 2 blog posts targeting 'interstate moving quotes'",
    accentClass: "text-emerald-600 bg-emerald-500/10",
    href: "/marketing/seo",
  },
  {
    name: "Paid Ads Agent",
    icon: Megaphone,
    status: "active",
    tasksCompleted: 28,
    tasksInProgress: 2,
    lastAction: "Optimized Google Ads bid strategy — CPA down 11%",
    accentClass: "text-blue-600 bg-blue-500/10",
    href: "/marketing/ads",
  },
];

const RECENT_TASKS = [
  { agent: "SEO", text: "Generated keyword cluster for 'long distance movers'", time: "2m ago", status: "done" },
  { agent: "Ads", text: "Paused underperforming ad group 'movers near me'", time: "15m ago", status: "done" },
  { agent: "SEO", text: "Technical SEO audit — fixed 3 broken links", time: "1h ago", status: "done" },
  { agent: "Ads", text: "Created new responsive search ad variants", time: "2h ago", status: "done" },
  
  { agent: "SEO", text: "Building backlink outreach list", time: "4h ago", status: "in_progress" },
];

const TOP_KEYWORDS = [
  { keyword: "long distance movers", position: 3, change: +2, volume: "14.8K" },
  { keyword: "interstate moving companies", position: 5, change: +4, volume: "9.2K" },
  { keyword: "cross country movers", position: 8, change: -1, volume: "12.1K" },
  { keyword: "moving broker near me", position: 2, change: 0, volume: "6.4K" },
  { keyword: "best moving company reviews", position: 11, change: +7, volume: "8.9K" },
];

export default function MarketingDashboard() {
  return (
    <MarketingShell>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
            <p className="text-xs text-muted-foreground">Your AI agents are managing SEO, Ads & Website</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              2 agents active
            </span>
            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Last 30 days</span>
          </div>
        </div>

        {/* Metrics strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-border rounded-xl overflow-hidden">
          {METRICS.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="bg-card px-3 py-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{m.label}</span>
                </div>
                <div className="text-lg font-bold text-foreground leading-tight">{m.value}</div>
                <div className={cn("text-[10px] flex items-center gap-0.5 mt-0.5", m.up ? "text-emerald-600" : "text-red-500")}>
                  {m.up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                  {m.trend}
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Agent Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            return (
              <Link
                key={agent.name}
                to={agent.href}
                className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", agent.accentClass)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-foreground">{agent.name}</h3>
                      <span className="flex items-center gap-1 text-[9px]">
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          agent.status === "active" ? "bg-emerald-500" : "bg-muted-foreground/40"
                        )} />
                        <span className={agent.status === "active" ? "text-emerald-600" : "text-muted-foreground"}>
                          {agent.status === "active" ? "Working" : "Idle"}
                        </span>
                      </span>
                    </div>
                  </div>
                  <Bot className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-muted/30 rounded-lg px-2 py-1.5">
                    <div className="text-[9px] text-muted-foreground">Completed</div>
                    <div className="text-sm font-bold text-foreground">{agent.tasksCompleted}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg px-2 py-1.5">
                    <div className="text-[9px] text-muted-foreground">In Progress</div>
                    <div className="text-sm font-bold text-foreground">{agent.tasksInProgress}</div>
                  </div>
                </div>

                <div className="text-[10px] text-muted-foreground">
                  <span className="font-medium text-foreground">Last action:</span> {agent.lastAction}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Tasks + Top Keywords side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          {/* Recent Tasks */}
          <div className="lg:col-span-3 bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-bold text-foreground">Recent Tasks</h2>
              </div>
              <Link to="/marketing/tasks" className="text-[10px] text-primary font-medium hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-border/30">
              {RECENT_TASKS.map((t, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={cn(
                      "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0",
                      t.agent === "SEO" ? "text-emerald-600 bg-emerald-500/10"
                        : t.agent === "Ads" ? "text-blue-600 bg-blue-500/10"
                        : "text-violet-600 bg-violet-500/10"
                    )}>{t.agent}</span>
                    <span className="text-[11px] text-foreground truncate">{t.text}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {t.status === "done" ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Clock className="w-3 h-3 text-amber-500" />
                    )}
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">{t.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Keywords */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-bold text-foreground">Top Keywords</h2>
              </div>
              <Link to="/marketing/seo" className="text-[10px] text-primary font-medium hover:underline">See all</Link>
            </div>
            <div className="divide-y divide-border/30">
              {TOP_KEYWORDS.map((k, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <div className="min-w-0">
                    <div className="text-[11px] text-foreground font-medium truncate">{k.keyword}</div>
                    <div className="text-[9px] text-muted-foreground">{k.volume}/mo</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-foreground">#{k.position}</span>
                    {k.change !== 0 && (
                      <span className={cn(
                        "text-[9px] font-bold",
                        k.change > 0 ? "text-emerald-600" : "text-red-500"
                      )}>
                        {k.change > 0 ? `↑${k.change}` : `↓${Math.abs(k.change)}`}
                      </span>
                    )}
                    {k.change === 0 && <span className="text-[9px] text-muted-foreground">—</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
