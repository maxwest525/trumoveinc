import { useState } from "react";
import MarketingShell from "@/components/layout/MarketingShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  Legend,
} from "recharts";
import {
  ChevronDown, Download, ArrowUpRight, ArrowDownRight,
  CheckCircle2, DollarSign, Target, TrendingUp, Percent,
  Users, Gauge, Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Design tokens — match Action Dashboard                              */
/* ------------------------------------------------------------------ */
const GREEN = "#22C55E";
const GREEN_SOFT = "rgba(34, 197, 94, 0.08)";
const GREEN_BORDER = "rgba(34, 197, 94, 0.28)";
const TEXT = "#111827";
const TEXT_MUTED = "#6B7280";
const TEXT_SECONDARY = "#4B5563";
const BORDER = "rgba(17, 24, 39, 0.08)";
const BG = "#F8FAFC";
const CARD = "#FFFFFF";

/* ------------------------------------------------------------------ */
/*  Mock data — realistic moving industry numbers                       */
/* ------------------------------------------------------------------ */
const heroKpis = [
  { label: "Booked Jobs (7d)", value: "23", delta: "+12%", up: true, betterUp: true, icon: CheckCircle2 },
  { label: "Revenue (7d)", value: "$48,200", delta: "+8.4%", up: true, betterUp: true, icon: DollarSign },
  { label: "Cost / Booked Job", value: "$412", delta: "-6.1%", up: false, betterUp: false, icon: Target },
  { label: "ROAS", value: "4.8x", delta: "+0.3x", up: true, betterUp: true, icon: TrendingUp },
  { label: "Owned Lead %", value: "38%", delta: "+2 pts", up: true, betterUp: true, icon: Percent },
  { label: "Total Leads (30d)", value: "1,284", delta: "+11%", up: true, betterUp: true, icon: Users },
  { label: "Avg CPA", value: "$92", delta: "-4.2%", up: false, betterUp: false, icon: Gauge },
  { label: "Speed to Lead", value: "72s", delta: "-18s", up: false, betterUp: false, icon: Timer },
];

const trendData90d = Array.from({ length: 13 }).map((_, i) => {
  const w = i + 1;
  return {
    label: `W${w}`,
    booked: 14 + Math.round(Math.sin(i / 2) * 4) + i,
    revenue: 28000 + i * 1800 + Math.round(Math.cos(i / 2) * 3500),
  };
});

const sourceRows = [
  { source: "Google Organic", leads: 312, close: 14.2, cpl: 0, cpb: 180, rpl: 412, type: "owned" },
  { source: "Google Ads — Brand", leads: 96, close: 22.1, cpl: 38, cpb: 172, rpl: 920, type: "paid" },
  { source: "Google Ads — Non-Brand", leads: 184, close: 8.7, cpl: 64, cpb: 735, rpl: 310, type: "paid" },
  { source: "Meta Ads", leads: 142, close: 6.4, cpl: 42, cpb: 656, rpl: 240, type: "paid" },
  { source: "BudgetVanLines", leads: 178, close: 5.1, cpl: 48, cpb: 941, rpl: 198, type: "vendor" },
  { source: "ResultCalls", leads: 124, close: 4.2, cpl: 55, cpb: 1310, rpl: 162, type: "vendor" },
  { source: "Billy.com", leads: 162, close: 7.8, cpl: 41, cpb: 525, rpl: 285, type: "vendor" },
  { source: "MoveAdvisor", leads: 86, close: 9.1, cpl: 39, cpb: 428, rpl: 348, type: "vendor" },
];

const ownedVsBoughtData = [
  { name: "Owned", value: 38 },
  { name: "Bought", value: 62 },
];

const cpbBySource = [...sourceRows]
  .map((r) => ({ source: r.source.replace("Google Ads — ", "GAds "), cost: r.cpb }))
  .sort((a, b) => b.cost - a.cost);

const seoKeywordMovers = [
  { keyword: "long distance movers", volume: 9900, change: +4, impact: "+1.2K" },
  { keyword: "moving company near me", volume: 22000, change: +2, impact: "+820" },
  { keyword: "interstate movers", volume: 4400, change: +6, impact: "+650" },
  { keyword: "cross country moving", volume: 3600, change: -2, impact: "-180" },
  { keyword: "moving quote online", volume: 2900, change: +3, impact: "+410" },
];

const seoPosTrend = Array.from({ length: 30 }).map((_, i) => ({
  d: i + 1,
  pos: 28 - Math.round(Math.sin(i / 4) * 2) - Math.floor(i / 6),
}));

const ppcCampaigns = [
  { name: "Brand — Exact", spend: 1840, cpa: 38, roas: 11.2, trend: "up" },
  { name: "NB — Long Distance", spend: 2410, cpa: 96, roas: 4.1, trend: "up" },
  { name: "NB — Interstate", spend: 1980, cpa: 142, roas: 2.6, trend: "down" },
  { name: "Remarketing", spend: 760, cpa: 54, roas: 6.4, trend: "up" },
];

const ppcBrandSplit = [
  { name: "Brand", spend: 1840 },
  { name: "Non-Brand", spend: 4390 },
];

const metaCampaigns = [
  { name: "Lookalike — Movers", spend: 1620, cpa: 88, roas: 3.6, obj: "Conversion" },
  { name: "Awareness — Local", spend: 880, cpa: 0, roas: 0, obj: "Awareness" },
  { name: "Retargeting — Site", spend: 940, cpa: 41, roas: 6.1, obj: "Conversion" },
  { name: "Quote Form Leads", spend: 760, cpa: 62, roas: 4.4, obj: "Consideration" },
];

const metaObjectiveSplit = [
  { name: "Awareness", value: 880 },
  { name: "Consideration", value: 760 },
  { name: "Conversion", value: 2560 },
];

const vendorScorecards = [
  { vendor: "BudgetVanLines", score: 62, close: 5.1, cpl: 48, cpb: 941, contact: 78, compliance: 92, sentiment: 71, alert: "—" },
  { vendor: "ResultCalls", score: 38, close: 4.2, cpl: 55, cpb: 1310, contact: 64, compliance: 81, sentiment: 52, alert: "RED" },
  { vendor: "Billy.com", score: 71, close: 7.8, cpl: 41, cpb: 525, contact: 84, compliance: 96, sentiment: 78, alert: "—" },
  { vendor: "MoveAdvisor", score: 64, close: 9.1, cpl: 39, cpb: 428, contact: 81, compliance: 89, sentiment: 74, alert: "YELLOW" },
];

const vendorTrend12w = Array.from({ length: 12 }).map((_, i) => ({
  w: `W${i + 1}`,
  BudgetVanLines: 55 + Math.round(Math.sin(i / 2) * 6) + i / 3,
  ResultCalls: 48 - Math.round(i / 2) + Math.round(Math.cos(i / 2) * 4),
  "Billy.com": 64 + Math.round(Math.sin(i / 3) * 4) + i / 4,
  MoveAdvisor: 58 + Math.round(Math.cos(i / 2) * 5) + i / 6,
}));

const dependencyTrend = Array.from({ length: 12 }).map((_, i) => ({
  w: `W${i + 1}`,
  bought: 72 - i * 0.8 + Math.round(Math.sin(i / 2) * 2),
  owned: 28 + i * 0.8 - Math.round(Math.sin(i / 2) * 2),
}));

const seoTopKeywords = [
  { kw: "moving company near me", vol: 22000, pos: 8, change: +2, page: "/" },
  { kw: "long distance movers", vol: 9900, pos: 12, change: +4, page: "/long-distance" },
  { kw: "interstate movers", vol: 4400, pos: 15, change: +6, page: "/interstate" },
  { kw: "moving quote online", vol: 2900, pos: 9, change: +3, page: "/quote" },
  { kw: "cross country moving", vol: 3600, pos: 22, change: -2, page: "/cross-country" },
  { kw: "best movers reviews", vol: 1900, pos: 18, change: +1, page: "/reviews" },
  { kw: "professional movers", vol: 6600, pos: 24, change: +3, page: "/" },
  { kw: "household movers", vol: 1300, pos: 11, change: 0, page: "/household" },
  { kw: "out of state movers", vol: 2100, pos: 14, change: +5, page: "/out-of-state" },
  { kw: "auto transport movers", vol: 1700, pos: 28, change: -1, page: "/auto-transport" },
];

const seoTopPages = [
  { page: "/long-distance", visits: 3120, conv: 38, cvr: 1.22 },
  { page: "/", visits: 4280, conv: 41, cvr: 0.96 },
  { page: "/interstate", visits: 1840, conv: 22, cvr: 1.20 },
  { page: "/quote", visits: 1260, conv: 64, cvr: 5.08 },
  { page: "/cross-country", visits: 980, conv: 9, cvr: 0.92 },
];

const competitors = [
  { name: "AllAmericanRelocation", da: 38, organic: "48K", paid: "$22K", kws: 1840, threat: "HIGH", change: "Launched 14 new city pages" },
  { name: "MoverJunction", da: 31, organic: "31K", paid: "$14K", kws: 1240, threat: "HIGH", change: "Bidding on TruMove brand" },
  { name: "NationwideRelocation", da: 42, organic: "62K", paid: "$31K", kws: 2110, threat: "HIGH", change: "Refreshed pricing page" },
  { name: "MovingAPT", da: 27, organic: "18K", paid: "$8K", kws: 740, threat: "MED", change: "—" },
  { name: "GreatGuysMoving", da: 24, organic: "12K", paid: "$4K", kws: 510, threat: "MED", change: "Added blog cluster" },
  { name: "iMoving", da: 22, organic: "9K", paid: "$3K", kws: 410, threat: "LOW", change: "—" },
  { name: "HireAHelper", da: 51, organic: "84K", paid: "$11K", kws: 2640, threat: "HIGH", change: "Improved DA +3" },
];

const contentVelocity = [
  { name: "TruMove", pages: 4 },
  { name: "AllAmericanRelocation", pages: 12 },
  { name: "MoverJunction", pages: 9 },
  { name: "NationwideRelocation", pages: 14 },
  { name: "HireAHelper", pages: 18 },
  { name: "GreatGuysMoving", pages: 7 },
];

const spendAllocation = [
  { name: "Google — Brand", value: 1840 },
  { name: "Google — Non-Brand", value: 4390 },
  { name: "Meta", value: 4200 },
  { name: "SEO Retainer", value: 850 },
  { name: "Vendors", value: 420 },
];

const spendVsTarget = [
  { ch: "Google — Brand", budget: 280, actual: 263, pacing: 94 },
  { ch: "Google — Non-Brand", budget: 620, actual: 627, pacing: 101 },
  { ch: "Meta", budget: 600, actual: 600, pacing: 100 },
  { ch: "SEO Retainer", budget: 121, actual: 121, pacing: 100 },
  { ch: "Vendors", budget: 60, actual: 60, pacing: 100 },
];

const roiByChannel = [
  { ch: "Google Brand", roas: 11.2 },
  { ch: "Retargeting", roas: 6.4 },
  { ch: "SEO", roas: 5.8 },
  { ch: "Meta Conv.", roas: 4.4 },
  { ch: "GAds NB", roas: 3.1 },
  { ch: "Vendors", roas: 1.9 },
];

const PIE_PALETTE = [GREEN, "#1A365D", "#2C5282", "#D69E2E", "#15803D", "#94A3B8"];

/* ------------------------------------------------------------------ */
/*  UI primitives                                                       */
/* ------------------------------------------------------------------ */
function SectionCard({
  number, title, summary, defaultOpen = false, children,
}: {
  number: number; title: string; summary: string;
  defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-2xl bg-white"
      style={{ border: `1px solid ${BORDER}`, boxShadow: "0 1px 2px rgba(17,24,39,0.04)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-slate-50/60 transition-colors rounded-2xl"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-xs font-semibold"
            style={{ background: GREEN_SOFT, color: GREEN, border: `1px solid ${GREEN_BORDER}` }}
          >
            {number}
          </span>
          <h2 className="text-base font-semibold tracking-tight truncate" style={{ color: TEXT }}>
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs hidden md:block" style={{ color: TEXT_SECONDARY }}>{summary}</span>
          <ChevronDown
            className={cn("w-4 h-4 transition-transform duration-200", open && "rotate-180")}
            style={{ color: TEXT_MUTED }}
          />
        </div>
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6 pt-1">
            <div className="md:hidden text-xs mb-3" style={{ color: TEXT_SECONDARY }}>{summary}</div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroCard({ k }: { k: typeof heroKpis[number] }) {
  const Icon = k.icon;
  // Color logic: "up" arrow direction; "betterUp" governs whether green/red
  const isPositive = k.up === k.betterUp;
  return (
    <div
      className="rounded-2xl bg-white p-4"
      style={{ border: `1px solid ${BORDER}`, boxShadow: "0 1px 2px rgba(17,24,39,0.04)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className="inline-flex items-center justify-center w-7 h-7 rounded-lg"
          style={{ background: GREEN_SOFT, border: `1px solid ${GREEN_BORDER}` }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: GREEN, strokeWidth: 1.75 }} />
        </div>
      </div>
      <div className="text-[11px] font-medium mb-1" style={{ color: TEXT_MUTED }}>{k.label}</div>
      <div className="text-2xl font-semibold tracking-tight tabular-nums" style={{ color: TEXT }}>{k.value}</div>
      <div
        className="flex items-center gap-1 text-[11px] font-medium mt-1.5"
        style={{ color: isPositive ? "#16A34A" : "#DC2626" }}
      >
        {k.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {k.delta}
        <span className="font-normal" style={{ color: TEXT_MUTED }}>vs prev</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div
      className="rounded-xl bg-white p-3"
      style={{ border: `1px solid ${BORDER}` }}
    >
      <div className="text-[10px] font-medium uppercase tracking-wide" style={{ color: TEXT_MUTED }}>{label}</div>
      <div className="text-lg font-semibold mt-0.5 tabular-nums" style={{ color: TEXT }}>{value}</div>
      {hint && <div className="text-[10px] mt-0.5" style={{ color: TEXT_SECONDARY }}>{hint}</div>}
    </div>
  );
}

function tableHead(cols: string[]) {
  return (
    <thead>
      <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
        {cols.map((c, i) => (
          <th
            key={c}
            className={cn(
              "py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wide",
              i === 0 ? "text-left" : "text-right",
            )}
            style={{ color: TEXT_MUTED }}
          >
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function ThreatBadge({ level }: { level: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    HIGH: { bg: "rgba(220, 38, 38, 0.08)", fg: "#DC2626" },
    MED: { bg: "rgba(217, 119, 6, 0.10)", fg: "#B45309" },
    LOW: { bg: GREEN_SOFT, fg: GREEN },
    RED: { bg: "rgba(220, 38, 38, 0.08)", fg: "#DC2626" },
    YELLOW: { bg: "rgba(217, 119, 6, 0.10)", fg: "#B45309" },
    "—": { bg: "rgba(17,24,39,0.04)", fg: TEXT_MUTED },
  };
  const c = map[level] || map["—"];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: c.bg, color: c.fg }}
    >
      {level}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function MarketingDashboard() {
  const [trendRange, setTrendRange] = useState("90d");
  const [globalRange, setGlobalRange] = useState("30d");

  return (
    <MarketingShell breadcrumb="Metric Dashboard">
      <div style={{ background: BG }} className="-m-3 sm:-m-4 p-4 sm:p-6 min-h-[calc(100vh-3rem)]">
        {/* Top bar — account + range + export */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <Select defaultValue="trumove">
            <SelectTrigger className="h-9 w-[150px] bg-white" style={{ borderColor: BORDER, color: TEXT }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trumove">TruMove</SelectItem>
            </SelectContent>
          </Select>

          <Select value={globalRange} onValueChange={setGlobalRange}>
            <SelectTrigger className="h-9 w-[140px] bg-white" style={{ borderColor: BORDER, color: TEXT }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12mo">Last 12 months</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-9 bg-white"
              style={{ borderColor: GREEN_BORDER, color: GREEN }}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" style={{ strokeWidth: 1.75 }} />
              Export Report
            </Button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: TEXT }}>
            Metric Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: TEXT_SECONDARY }}>
            How every marketing investment is performing
          </p>
        </div>

        {/* Hero KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-5">
          {heroKpis.map((k) => <HeroCard key={k.label} k={k} />)}
        </div>

        {/* Trend chart */}
        <div
          className="rounded-2xl bg-white p-6 mb-5"
          style={{ border: `1px solid ${BORDER}`, boxShadow: "0 1px 2px rgba(17,24,39,0.04)" }}
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: TEXT }}>Booked Jobs & Revenue — Last 90 Days</h3>
              <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>Weekly performance trend</p>
            </div>
            <Select value={trendRange} onValueChange={setTrendRange}>
              <SelectTrigger className="h-8 w-[110px] text-xs bg-white" style={{ borderColor: BORDER }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7d</SelectItem>
                <SelectItem value="30d">30d</SelectItem>
                <SelectItem value="90d">90d</SelectItem>
                <SelectItem value="12mo">12mo</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData90d} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={BORDER} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: TEXT_MUTED }} axisLine={{ stroke: BORDER }} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: TEXT_MUTED }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }}
                formatter={(value: number, name: string) => name === "Revenue" ? [`$${value.toLocaleString()}`, name] : [value, name]}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Line yAxisId="left" type="monotone" dataKey="booked" name="Booked Jobs" stroke={GREEN} strokeWidth={2} dot={{ r: 3, fill: GREEN }} activeDot={{ r: 5 }} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#1A365D" strokeWidth={2} dot={{ r: 3, fill: "#1A365D" }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {/* SECTION 1 — BY LEAD SOURCE */}
          <SectionCard
            number={1}
            title="By Lead Source"
            summary="6 sources · Owned 38% / Bought 62% · Best CPB: Google Organic $180"
            defaultOpen
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Sources table */}
              <div className="lg:col-span-2 overflow-x-auto rounded-xl" style={{ border: `1px solid ${BORDER}` }}>
                <table className="w-full text-sm">
                  {tableHead(["Source", "Leads", "Close Rate", "CPL", "Cost / Booked", "Rev / Lead", "Trend"])}
                  <tbody>
                    {sourceRows.map((r) => {
                      const cpbClass = r.cpb > 1000 ? "text-red-500" : r.cpb < 300 ? "text-emerald-600" : "";
                      const closeClass = r.close > 10 ? "text-emerald-600" : r.close < 5 ? "text-red-500" : "";
                      return (
                        <tr key={r.source} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: `1px solid ${BORDER}`, height: 54 }}>
                          <td className="px-3 font-medium" style={{ color: TEXT }}>{r.source}</td>
                          <td className="px-3 text-right tabular-nums" style={{ color: TEXT }}>{r.leads}</td>
                          <td className={cn("px-3 text-right tabular-nums font-medium", closeClass)} style={!closeClass ? { color: TEXT } : {}}>{r.close.toFixed(1)}%</td>
                          <td className="px-3 text-right tabular-nums" style={{ color: TEXT_SECONDARY }}>{r.cpl ? `$${r.cpl}` : "—"}</td>
                          <td className={cn("px-3 text-right tabular-nums font-medium", cpbClass)} style={!cpbClass ? { color: TEXT } : {}}>${r.cpb}</td>
                          <td className="px-3 text-right tabular-nums" style={{ color: TEXT_SECONDARY }}>${r.rpl}</td>
                          <td className="px-3 text-right" style={{ color: TEXT_MUTED }}>
                            <Sparkline trend={r.cpb < 600 ? "up" : "down"} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <div className="rounded-xl bg-white p-4" style={{ border: `1px solid ${BORDER}` }}>
                  <h4 className="text-xs font-semibold mb-2" style={{ color: TEXT }}>Owned vs Bought</h4>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={ownedVsBoughtData} dataKey="value" cx="50%" cy="50%" innerRadius={42} outerRadius={64} paddingAngle={3}>
                        <Cell fill={GREEN} />
                        <Cell fill="#1A365D" />
                      </Pie>
                      <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="rounded-xl bg-white p-4" style={{ border: `1px solid ${BORDER}` }}>
                  <h4 className="text-xs font-semibold mb-2" style={{ color: TEXT }}>Cost per Booked Job by Source</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={cpbBySource} layout="vertical" margin={{ left: 0, right: 8 }}>
                      <CartesianGrid stroke={BORDER} strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                      <YAxis dataKey="source" type="category" tick={{ fontSize: 10, fill: TEXT_SECONDARY }} width={100} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v: number) => `$${v}`} contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="cost" fill={GREEN} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* SECTION 2 — BY CHANNEL */}
          <SectionCard
            number={2}
            title="By Channel (SEO / PPC / Meta)"
            summary="SEO 14.3K visits · PPC $7.5K spend · Meta $4.2K spend · Best ROAS: SEO"
          >
            <div className="space-y-6">
              {/* SEO */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: TEXT_MUTED }}>SEO Performance</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <MiniStat label="Tracked Keywords" value="47" hint="Across 12 cities" />
                  <MiniStat label="Improved (30d)" value="12" hint="↑ ranking" />
                  <MiniStat label="Declined (30d)" value="3" hint="↓ ranking" />
                  <MiniStat label="Organic Visits (30d)" value="14.3K" hint="+11% MoM" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                    <table className="w-full text-sm">
                      {tableHead(["Top Movers", "Volume", "Δ Pos", "Traffic"])}
                      <tbody>
                        {seoKeywordMovers.map((k) => (
                          <tr key={k.keyword} className="hover:bg-slate-50" style={{ borderBottom: `1px solid ${BORDER}`, height: 48 }}>
                            <td className="px-3" style={{ color: TEXT }}>{k.keyword}</td>
                            <td className="px-3 text-right tabular-nums" style={{ color: TEXT_SECONDARY }}>{k.volume.toLocaleString()}</td>
                            <td className={cn("px-3 text-right tabular-nums font-medium", k.change > 0 ? "text-emerald-600" : k.change < 0 ? "text-red-500" : "")}>
                              {k.change > 0 ? `+${k.change}` : k.change}
                            </td>
                            <td className="px-3 text-right tabular-nums" style={{ color: TEXT_SECONDARY }}>{k.impact}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="rounded-xl bg-white p-4" style={{ border: `1px solid ${BORDER}` }}>
                    <h5 className="text-xs font-semibold mb-2" style={{ color: TEXT }}>Avg Position (30d)</h5>
                    <ResponsiveContainer width="100%" height={210}>
                      <AreaChart data={seoPosTrend}>
                        <defs>
                          <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={GREEN} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke={BORDER} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="d" tick={{ fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                        <YAxis reversed tick={{ fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} />
                        <Area type="monotone" dataKey="pos" stroke={GREEN} strokeWidth={2} fill="url(#posGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* PPC */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: TEXT_MUTED }}>PPC Performance</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                  <MiniStat label="Spend (7d)" value="$7,490" />
                  <MiniStat label="Clicks" value="3,412" />
                  <MiniStat label="Conversions" value="62" />
                  <MiniStat label="CPA" value="$121" />
                  <MiniStat label="ROAS" value="4.2x" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white p-4" style={{ border: `1px solid ${BORDER}` }}>
                    <h5 className="text-xs font-semibold mb-2" style={{ color: TEXT }}>Brand vs Non-Brand Spend</h5>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={ppcBrandSplit}>
                        <CartesianGrid stroke={BORDER} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                        <Tooltip formatter={(v: number) => `$${v}`} contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="spend" fill={GREEN} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                    <table className="w-full text-sm">
                      {tableHead(["Top Campaigns", "Spend", "CPA", "ROAS"])}
                      <tbody>
                        {ppcCampaigns.map((c) => (
                          <tr key={c.name} className="hover:bg-slate-50" style={{ borderBottom: `1px solid ${BORDER}`, height: 48 }}>
                            <td className="px-3" style={{ color: TEXT }}>{c.name}</td>
                            <td className="px-3 text-right tabular-nums" style={{ color: TEXT_SECONDARY }}>${c.spend.toLocaleString()}</td>
                            <td className="px-3 text-right tabular-nums" style={{ color: TEXT }}>${c.cpa}</td>
                            <td className={cn("px-3 text-right tabular-nums font-medium", c.roas >= 4 ? "text-emerald-600" : c.roas < 3 ? "text-red-500" : "")}>{c.roas}x</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div
                  className="mt-3 inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
                  style={{ background: "rgba(217, 119, 6, 0.08)", color: "#B45309", border: "1px solid rgba(217, 119, 6, 0.20)" }}
                >
                  <span className="font-semibold">Wasted spend:</span> $620 identified in last 14 days across 3 ad groups with 0 conversions.
                </div>
              </div>

              {/* META */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: TEXT_MUTED }}>Meta Performance</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                  <MiniStat label="Spend (7d)" value="$4,200" />
                  <MiniStat label="Clicks" value="2,840" />
                  <MiniStat label="Conversions" value="48" />
                  <MiniStat label="CPA" value="$87" />
                  <MiniStat label="ROAS" value="3.9x" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white p-4" style={{ border: `1px solid ${BORDER}` }}>
                    <h5 className="text-xs font-semibold mb-2" style={{ color: TEXT }}>Spend by Objective</h5>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={metaObjectiveSplit} dataKey="value" cx="50%" cy="50%" innerRadius={42} outerRadius={64} paddingAngle={3}>
                          {metaObjectiveSplit.map((_, i) => <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => `$${v}`} contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                    <table className="w-full text-sm">
                      {tableHead(["Top Campaigns", "Spend", "CPA", "ROAS"])}
                      <tbody>
                        {metaCampaigns.map((c) => (
                          <tr key={c.name} className="hover:bg-slate-50" style={{ borderBottom: `1px solid ${BORDER}`, height: 48 }}>
                            <td className="px-3" style={{ color: TEXT }}>
                              <div>{c.name}</div>
                              <div className="text-[10px]" style={{ color: TEXT_MUTED }}>{c.obj}</div>
                            </td>
                            <td className="px-3 text-right tabular-nums" style={{ color: TEXT_SECONDARY }}>${c.spend.toLocaleString()}</td>
                            <td className="px-3 text-right tabular-nums" style={{ color: TEXT }}>{c.cpa ? `$${c.cpa}` : "—"}</td>
                            <td className={cn("px-3 text-right tabular-nums font-medium", c.roas >= 4 ? "text-emerald-600" : c.roas === 0 ? "" : c.roas < 3 ? "text-red-500" : "")}
                              style={c.roas === 0 ? { color: TEXT_MUTED } : {}}>
                              {c.roas ? `${c.roas}x` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* SECTION 3 — BY VENDOR */}
          <SectionCard
            number={3}
            title="By Vendor (Full Scorecard)"
            summary="4 vendors active · Avg score 51 · 1 RED alert · Dependency 62%"
          >
            <div className="rounded-xl overflow-x-auto" style={{ border: `1px solid ${BORDER}` }}>
              <table className="w-full text-sm">
                {tableHead(["Vendor", "Score", "Close", "CPL", "Cost/Book", "Contact", "Compliance", "Sentiment", "Alert"])}
                <tbody>
                  {vendorScorecards.map((v) => {
                    const sc = (n: number) => n >= 70 ? "text-emerald-600" : n >= 50 ? "text-amber-600" : "text-red-500";
                    return (
                      <tr key={v.vendor} className="hover:bg-slate-50" style={{ borderBottom: `1px solid ${BORDER}`, height: 54 }}>
                        <td className="px-3 font-medium" style={{ color: TEXT }}>{v.vendor}</td>
                        <td className={cn("px-3 text-right tabular-nums font-semibold", sc(v.score))}>{v.score}</td>
                        <td className="px-3 text-right tabular-nums" style={{ color: TEXT }}>{v.close}%</td>
                        <td className="px-3 text-right tabular-nums" style={{ color: TEXT_SECONDARY }}>${v.cpl}</td>
                        <td className="px-3 text-right tabular-nums" style={{ color: TEXT }}>${v.cpb}</td>
                        <td className={cn("px-3 text-right tabular-nums", sc(v.contact))}>{v.contact}%</td>
                        <td className={cn("px-3 text-right tabular-nums", sc(v.compliance))}>{v.compliance}%</td>
                        <td className={cn("px-3 text-right tabular-nums", sc(v.sentiment))}>{v.sentiment}</td>
                        <td className="px-3 text-right"><ThreatBadge level={v.alert} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <div className="rounded-xl bg-white p-4" style={{ border: `1px solid ${BORDER}` }}>
                <h5 className="text-xs font-semibold mb-2" style={{ color: TEXT }}>Vendor Score Trend (12 weeks)</h5>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={vendorTrend12w}>
                    <CartesianGrid stroke={BORDER} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="w" tick={{ fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="BudgetVanLines" stroke={GREEN} strokeWidth={1.75} dot={false} />
                    <Line type="monotone" dataKey="ResultCalls" stroke="#DC2626" strokeWidth={1.75} dot={false} />
                    <Line type="monotone" dataKey="Billy.com" stroke="#1A365D" strokeWidth={1.75} dot={false} />
                    <Line type="monotone" dataKey="MoveAdvisor" stroke="#D69E2E" strokeWidth={1.75} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-xl bg-white p-4" style={{ border: `1px solid ${BORDER}` }}>
                <h5 className="text-xs font-semibold mb-2" style={{ color: TEXT }}>Owned vs Bought Dependency (12w)</h5>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={dependencyTrend}>
                    <defs>
                      <linearGradient id="boughtGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1A365D" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#1A365D" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="ownedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={GREEN} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={BORDER} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="w" tick={{ fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `${Math.round(v)}%`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="bought" stroke="#1A365D" fill="url(#boughtGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="owned" stroke={GREEN} fill="url(#ownedGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="text-[11px] mt-1" style={{ color: TEXT_MUTED }}>Target: 50% owned</div>
              </div>
            </div>
          </SectionCard>

          {/* SECTION 4 — SEO INSIGHTS */}
          <SectionCard
            number={4}
            title="SEO Insights"
            summary="47 keywords · 14.3K monthly visits · DA 1 → target 20"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                <div className="px-3 py-2.5" style={{ borderBottom: `1px solid ${BORDER}`, background: "#FAFBFC" }}>
                  <h5 className="text-xs font-semibold" style={{ color: TEXT }}>Top Ranking Keywords</h5>
                </div>
                <table className="w-full text-sm">
                  {tableHead(["Keyword", "Vol", "Pos", "Δ"])}
                  <tbody>
                    {seoTopKeywords.map((k) => (
                      <tr key={k.kw} className="hover:bg-slate-50" style={{ borderBottom: `1px solid ${BORDER}`, height: 44 }}>
                        <td className="px-3" style={{ color: TEXT }}>
                          <div className="text-xs">{k.kw}</div>
                          <div className="text-[10px]" style={{ color: TEXT_MUTED }}>{k.page}</div>
                        </td>
                        <td className="px-3 text-right tabular-nums text-xs" style={{ color: TEXT_SECONDARY }}>{k.vol.toLocaleString()}</td>
                        <td className="px-3 text-right tabular-nums text-xs" style={{ color: TEXT }}>{k.pos}</td>
                        <td className={cn("px-3 text-right tabular-nums text-xs font-medium", k.change > 0 ? "text-emerald-600" : k.change < 0 ? "text-red-500" : "")} style={k.change === 0 ? { color: TEXT_MUTED } : {}}>
                          {k.change > 0 ? `+${k.change}` : k.change || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                <div className="px-3 py-2.5" style={{ borderBottom: `1px solid ${BORDER}`, background: "#FAFBFC" }}>
                  <h5 className="text-xs font-semibold" style={{ color: TEXT }}>Top Performing Pages</h5>
                </div>
                <table className="w-full text-sm">
                  {tableHead(["Page", "Visits", "Conv", "CVR"])}
                  <tbody>
                    {seoTopPages.map((p) => (
                      <tr key={p.page} className="hover:bg-slate-50" style={{ borderBottom: `1px solid ${BORDER}`, height: 48 }}>
                        <td className="px-3 text-xs" style={{ color: TEXT }}>{p.page}</td>
                        <td className="px-3 text-right tabular-nums text-xs" style={{ color: TEXT_SECONDARY }}>{p.visits.toLocaleString()}</td>
                        <td className="px-3 text-right tabular-nums text-xs" style={{ color: TEXT }}>{p.conv}</td>
                        <td className={cn("px-3 text-right tabular-nums text-xs font-medium", p.cvr >= 2 ? "text-emerald-600" : "")} style={p.cvr < 2 ? { color: TEXT } : {}}>{p.cvr.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-3 py-2.5 text-[11px]" style={{ color: TEXT_MUTED, borderTop: `1px solid ${BORDER}` }}>
                  6 pages flagged as needing refresh (last updated &gt; 180 days)
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 space-y-4" style={{ border: `1px solid ${BORDER}` }}>
                <h5 className="text-xs font-semibold" style={{ color: TEXT }}>Authority Building</h5>
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs" style={{ color: TEXT_SECONDARY }}>Domain Authority</span>
                    <span className="text-lg font-semibold tabular-nums" style={{ color: TEXT }}>1<span className="text-xs font-normal" style={{ color: TEXT_MUTED }}> / 20 target</span></span>
                  </div>
                  <div className="h-2 rounded-full mt-2 overflow-hidden" style={{ background: "rgba(17,24,39,0.06)" }}>
                    <div className="h-full rounded-full" style={{ width: "5%", background: GREEN }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide" style={{ color: TEXT_MUTED }}>Backlinks</div>
                    <div className="text-lg font-semibold tabular-nums" style={{ color: TEXT }}>142</div>
                    <div className="text-[10px] text-emerald-600">+18 (30d)</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide" style={{ color: TEXT_MUTED }}>Referring Domains</div>
                    <div className="text-lg font-semibold tabular-nums" style={{ color: TEXT }}>38</div>
                    <div className="text-[10px] text-emerald-600">+4 (30d)</div>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* SECTION 5 — COMPETITOR BENCHMARKS */}
          <SectionCard
            number={5}
            title="Competitor Benchmarks"
            summary="7 competitors tracked · 3 high threat · TruMove ranked #18 for primary terms"
          >
            <div className="rounded-xl overflow-x-auto" style={{ border: `1px solid ${BORDER}` }}>
              <table className="w-full text-sm">
                {tableHead(["Competitor", "DA", "Organic", "Paid", "Keywords", "Threat", "Recent Changes"])}
                <tbody>
                  {competitors.map((c) => (
                    <tr key={c.name} className="hover:bg-slate-50" style={{ borderBottom: `1px solid ${BORDER}`, height: 54 }}>
                      <td className="px-3 font-medium" style={{ color: TEXT }}>{c.name}</td>
                      <td className="px-3 text-right tabular-nums" style={{ color: TEXT }}>{c.da}</td>
                      <td className="px-3 text-right tabular-nums" style={{ color: TEXT_SECONDARY }}>{c.organic}</td>
                      <td className="px-3 text-right tabular-nums" style={{ color: TEXT_SECONDARY }}>{c.paid}</td>
                      <td className="px-3 text-right tabular-nums" style={{ color: TEXT }}>{c.kws.toLocaleString()}</td>
                      <td className="px-3 text-right"><ThreatBadge level={c.threat} /></td>
                      <td className="px-3 text-right text-xs" style={{ color: TEXT_SECONDARY }}>{c.change}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <div className="rounded-xl bg-white p-4" style={{ border: `1px solid ${BORDER}` }}>
                <h5 className="text-xs font-semibold mb-1" style={{ color: TEXT }}>Keyword Gap</h5>
                <p className="text-[11px] mb-3" style={{ color: TEXT_MUTED }}>High-value keywords competitors rank for that TruMove doesn't</p>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-semibold tabular-nums" style={{ color: TEXT }}>284</div>
                  <div className="text-xs" style={{ color: TEXT_SECONDARY }}>missed keywords</div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <MiniStat label="High Vol" value="62" />
                  <MiniStat label="Med Vol" value="118" />
                  <MiniStat label="Low Vol" value="104" />
                </div>
              </div>
              <div className="rounded-xl bg-white p-4" style={{ border: `1px solid ${BORDER}` }}>
                <h5 className="text-xs font-semibold mb-2" style={{ color: TEXT }}>Content Velocity (pages / month)</h5>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={contentVelocity} layout="vertical" margin={{ left: 0 }}>
                    <CartesianGrid stroke={BORDER} strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: TEXT_SECONDARY }} width={140} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="pages" radius={[0, 4, 4, 0]}>
                      {contentVelocity.map((c, i) => (
                        <Cell key={i} fill={c.name === "TruMove" ? GREEN : "#1A365D"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </SectionCard>

          {/* SECTION 6 — BUDGET & SPEND */}
          <SectionCard
            number={6}
            title="Budget & Spend"
            summary="Total spend $11.7K (7d) · Pacing 102% · Best ROI: Google Brand"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white p-4" style={{ border: `1px solid ${BORDER}` }}>
                <h5 className="text-xs font-semibold mb-2" style={{ color: TEXT }}>Spend Allocation</h5>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={spendAllocation} dataKey="value" cx="50%" cy="50%" innerRadius={48} outerRadius={78} paddingAngle={3}>
                      {spendAllocation.map((_, i) => <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                <div className="px-3 py-2.5" style={{ borderBottom: `1px solid ${BORDER}`, background: "#FAFBFC" }}>
                  <h5 className="text-xs font-semibold" style={{ color: TEXT }}>Spend vs Target</h5>
                </div>
                <table className="w-full text-sm">
                  {tableHead(["Channel", "Daily Budget", "Daily Actual", "Pacing"])}
                  <tbody>
                    {spendVsTarget.map((s) => (
                      <tr key={s.ch} className="hover:bg-slate-50" style={{ borderBottom: `1px solid ${BORDER}`, height: 48 }}>
                        <td className="px-3 text-xs" style={{ color: TEXT }}>{s.ch}</td>
                        <td className="px-3 text-right tabular-nums text-xs" style={{ color: TEXT_SECONDARY }}>${s.budget}</td>
                        <td className="px-3 text-right tabular-nums text-xs" style={{ color: TEXT }}>${s.actual}</td>
                        <td className={cn("px-3 text-right tabular-nums text-xs font-medium", s.pacing > 110 ? "text-red-500" : s.pacing < 90 ? "text-amber-600" : "text-emerald-600")}>
                          {s.pacing}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 mt-4" style={{ border: `1px solid ${BORDER}` }}>
              <h5 className="text-xs font-semibold mb-2" style={{ color: TEXT }}>ROI by Channel</h5>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={roiByChannel}>
                  <CartesianGrid stroke={BORDER} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="ch" tick={{ fontSize: 11, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: TEXT_MUTED }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}x`} />
                  <Tooltip formatter={(v: number) => `${v}x ROAS`} contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="roas" fill={GREEN} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-xs mt-4 px-3 py-2.5 rounded-lg" style={{ background: GREEN_SOFT, border: `1px solid ${GREEN_BORDER}`, color: TEXT_SECONDARY }}>
              Recommended budget reallocations are available in the <span className="font-semibold" style={{ color: TEXT }}>Action Dashboard</span>.
            </div>
          </SectionCard>
        </div>
      </div>
    </MarketingShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Tiny inline sparkline                                               */
/* ------------------------------------------------------------------ */
function Sparkline({ trend }: { trend: "up" | "down" }) {
  const data = trend === "up"
    ? [3, 4, 3, 5, 4, 6, 7]
    : [7, 6, 7, 5, 6, 4, 3];
  const w = 60, h = 18;
  const max = Math.max(...data), min = Math.min(...data);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="inline-block">
      <polyline
        fill="none"
        stroke={trend === "up" ? GREEN : "#DC2626"}
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  );
}
