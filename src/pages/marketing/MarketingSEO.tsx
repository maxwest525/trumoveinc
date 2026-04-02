import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  ArrowUpRight, TrendingUp, Target, FileText, Search, Globe, AlertCircle,
  CheckCircle2, Clock, ExternalLink, Sparkles, Save, Plus, Loader2, Trash2, RefreshCw
} from "lucide-react";
import MarketingShell from "@/components/layout/MarketingShell";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ─── Static Research Data ─────────────────────────────────────────────────────
const keywords = [
  { keyword: "long distance movers", volume: 33100, difficulty: 72, position: null, intent: "commercial", value: "high" },
  { keyword: "interstate moving companies", volume: 18100, difficulty: 68, position: null, intent: "commercial", value: "high" },
  { keyword: "cross country movers", volume: 22200, difficulty: 70, position: null, intent: "commercial", value: "high" },
  { keyword: "cheap long distance movers", volume: 12100, difficulty: 65, position: null, intent: "transactional", value: "high" },
  { keyword: "FMCSA certified movers", volume: 2400, difficulty: 35, position: null, intent: "informational", value: "medium" },
  { keyword: "moving company instant quote", volume: 8100, difficulty: 58, position: null, intent: "transactional", value: "high" },
  { keyword: "verified moving companies", volume: 4400, difficulty: 42, position: null, intent: "commercial", value: "high" },
  { keyword: "how to hire a long distance mover", volume: 5400, difficulty: 38, position: null, intent: "informational", value: "medium" },
  { keyword: "moving scam protection", volume: 3600, difficulty: 30, position: null, intent: "informational", value: "medium" },
  { keyword: "best interstate movers 2025", volume: 14800, difficulty: 62, position: null, intent: "commercial", value: "high" },
];

const competitors = [
  { domain: "moving.com", da: 72, traffic: "2.1M", keywords: 45200, backlinks: 125000 },
  { domain: "movinghelp.com", da: 58, traffic: "890K", keywords: 18400, backlinks: 43000 },
  { domain: "imrs.com", da: 45, traffic: "340K", keywords: 8200, backlinks: 12000 },
  { domain: "move.org", da: 68, traffic: "1.4M", keywords: 32100, backlinks: 89000 },
  { domain: "xyzmoving.com", da: 41, traffic: "210K", keywords: 5600, backlinks: 8400 },
  { domain: "hireahelper.com", da: 62, traffic: "780K", keywords: 22000, backlinks: 38000 },
  { domain: "unpakt.com", da: 55, traffic: "520K", keywords: 14800, backlinks: 28000 },
];

const contentBriefs = [
  { title: "How to Choose a Long Distance Moving Company", keyword: "long distance movers", wordCount: 2800, priority: "high", status: "planned" },
  { title: "FMCSA Requirements Explained for Consumers", keyword: "FMCSA certified movers", wordCount: 2200, priority: "high", status: "planned" },
  { title: "Red Flags of Moving Scams (and How to Avoid Them)", keyword: "moving scam protection", wordCount: 1800, priority: "medium", status: "planned" },
  { title: "Interstate Moving Cost Calculator Guide", keyword: "interstate moving cost", wordCount: 2500, priority: "high", status: "planned" },
  { title: "State-by-State Moving Regulations", keyword: "state moving laws", wordCount: 3500, priority: "medium", status: "planned" },
];

// ─── Meta Tags Editor ─────────────────────────────────────────────────────────
type SeoOverride = {
  id?: string;
  url_path: string;
  title: string;
  description: string;
  canonical_url: string;
  updated_at?: string;
};

const DEFAULT_PAGES: SeoOverride[] = [
  { url_path: "/", title: "", description: "", canonical_url: "https://trumoveinc.com/" },
  { url_path: "/about", title: "", description: "", canonical_url: "https://trumoveinc.com/about" },
  { url_path: "/free-online-estimate", title: "", description: "", canonical_url: "https://trumoveinc.com/free-online-estimate" },
  { url_path: "/vetting-process", title: "", description: "", canonical_url: "https://trumoveinc.com/vetting-process" },
  { url_path: "/property-lookup", title: "", description: "", canonical_url: "https://trumoveinc.com/property-lookup" },
  { url_path: "/book-video-consult", title: "", description: "", canonical_url: "https://trumoveinc.com/book-video-consult" },
];

function CharCount({ value, min, max }: { value: string; min: number; max: number }) {
  const len = value.length;
  const color =
    len === 0 ? "text-muted-foreground" :
    len < min ? "text-amber-600" :
    len > max ? "text-red-600" :
    "text-emerald-600";
  const status =
    len === 0 ? "" :
    len < min ? `Too short (need ${min - len} more)` :
    len > max ? `Too long (${len - max} over)` :
    "Good";
  return (
    <div className={`flex items-center gap-2 text-xs mt-1 ${color}`}>
      <span>{len} chars</span>
      {status && <span>— {status}</span>}
      {len > 0 && (len < min || len > max) && (
        <span className="font-semibold text-blue-600">Use AI Suggest</span>
      )}
    </div>
  );
}

function MetaTagsEditor() {
  const [pages, setPages] = useState<SeoOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [suggesting, setSuggesting] = useState<Record<string, boolean>>({});
  const [suggestions, setSuggestions] = useState<Record<string, { title: string; description: string } | null>>({});
  const { toast } = useToast();

  useEffect(() => { loadPages(); }, []);

  async function loadPages() {
    setLoading(true);
    const { data } = await (supabase as any).from("seo_overrides").select("*").order("url_path");
    setPages(data && data.length > 0 ? data : DEFAULT_PAGES);
    setLoading(false);
  }

  function updatePage(path: string, field: keyof SeoOverride, value: string) {
    setPages(prev => prev.map(p => p.url_path === path ? { ...p, [field]: value } : p));
  }

  async function savePage(page: SeoOverride) {
    setSaving(prev => ({ ...prev, [page.url_path]: true }));
    const { error } = await (supabase as any).from("seo_overrides").upsert(
      { ...page, updated_at: new Date().toISOString() },
      { onConflict: "url_path" }
    );
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      await (supabase as any).from("marketing_activity_log").upsert(
        { section: "seo_meta", last_updated: new Date().toISOString() },
        { onConflict: "section" }
      );
      toast({ title: "Pushed live", description: `Meta for ${page.url_path} is now live on trumoveinc.com` });
      loadPages();
    }
    setSaving(prev => ({ ...prev, [page.url_path]: false }));
  }

  async function suggestMeta(page: SeoOverride) {
    setSuggesting(prev => ({ ...prev, [page.url_path]: true }));
    try {
      const { data, error } = await supabase.functions.invoke("suggest-meta", {
        body: { url_path: page.url_path, title: page.title, description: page.description },
      });
      if (error) throw new Error(error.message);
      setSuggestions(prev => ({ ...prev, [page.url_path]: data }));
    } catch (e: any) {
      toast({ title: "AI suggest failed", description: e.message, variant: "destructive" });
    }
    setSuggesting(prev => ({ ...prev, [page.url_path]: false }));
  }

  function applySuggestion(path: string) {
    const s = suggestions[path];
    if (!s) return;
    setPages(prev => prev.map(p => p.url_path === path ? { ...p, title: s.title, description: s.description } : p));
    setSuggestions(prev => ({ ...prev, [path]: null }));
  }

  function addPage() {
    const path = window.prompt("Enter URL path (e.g. /services)");
    if (!path) return;
    const clean = path.startsWith("/") ? path : `/${path}`;
    if (pages.find(p => p.url_path === clean)) return;
    setPages(prev => [...prev, { url_path: clean, title: "", description: "", canonical_url: `https://trumoveinc.com${clean}` }]);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Page Meta Tags</p>
          <p className="text-xs text-muted-foreground">Saves push instantly to trumoveinc.com. Optimal: titles 50-60 chars, descriptions 150-160 chars.</p>
        </div>
        <Button size="sm" variant="outline" onClick={addPage}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Page
        </Button>
      </div>

      {pages.map((page) => {
        const isSaving = saving[page.url_path];
        const isSuggesting = suggesting[page.url_path];
        const suggestion = suggestions[page.url_path];
        const titleBad = page.title.length > 0 && (page.title.length < 50 || page.title.length > 60);
        const descBad = page.description.length > 0 && (page.description.length < 150 || page.description.length > 160);
        const needsSuggest = titleBad || descBad || !page.title || !page.description;

        return (
          <Card key={page.url_path} className={titleBad || descBad ? "border-amber-300" : ""}>
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-center justify-between">
                <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{page.url_path}</code>
                <div className="flex items-center gap-2">
                  {needsSuggest && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => suggestMeta(page)}
                      disabled={isSuggesting}
                    >
                      {isSuggesting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                      AI Suggest
                    </Button>
                  )}
                  <Button size="sm" className="h-7 text-xs" onClick={() => savePage(page)} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                    Save & Push Live
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
              <div>
                <Label className="text-xs">Title Tag</Label>
                <Input
                  value={page.title}
                  onChange={(e) => updatePage(page.url_path, "title", e.target.value)}
                  placeholder="e.g. Long Distance Movers | Instant Quotes | TruMove"
                  className="mt-1 text-sm"
                />
                <CharCount value={page.title} min={50} max={60} />
              </div>
              <div>
                <Label className="text-xs">Meta Description</Label>
                <Textarea
                  value={page.description}
                  onChange={(e) => updatePage(page.url_path, "description", e.target.value)}
                  placeholder="e.g. Compare FMCSA-verified long distance movers. Get instant quotes, no deposits. Trusted carriers, transparent pricing. Move smarter with TruMove."
                  className="mt-1 text-sm resize-none"
                  rows={2}
                />
                <CharCount value={page.description} min={150} max={160} />
              </div>
              <div>
                <Label className="text-xs">Canonical URL</Label>
                <Input
                  value={page.canonical_url}
                  onChange={(e) => updatePage(page.url_path, "canonical_url", e.target.value)}
                  className="mt-1 text-xs font-mono"
                />
              </div>

              {suggestion && (
                <div className="rounded-md bg-blue-50 border border-blue-200 p-3 space-y-2">
                  <p className="text-xs font-semibold text-blue-800">AI Suggestion</p>
                  <div className="space-y-1">
                    <p className="text-xs text-blue-600">Title ({suggestion.title.length} chars)</p>
                    <p className="text-sm font-medium">{suggestion.title}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-blue-600">Description ({suggestion.description.length} chars)</p>
                    <p className="text-sm">{suggestion.description}</p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" className="h-7 text-xs" onClick={() => applySuggestion(page.url_path)}>Use This</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSuggestions(prev => ({ ...prev, [page.url_path]: null }))}>Dismiss</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MarketingSEO() {
  const [daScore] = useState(1);
  const [daHistory] = useState([{ date: "Jan", score: 1 }, { date: "Feb", score: 1 }, { date: "Mar", score: 2 }, { date: "Apr", score: 2 }]);

  return (
    <MarketingShell>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SEO Manager</h1>
          <p className="text-muted-foreground text-sm">Meta tags, keywords, backlinks, domain authority, and content strategy — all in one place.</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Domain Authority</p>
              <p className="text-3xl font-bold">{daScore}</p>
              <p className="text-xs text-muted-foreground">/100</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Tracked Keywords</p>
              <p className="text-3xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Add keywords to track</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Backlinks</p>
              <p className="text-3xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">referring domains</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Organic Traffic</p>
              <p className="text-3xl font-bold">—</p>
              <p className="text-xs text-muted-foreground">Connect GA4</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="meta">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="meta">Meta Tags</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="backlinks">Backlinks</TabsTrigger>
            <TabsTrigger value="da">Domain Auth</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
          </TabsList>

          {/* META TAGS TAB */}
          <TabsContent value="meta" className="mt-4">
            <MetaTagsEditor />
          </TabsContent>

          {/* KEYWORDS TAB */}
          <TabsContent value="keywords" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Target Keywords</CardTitle>
                    <CardDescription>Research + live rank tracking. Add tracked keywords in the table.</CardDescription>
                  </div>
                  <Button size="sm"><Plus className="w-3.5 h-3.5 mr-1.5" /> Add Keyword</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Intent</TableHead>
                      <TableHead>Current Position</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keywords.map((kw) => (
                      <TableRow key={kw.keyword}>
                        <TableCell className="font-medium text-sm">{kw.keyword}</TableCell>
                        <TableCell>{kw.volume.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={kw.difficulty} className="w-16 h-1.5" />
                            <span className="text-xs">{kw.difficulty}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{kw.intent}</Badge>
                        </TableCell>
                        <TableCell>
                          {kw.position ? (
                            <span className="text-sm font-medium"># {kw.position}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not tracking</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={kw.value === "high" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                            {kw.value}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BACKLINKS TAB */}
          <TabsContent value="backlinks" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Backlink Manager</CardTitle>
                    <CardDescription>Track referring domains and link quality. Add backlinks as you acquire them.</CardDescription>
                  </div>
                  <Button size="sm"><Plus className="w-3.5 h-3.5 mr-1.5" /> Add Backlink</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Globe className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">No backlinks tracked yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Add your first backlink to start tracking domain authority growth</p>
                  <Button size="sm" className="mt-4"><Plus className="w-3.5 h-3.5 mr-1.5" /> Add First Backlink</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DOMAIN AUTHORITY TAB */}
          <TabsContent value="da" className="mt-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Domain Authority: {daScore}/100</CardTitle>
                  <CardDescription>New domain — score grows as you earn backlinks and publish content. Target: 20+ in 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={(daScore / 100) * 100} className="h-3" />
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {[{ label: "Target (6mo)", value: "20" }, { label: "Industry Avg", value: "45" }, { label: "Top Competitor", value: "72" }].map(item => (
                      <div key={item.label} className="text-center">
                        <p className="text-2xl font-bold">{item.value}</p>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>DA Growth Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { action: "Publish 2 high-quality articles/month", impact: "high", status: "in-progress" },
                      { action: "Submit to FMCSA and moving industry directories", impact: "high", status: "todo" },
                      { action: "Guest post on moving/real estate blogs", impact: "medium", status: "todo" },
                      { action: "Create linkable assets (cost calculator, state guides)", impact: "high", status: "todo" },
                      { action: "Get listed on Angi, Thumbtack, HomeAdvisor", impact: "medium", status: "todo" },
                    ].map((item) => (
                      <div key={item.action} className="flex items-center justify-between py-2 border-b last:border-0">
                        <span className="text-sm">{item.action}</span>
                        <div className="flex items-center gap-2">
                          <Badge className={item.impact === "high" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>{item.impact}</Badge>
                          <Badge variant="outline">{item.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* CONTENT TAB */}
          <TabsContent value="content" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Content Pipeline</CardTitle>
                    <CardDescription>SEO content briefs — ready to write or send to a writer.</CardDescription>
                  </div>
                  <Button size="sm"><Plus className="w-3.5 h-3.5 mr-1.5" /> New Brief</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Target Keyword</TableHead>
                      <TableHead>Words</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contentBriefs.map((brief) => (
                      <TableRow key={brief.title}>
                        <TableCell className="font-medium text-sm">{brief.title}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{brief.keyword}</TableCell>
                        <TableCell>{brief.wordCount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={brief.priority === "high" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}>{brief.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{brief.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" className="h-7 text-xs">Write</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COMPETITORS TAB */}
          <TabsContent value="competitors" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Competitor SEO Intelligence</CardTitle>
                <CardDescription>Domain authority, traffic, and keyword gap analysis.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>DA</TableHead>
                      <TableHead>Monthly Traffic</TableHead>
                      <TableHead>Ranking Keywords</TableHead>
                      <TableHead>Backlinks</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {competitors.map((comp) => (
                      <TableRow key={comp.domain}>
                        <TableCell className="font-medium">{comp.domain}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={comp.da} className="w-12 h-1.5" />
                            <span>{comp.da}</span>
                          </div>
                        </TableCell>
                        <TableCell>{comp.traffic}</TableCell>
                        <TableCell>{comp.keywords.toLocaleString()}</TableCell>
                        <TableCell>{comp.backlinks.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" className="h-7 text-xs">
                            <ExternalLink className="w-3 h-3 mr-1" /> Analyze
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MarketingShell>
  );
}
