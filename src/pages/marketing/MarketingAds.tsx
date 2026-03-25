import MarketingShell from "@/components/layout/MarketingShell";
import {
  Megaphone, ArrowUpRight, ArrowDownRight, DollarSign,
  MousePointerClick, Eye, TrendingUp, Pause, Play,
  BarChart3, Target, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AD_METRICS = [
  { label: "Ad Spend", value: "$4,820", trend: "-6%", up: true },
  { label: "Impressions", value: "142K", trend: "+9%", up: true },
  { label: "Clicks", value: "8,291", trend: "+12%", up: true },
  { label: "CTR", value: "5.8%", trend: "+0.4pt", up: true },
  { label: "Conversions", value: "156", trend: "+8%", up: true },
  { label: "CPA", value: "$30.90", trend: "-$3.10", up: true },
];

const CAMPAIGNS = [
  { name: "Long Distance Movers — Search", platform: "Google", status: "active", spend: "$1,820", conversions: 62, cpa: "$29.35", roas: "4.2x" },
  { name: "Interstate Moving — Brand", platform: "Google", status: "active", spend: "$480", conversions: 28, cpa: "$17.14", roas: "7.1x" },
  { name: "Moving Leads — LAL", platform: "Meta", status: "active", spend: "$1,240", conversions: 41, cpa: "$30.24", roas: "3.8x" },
  { name: "Retargeting — All Visitors", platform: "Meta", status: "active", spend: "$620", conversions: 18, cpa: "$34.44", roas: "3.2x" },
  { name: "Movers Near Me — Search", platform: "Google", status: "paused", spend: "$660", conversions: 7, cpa: "$94.29", roas: "1.1x" },
];

const RECENT_ACTIONS = [
  { text: "Paused 'Movers Near Me' campaign — CPA exceeded target by 3x", time: "15m ago" },
  { text: "Increased budget on 'Long Distance Movers' by 20% — strong ROAS", time: "2h ago" },
  { text: "Created 3 new responsive search ad variants for testing", time: "4h ago" },
  { text: "Updated audience targeting — excluded converted users", time: "1d ago" },
];

export default function MarketingAds() {
  return (
    <MarketingShell breadcrumb=" / Paid Ads Agent">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Paid Ads Agent</h1>
              <p className="text-xs text-muted-foreground">Launch, optimize & scale your ad campaigns</p>
            </div>
          </div>
          <span className="text-[10px] bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Agent Active
          </span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-border rounded-xl overflow-hidden">
          {AD_METRICS.map((m) => (
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

        {/* Campaigns Table */}
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Target className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold text-foreground">Campaigns</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="py-2 px-4 text-left text-[10px] text-muted-foreground font-semibold">Campaign</th>
                  <th className="py-2 px-3 text-center text-[10px] text-muted-foreground font-semibold">Platform</th>
                  <th className="py-2 px-3 text-center text-[10px] text-muted-foreground font-semibold">Status</th>
                  <th className="py-2 px-3 text-right text-[10px] text-muted-foreground font-semibold">Spend</th>
                  <th className="py-2 px-3 text-right text-[10px] text-muted-foreground font-semibold">Conv.</th>
                  <th className="py-2 px-3 text-right text-[10px] text-muted-foreground font-semibold">CPA</th>
                  <th className="py-2 px-3 text-right text-[10px] text-muted-foreground font-semibold">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {CAMPAIGNS.map((c, i) => (
                  <tr key={i} className="border-b border-border/30 hover:bg-muted/10">
                    <td className="py-2 px-4 font-medium text-foreground">{c.name}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={cn(
                        "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded",
                        c.platform === "Google" ? "text-blue-600 bg-blue-500/10" : "text-indigo-600 bg-indigo-500/10"
                      )}>{c.platform}</span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1 text-[9px] font-medium",
                        c.status === "active" ? "text-emerald-600" : "text-muted-foreground"
                      )}>
                        {c.status === "active" ? <Play className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-foreground">{c.spend}</td>
                    <td className="py-2 px-3 text-right font-bold text-foreground">{c.conversions}</td>
                    <td className={cn("py-2 px-3 text-right", parseFloat(c.cpa.replace("$", "")) > 50 ? "text-red-500 font-bold" : "text-foreground")}>{c.cpa}</td>
                    <td className={cn("py-2 px-3 text-right font-bold", parseFloat(c.roas) >= 3 ? "text-emerald-600" : "text-amber-600")}>{c.roas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Agent Actions */}
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Zap className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-bold text-foreground">Agent Actions</h2>
          </div>
          <div className="divide-y divide-border/30">
            {RECENT_ACTIONS.map((a, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-[11px] text-foreground">{a.text}</span>
                <span className="text-[9px] text-muted-foreground whitespace-nowrap ml-2">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
