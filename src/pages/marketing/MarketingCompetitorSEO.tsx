import MarketingShell from "@/components/layout/MarketingShell";
import { Swords, TrendingUp, Globe, AlertTriangle } from "lucide-react";

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
    <MarketingShell breadcrumb="Competitor Intel">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Swords className="w-5 h-5 text-primary" />
              Competitor Intelligence
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">SEO and paid traffic analysis for TruMove's top competitors</p>
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
      </div>
    </MarketingShell>
  );
}
