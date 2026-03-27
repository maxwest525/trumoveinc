import { useMemo } from "react";
import MarketingShell from "@/components/layout/MarketingShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, TrendingUp, Users, DollarSign, MousePointerClick,
  Eye, ArrowUpRight, ArrowDownRight, Target, Percent, Mail, MessageSquare,
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const trafficData = [
  { month: "Oct", organic: 1240, paid: 890, referral: 320 },
  { month: "Nov", organic: 1480, paid: 1120, referral: 410 },
  { month: "Dec", organic: 1320, paid: 960, referral: 380 },
  { month: "Jan", organic: 1690, paid: 1340, referral: 520 },
  { month: "Feb", organic: 1850, paid: 1580, referral: 610 },
  { month: "Mar", organic: 2120, paid: 1720, referral: 690 },
];

const conversionData = [
  { month: "Oct", leads: 84, booked: 31 },
  { month: "Nov", leads: 112, booked: 42 },
  { month: "Dec", leads: 96, booked: 38 },
  { month: "Jan", leads: 134, booked: 56 },
  { month: "Feb", leads: 148, booked: 61 },
  { month: "Mar", leads: 172, booked: 74 },
];

const channelBreakdown = [
  { name: "PPC / Google Ads", value: 42, color: "hsl(var(--primary))" },
  { name: "Organic / SEO", value: 28, color: "hsl(var(--accent-foreground))" },
  { name: "Referral", value: 15, color: "hsl(var(--muted-foreground))" },
  { name: "Direct", value: 10, color: "hsl(var(--secondary-foreground))" },
  { name: "Social / Meta", value: 5, color: "hsl(var(--destructive))" },
];

const campaignRows = [
  { name: "Google — Long Distance Moving", spend: 4200, clicks: 1840, leads: 62, cpl: 67.74, conv: 3.37 },
  { name: "Google — Cross Country Movers", spend: 3100, clicks: 1320, leads: 41, cpl: 75.61, conv: 3.11 },
  { name: "Meta — Interstate Retarget", spend: 1800, clicks: 920, leads: 28, cpl: 64.29, conv: 3.04 },
  { name: "Google — Brand", spend: 600, clicks: 480, leads: 18, cpl: 33.33, conv: 3.75 },
];

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

export default function MarketingDashboard() {
  return (
    <MarketingShell breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Marketing Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            High-level KPIs across all channels — updated daily.
          </p>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard title="Total Leads" value="172" change={16.2} icon={Users} />
          <KpiCard title="Cost per Lead" value="68.40" change={-4.8} icon={DollarSign} prefix="$" />
          <KpiCard title="Website Sessions" value="4,530" change={14.6} icon={Eye} />
          <KpiCard title="Conversion Rate" value="3.8%" change={8.1} icon={Percent} />
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
                <BarChart3 className="w-4 h-4 text-primary" /> Active Campaigns
              </CardTitle>
              <CardDescription className="text-xs">Current month performance</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left font-medium px-5 py-2.5">Campaign</th>
                      <th className="text-right font-medium px-3 py-2.5">Spend</th>
                      <th className="text-right font-medium px-3 py-2.5">Clicks</th>
                      <th className="text-right font-medium px-3 py-2.5">Leads</th>
                      <th className="text-right font-medium px-3 py-2.5">CPL</th>
                      <th className="text-right font-medium px-5 py-2.5">Conv %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignRows.map((c) => (
                      <tr key={c.name} className="border-b last:border-0 hover:bg-muted/40">
                        <td className="px-5 py-2.5 font-medium text-foreground">{c.name}</td>
                        <td className="text-right px-3 py-2.5">${c.spend.toLocaleString()}</td>
                        <td className="text-right px-3 py-2.5">{c.clicks.toLocaleString()}</td>
                        <td className="text-right px-3 py-2.5">{c.leads}</td>
                        <td className="text-right px-3 py-2.5">${c.cpl.toFixed(2)}</td>
                        <td className="text-right px-5 py-2.5">
                          <Badge variant={c.conv >= 3.5 ? "default" : "secondary"} className="text-[10px]">
                            {c.conv.toFixed(2)}%
                          </Badge>
                        </td>
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
          <KpiCard title="Email Open Rate" value="24.3%" change={2.1} icon={Mail} />
          <KpiCard title="SMS Response Rate" value="18.7%" change={5.4} icon={MessageSquare} />
          <KpiCard title="Ad Spend (MTD)" value="9,700" change={12.3} icon={DollarSign} prefix="$" />
          <KpiCard title="ROAS" value="4.2x" change={6.8} icon={TrendingUp} />
        </div>
      </div>
    </MarketingShell>
  );
}