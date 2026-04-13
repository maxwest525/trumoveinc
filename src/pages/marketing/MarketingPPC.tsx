import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, Save, TrendingUp, DollarSign, MousePointer, Target, Edit2, Trash2, CheckCircle, PauseCircle, AlertCircle } from "lucide-react";
import MarketingShell from "@/components/layout/MarketingShell";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Campaign = {
  id?: string;
  name: string;
  channel: string;
  status: string;
  daily_budget: number;
  monthly_budget: number;
  total_spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
  cpc: number;
  cpa: number;
  roas: number;
  notes: string;
  updated_at?: string;
};

const EMPTY_CAMPAIGN: Campaign = {
  name: "", channel: "google_ads", status: "paused",
  daily_budget: 0, monthly_budget: 0, total_spend: 0,
  clicks: 0, impressions: 0, conversions: 0,
  cpc: 0, cpa: 0, roas: 0, notes: ""
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  paused: "bg-amber-100 text-amber-800",
  ended: "bg-gray-100 text-gray-700",
};

const CHANNEL_LABELS: Record<string, string> = {
  google_ads: "Google Ads",
  meta: "Meta Ads",
  bing: "Bing Ads",
  other: "Other",
};

export default function MarketingPPC() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadCampaigns(); }, []);

  async function loadCampaigns() {
    setLoading(true);
    const { data } = await (supabase as any).from("ppc_campaigns").select("*").order("updated_at", { ascending: false });
    setCampaigns(data || []);
    setLoading(false);
  }

  function openNew() { setEditing({ ...EMPTY_CAMPAIGN }); setDialogOpen(true); }
  function openEdit(c: Campaign) { setEditing({ ...c }); setDialogOpen(true); }

  async function saveCampaign() {
    if (!editing || !editing.name) return;
    setSaving(true);
    const payload = { ...editing, updated_at: new Date().toISOString() };
    let error;
    if (editing.id) {
      ({ error } = await (supabase as any).from("ppc_campaigns").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await (supabase as any).from("ppc_campaigns").insert(payload));
    }
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await (supabase as any).from("marketing_activity_log").upsert(
        { section: "ppc_campaigns", last_updated: new Date().toISOString() },
        { onConflict: "section" }
      );
      toast({ title: editing.id ? "Campaign updated" : "Campaign created" });
      setDialogOpen(false);
      loadCampaigns();
    }
    setSaving(false);
  }

  async function deleteCampaign(id: string) {
    if (!window.confirm("Delete this campaign?")) return;
    await (supabase as any).from("ppc_campaigns").delete().eq("id", id);
    loadCampaigns();
  }

  const totalSpend = campaigns.reduce((s, c) => s + (c.total_spend || 0), 0);
  const totalClicks = campaigns.reduce((s, c) => s + (c.clicks || 0), 0);
  const totalConversions = campaigns.reduce((s, c) => s + (c.conversions || 0), 0);
  const avgCPA = totalConversions > 0 ? totalSpend / totalConversions : 0;

  return (
    <MarketingShell breadcrumb="Advertising">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Advertising</h1>
            <p className="text-muted-foreground text-xs">Google Ads, Meta, budgets & spend</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs border border-border rounded-lg px-3 py-1.5">
              <span className="text-muted-foreground">Mode:</span>
              <span className="font-medium text-foreground">Manual</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground cursor-not-allowed">Automated</span>
            </div>
            <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> New Campaign</Button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Spend", value: `$${totalSpend.toLocaleString()}`, icon: DollarSign, color: "text-red-600" },
            { label: "Total Clicks", value: totalClicks.toLocaleString(), icon: MousePointer, color: "text-blue-600" },
            { label: "Conversions", value: totalConversions.toLocaleString(), icon: Target, color: "text-emerald-600" },
            { label: "Avg CPA", value: avgCPA > 0 ? `$${avgCPA.toFixed(0)}` : "—", icon: TrendingUp, color: "text-purple-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${color} opacity-70`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Campaigns Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Campaigns</CardTitle>
              <Button size="sm" onClick={openNew}><Plus className="w-3.5 h-3.5 mr-1.5" /> Add</Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium">No campaigns yet</p>
                <p className="text-xs text-muted-foreground mt-1">Add your Google Ads or Meta campaigns to track them here</p>
                <Button size="sm" className="mt-4" onClick={openNew}><Plus className="w-3.5 h-3.5 mr-1.5" /> Add First Campaign</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Daily Budget</TableHead>
                    <TableHead>Spend</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Conv.</TableHead>
                    <TableHead>CPA</TableHead>
                    <TableHead>ROAS</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium text-sm">{c.name}</TableCell>
                      <TableCell><Badge variant="outline">{CHANNEL_LABELS[c.channel] || c.channel}</Badge></TableCell>
                      <TableCell><Badge className={STATUS_COLORS[c.status] || ""}>{c.status}</Badge></TableCell>
                      <TableCell>${c.daily_budget}/day</TableCell>
                      <TableCell>${(c.total_spend || 0).toLocaleString()}</TableCell>
                      <TableCell>{(c.clicks || 0).toLocaleString()}</TableCell>
                      <TableCell>{c.conversions || 0}</TableCell>
                      <TableCell>{c.cpa > 0 ? `$${c.cpa.toFixed(0)}` : "—"}</TableCell>
                      <TableCell>{c.roas > 0 ? `${c.roas.toFixed(1)}x` : "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(c)}><Edit2 className="w-3.5 h-3.5" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => deleteCampaign(c.id!)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Campaign Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing?.id ? "Edit Campaign" : "New Campaign"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Campaign Name</Label>
                  <Input value={editing?.name || ""} onChange={e => setEditing(prev => prev ? { ...prev, name: e.target.value } : prev)} placeholder="e.g. Brand - Long Distance Movers" className="mt-1" />
                </div>
                <div>
                  <Label>Channel</Label>
                  <Select value={editing?.channel || "google_ads"} onValueChange={v => setEditing(prev => prev ? { ...prev, channel: v } : prev)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google_ads">Google Ads</SelectItem>
                      <SelectItem value="meta">Meta Ads</SelectItem>
                      <SelectItem value="bing">Bing Ads</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={editing?.status || "paused"} onValueChange={v => setEditing(prev => prev ? { ...prev, status: v } : prev)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="ended">Ended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Daily Budget ($)</Label>
                  <Input type="number" value={editing?.daily_budget || 0} onChange={e => setEditing(prev => prev ? { ...prev, daily_budget: parseFloat(e.target.value) || 0 } : prev)} className="mt-1" />
                </div>
                <div>
                  <Label>Monthly Budget ($)</Label>
                  <Input type="number" value={editing?.monthly_budget || 0} onChange={e => setEditing(prev => prev ? { ...prev, monthly_budget: parseFloat(e.target.value) || 0 } : prev)} className="mt-1" />
                </div>
                <div>
                  <Label>Total Spend ($)</Label>
                  <Input type="number" value={editing?.total_spend || 0} onChange={e => setEditing(prev => prev ? { ...prev, total_spend: parseFloat(e.target.value) || 0 } : prev)} className="mt-1" />
                </div>
                <div>
                  <Label>Clicks</Label>
                  <Input type="number" value={editing?.clicks || 0} onChange={e => setEditing(prev => prev ? { ...prev, clicks: parseInt(e.target.value) || 0 } : prev)} className="mt-1" />
                </div>
                <div>
                  <Label>Conversions</Label>
                  <Input type="number" value={editing?.conversions || 0} onChange={e => setEditing(prev => prev ? { ...prev, conversions: parseInt(e.target.value) || 0 } : prev)} className="mt-1" />
                </div>
                <div>
                  <Label>CPA ($)</Label>
                  <Input type="number" value={editing?.cpa || 0} onChange={e => setEditing(prev => prev ? { ...prev, cpa: parseFloat(e.target.value) || 0 } : prev)} className="mt-1" />
                </div>
                <div>
                  <Label>ROAS</Label>
                  <Input type="number" step="0.1" value={editing?.roas || 0} onChange={e => setEditing(prev => prev ? { ...prev, roas: parseFloat(e.target.value) || 0 } : prev)} className="mt-1" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveCampaign} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Campaign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MarketingShell>
  );
}
