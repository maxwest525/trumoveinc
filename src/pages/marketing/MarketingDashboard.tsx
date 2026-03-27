import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MarketingShell from "@/components/layout/MarketingShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, TrendingUp, Users, DollarSign, MousePointerClick,
  Eye, ArrowUpRight, ArrowDownRight, Target, Percent, Mail, MessageSquare, Settings2,
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, subMonths, subDays, startOfMonth, endOfMonth, differenceInDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface KpiCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  prefix?: string;
}

function KpiCard({ title, value, change, icon: Icon, prefix }: KpiCardProps) {
  const positive = change >= 0;
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{prefix}{value}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3">
          {positive ? (
            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
          ) : (
            <ArrowDownRight className="w-3 h-3 text-destructive" />
          )}
          <span className={`text-xs font-medium ${positive ? "text-emerald-500" : "text-destructive"}`}>
            {positive ? "+" : ""}{change}%
          </span>
          <span className="text-xs text-muted-foreground">vs last month</span>

        </div>
      </CardContent>
    </Card>
  );
}

const STORAGE_KEY = "marketing-dashboard-widgets";

interface WidgetVisibility {
  kpiStrip: boolean;
  trafficChart: boolean;
  conversionChart: boolean;
  channelMix: boolean;
  vendorTable: boolean;
  quickStats: boolean;
}

const defaultVisibility: WidgetVisibility = {
  kpiStrip: true,
  trafficChart: true,
  conversionChart: true,
  channelMix: true,
  vendorTable: true,
  quickStats: true,
};

const widgetLabels: Record<keyof WidgetVisibility, string> = {
  kpiStrip: "KPI Cards",
  trafficChart: "Traffic by Source",
  conversionChart: "Leads → Booked",
  channelMix: "Lead Channel Mix",
  vendorTable: "Lead Vendors",
  quickStats: "Quick Stats",
};

export default function MarketingDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const now = new Date();

  const [widgets, setWidgets] = useState<WidgetVisibility>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultVisibility, ...JSON.parse(saved) } : defaultVisibility;
    } catch { return defaultVisibility; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
  }, [widgets]);

  const toggleWidget = (key: keyof WidgetVisibility) => {
    setWidgets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const rangeStart = useMemo(() => dateRange?.from ?? subDays(now, 30), [dateRange]);
  const rangeEnd = useMemo(() => dateRange?.to ?? now, [dateRange]);

  const prevRangeStart = useMemo(() => {
    const span = differenceInDays(rangeEnd, rangeStart) || 1;
    return subDays(rangeStart, span);
  }, [rangeStart, rangeEnd]);

  const rangeStartIso = rangeStart.toISOString();
  const rangeEndIso = rangeEnd.toISOString();
  const prevRangeStartIso = prevRangeStart.toISOString();
  const prevRangeEndIso = rangeStart.toISOString();

  // Fetch leads
  const { data: allLeads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ["marketing-leads"],
    queryFn: async () => {
      const { data } = await supabase.from("leads").select("id, created_at, source, status");
      return data ?? [];
    },
  });

  // Fetch deals
  const { data: allDeals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ["marketing-deals"],
    queryFn: async () => {
      const { data } = await supabase.from("deals").select("id, created_at, stage, deal_value, lead_id");
      return data ?? [];
    },
  });

  // Fetch vendors for CPL
  const { data: vendors = [] } = useQuery({
    queryKey: ["marketing-vendors"],
    queryFn: async () => {
      const { data } = await supabase.from("lead_vendors").select("id, name, cost_per_lead, monthly_budget");
      return data ?? [];
    },
  });

  const isLoading = leadsLoading || dealsLoading;

  // Computed KPIs
  const kpis = useMemo(() => {
    const thisMonthLeads = allLeads.filter((l) => l.created_at >= rangeStartIso && l.created_at <= rangeEndIso);
    const lastMonthLeads = allLeads.filter((l) => l.created_at >= prevRangeStartIso && l.created_at < prevRangeEndIso);
    const thisMonthDeals = allDeals.filter((d) => d.created_at >= rangeStartIso && d.created_at <= rangeEndIso);
    const lastMonthDeals = allDeals.filter((d) => d.created_at >= prevRangeStartIso && d.created_at < prevRangeEndIso);

    const booked = thisMonthDeals.filter((d) => ["booked", "dispatched", "in_transit", "delivered", "closed_won"].includes(d.stage));
    const lastBooked = lastMonthDeals.filter((d) => ["booked", "dispatched", "in_transit", "delivered", "closed_won"].includes(d.stage));

    const totalLeads = thisMonthLeads.length;
    const lastTotalLeads = lastMonthLeads.length;
    const leadChange = lastTotalLeads > 0 ? ((totalLeads - lastTotalLeads) / lastTotalLeads) * 100 : 0;

    const convRate = totalLeads > 0 ? (booked.length / totalLeads) * 100 : 0;
    const lastConvRate = lastTotalLeads > 0 ? (lastBooked.length / lastTotalLeads) * 100 : 0;
    const convChange = lastConvRate > 0 ? ((convRate - lastConvRate) / lastConvRate) * 100 : 0;

    const avgCpl = vendors.length > 0
      ? vendors.reduce((s, v) => s + (v.cost_per_lead ?? 0), 0) / vendors.filter((v) => (v.cost_per_lead ?? 0) > 0).length || 0
      : 0;

    return { totalLeads, leadChange, convRate, convChange, avgCpl, booked: booked.length };
  }, [allLeads, allDeals, vendors, rangeStartIso, rangeEndIso, prevRangeStartIso, prevRangeEndIso]);

  // Monthly trend data (last 6 months)
  const conversionData = useMemo(() => {
    const months: { month: string; start: string; end: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      months.push({ month: format(d, "MMM"), start: startOfMonth(d).toISOString(), end: endOfMonth(d).toISOString() });
    }
    return months.map((m) => {
      const leads = allLeads.filter((l) => l.created_at >= m.start && l.created_at <= m.end).length;
      const booked = allDeals.filter((d) => d.created_at >= m.start && d.created_at <= m.end && ["booked", "dispatched", "in_transit", "delivered", "closed_won"].includes(d.stage)).length;
      return { month: m.month, leads, booked };
    });
  }, [allLeads, allDeals]);

  // Channel breakdown from lead source
  const channelBreakdown = useMemo(() => {
    const thisMonthLeads = allLeads.filter((l) => l.created_at >= rangeStartIso && l.created_at <= rangeEndIso);
    const total = thisMonthLeads.length || 1;
    const sourceMap: Record<string, { label: string; color: string }> = {
      ppc: { label: "PPC / Google Ads", color: "hsl(var(--primary))" },
      website: { label: "Organic / Website", color: "hsl(var(--accent-foreground))" },
      referral: { label: "Referral", color: "hsl(var(--muted-foreground))" },
      phone: { label: "Phone / Direct", color: "hsl(var(--secondary-foreground))" },
      walk_in: { label: "Walk-in", color: "hsl(var(--destructive))" },
      other: { label: "Other", color: "hsl(var(--muted-foreground) / 0.6)" },
    };
    const counts: Record<string, number> = {};
    thisMonthLeads.forEach((l) => { counts[l.source] = (counts[l.source] || 0) + 1; });
    return Object.entries(counts)
      .map(([src, count]) => ({
        name: sourceMap[src]?.label ?? src,
        value: Math.round((count / total) * 100),
        color: sourceMap[src]?.color ?? "hsl(var(--muted-foreground))",
      }))
      .sort((a, b) => b.value - a.value);
  }, [allLeads, rangeStartIso, rangeEndIso]);

  // Lead source trend (last 6 months)
  const trafficData = useMemo(() => {
    const months: { month: string; start: string; end: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      months.push({ month: format(d, "MMM"), start: startOfMonth(d).toISOString(), end: endOfMonth(d).toISOString() });
    }
    return months.map((m) => {
      const ml = allLeads.filter((l) => l.created_at >= m.start && l.created_at <= m.end);
      return {
        month: m.month,
        organic: ml.filter((l) => l.source === "website").length,
        paid: ml.filter((l) => l.source === "ppc").length,
        referral: ml.filter((l) => ["referral", "phone", "walk_in", "other"].includes(l.source)).length,
      };
    });
  }, [allLeads]);

  // Vendor table as "campaigns"
  const campaignRows = useMemo(() => {
    return vendors.map((v) => {
      const vendorLeads = allLeads.filter((l) => l.source === "ppc").length; // approximate
      return {
        name: v.name,
        spend: v.monthly_budget ?? 0,
        leads: vendorLeads,
        cpl: v.cost_per_lead ?? 0,
      };
    });
  }, [vendors, allLeads]);

  return (
    <MarketingShell breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Marketing Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              High-level KPIs across all channels — updated daily.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 px-3">
                  <Settings2 className="w-3.5 h-3.5" />
                  Customize
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" align="end">
                <p className="text-xs font-semibold text-foreground mb-3">Show / Hide Widgets</p>
                <div className="space-y-2.5">
                  {(Object.keys(widgetLabels) as (keyof WidgetVisibility)[]).map((key) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={`w-${key}`} className="text-xs text-muted-foreground cursor-pointer">{widgetLabels[key]}</Label>
                      <Switch id={`w-${key}`} checked={widgets[key]} onCheckedChange={() => toggleWidget(key)} className="scale-75" />
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-8 text-xs gap-1.5 px-3")}>
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {dateRange?.from
                    ? `${format(dateRange.from, "MMM d, yyyy")}${dateRange.to ? ` – ${format(dateRange.to, "MMM d, yyyy")}` : ""}`
                    : "Select dates"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {isLoading ? (
            <>
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
            </>
          ) : (
            <>
              <KpiCard title="Total Leads" value={kpis.totalLeads.toString()} change={Math.round(kpis.leadChange * 10) / 10} icon={Users} />
              <KpiCard title="Avg Cost per Lead" value={kpis.avgCpl.toFixed(2)} change={0} icon={DollarSign} prefix="$" />
              <KpiCard title="Booked Deals" value={kpis.booked.toString()} change={0} icon={Target} />
              <KpiCard title="Conversion Rate" value={`${kpis.convRate.toFixed(1)}%`} change={Math.round(kpis.convChange * 10) / 10} icon={Percent} />
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Traffic Trend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Traffic by Source
              </CardTitle>
              <CardDescription className="text-xs">Sessions over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="organic" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.3)" />
                    <Area type="monotone" dataKey="paid" stackId="1" stroke="hsl(var(--accent-foreground))" fill="hsl(var(--accent-foreground) / 0.2)" />
                    <Area type="monotone" dataKey="referral" stackId="1" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground) / 0.15)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Leads vs Booked */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> Leads → Booked
              </CardTitle>
              <CardDescription className="text-xs">Monthly conversion funnel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={conversionData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="leads" fill="hsl(var(--primary) / 0.4)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="booked" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Channel Mix */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-primary" /> Lead Channel Mix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={channelBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                      {channelBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}%`} contentStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                {channelBreakdown.map((ch) => (
                  <div key={ch.name} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: ch.color }} />
                    <span className="text-[11px] text-muted-foreground truncate">{ch.name}</span>
                    <span className="text-[11px] font-medium text-foreground ml-auto">{ch.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Campaign Performance Table */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Lead Vendors
              </CardTitle>
              <CardDescription className="text-xs">Vendor spend & lead cost</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left font-medium px-5 py-2.5">Vendor</th>
                      <th className="text-right font-medium px-3 py-2.5">Spend</th>
                      <th className="text-right font-medium px-5 py-2.5">CPL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignRows.length === 0 && (
                      <tr><td colSpan={3} className="text-center text-muted-foreground py-6">No vendors configured</td></tr>
                    )}
                    {campaignRows.map((c, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/40">
                        <td className="px-5 py-2.5 font-medium text-foreground">{c.name}</td>
                        <td className="text-right px-3 py-2.5">${c.spend.toLocaleString()}</td>
                        <td className="text-right px-5 py-2.5">${c.cpl.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard title="Total Leads (All Time)" value={allLeads.length.toString()} change={0} icon={Users} />
          <KpiCard title="Total Deals" value={allDeals.length.toString()} change={0} icon={Target} />
          <KpiCard title="PPC Leads" value={allLeads.filter(l => l.source === "ppc" && l.created_at >= rangeStartIso).length.toString()} change={0} icon={MousePointerClick} />
          <KpiCard title="Referral" value={allLeads.filter(l => l.source === "referral" && l.created_at >= rangeStartIso).length.toString()} change={0} icon={TrendingUp} />
        </div>
      </div>
    </MarketingShell>
  );
}