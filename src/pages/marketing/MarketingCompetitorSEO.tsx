import MarketingShell from "@/components/layout/MarketingShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Swords, TrendingUp, Globe, AlertTriangle, Eye } from "lucide-react";

const competitors = [
  { name: "move.org", domain: "move.org", organicTraffic: "2.1M", paidTraffic: "320K", keywords: "14,200", threat: "High" },
  { name: "uShip", domain: "uship.com", organicTraffic: "890K", paidTraffic: "210K", keywords: "8,400", threat: "High" },
  { name: "Bellhop", domain: "bellhop.com", organicTraffic: "340K", paidTraffic: "95K", keywords: "3,200", threat: "Medium" },
  { name: "Billy.com", domain: "billy.com", organicTraffic: "280K", paidTraffic: "60K", keywords: "2,900", threat: "Medium" },
  { name: "SafeShip", domain: "safeship.com", organicTraffic: "145K", paidTraffic: "40K", keywords: "1,800", threat: "Low" },
  { name: "BudgetVanLines", domain: "budgetvanlines.com", organicTraffic: "120K", paidTraffic: "30K", keywords: "1,600", threat: "Low" },
  { name: "MoveAdvisor", domain: "moveadvisor.com", organicTraffic: "98K", paidTraffic: "18K", keywords: "1,200", threat: "Low" },
];

const threatColors: Record<string, string> = {
  High: "text-red-600 bg-red-50",
  Medium: "text-yellow-600 bg-yellow-50",
  Low: "text-green-600 bg-green-50",
};

export default function MarketingCompetitorSEO() {
  return (
    <MarketingShell breadcrumb="Competitors">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Competitors
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Tracking, gaps & market intel</p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            + Add Competitor
          </button>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Tracked Competitors</h2>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Competitor</th>
                <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Organic Traffic</th>
                <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Paid Traffic</th>
                <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Keywords</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Threat Level</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((c) => (
                <tr key={c.name} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-medium">{c.name}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{c.domain}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{c.organicTraffic}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{c.paidTraffic}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{c.keywords}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${threatColors[c.threat]}`}>
                      {c.threat}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-primary hover:underline text-[11px] font-medium">Analyze</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Changes This Week */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Changes This Week</CardTitle>
            <CardDescription>Detected changes in competitor strategies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-6 text-center text-muted-foreground">
              <AlertTriangle className="w-5 h-5 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No changes detected this week</p>
              <p className="text-xs mt-1">Competitor monitoring will surface ranking changes, new content, and ad activity here.</p>
            </div>
          </CardContent>
        </Card>

        {/* Keyword Gaps */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Keyword Gaps</CardTitle>
            <CardDescription>Keywords competitors rank for that TruMove doesn't</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-6 text-center text-muted-foreground">
              <Globe className="w-5 h-5 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Connect SEO tools to identify keyword gaps</p>
              <p className="text-xs mt-1">This section will show high-value keywords where competitors outrank TruMove.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MarketingShell>
  );
}
