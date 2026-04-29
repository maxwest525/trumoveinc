import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import {
  TrendingUp, Users, DollarSign, Target, Settings, Loader2, Save,
  AlertCircle, CheckCircle, ArrowRight, Zap, ArrowUpRight, ArrowDownRight, Percent,
} from "lucide-react";
import MarketingShell from "@/components/layout/MarketingShell";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

// ─── Static sample data ─────
const trafficData = [
  { month: "Oct", organic: 0, paid: 0, direct: 40 },
  { month: "Nov", organic: 120, paid: 80, direct: 55 },
  { month: "Dec", organic: 180, paid: 140, direct: 70 },
  { month: "Jan", organic: 240, paid: 190, direct: 85 },
  { month: "Feb", organic: 310, paid: 220, direct: 90 },
  { month: "Mar", organic: 420, paid: 280, direct: 110 },
];

const leadData = [
  { month: "Oct", leads: 12, booked: 3 },
  { month: "Nov", leads: 28, booked: 8 },
  { month: "Dec", leads: 41, booked: 14 },
  { month: "Jan", leads: 55, booked: 19 },
  { month: "Feb", leads: 68, booked: 24 },
  { month: "Mar", leads: 84, booked: 31 },
];

// TruMove brand palette: Navy + Green accents
const TM_NAVY = "#1A365D";
const TM_NAVY_LIGHT = "#2C5282";
const TM_GREEN = "#22C55E";
const TM_GREEN_DEEP = "#15803D";
const TM_GOLD = "#D69E2E";
const TM_SLATE = "#94A3B8";

const channelData = [
  { name: "Organic", value: 38, color: TM_GREEN },
  { name: "Paid", value: 29, color: TM_NAVY },
  { name: "Direct", value: 18, color: TM_GOLD },
  { name: "Referral", value: 15, color: TM_NAVY_LIGHT },
];

const sourceQualityPie = [
  { name: "Owned", value: 38, color: TM_GREEN_DEEP },
  { name: "Bought", value: 62, color: TM_NAVY },
];

const costPerBookedSource = [
  { source: "Organic", cost: 42 },
  { source: "Google Ads", cost: 185 },
  { source: "Meta", cost: 210 },
  { source: "Vendors", cost: 290 },
  { source: "Referral", cost: 18 },
];

type Integration = {
  id?: string;
  provider: string;
  is_connected: boolean;
  property_id: string;
  account_id: string;
};

const INTEGRATION_LABELS: Record<string, string> = {
  ga4: "Google Analytics",
  gsc: "Search Console",
  google_ads: "Google Ads",
  meta: "Meta Ads",
};

function MetricCardRow() {
  const metrics = [
    { label: "Booked Jobs (7d)", value: "31", change: "+12%", up: true, icon: CheckCircle },
    { label: "Revenue (7d)", value: "$48,200", change: "+8%", up: true, icon: DollarSign },
    { label: "Cost / Booked Job", value: "$142", change: "-6%", up: true, icon: Target },
    { label: "ROAS", value: "3.4x", change: "+0.3x", up: true, icon: TrendingUp },
    { label: "Owned Lead %", value: "38%", change: "+2%", up: true, icon: Percent },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <Card key={m.label}>
            <CardContent className="p-3.5">
              <div className="flex items-start justify-between mb-1.5">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${m.up ? "text-emerald-600" : "text-red-500"}`}>
                  {m.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {m.change}
                </span>
              </div>
              <div className="text-xl font-bold text-foreground">{m.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{m.label}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function MarketingDashboard() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [savingIntegration, setSavingIntegration] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadIntegrations(); }, []);

  async function loadIntegrations() {
    const { data } = await (supabase as any).from("integration_credentials").select("provider, is_connected, property_id, account_id, id");
    setIntegrations(data || []);
  }

  function openIntegrationEdit(provider: string) {
    const existing = integrations.find(i => i.provider === provider);
    setEditingIntegration(existing || { provider, is_connected: false, property_id: "", account_id: "" });
  }

  async function saveIntegration() {
    if (!editingIntegration) return;
    setSavingIntegration(true);
    const payload = { ...editingIntegration, is_connected: !!(editingIntegration.property_id || editingIntegration.account_id), updated_at: new Date().toISOString() };
    const { error } = await (supabase as any).from("integration_credentials").upsert(payload, { onConflict: "provider" });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Integration saved" });
      setEditingIntegration(null);
      loadIntegrations();
    }
    setSavingIntegration(false);
  }

  const getIntegration = (provider: string) => integrations.find(i => i.provider === provider);

  return (
    <MarketingShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Metrics Dashboard</h1>
            <p className="text-muted-foreground text-xs">KPIs, analytics & channel performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/marketing/action-items"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-primary" /> Action Items <ArrowRight className="w-3 h-3" />
            </Link>
            <Button variant="outline" size="sm" onClick={() => setShowIntegrations(true)}>
              <Settings className="w-3.5 h-3.5 mr-1.5" /> Manage Connections
            </Button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <MetricCardRow />

        {/* Action items moved to dedicated page: /marketing/action-items */}

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Traffic by Channel</CardTitle>
              <CardDescription className="text-xs">Organic vs Paid vs Direct — last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="organic" stackId="1" stroke={TM_GREEN} fill={TM_GREEN} fillOpacity={0.65} name="Organic" />
                  <Area type="monotone" dataKey="paid" stackId="1" stroke={TM_NAVY} fill={TM_NAVY} fillOpacity={0.7} name="Paid" />
                  <Area type="monotone" dataKey="direct" stackId="1" stroke={TM_GOLD} fill={TM_GOLD} fillOpacity={0.6} name="Direct" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Leads to Booked</CardTitle>
              <CardDescription className="text-xs">Monthly lead generation and conversion</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={leadData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="leads" fill={TM_NAVY} name="Leads" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="booked" fill={TM_GREEN} name="Booked" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Channel Mix + Source Quality */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Lead Channel Mix</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={channelData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {channelData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Owned vs Bought</CardTitle>
              <CardDescription className="text-xs">Lead source dependency split</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={sourceQualityPie} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {sourceQualityPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Cost per Booked Job</CardTitle>
              <CardDescription className="text-xs">By source — placeholder data</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={costPerBookedSource} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                  <YAxis dataKey="source" type="category" tick={{ fontSize: 10 }} width={70} />
                  <Tooltip formatter={(v: number) => `$${v}`} />
                  <Bar dataKey="cost" fill={TM_NAVY} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Data Sources */}
        <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/30">
          <p className="text-xs text-muted-foreground w-full mb-1 font-medium">Data Sources</p>
          {["ga4", "gsc", "google_ads", "meta"].map(provider => {
            const integration = getIntegration(provider);
            const connected = integration?.is_connected;
            return (
              <button
                key={provider}
                onClick={() => { openIntegrationEdit(provider); setShowIntegrations(true); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors hover:opacity-80 ${
                  connected ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-muted border-border text-muted-foreground"
                }`}
              >
                {connected ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {INTEGRATION_LABELS[provider]}
                {!connected && <span className="text-xs opacity-70">— click to connect</span>}
              </button>
            );
          })}
        </div>

        {/* Integrations Manager Dialog */}
        <Dialog open={showIntegrations} onOpenChange={setShowIntegrations}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Manage Connections</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <p className="text-sm text-muted-foreground">Enter your Property IDs and Account IDs to connect data sources.</p>
              {["ga4", "gsc", "google_ads", "meta"].map(provider => {
                const integration = getIntegration(provider);
                const isEditing = editingIntegration?.provider === provider;
                return (
                  <div key={provider} className={`rounded-lg border p-4 space-y-3 ${integration?.is_connected ? "border-emerald-200" : ""}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {integration?.is_connected ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-muted-foreground" />}
                        <p className="font-medium text-sm">{INTEGRATION_LABELS[provider]}</p>
                      </div>
                      {!isEditing && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openIntegrationEdit(provider)}>
                          {integration?.is_connected ? "Update" : "Connect"}
                        </Button>
                      )}
                    </div>
                    {isEditing && (
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">Property / Account ID</Label>
                          <Input
                            value={editingIntegration?.property_id || ""}
                            onChange={e => setEditingIntegration(prev => prev ? { ...prev, property_id: e.target.value } : prev)}
                            placeholder={provider === "ga4" ? "G-XXXXXXXXXX" : provider === "gsc" ? "https://trumoveinc.com" : provider === "google_ads" ? "123-456-7890" : "Meta Ad Account ID"}
                            className="mt-1 text-sm"
                          />
                        </div>
                        {provider === "ga4" && (
                          <div>
                            <Label className="text-xs">Numeric Property ID (for Data API)</Label>
                            <Input
                              value={editingIntegration?.account_id || ""}
                              onChange={e => setEditingIntegration(prev => prev ? { ...prev, account_id: e.target.value } : prev)}
                              placeholder="e.g. 412345678"
                              className="mt-1 text-sm"
                            />
                          </div>
                        )}
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" className="h-7 text-xs" onClick={saveIntegration} disabled={savingIntegration}>
                            {savingIntegration ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />} Save
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingIntegration(null)}>Cancel</Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowIntegrations(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MarketingShell>
  );
}
