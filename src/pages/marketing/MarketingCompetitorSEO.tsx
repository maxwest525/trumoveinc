import MarketingShell from "@/components/layout/MarketingShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Globe, AlertTriangle, Eye, Bell, Search } from "lucide-react";

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
      <div className="space-y-5">
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

        {/* Tracked Competitors */}
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
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" /> Changes This Week
            </CardTitle>
            <CardDescription className="text-xs">Competitor changes will appear here when automated monitoring is active. Connect HyperFX to activate.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Grayed out example */}
              <div className="p-3 rounded-lg border border-dashed border-border/60 bg-muted/20 opacity-50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="font-medium">BudgetVanLines</span>
                  <span>published 2 new state pages</span>
                  <span className="text-[10px] ml-auto">Example</span>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-dashed border-border/60 bg-muted/20 opacity-50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="font-medium">move.org</span>
                  <span>increased Google Ads spend by 18%</span>
                  <span className="text-[10px] ml-auto">Example</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Keyword Gaps */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" /> Keyword Gaps
            </CardTitle>
            <CardDescription className="text-xs">Keywords your competitors rank for that you don't. Connect a keyword data source to activate.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Keyword</TableHead>
                  <TableHead className="text-xs text-right">Volume</TableHead>
                  <TableHead className="text-xs text-right">Difficulty</TableHead>
                  <TableHead className="text-xs">Competitors Ranking</TableHead>
                  <TableHead className="text-xs text-right">Your Position</TableHead>
                  <TableHead className="text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="opacity-40">
                  <TableCell className="text-xs text-muted-foreground">long distance movers near me</TableCell>
                  <TableCell className="text-xs text-right text-muted-foreground">8,100</TableCell>
                  <TableCell className="text-xs text-right text-muted-foreground">72</TableCell>
                  <TableCell className="text-xs text-muted-foreground">move.org, uShip</TableCell>
                  <TableCell className="text-xs text-right text-muted-foreground">—</TableCell>
                  <TableCell className="text-xs text-primary">Create page</TableCell>
                </TableRow>
                <TableRow className="opacity-40">
                  <TableCell className="text-xs text-muted-foreground">cheapest way to move cross country</TableCell>
                  <TableCell className="text-xs text-right text-muted-foreground">5,400</TableCell>
                  <TableCell className="text-xs text-right text-muted-foreground">58</TableCell>
                  <TableCell className="text-xs text-muted-foreground">Bellhop, Billy.com</TableCell>
                  <TableCell className="text-xs text-right text-muted-foreground">—</TableCell>
                  <TableCell className="text-xs text-primary">Create page</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p className="text-[10px] text-muted-foreground text-center mt-3">Example data shown. Connect a keyword data source to populate with real gaps.</p>
          </CardContent>
        </Card>
      </div>
    </MarketingShell>
  );
}
