import { useState, useEffect, useMemo } from "react";
import MarketingShell from "@/components/layout/MarketingShell";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link2, ExternalLink, PlusCircle, Trash2, Edit2, RefreshCw, TrendingUp, TrendingDown, Globe, ShieldCheck, AlertCircle } from "lucide-react";

interface Backlink {
  id: string;
  source_domain: string;
  source_url: string | null;
  target_url: string;
  anchor_text: string | null;
  domain_authority: number;
  page_authority: number;
  follow_type: string;
  status: string;
  first_seen: string | null;
  last_verified: string | null;
  notes: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
  disavowed: "bg-gray-100 text-gray-500",
  pending_verification: "bg-yellow-100 text-yellow-800",
};

const EMPTY_FORM: Omit<Backlink, "id"> = {
  source_domain: "",
  source_url: "",
  target_url: "/",
  anchor_text: "",
  domain_authority: 0,
  page_authority: 0,
  follow_type: "dofollow",
  status: "active",
  first_seen: new Date().toISOString().split("T")[0],
  last_verified: new Date().toISOString().split("T")[0],
  notes: "",
};

export default function MarketingBacklinks() {
  const { toast } = useToast();
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Backlink | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("backlinks")
      .select("*")
      .order("domain_authority", { ascending: false });
    if (!error && data) setBacklinks(data as Backlink[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = backlinks;
    if (activeTab !== "all") list = list.filter(b => b.status === activeTab);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        b.source_domain.toLowerCase().includes(q) ||
        (b.anchor_text ?? "").toLowerCase().includes(q) ||
        b.target_url.toLowerCase().includes(q)
      );
    }
    return list;
  }, [backlinks, activeTab, search]);

  const stats = useMemo(() => ({
    total: backlinks.length,
    active: backlinks.filter(b => b.status === "active").length,
    lost: backlinks.filter(b => b.status === "lost").length,
    dofollow: backlinks.filter(b => b.follow_type === "dofollow" && b.status === "active").length,
    referringDomains: new Set(backlinks.filter(b => b.status === "active").map(b => b.source_domain)).size,
    avgDA: backlinks.length
      ? Math.round(backlinks.reduce((s, b) => s + b.domain_authority, 0) / backlinks.length)
      : 0,
  }), [backlinks]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (b: Backlink) => {
    setEditTarget(b);
    setForm({ ...b });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.source_domain.trim()) {
      toast({ title: "Source domain required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = { ...form, source_domain: form.source_domain.trim() };
    let error;
    if (editTarget) {
      ({ error } = await (supabase as any).from("backlinks").update(payload).eq("id", editTarget.id));
    } else {
      ({ error } = await (supabase as any).from("backlinks").insert([payload]));
    }
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editTarget ? "Backlink updated" : "Backlink added" });
      setDialogOpen(false);
      load();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("backlinks").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Backlink removed" });
      load();
    }
  };

  const dofollowPct = stats.active > 0 ? Math.round((stats.dofollow / stats.active) * 100) : 0;

  return (
    <MarketingShell breadcrumb="Backlinks">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Backlink Manager</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track, verify, and build your link profile.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={openAdd}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              Add Backlink
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Backlinks</p>
                  <p className="text-2xl font-bold mt-0.5">{stats.total}</p>
                </div>
                <Link2 className="w-5 h-5 text-primary mt-1" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stats.active} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Referring Domains</p>
                  <p className="text-2xl font-bold mt-0.5">{stats.referringDomains}</p>
                </div>
                <Globe className="w-5 h-5 text-blue-500 mt-1" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Unique domains linking to you</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Dofollow %</p>
                  <p className="text-2xl font-bold mt-0.5">{dofollowPct}%</p>
                </div>
                <ShieldCheck className="w-5 h-5 text-green-500 mt-1" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stats.dofollow} dofollow links</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Avg Domain Authority</p>
                  <p className="text-2xl font-bold mt-0.5">{stats.avgDA}</p>
                </div>
                {stats.avgDA >= 40 ? (
                  <TrendingUp className="w-5 h-5 text-green-500 mt-1" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-amber-500 mt-1" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Across all active links</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Tip */}
        {stats.lost > 0 && (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    {stats.lost} lost backlink{stats.lost !== 1 ? "s" : ""} detected
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    Reach out to the linking sites to reinstate these links. Lost backlinks can negatively impact domain authority if not recovered.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table with tabs */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Link Profile</CardTitle>
                <CardDescription className="text-xs">All tracked backlinks</CardDescription>
              </div>
              <Input
                placeholder="Search domains, anchors..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-52 h-8 text-xs"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-8 mb-3">
                <TabsTrigger value="all" className="text-xs px-3">All ({backlinks.length})</TabsTrigger>
                <TabsTrigger value="active" className="text-xs px-3">Active ({stats.active})</TabsTrigger>
                <TabsTrigger value="lost" className="text-xs px-3">Lost ({stats.lost})</TabsTrigger>
                <TabsTrigger value="disavowed" className="text-xs px-3">
                  Disavowed ({backlinks.filter(b => b.status === "disavowed").length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {loading ? (
                  <div className="text-center py-10 text-sm text-muted-foreground">Loading backlinks...</div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-10">
                    <Link2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No backlinks found.</p>
                    <Button size="sm" className="mt-3" onClick={openAdd}>
                      <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                      Add your first backlink
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Source Domain</TableHead>
                          <TableHead className="text-xs">Anchor Text</TableHead>
                          <TableHead className="text-xs">Target Page</TableHead>
                          <TableHead className="text-xs">DA</TableHead>
                          <TableHead className="text-xs">Type</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                          <TableHead className="text-xs">Last Verified</TableHead>
                          <TableHead className="text-xs w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map(bl => (
                          <TableRow key={bl.id}>
                            <TableCell className="text-xs font-medium">
                              <div className="flex items-center gap-1">
                                {bl.source_domain}
                                {bl.source_url && (
                                  <a href={bl.source_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-primary" />
                                  </a>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                              {bl.anchor_text || "—"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[100px] truncate">
                              {bl.target_url}
                            </TableCell>
                            <TableCell className="text-xs">
                              <span className={`font-semibold ${bl.domain_authority >= 40 ? "text-green-600" : bl.domain_authority >= 20 ? "text-amber-600" : "text-red-500"}`}>
                                {bl.domain_authority}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs">
                              <Badge variant="outline" className="text-[10px] py-0">
                                {bl.follow_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-[10px] py-0 px-1.5 ${STATUS_COLORS[bl.status] || ""}`}>
                                {bl.status.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {bl.last_verified || "—"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(bl)}>
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(bl.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Backlink" : "Add Backlink"}</DialogTitle>
            <DialogDescription>Track a new backlink to your site.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Source Domain *</Label>
              <Input
                value={form.source_domain}
                onChange={e => setForm(f => ({ ...f, source_domain: e.target.value }))}
                placeholder="example.com"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Source URL</Label>
              <Input
                value={form.source_url ?? ""}
                onChange={e => setForm(f => ({ ...f, source_url: e.target.value }))}
                placeholder="https://example.com/post"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Target Page</Label>
              <Input
                value={form.target_url}
                onChange={e => setForm(f => ({ ...f, target_url: e.target.value }))}
                placeholder="/"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Anchor Text</Label>
              <Input
                value={form.anchor_text ?? ""}
                onChange={e => setForm(f => ({ ...f, anchor_text: e.target.value }))}
                placeholder="Click here"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Domain Authority</Label>
              <Input
                type="number"
                value={form.domain_authority}
                onChange={e => setForm(f => ({ ...f, domain_authority: Number(e.target.value) }))}
                min={0} max={100}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Link Type</Label>
              <Select value={form.follow_type} onValueChange={v => setForm(f => ({ ...f, follow_type: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dofollow">Dofollow</SelectItem>
                  <SelectItem value="nofollow">Nofollow</SelectItem>
                  <SelectItem value="ugc">UGC</SelectItem>
                  <SelectItem value="sponsored">Sponsored</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="disavowed">Disavowed</SelectItem>
                  <SelectItem value="pending_verification">Pending Verification</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Notes</Label>
              <Input
                value={form.notes ?? ""}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Optional notes..."
                className="h-8 text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editTarget ? "Update" : "Add Backlink"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MarketingShell>
  );
}
