import MarketingShell from "@/components/layout/MarketingShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, AlertTriangle, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Target, Users, Percent, Award, ShieldCheck } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const depData = [
  { name: "Owned", value: 38, color: "#16a34a" },
  { name: "Bought", value: 62, color: "#3b82f6" },
];

const VENDORS = [
  { name: "BudgetVanLines", score: "—", closeRate: "—", cpl: "—", costBook: "—", contactRate: "—", compliance: "—", sentiment: "—", trend: "→", alert: null },
  { name: "ResultCalls", score: "—", closeRate: "—", cpl: "—", costBook: "—", contactRate: "—", compliance: "—", sentiment: "—", trend: "→", alert: null },
  { name: "Billy.com", score: "—", closeRate: "—", cpl: "—", costBook: "—", contactRate: "—", compliance: "—", sentiment: "—", trend: "→", alert: null },
  { name: "MoveAdvisor", score: "—", closeRate: "—", cpl: "—", costBook: "—", contactRate: "—", compliance: "—", sentiment: "—", trend: "→", alert: null },
];

const OWNED_VS_BOUGHT = [
  { source: "Google Organic", leads: "—", closeRate: "—", cpl: "—", costBook: "—", revLead: "—", callDur: "—", speed: "—" },
  { source: "Google Ads Brand", leads: "—", closeRate: "—", cpl: "—", costBook: "—", revLead: "—", callDur: "—", speed: "—" },
  { source: "Google Ads Non-Brand", leads: "—", closeRate: "—", cpl: "—", costBook: "—", revLead: "—", callDur: "—", speed: "—" },
  { source: "Meta Ads", leads: "—", closeRate: "—", cpl: "—", costBook: "—", revLead: "—", callDur: "—", speed: "—" },
];

function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="p-3.5">
        <div className="flex items-start justify-between mb-1.5">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Icon className="w-3.5 h-3.5 text-primary" />
          </div>
        </div>
        <div className="text-xl font-bold text-foreground">{value}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
      </CardContent>
    </Card>
  );
}

function RingChart({ score, label }: { score: number; label: string }) {
  const data = [
    { name: "Score", value: score, color: label === "Owned Leads" ? "#16a34a" : "#3b82f6" },
    { name: "Rest", value: 100 - score, color: "#e5e7eb" },
  ];
  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width={120} height={120}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={55} startAngle={90} endAngle={-270} dataKey="value">
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center -mt-2">
        <div className="text-lg font-bold text-foreground">{score}</div>
        <div className="text-[10px] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

export default function MarketingLeadSources() {
  return (
    <MarketingShell breadcrumb="Lead Sources">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Lead Sources
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Vendor scores, compliance & lead quality
          </p>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <MetricCard label="Total Vendor Leads (30d)" value="0" icon={Users} />
          <MetricCard label="Avg Vendor Score" value="—" icon={Target} />
          <MetricCard label="Owned vs Bought" value="38% / 62%" icon={Percent} />
          <MetricCard label="Best Vendor" value="—" icon={Award} />
          <MetricCard label="Worst Vendor" value="—" icon={AlertTriangle} />
        </div>

        {/* Vendor Scorecard */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Vendor Scorecard</CardTitle>
            <CardDescription className="text-xs">Connect your sales data to activate vendor scoring.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-card border border-border rounded-xl overflow-x-auto">
              <table className="w-full text-xs min-w-[800px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Vendor</th>
                    <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Score</th>
                    <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Close Rate</th>
                    <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">CPL</th>
                    <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Cost/Book</th>
                    <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Contact Rate</th>
                    <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Compliance</th>
                    <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Sentiment</th>
                    <th className="text-center px-3 py-2.5 text-muted-foreground font-medium">Trend</th>
                    <th className="text-center px-3 py-2.5 text-muted-foreground font-medium">Alert</th>
                  </tr>
                </thead>
                <tbody>
                  {VENDORS.map((v) => (
                    <tr key={v.name} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{v.name}</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">{v.score}</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">{v.closeRate}</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">{v.cpl}</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">{v.costBook}</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">{v.contactRate}</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">{v.compliance}</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">{v.sentiment}</td>
                      <td className="px-3 py-3 text-center text-muted-foreground">{v.trend}</td>
                      <td className="px-3 py-3 text-center">—</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">Connect your sales data to activate vendor scoring.</p>
          </CardContent>
        </Card>

        {/* Owned vs Bought */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Owned vs Bought Comparison</CardTitle>
            <CardDescription className="text-xs">Source performance once data is connected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-card border border-border rounded-xl overflow-x-auto">
              <table className="w-full text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Source</th>
                    <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Leads</th>
                    <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Close Rate</th>
                    <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">CPL</th>
                    <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Cost/Book</th>
                    <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Rev/Lead</th>
                    <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Avg Call Dur</th>
                    <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Speed-to-Lead</th>
                  </tr>
                </thead>
                <tbody>
                  {OWNED_VS_BOUGHT.map((row) => (
                    <tr key={row.source} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{row.source}</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">{row.leads}</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">{row.closeRate}</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">{row.cpl}</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">{row.costBook}</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">{row.revLead}</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">{row.callDur}</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">{row.speed}</td>
                    </tr>
                  ))}
                  {VENDORS.map((v) => (
                    <tr key={v.name} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium text-muted-foreground">{v.name}</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">—</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">—</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">—</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">—</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">—</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">—</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">—</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dependency Ratio */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Dependency Ratio</CardTitle>
              <CardDescription className="text-xs">Target: &lt;50% vendor dependency within 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={depData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {depData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-muted-foreground text-center mt-2">38% owned / 62% bought — placeholder data</p>
            </CardContent>
          </Card>

          {/* Compliance & Sentiment */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Compliance & Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-6">
                <RingChart score={86} label="Owned Leads" />
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-600">+42</div>
                  <div className="text-[10px] text-muted-foreground">points ahead</div>
                </div>
                <RingChart score={44} label="Vendor Avg" />
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-4 leading-relaxed max-w-md mx-auto">
                Compliance scoring uses consent verification, TCPA checks, source URL tracking, and response time. Sentiment scoring uses call duration, follow-through rate, and contact attempts. Connect your dialer and sales data to activate.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MarketingShell>
  );
}
