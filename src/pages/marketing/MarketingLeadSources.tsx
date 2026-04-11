import MarketingShell from "@/components/layout/MarketingShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const depData = [
  { name: "Owned", value: 35, color: "#16a34a" },
  { name: "Bought", value: 65, color: "#3b82f6" },
];

export default function MarketingLeadSources() {
  return (
    <MarketingShell breadcrumb="Lead Sources">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Lead Sources
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track lead source quality and vendor performance. Connect your sales data to activate scoring.
          </p>
        </div>

        {/* Vendor Scorecard */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Vendor Scorecard</CardTitle>
            <CardDescription>Connect sales data to populate vendor performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Vendor</th>
                    <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Score</th>
                    <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Close Rate</th>
                    <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">CPL</th>
                    <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Cost/Book</th>
                    <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Contact Rate</th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Trend</th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Alert</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      <AlertTriangle className="w-5 h-5 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No vendor data yet</p>
                      <p className="text-xs mt-1">Connect your CRM sales data to activate vendor scoring</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Owned vs Bought */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Owned vs Bought Comparison</CardTitle>
              <CardDescription>Source performance once data is connected</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Source</th>
                      <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Leads</th>
                      <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Close Rate</th>
                      <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">CPL</th>
                      <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Cost/Book</th>
                      <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Rev/Lead</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="px-4 py-3 font-medium">Owned (Organic/Direct)</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">—</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">—</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">—</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">—</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">—</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Bought (PPC/Vendors)</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">—</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">—</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">—</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">—</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Dependency Ratio */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Dependency Ratio</CardTitle>
              <CardDescription>Owned vs bought lead percentage</CardDescription>
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
            </CardContent>
          </Card>
        </div>

        {/* Compliance & Sentiment */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Compliance & Sentiment</CardTitle>
            <CardDescription>Vendor compliance tracking and customer sentiment analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center text-muted-foreground">
              <p className="text-sm">Coming soon</p>
              <p className="text-xs mt-1">This section will track vendor compliance scores and customer sentiment by lead source.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MarketingShell>
  );
}
