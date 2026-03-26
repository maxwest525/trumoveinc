import { useState, useCallback } from "react";
import MarketingShell from "@/components/layout/MarketingShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Search, Sparkles, Globe, CheckCircle2, AlertCircle, Loader2,
  Download, ChevronDown, ChevronUp, RefreshCw, ScanSearch, Link2,
  AlertTriangle, CircleCheck, Filter,
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import AuditPageDetail, { type PageDecisions } from "@/components/seo/AuditPageDetail";

interface IssueSuggestion {
  issue: string;
  suggestion: string;
  priority: "high" | "medium" | "low";
}

interface AuditPage {
  url: string;
  fetchedTitle: string | null;
  fetchedDescription: string | null;
  fetchedH1: string | null;
  fetchedCanonical: string | null;
  issues: string[];
  suggestedTitle: string | null;
  suggestedDescription: string | null;
  suggestedH1: string | null;
  aiChecklist: string[];
  issueSuggestions: IssueSuggestion[];
}

const defaultDecisions = (): PageDecisions => ({
  title: { status: "pending" },
  description: { status: "pending" },
  h1: { status: "pending" },
});

type FilterMode = "all" | "issues" | "ok";

export default function MarketingSEO() {
  const [singleUrl, setSingleUrl] = useState("");
  const [discoveredUrls, setDiscoveredUrls] = useState<string[]>([]);
  const [auditPages, setAuditPages] = useState<AuditPage[]>([]);
  const [decisions, setDecisions] = useState<Record<string, PageDecisions>>({});
  const [discovering, setDiscovering] = useState(false);
  const [discoverySource, setDiscoverySource] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null);
  const [analyzeProgress, setAnalyzeProgress] = useState({ done: 0, total: 0 });
  const [regeneratingUrl, setRegeneratingUrl] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  const analyzeUrls = useCallback(async (urls: string[]) => {
    setAnalyzing(true);
    setAuditPages([]);
    setDecisions({});
    const allResults: AuditPage[] = [];
    const allDecisions: Record<string, PageDecisions> = {};
    const batchSize = 5;
    const total = urls.length;
    setAnalyzeProgress({ done: 0, total });

    for (let i = 0; i < total; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      try {
        const { data, error } = await supabase.functions.invoke("seo-audit", {
          body: { action: "analyze", urls: batch },
        });
        if (error) throw error;
        const results = (data?.results || []).map((r: any) => ({
          ...r,
          issues: r.issues || [],
          aiChecklist: r.aiChecklist || [],
        }));
        results.forEach((r: AuditPage) => { allDecisions[r.url] = defaultDecisions(); });
        allResults.push(...results);
        setAuditPages([...allResults]);
        setDecisions({ ...allDecisions });
        setAnalyzeProgress({ done: Math.min(i + batchSize, total), total });
      } catch (e: any) {
        console.error("Batch error:", e);
        batch.forEach((u) => {
          allResults.push({
            url: u, fetchedTitle: null, fetchedDescription: null, fetchedH1: null,
            fetchedCanonical: null, issues: [`Analysis failed: ${e.message}`],
            suggestedTitle: null, suggestedDescription: null, suggestedH1: null,
            aiChecklist: [],
          });
          allDecisions[u] = defaultDecisions();
        });
        setAuditPages([...allResults]);
        setDecisions({ ...allDecisions });
      }
    }

    // Save to DB
    for (const page of allResults) {
      try {
        await supabase.from("seo_audit_pages" as any).insert({
          url: page.url,
          fetched_title: page.fetchedTitle,
          fetched_description: page.fetchedDescription,
          fetched_h1: page.fetchedH1,
          fetched_canonical: page.fetchedCanonical,
          issues: page.issues,
          suggested_title: page.suggestedTitle,
          suggested_description: page.suggestedDescription,
          suggested_h1: page.suggestedH1,
          ai_checklist: page.aiChecklist,
          status: "pending",
        } as any);
      } catch {}
    }

    setAnalyzing(false);
    const withIssues = allResults.filter(p => (p.issues?.length || 0) > 0).length;
    toast.success(`Audit complete — ${allResults.length} pages analyzed, ${withIssues} need improvement`);
  }, []);

  // Crawl + auto-analyze in one click
  const handleFullCrawl = async () => {
    setDiscovering(true);
    setDiscoveredUrls([]);
    setAuditPages([]);
    setFilterMode("all");
    try {
      const { data, error } = await supabase.functions.invoke("seo-audit", {
        body: { action: "discover", url: "https://trumoveinc.com" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const urls = (data?.urls || []) as string[];
      const source = data?.source || "crawl";
      setDiscoveredUrls(urls);
      setDiscoverySource(source);
      toast.success(`Found ${urls.length} pages via ${source === "sitemap" ? "sitemap.xml" : "link crawl"} — starting analysis…`);
      setDiscovering(false);
      if (urls.length > 0) {
        await analyzeUrls(urls);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to discover pages");
      setDiscovering(false);
    }
  };

  const handleAnalyzeSingle = async () => {
    if (!singleUrl) return toast.error("Enter a URL");
    let u = singleUrl.trim();
    if (!u.startsWith("http")) u = `https://${u}`;
    await analyzeUrls([u]);
  };

  const handleDecisionChange = (url: string, d: PageDecisions) => {
    setDecisions((prev) => ({ ...prev, [url]: d }));
    const updates: any = {};
    if (d.title.status === "approved") updates.suggested_title = auditPages.find(p => p.url === url)?.suggestedTitle;
    if (d.title.status === "edited") updates.suggested_title = d.title.editedValue;
    if (d.description.status === "approved") updates.suggested_description = auditPages.find(p => p.url === url)?.suggestedDescription;
    if (d.description.status === "edited") updates.suggested_description = d.description.editedValue;
    if (d.h1.status === "approved") updates.suggested_h1 = auditPages.find(p => p.url === url)?.suggestedH1;
    if (d.h1.status === "edited") updates.suggested_h1 = d.h1.editedValue;

    const anyApproved = ["approved", "edited"].includes(d.title.status) ||
      ["approved", "edited"].includes(d.description.status) ||
      ["approved", "edited"].includes(d.h1.status);
    if (anyApproved) updates.status = "approved";

    if (Object.keys(updates).length > 0) {
      supabase.from("seo_audit_pages" as any).update(updates as any).eq("url", url).then();
    }
  };

  const handleRegenerate = async (url: string) => {
    setRegeneratingUrl(url);
    try {
      const { data, error } = await supabase.functions.invoke("seo-audit", {
        body: { action: "analyze", urls: [url] },
      });
      if (error) throw error;
      const result = data?.results?.[0];
      if (result) {
        setAuditPages((prev) => prev.map((p) =>
          p.url === url ? { ...p, suggestedTitle: result.suggestedTitle, suggestedDescription: result.suggestedDescription, suggestedH1: result.suggestedH1, aiChecklist: result.aiChecklist || [] } : p
        ));
        setDecisions((prev) => ({ ...prev, [url]: defaultDecisions() }));
        toast.success("New suggestions generated");
      }
    } catch (e: any) {
      toast.error(e.message || "Regeneration failed");
    } finally {
      setRegeneratingUrl(null);
    }
  };

  const handleExportCSV = () => {
    const rows: string[] = [];
    auditPages.forEach((p) => {
      const d = decisions[p.url];
      if (!d) return;
      const titleVal = d.title.status === "edited" ? d.title.editedValue : d.title.status === "approved" ? p.suggestedTitle : null;
      const descVal = d.description.status === "edited" ? d.description.editedValue : d.description.status === "approved" ? p.suggestedDescription : null;
      const h1Val = d.h1.status === "edited" ? d.h1.editedValue : d.h1.status === "approved" ? p.suggestedH1 : null;
      if (!titleVal && !descVal && !h1Val) return;
      rows.push([
        `"${p.url}"`,
        `"${(p.fetchedTitle || "").replace(/"/g, '""')}"`,
        `"${(titleVal || "").replace(/"/g, '""')}"`,
        `"${d.title.status}"`,
        `"${(p.fetchedDescription || "").replace(/"/g, '""')}"`,
        `"${(descVal || "").replace(/"/g, '""')}"`,
        `"${d.description.status}"`,
        `"${(p.fetchedH1 || "").replace(/"/g, '""')}"`,
        `"${(h1Val || "").replace(/"/g, '""')}"`,
        `"${d.h1.status}"`,
      ].join(","));
    });
    if (!rows.length) return toast.error("Approve or edit at least one field first");
    const header = "URL,Current Title,New Title,Title Status,Current Description,New Description,Desc Status,Current H1,New H1,H1 Status\n";
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `seo-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success("CSV exported");
  };

  const getPageStatus = (url: string) => {
    const d = decisions[url];
    if (!d) return "pending";
    const statuses = [d.title.status, d.description.status, d.h1.status];
    if (statuses.every((s) => s === "ignored")) return "ignored";
    if (statuses.some((s) => s === "approved" || s === "edited")) return "actioned";
    return "pending";
  };

  const issueCount = (p: AuditPage) => p.issues?.length || 0;
  const charBadge = (text: string | null, min: number, max: number) => {
    if (!text) return <Badge variant="destructive" className="text-[10px] font-normal">Missing</Badge>;
    const len = text.length;
    const ok = len >= min && len <= max;
    return (
      <Badge variant={ok ? "default" : "secondary"} className="text-[10px] font-normal">
        {len} {ok ? "✓" : `(${min}–${max})`}
      </Badge>
    );
  };

  const hasExportable = auditPages.some((p) => getPageStatus(p.url) === "actioned");

  // Stats
  const pagesWithIssues = auditPages.filter(p => issueCount(p) > 0);
  const pagesOk = auditPages.filter(p => issueCount(p) === 0);
  const totalIssues = auditPages.reduce((sum, p) => sum + issueCount(p), 0);

  // Filtered + sorted: pages with issues first
  const filteredPages = filterMode === "issues"
    ? pagesWithIssues
    : filterMode === "ok"
      ? pagesOk
      : [...pagesWithIssues, ...pagesOk];

  return (
    <MarketingShell breadcrumbs={[{ label: "SEO Audit" }]}>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-xl font-bold text-foreground">SEO Audit</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Auto-crawl <span className="font-medium">trumoveinc.com</span>, detect on-page issues, and get AI-written improvements.
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" /> Audit Controls
                </CardTitle>
                <CardDescription className="text-xs mt-1">Full crawl auto-analyzes every page found.</CardDescription>
              </div>
              <div className="flex items-center gap-1.5">
                <Input
                  value={singleUrl}
                  onChange={(e) => setSingleUrl(e.target.value)}
                  placeholder="Single URL…"
                  className="h-8 w-48 text-xs"
                  onKeyDown={(e) => e.key === "Enter" && singleUrl && handleAnalyzeSingle()}
                />
                <Button onClick={handleAnalyzeSingle} disabled={analyzing || !singleUrl} variant="secondary" size="sm" className="h-8 shrink-0">
                  {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleFullCrawl} disabled={discovering || analyzing} variant="default" size="sm">
                {(discovering || analyzing) ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <ScanSearch className="w-3 h-3 mr-1" />}
                {discovering ? "Discovering pages…" : analyzing ? `Analyzing…` : "Crawl & Analyze trumoveinc.com"}
              </Button>
              {hasExportable && (
                <Button onClick={handleExportCSV} variant="outline" size="sm">
                  <Download className="w-3 h-3 mr-1" /> Export Approved (CSV)
                </Button>
              )}
            </div>

            {analyzing && analyzeProgress.total > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Analyzing {analyzeProgress.done}/{analyzeProgress.total} pages…
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(analyzeProgress.done / analyzeProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Strip */}
        {auditPages.length > 0 && !analyzing && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-muted/30">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{auditPages.length}</p>
                <p className="text-[11px] text-muted-foreground">Pages Scanned</p>
              </CardContent>
            </Card>
            <Card className={pagesWithIssues.length > 0 ? "bg-destructive/5 border-destructive/20" : "bg-muted/30"}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-destructive">{pagesWithIssues.length}</p>
                <p className="text-[11px] text-muted-foreground">Pages Need Work</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{totalIssues}</p>
                <p className="text-[11px] text-muted-foreground">Total Issues</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{pagesOk.length}</p>
                <p className="text-[11px] text-muted-foreground">Pages OK</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        {auditPages.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ScanSearch className="w-4 h-4 text-primary" /> Audit Results
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3 h-3 text-muted-foreground" />
                  <Button
                    variant={filterMode === "all" ? "default" : "ghost"}
                    size="sm"
                    className="h-6 text-[11px] px-2"
                    onClick={() => setFilterMode("all")}
                  >
                    All ({auditPages.length})
                  </Button>
                  <Button
                    variant={filterMode === "issues" ? "destructive" : "ghost"}
                    size="sm"
                    className="h-6 text-[11px] px-2"
                    onClick={() => setFilterMode("issues")}
                  >
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Needs Work ({pagesWithIssues.length})
                  </Button>
                  <Button
                    variant={filterMode === "ok" ? "default" : "ghost"}
                    size="sm"
                    className="h-6 text-[11px] px-2"
                    onClick={() => setFilterMode("ok")}
                  >
                    <CircleCheck className="w-3 h-3 mr-1" />
                    OK ({pagesOk.length})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[35%]">Page</TableHead>
                    <TableHead className="w-[15%]">Issues</TableHead>
                    <TableHead className="w-[15%]">Title</TableHead>
                    <TableHead className="w-[15%]">Description</TableHead>
                    <TableHead className="w-[20%]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPages.map((page) => {
                    const status = getPageStatus(page.url);
                    const hasIssues = issueCount(page) > 0;
                    return (
                      <Collapsible key={page.url} open={expandedUrl === page.url} onOpenChange={(open) => setExpandedUrl(open ? page.url : null)} asChild>
                        <>
                          <CollapsibleTrigger asChild>
                            <TableRow className={`cursor-pointer hover:bg-muted/50 ${hasIssues ? "border-l-2 border-l-destructive" : ""}`}>
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  {expandedUrl === page.url ? <ChevronUp className="w-3 h-3 shrink-0 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" />}
                                  <div className="min-w-0">
                                    <p className="font-mono text-xs truncate">{page.url.replace("https://trumoveinc.com", "") || "/"}</p>
                                    {hasIssues && (
                                      <p className="text-[10px] text-destructive mt-0.5 truncate">
                                        {page.issues.slice(0, 2).join(" · ")}{page.issues.length > 2 ? ` +${page.issues.length - 2} more` : ""}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {hasIssues ? (
                                  <Badge variant="destructive" className="text-[10px]">
                                    <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                                    {issueCount(page)}
                                  </Badge>
                                ) : (
                                  <Badge variant="default" className="text-[10px]">
                                    <CircleCheck className="w-2.5 h-2.5 mr-0.5" />
                                    OK
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>{charBadge(page.fetchedTitle, 50, 60)}</TableCell>
                              <TableCell>{charBadge(page.fetchedDescription, 150, 160)}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={status === "actioned" ? "default" : status === "ignored" ? "outline" : "secondary"}
                                  className="text-[10px]"
                                >
                                  {status === "actioned" ? "✓ Reviewed" : status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          </CollapsibleTrigger>
                          <CollapsibleContent asChild>
                            <TableRow>
                              <TableCell colSpan={5} className="bg-muted/20 p-5">
                                <AuditPageDetail
                                  page={page}
                                  decisions={decisions[page.url] || defaultDecisions()}
                                  onDecisionChange={handleDecisionChange}
                                  onRegenerate={handleRegenerate}
                                  regenerating={regeneratingUrl === page.url}
                                />
                              </TableCell>
                            </TableRow>
                          </CollapsibleContent>
                        </>
                      </Collapsible>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredPages.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No pages match this filter.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Placeholders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="border-dashed border-border">
            <CardContent className="p-4 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Phase 2: Search Console</p>
                <p className="text-[11px] text-muted-foreground">Connect GSC to import top queries per URL and match titles to real search demand.</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-dashed border-border">
            <CardContent className="p-4 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Phase 3: GA4 Integration</p>
                <p className="text-[11px] text-muted-foreground">Prioritize SEO fixes by conversion data — focus on pages that drive bookings.</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-dashed border-border">
            <CardContent className="p-4 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Authority & Backlinks</p>
                <p className="text-[11px] text-muted-foreground">Placeholder for Ahrefs/Semrush integration — domain authority and backlink data.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-dashed border-primary/20">
          <CardContent className="p-4 flex items-start gap-2">
            <RefreshCw className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-foreground">CMS Integration</p>
              <p className="text-[11px] text-muted-foreground">
                Approved and edited changes are saved to the database.
                Use <strong>Export Approved (CSV)</strong> to download, or a future API can push meta tags directly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MarketingShell>
  );
}
