import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import {
  TrendingUp, TrendingDown, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Activity, Globe,
  CheckCircle, XCircle, Lightbulb, Clock, Pause,
  Play, ChevronRight, RefreshCw, Search, Zap,
  BarChart3, FileText, Target, Ban, PhoneOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

/* ─── MOCK DATA ─── */

const SYSTEM_HEALTH = [
  { label: "Google Ads", status: "live" },
  { label: "Meta Ads", status: "live" },
  { label: "Convoso", status: "live" },
  { label: "GHL", status: "off" },
  { label: "Webhooks", status: "live" },
  { label: "GA4", status: "live" },
];

const ALERTS = [
  { text: "Pixel not firing on /thank-you. Losing attribution.", type: "error", action: "Fix", href: "/marketing/tracking" },
  { text: "5 leads unworked > 2 min. Queue backed up.", type: "warning", action: "Queue", href: "/marketing/leads" },
  { text: "3 missed calls in 2 hrs. Callbacks needed.", type: "warning", action: "Calls", href: "/marketing/leads" },
];

const KPI_ROW = [
  { label: "Leads", value: "587", sub: "30d", trend: "+12%", up: true },
  { label: "Booked", value: "97", sub: "30d", trend: "+8%", up: true },
  { label: "Book Rate", value: "16.5%", sub: "avg", trend: "+1.2pt", up: true },
  { label: "$/Booked", value: "$148", sub: "avg", trend: "-$11", up: true },
  { label: "Revenue", value: "$194K", sub: "30d", trend: "+14%", up: true },
  { label: "Speed", value: "4m 12s", sub: "avg", trend: "Target: <60s", up: false },
];

const SOURCE_TO_SALE = [
  { source: "Google Search", leads: 234, cpl: "$22", speed: "8s", contacted: 218, booked: 42, bookRate: "18.0%", cpb: "$124", rev: "$84K", verdict: "scale" },
  { source: "Meta Ads", leads: 156, cpl: "$19", speed: "14s", contacted: 128, booked: 18, bookRate: "11.5%", cpb: "$164", rev: "$36K", verdict: "scale" },
  { source: "Google Maps", leads: 67, cpl: "$0", speed: "—", contacted: 61, booked: 12, bookRate: "17.9%", cpb: "$0", rev: "$24K", verdict: "maintain" },
  { source: "Organic SEO", leads: 89, cpl: "$0", speed: "22s", contacted: 78, booked: 14, bookRate: "15.7%", cpb: "$0", rev: "$28K", verdict: "maintain" },
  { source: "Referral", leads: 41, cpl: "$0", speed: "—", contacted: 39, booked: 11, bookRate: "26.8%", cpb: "$0", rev: "$22K", verdict: "maintain" },
];

const CAMPAIGN_PERFORMANCE = [
  { campaign: "Interstate CA", plat: "G", spend: "$2.8K", leads: 98, cpl: "$29", booked: 19, bookRate: "19.4%", cpb: "$149", verdict: "scale" },
  { campaign: "FL Interstate", plat: "M", spend: "$1.4K", leads: 82, cpl: "$17", booked: 9, bookRate: "11.0%", cpb: "$158", verdict: "watch" },
  { campaign: "Interstate TX", plat: "G", spend: "$2.0K", leads: 74, cpl: "$27", booked: 14, bookRate: "18.9%", cpb: "$141", verdict: "scale" },
  { campaign: "Retargeting", plat: "M", spend: "$680", leads: 34, cpl: "$20", booked: 3, bookRate: "8.8%", cpb: "$227", verdict: "watch" },
  { campaign: "Interstate NY", plat: "G", spend: "$2.1K", leads: 62, cpl: "$34", booked: 8, bookRate: "12.9%", cpb: "$263", verdict: "cut" },
];

const PAGE_PERFORMANCE = [
  { page: "Long-Distance LP", conv: "7.8%", booked: 38, bookRate: "17.2%", cpb: "$112", verdict: "scale" },
  { page: "Social Traffic LP", conv: "7.1%", booked: 11, bookRate: "11.6%", cpb: "$148", verdict: "watch" },
  { page: "Free Quote LP", conv: "6.8%", booked: 16, bookRate: "12.2%", cpb: "$138", verdict: "watch" },
  { page: "Homepage", conv: "2.1%", booked: 4, bookRate: "6.0%", cpb: "$380", verdict: "pause" },
];

const KEYWORD_PERFORMANCE = [
  { kw: "long distance movers", conv: "2.7%", booked: 8, cpb: "$161", verdict: "scale" },
  { kw: "interstate moving company", conv: "3.1%", booked: 7, cpb: "$162", verdict: "scale" },
  { kw: "cross country movers", conv: "2.9%", booked: 5, cpb: "$132", verdict: "scale" },
  { kw: "movers near me", conv: "0.6%", booked: 1, cpb: "$1,071", verdict: "pause" },
  { kw: "movers from FL to NY", conv: "3.3%", booked: 4, cpb: "$144", verdict: "scale" },
];

const LEAD_HEALTH = [
  { label: "Duplicate Rate", value: "2.2%", ok: true },
  { label: "Missed Calls", value: "5.1%", ok: false },
  { label: "Unreached", value: "9.2%", ok: false },
  { label: "Junk/Suppressed", value: "3.6%", ok: true },
  { label: "Webhook Errors", value: "0", ok: true },
  { label: "Routing Fails", value: "2", ok: false },
];

const QUEUE = [
  { label: "In Queue", value: "8" },
  { label: "Agents On", value: "3" },
  { label: "Callbacks", value: "5" },
  { label: "Contact %", value: "67%" },
];

const RECOMMENDATIONS = [
  { text: "Speed averaging 4m. Target <60s. Fix Convoso queue priority.", pri: "high", action: "Fix Queue", href: "/marketing/automation" },
  { text: "'Movers near me': $1,071/book. Pause or add negatives.", pri: "high", action: "Pause", href: "/marketing/tracking" },
  { text: "Homepage at 2.1% conv. Stop sending paid traffic there.", pri: "high", action: "Fix", href: "/marketing/landing-pages" },
  { text: "Meta CPL down 12%. Increase budget $200/day on winners.", pri: "med", action: "Scale", href: "/marketing/campaigns" },
  { text: "Interstate NY: $263/book. Cut or pause.", pri: "med", action: "Review", href: "/marketing/campaigns" },
];

function V({ v }: { v: string }) {
  const s: Record<string, string> = {
    scale: "text-emerald-600 bg-emerald-500/10",
    watch: "text-amber-600 bg-amber-500/10",
    maintain: "text-blue-600 bg-blue-500/10",
    pause: "text-red-600 bg-red-500/10",
    cut: "text-red-600 bg-red-500/10",
  };
  return (
    <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded", s[v] || "text-muted-foreground bg-muted")}>
      {v}
    </span>
  );
}

export default function GrowthDashboard() {
  return (
    <GrowthEngineShell>
      <div className="space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
          <div className="flex items-center gap-1.5">
            {SYSTEM_HEALTH.map(s => (
              <span key={s.label} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                <span className={cn("w-1.5 h-1.5 rounded-full", s.status === "live" ? "bg-emerald-500" : "bg-muted-foreground/40")} />
                {s.label}
              </span>
            ))}
            <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded ml-2">30d</span>
          </div>
        </div>

        {/* Alerts - compact */}
        {ALERTS.length > 0 && (
          <div className="space-y-1">
            {ALERTS.map((a, i) => (
              <div key={i} className={cn(
                "flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px]",
                a.type === "error" ? "bg-red-500/5 text-red-600 dark:text-red-400" : "bg-amber-500/5 text-amber-600 dark:text-amber-400"
              )}>
                <div className="flex items-center gap-2">
                  {a.type === "error" ? <XCircle className="w-3 h-3 shrink-0" /> : <AlertTriangle className="w-3 h-3 shrink-0" />}
                  <span>{a.text}</span>
                </div>
                <Link to={a.href} className="text-[9px] font-bold text-primary hover:underline ml-2">{a.action}</Link>
              </div>
            ))}
          </div>
        )}

        {/* KPI strip */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-px bg-border rounded-lg overflow-hidden">
          {KPI_ROW.map(k => (
            <div key={k.label} className="bg-card px-3 py-2.5">
              <div className="text-[9px] text-muted-foreground">{k.label}</div>
              <div className="text-base font-bold text-foreground leading-tight">{k.value}</div>
              <div className={cn("text-[9px] flex items-center gap-0.5", k.up ? "text-emerald-600" : "text-red-500")}>
                {k.up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                {k.trend}
              </div>
            </div>
          ))}
        </div>

        {/* Queue + Lead Health - inline */}
        <div className="grid grid-cols-2 lg:grid-cols-10 gap-px bg-border rounded-lg overflow-hidden">
          {QUEUE.map(q => (
            <div key={q.label} className="bg-card px-3 py-2">
              <div className="text-[9px] text-muted-foreground">{q.label}</div>
              <div className="text-sm font-bold text-foreground">{q.value}</div>
            </div>
          ))}
          {LEAD_HEALTH.map(h => (
            <div key={h.label} className="bg-card px-3 py-2">
              <div className="text-[9px] text-muted-foreground">{h.label}</div>
              <div className="flex items-center gap-1">
                <span className={cn("text-sm font-bold", h.ok ? "text-emerald-600" : "text-amber-600")}>{h.value}</span>
                <span className={cn("w-1.5 h-1.5 rounded-full", h.ok ? "bg-emerald-500" : "bg-amber-500")} />
              </div>
            </div>
          ))}
        </div>

        {/* Source to Sale */}
        <div className="bg-card rounded-lg border border-border">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <h2 className="text-[12px] font-bold text-foreground">Source to Sale</h2>
            </div>
            <Link to="/marketing/leads" className="text-[9px] text-primary font-semibold hover:underline flex items-center gap-0.5">Leads <ChevronRight className="w-2.5 h-2.5" /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Source","Leads","CPL","Speed","Contacted","Booked","Book %","$/Book","Rev",""].map(h => (
                    <th key={h} className={cn("py-1.5 px-2 text-[10px] text-muted-foreground font-semibold", h === "Source" ? "text-left" : "text-right")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SOURCE_TO_SALE.map(r => (
                  <tr key={r.source} className="border-b border-border/30 hover:bg-muted/10">
                    <td className="py-1.5 px-2 font-medium text-foreground">{r.source}</td>
                    <td className="py-1.5 px-2 text-right text-foreground">{r.leads}</td>
                    <td className="py-1.5 px-2 text-right text-muted-foreground">{r.cpl}</td>
                    <td className="py-1.5 px-2 text-right text-muted-foreground">{r.speed}</td>
                    <td className="py-1.5 px-2 text-right text-foreground">{r.contacted}</td>
                    <td className="py-1.5 px-2 text-right font-bold text-emerald-600">{r.booked}</td>
                    <td className="py-1.5 px-2 text-right text-foreground">{r.bookRate}</td>
                    <td className="py-1.5 px-2 text-right text-foreground">{r.cpb}</td>
                    <td className="py-1.5 px-2 text-right text-foreground">{r.rev}</td>
                    <td className="py-1.5 px-2 text-right"><V v={r.verdict} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Campaign Performance */}
        <div className="bg-card rounded-lg border border-border">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border">
            <BarChart3 className="w-3.5 h-3.5 text-primary" />
            <h2 className="text-[12px] font-bold text-foreground">Campaign Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Campaign","","Spend","Leads","CPL","Booked","Book %","$/Book",""].map((h,i) => (
                    <th key={i} className={cn("py-1.5 px-2 text-[10px] text-muted-foreground font-semibold", i < 2 ? "text-left" : "text-right")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CAMPAIGN_PERFORMANCE.map(r => (
                  <tr key={r.campaign} className={cn("border-b border-border/30 hover:bg-muted/10", r.verdict === "cut" && "bg-red-500/[0.03]")}>
                    <td className="py-1.5 px-2 font-medium text-foreground">{r.campaign}</td>
                    <td className="py-1.5 px-2 text-[9px] text-muted-foreground">{r.plat}</td>
                    <td className="py-1.5 px-2 text-right text-muted-foreground">{r.spend}</td>
                    <td className="py-1.5 px-2 text-right text-foreground">{r.leads}</td>
                    <td className="py-1.5 px-2 text-right text-muted-foreground">{r.cpl}</td>
                    <td className="py-1.5 px-2 text-right font-bold text-emerald-600">{r.booked}</td>
                    <td className="py-1.5 px-2 text-right text-foreground">{r.bookRate}</td>
                    <td className="py-1.5 px-2 text-right text-foreground">{r.cpb}</td>
                    <td className="py-1.5 px-2 text-right"><V v={r.verdict} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Page + Keyword side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-card rounded-lg border border-border">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <h2 className="text-[12px] font-bold text-foreground">Page to Sale</h2>
            </div>
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Page","Conv","Booked","Book %","$/Book",""].map(h => (
                    <th key={h} className={cn("py-1.5 px-2 text-[10px] text-muted-foreground font-semibold", h === "Page" ? "text-left" : "text-right")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PAGE_PERFORMANCE.map(r => (
                  <tr key={r.page} className={cn("border-b border-border/30", r.verdict === "pause" && "bg-red-500/[0.03]")}>
                    <td className="py-1.5 px-2 font-medium text-foreground">{r.page}</td>
                    <td className="py-1.5 px-2 text-right text-foreground">{r.conv}</td>
                    <td className="py-1.5 px-2 text-right font-bold text-emerald-600">{r.booked}</td>
                    <td className="py-1.5 px-2 text-right text-foreground">{r.bookRate}</td>
                    <td className="py-1.5 px-2 text-right text-foreground">{r.cpb}</td>
                    <td className="py-1.5 px-2 text-right"><V v={r.verdict} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-card rounded-lg border border-border">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border">
              <Search className="w-3.5 h-3.5 text-primary" />
              <h2 className="text-[12px] font-bold text-foreground">Keyword to Sale</h2>
            </div>
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Keyword","Conv","Booked","$/Book",""].map(h => (
                    <th key={h} className={cn("py-1.5 px-2 text-[10px] text-muted-foreground font-semibold", h === "Keyword" ? "text-left" : "text-right")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {KEYWORD_PERFORMANCE.map(r => (
                  <tr key={r.kw} className={cn("border-b border-border/30", r.verdict === "pause" && "bg-red-500/[0.03]")}>
                    <td className="py-1.5 px-2 font-medium text-foreground">{r.kw}</td>
                    <td className="py-1.5 px-2 text-right text-foreground">{r.conv}</td>
                    <td className="py-1.5 px-2 text-right font-bold text-emerald-600">{r.booked}</td>
                    <td className="py-1.5 px-2 text-right text-foreground">{r.cpb}</td>
                    <td className="py-1.5 px-2 text-right"><V v={r.verdict} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations - compact */}
        <div className="bg-card rounded-lg border border-border">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <h2 className="text-[12px] font-bold text-foreground">What to Do Next</h2>
          </div>
          <div className="divide-y divide-border/30">
            {RECOMMENDATIONS.map((r, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", r.pri === "high" ? "bg-red-500" : "bg-amber-500")} />
                  <span className="text-[11px] text-foreground truncate">{r.text}</span>
                </div>
                <Link to={r.href} className="text-[9px] font-bold text-primary hover:underline whitespace-nowrap ml-2">{r.action}</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GrowthEngineShell>
  );
}
