import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Link2, Loader2, ArrowUpDown, TrendingUp } from "lucide-react";
import type { PhaseStatus, GA4PageData } from "./types";

const mockGA4Data: GA4PageData[] = [
  { url: "https://trumoveinc.com", sessions: 14200, conversions: 340, conversionRate: 2.4, bounceRate: 42, avgEngagementTime: 85 },
  { url: "https://trumoveinc.com/online-estimate", sessions: 6800, conversions: 520, conversionRate: 7.6, bounceRate: 28, avgEngagementTime: 210 },
  { url: "https://trumoveinc.com/book", sessions: 3200, conversions: 280, conversionRate: 8.8, bounceRate: 35, avgEngagementTime: 180 },
  { url: "https://trumoveinc.com/about", sessions: 2100, conversions: 45, conversionRate: 2.1, bounceRate: 55, avgEngagementTime: 60 },
  { url: "https://trumoveinc.com/faq", sessions: 1800, conversions: 32, conversionRate: 1.8, bounceRate: 48, avgEngagementTime: 95 },
  { url: "https://trumoveinc.com/vetting", sessions: 950, conversions: 18, conversionRate: 1.9, bounceRate: 52, avgEngagementTime: 70 },
];

interface GA4TabProps {
  status: PhaseStatus;
}

export default function GA4Tab({ status }: GA4TabProps) {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(status === "connected");
  const [sortBy, setSortBy] = useState<"sessions" | "conversions" | "conversionRate">("conversionRate");

  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 2000);
  };

  if (!connected) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Connect Google Analytics 4</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Pull session and conversion data per URL to prioritize SEO fixes by actual business impact — focus on pages that drive bookings.
              </p>
            </div>
            <Button onClick={handleConnect} disabled={connecting} size="lg">
              {connecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
              {connecting ? "Connecting…" : "Connect GA4"}
            </Button>
            <p className="text-[11px] text-muted-foreground">Requires GA4 property configured for trumoveinc.com</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sorted = [...mockGA4Data].sort((a, b) => b[sortBy] - a[sortBy]);
  const totalSessions = mockGA4Data.reduce((s, d) => s + d.sessions, 0);
  const totalConversions = mockGA4Data.reduce((s, d) => s + d.conversions, 0);

  return (
    <div className="space-y-4">
      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{totalSessions.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">Total Sessions</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{totalConversions.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">Total Conversions</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {totalSessions > 0 ? ((totalConversions / totalSessions) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-[11px] text-muted-foreground">Avg Conversion Rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> GA4 Page Performance
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Ranked by conversion impact — fix high-converting pages first (demo data)
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="default" className="text-[10px]">Connected</Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] gap-1"
                onClick={() => setSortBy(sortBy === "conversionRate" ? "sessions" : sortBy === "sessions" ? "conversions" : "conversionRate")}
              >
                <ArrowUpDown className="w-3 h-3" />
                Sort: {sortBy === "conversionRate" ? "CVR" : sortBy === "sessions" ? "Sessions" : "Conversions"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[5%]">#</TableHead>
                <TableHead className="w-[35%]">Page</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">CVR</TableHead>
                <TableHead className="text-right">Bounce</TableHead>
                <TableHead className="text-right">Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((page, i) => (
                <TableRow key={page.url}>
                  <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                  <TableCell>
                    <p className="font-mono text-xs truncate">{page.url.replace("https://trumoveinc.com", "") || "/"}</p>
                  </TableCell>
                  <TableCell className="text-right text-sm">{page.sessions.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm font-medium">{page.conversions}</TableCell>
                  <TableCell className="text-right text-sm">
                    <span className={page.conversionRate >= 5 ? "text-primary font-medium" : ""}>
                      {page.conversionRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{page.bounceRate}%</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={i < 2 ? "default" : "secondary"} className="text-[9px]">
                      {i < 2 ? (
                        <><TrendingUp className="w-2.5 h-2.5 mr-0.5" /> High</>
                      ) : i < 4 ? "Medium" : "Low"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
