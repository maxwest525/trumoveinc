import { useState, useEffect } from "react";
import MarketingShell from "@/components/layout/MarketingShell";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Shield, TrendingUp, TrendingDown, Link2, Globe, BarChart3, PlusCircle, RefreshCw, Info } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

interface DARecord {
  id: string;
  recorded_at: string;
  domain_authority: number;
  page_authority: number | null;
  trust_flow: number | null;
  citation_flow: number | null;
  total_backlinks: number | null;
  referring_domains: number | null;
  source_tool: string | null;
  notes: string | null;
}

const COMPETITORS = [
  { domain: "yoursite.com", da: 0, color: "#6366f1" },
  { domain: "competitor1.com", da: 38, color: "#f59e0b" },
  { domain: "competitor2.com", da: 45, color: "#10b981" },
  { domain: "competitor3.com", da: 29, color: "#ef4444" },
];

export default function MarketingDomainAuthority() {
  const { toast } = useToast();
  const [history, setHistory] = useState<DARecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    domain_authority: "",
    page_authority: "",
    trust_flow: "",
    citation_flow: "",
    total_backlinks: "",
    referring_domains: "",
    source_tool: "moz",
    notes: "",
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("domain_authority_history")
      .select("*")
      .order("recorded_at", { ascending: true })
      .limit(30);
    if (!error && data) setHistory(data as DARecord[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const latest = history[history.length - 1] ?? null;
  const previous = history[history.length - 2] ?? null;
  const daTrend = latest && previous ? latest.domain_authority - previous.domain_authority : null;

  const chartData = history.map(r => ({
    date: new Date(r.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    DA: r.domain_authority,
    PA: r.page_authority ?? 0,
  }));

  const competitorData = COMPETITORS.map(c => ({
    ...c,
    da: c.domain === "yoursite.com" ? (latest?.domain_authority ?? 0) : c.da,
  }));

  const handleSave = async () => {
    if (!form.domain_authority) {
      toast({ title: "DA score required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await (supabase as any).from("domain_authority_history").insert([{
      domain_authority: Number(form.domain_authority),
      page_authority: form.page_authority ? Number(form.page_authority) : null,
      trust_flow: form.trust_flow ? Number(form.trust_flow) : null,
      citation_flow: form.citation_flow ? Number(form.citation_flow) : null,
      total_backlinks: form.total_backlinks ? Number(form.total_backlinks) : null,
      referring_domains: form.referring_domains ? Number(form.referring_domains) : null,
      source_tool: form.source_tool,
      notes: form.notes || null,
      recorded_at: new Date().toISOString(),
    }]);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "DA score recorded" });
      setDialogOpen(false);
      load();
    }
  };

  const getDATier = (da: number) => {
    if (da >= 60) return { label: "Strong", color: "text-green-600" };
    if (da >= 40) return { label: "Good", color: "text-blue-600" };
    if (da >= 20) return { label: "Fair", color: "text-amber-600" };
    return { label: "Weak", color: "text-red-500" };
  };

  const tier = latest ? getDATier(latest.domain_authority) : null;

  const recommendations = [
    {
      priority: "High",
      action: "Build more dofollow backlinks from DA 40+ domains to accelerate authority growth.",
    },
    {
      priority: "High",
      action: "Create linkable assets (guides, data studies, tools) that naturally attract backlinks.",
    },
    {
      priority: "Medium",
      action: "Pursue guest posting on industry publications with DA above yours.",
    },
    {
      priority: "Medium",
      action: "Fix broken backlinks pointing to your site to recover lost link equity.",
    },
    {
      priority: "Low",
      action: "Disavow spammy or low-quality backlinks that may be hurting your trust flow.",
    },
  ];

  return (
    <MarketingShell breadcrumb="Domain Authority">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Domain Authority</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track your site authority score over time.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              Log New Score
            </Button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* DA Score - prominent */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Domain Authority</p>
                  <p className="text-4xl font-extrabold mt-1 tracking-tight">
                    {latest ? latest.domain_authority : "—"}
                  </p>
                  {tier && <p className={`text-xs font-medium mt-0.5 ${tier.color}`}>{tier.label}</p>}
                </div>
                <Shield className="w-6 h-6 text-primary mt-1" />
              </div>
              {daTrend !== null && (
                <div className="flex items-center gap-1 mt-2">
                  {daTrend >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                  )}
                  <span className={`text-xs font-medium ${daTrend >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {daTrend >= 0 ? "+" : ""}{daTrend} vs last check
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Page Authority</p>
                  <p className="text-2xl font-bold mt-0.5">{latest?.page_authority ?? "—"}</p>
                </div>
                <BarChart3 className="w-5 h-5 text-blue-500 mt-1" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Homepage PA</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Backlinks</p>
                  <p className="text-2xl font-bold mt-0.5">{latest?.total_backlinks?.toLocaleString() ?? "—"}</p>
                </div>
                <Link2 className="w-5 h-5 text-indigo-500 mt-1" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">All inbound links</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Referring Domains</p>
                  <p className="text-2xl font-bold mt-0.5">{latest?.referring_domains?.toLocaleString() ?? "—"}</p>
                </div>
                <Globe className="w-5 h-5 text-emerald-500 mt-1" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Unique linking domains</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* DA History */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">DA History</CardTitle>
              <CardDescription className="text-xs">Authority score over time</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length < 2 ? (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                  <div className="text-center">
                    <Info className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                    <p>Log at least 2 DA entries to see the trend chart.</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="DA" stroke="#6366f1" strokeWidth={2} dot={false} name="Domain Authority" />
                    <Line type="monotone" dataKey="PA" stroke="#10b981" strokeWidth={2} dot={false} name="Page Authority" strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Competitor Comparison */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Competitor DA Comparison</CardTitle>
              <CardDescription className="text-xs">How you stack up</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={competitorData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="domain" type="category" tick={{ fontSize: 10 }} width={90} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Bar dataKey="da" name="Domain Authority" radius={[0, 4, 4, 0]}>
                    {competitorData.map((entry, i) => (
                      <rect key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Authority Building Recommendations</CardTitle>
            <CardDescription className="text-xs">Actions to improve your domain authority score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Badge
                    className={`text-[10px] shrink-0 mt-0.5 ${
                      rec.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : rec.priority === "Medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {rec.priority}
                  </Badge>
                  <p className="text-xs text-foreground">{rec.action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Log Score Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log DA Score</DialogTitle>
            <DialogDescription>
              Enter your current domain authority scores from Moz, Ahrefs, or SEMrush.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Domain Authority *</Label>
              <Input type="number" min={0} max={100} value={form.domain_authority}
                onChange={e => setForm(f => ({ ...f, domain_authority: e.target.value }))}
                placeholder="0–100" className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Page Authority</Label>
              <Input type="number" min={0} max={100} value={form.page_authority}
                onChange={e => setForm(f => ({ ...f, page_authority: e.target.value }))}
                placeholder="0–100" className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Trust Flow</Label>
              <Input type="number" min={0} max={100} value={form.trust_flow}
                onChange={e => setForm(f => ({ ...f, trust_flow: e.target.value }))}
                placeholder="Majestic" className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Citation Flow</Label>
              <Input type="number" min={0} max={100} value={form.citation_flow}
                onChange={e => setForm(f => ({ ...f, citation_flow: e.target.value }))}
                placeholder="Majestic" className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Total Backlinks</Label>
              <Input type="number" min={0} value={form.total_backlinks}
                onChange={e => setForm(f => ({ ...f, total_backlinks: e.target.value }))}
                className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Referring Domains</Label>
              <Input type="number" min={0} value={form.referring_domains}
                onChange={e => setForm(f => ({ ...f, referring_domains: e.target.value }))}
                className="h-8 text-xs" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Notes (optional)</Label>
              <Input value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="e.g. Post link building campaign" className="h-8 text-xs" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Log Score"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MarketingShell>
  );
}
