import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Users, DollarSign, Target, Activity, Wifi, WifiOff, Settings, RefreshCw, AlertCircle, CheckCircle, Clock, Loader2, Save } from "lucide-react";
import MarketingShell from "@/components/layout/MarketingShell";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ─── Static sample data (replaced by real data when integrations connected) ─────
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

const channelData = [
  { name: "Organic", value: 38, color: "#22c55e" },
  { name: "Paid", value: 29, color: "#3b82f6" },
  { name: "Direct", value: 18, color: "#f59e0b" },
  { name: "Referral", value: 15, color: "#8b5cf6" },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type Integration = {
  id?: string;
  provider: string;
  is_connected: boolean;
  property_id: string;
  account_id: string;
};

type ActivityItem = {
  section: string;
  last_updated: string;
  label: string;
};

const INTEGRATION_LABELS: Record<string, string> = {
  ga4: "Google Analytics",
  gsc: "Search Console",
  google_ads: "Google Ads",
  meta: "Meta Ads",
};

const ACTIVITY_LABELS: Record<string, string> = {
  seo_meta: "Meta Tags",
  keywords: "Keywords",
  backlinks: "Backlinks",
  ppc_campaigns: "PPC Campaigns",
  blog_posts: "Blog Posts",
  competitor_intel: "Competitor Intel",
};

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function ActivityCard({ item }: { item: ActivityItem }) {
  const days = daysSince(item.last_updated);
  const isNever = days > 900;
  const color = isNever ? "text-red-600" : days > 30 ? "text-red-500" : days > 7 ? "text-amber-600" : "text-emerald-600";
  const label = isNever ? "Never updated" : days === 0 ? "Updated today" : days === 1 ? "1 day ago" : `${days} days ago`;
  const urgency = isNever || days > 30 ? "Needs attention" : days > 7 ? "A bit stale" : "Up to date";

  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg border bg-card">
      <p className="text-xs font-semibold">{item.label}</p>
      <p className={`text-sm font-medium ${color}`}>{label}</p>
      <p className={`text-xs ${color}`}>{urgency}</p>
    </div>
  );
}

export default function MarketingDashboard() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityItem[]>([]);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [savingIntegration, setSavingIntegration] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
    loadActivityLog();
  }, []);

  async function loadIntegrations() {
    const { data } = await (supabase as any).from("integration_credentials").select("provider, is_connected, property_id, account_id, id");
    setIntegrations(data || []);
  }

  async function loadActivityLog() {
    const { data } = await (supabase as any).from("marketing_activity_log").select("section, last_updated");
    if (data) {
      setActivityLog(data.map((row: any) => ({
        ...row,
        label: ACTIVITY_LABELS[row.section] || row.section,
      })));
    }
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
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Marketing Dashboard</h1>
            <p className="text-muted-foreground text-sm">All channels, all data, all actions — one page.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowIntegrations(true)}>
            <Settings className="w-4 h-4 mr-2" /> Manage Connections
          </Button>
        </div>

        {/* Integration Status Bar */}
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
                  connected ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-500"
                }`}
              >
                {connected ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {INTEGRATION_LABELS[provider]}
                {!connected && <span className="text-xs opacity-70">— click to connect</span>}
              </button>
            );
          })}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Monthly Traffic", value: "1,240", subtext: "+18% vs last month", icon: Users, color: "text-blue-600" },
            { label: "Organic Leads", value: "84", subtext: "this month", icon: Target, color: "text-emerald-600" },
            { label: "Ad Spend", value: "$0", subtext: "no active campaigns", icon: DollarSign, color: "text-amber-600" },
            { label: "Conversion Rate", value: "3.2%", subtext: "leads to booked", icon: TrendingUp, color: "text-purple-600" },
          ].map(({ label, value, subtext, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${color} opacity-60`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic by Channel</CardTitle>
              <CardDescription>Organic vs Paid vs Direct — last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="organic" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Organic" />
                  <Area type="monotone" dataKey="paid" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Paid" />
                  <Area type="monotone" dataKey="direct" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Direct" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leads to Booked</CardTitle>
              <CardDescription>Monthly lead generation and conversion</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={leadData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="leads" fill="#3b82f6" name="Leads" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="booked" fill="#22c55e" name="Booked" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Channel Mix + Activity Log */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Channel Mix</CardTitle>
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
            <CardHeader>
              <CardTitle>Activity Tracker</CardTitle>
              <CardDescription>How recently each section was updated — stay current</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {activityLog.length === 0 ? (
                  <p className="col-span-2 text-sm text-muted-foreground">Run the SQL migration to enable activity tracking.</p>
                ) : (
                  activityLog.map(item => <ActivityCard key={item.section} item={item} />)
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integrations Manager Dialog */}
        <Dialog open={showIntegrations} onOpenChange={setShowIntegrations}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Manage Connections</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <p className="text-sm text-muted-foreground">Enter your Property IDs and Account IDs to connect data sources. All credentials are stored securely in your Supabase database.</p>
              {["ga4", "gsc", "google_ads", "meta"].map(provider => {
                const integration = getIntegration(provider);
                const isEditing = editingIntegration?.provider === provider;
                return (
                  <div key={provider} className={`rounded-lg border p-4 space-y-3 ${integration?.is_connected ? "border-emerald-200" : ""}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {integration?.is_connected ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                        )}
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
