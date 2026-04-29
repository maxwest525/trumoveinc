import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link2, Shield, TrendingUp, AlertTriangle, Globe, ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TM_CHART } from "@/lib/marketingChartTheme";

const DA_HISTORY = [
  { month: "Oct", da: 12 }, { month: "Nov", da: 14 }, { month: "Dec", da: 16 },
  { month: "Jan", da: 18 }, { month: "Feb", da: 21 }, { month: "Mar", da: 24 },
];

const COMPETITOR_DA = [
  { name: "move.org", da: 72 }, { name: "uship.com", da: 68 }, { name: "bellhop.com", da: 55 },
  { name: "trumoveinc.com", da: 24 }, { name: "billy.com", da: 42 }, { name: "safeship.com", da: 31 },
];

export default function BacklinksAuthorityTab() {
  const [backlinks, setBacklinks] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("backlinks").select("*").order("domain_authority", { ascending: false }).limit(20).then(({ data }) => {
      setBacklinks(data || []);
    });
  }, []);

  const active = backlinks.filter((b) => b.status === "active").length;
  const lost = backlinks.filter((b) => b.status === "lost").length;
  const disavowed = backlinks.filter((b) => b.status === "disavowed").length;

  return (
    <div className="space-y-6 mt-4">
      {/* DA Score + History */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-5xl font-bold text-primary">24</div>
            <p className="text-sm text-muted-foreground mt-1">Domain Authority</p>
            <div className="flex items-center justify-center gap-1 mt-2 text-emerald-600 text-xs font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> +6 last 90 days
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">DA History</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={DA_HISTORY}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 40]} />
                <Tooltip />
                <Area type="monotone" dataKey="da" stroke={TM_CHART.green} fill={TM_CHART.green} fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Competitor DA Comparison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Competitor DA Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {COMPETITOR_DA.sort((a, b) => b.da - a.da).map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className={`text-xs font-medium w-32 truncate ${c.name === "trumoveinc.com" ? "text-primary font-bold" : "text-muted-foreground"}`}>{c.name}</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${c.name === "trumoveinc.com" ? "bg-primary" : "bg-muted-foreground/30"}`} style={{ width: `${c.da}%` }} />
                </div>
                <span className="text-xs font-semibold w-8 text-right">{c.da}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Link Profile */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{active}</div>
            <p className="text-xs text-muted-foreground">Active Links</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-red-600">{lost}</div>
            <p className="text-xs text-muted-foreground">Lost Links</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{disavowed}</div>
            <p className="text-xs text-muted-foreground">Disavowed</p>
          </CardContent>
        </Card>
      </div>

      {/* Backlinks Table */}
      {backlinks.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Link Profile</h3>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Source</th>
                <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">DA</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Anchor</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Type</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {backlinks.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-medium">{b.source_domain}</td>
                  <td className="px-4 py-2.5 text-right">{b.domain_authority}</td>
                  <td className="px-4 py-2.5 text-muted-foreground truncate max-w-[200px]">{b.anchor_text || "—"}</td>
                  <td className="px-4 py-2.5"><Badge variant="outline" className="text-[10px]">{b.follow_type}</Badge></td>
                  <td className="px-4 py-2.5">
                    <Badge variant="outline" className={`text-[10px] ${b.status === "active" ? "text-emerald-600" : b.status === "lost" ? "text-red-600" : "text-amber-600"}`}>
                      {b.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recommendations placeholder */}
      <Card>
        <CardContent className="pt-4">
          <h3 className="text-sm font-semibold mb-2">Authority Building Recommendations</h3>
          <div className="space-y-2">
            {["Submit to FMCSA-related directories (DA 40+)", "Guest post on moving industry blogs", "Build local citations in top 50 metros", "Create linkable assets (cost calculators, route maps)"].map((rec, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <ArrowUpRight className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-xs">{rec}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
