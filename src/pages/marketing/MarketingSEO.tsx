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
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AuditPage {
  id?: string;
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
  status: "pending" | "approved" | "exported";
}

export default function MarketingSEO() {
  const [singleUrl, setSingleUrl] = useState("");
  const [discoveredUrls, setDiscoveredUrls] = useState<string[]>([]);
  const [auditPages, setAuditPages] = useState<AuditPage[]>([]);
  const [discovering, setDiscovering] = useState(false);
  const [discoverySource, setDiscoverySource] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null);
  const [analyzeProgress, setAnalyzeProgress] = useState({ done: 0, total: 0 });

  const handleDiscover = async () => {
    setDiscovering(true);
    setDiscoveredUrls([]);
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
      toast.success(`Found ${urls.length} pages via ${source === "sitemap" ? "sitemap.xml" : "link crawl"}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to discover pages");
    } finally {
      setDiscovering(false);
    }
  };

  const analyzeUrls = async (urls: string[]) => {
    setAnalyzing(true);
    setAuditPages([]);
    const allResults: AuditPage[] = [];
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
          status: "pending" as const,
        }));
        allResults.push(...results);
        setAuditPages([...allResults]);
        setAnalyzeProgress({ done: Math.min(i + batchSize, total), total });
      } catch (e: any) {
        console.error("Batch error:", e);
        batch.forEach((u) =>
          allResults.push({
            url: u, fetchedTitle: null, fetchedDescription: null, fetchedH1: null,
            fetchedCanonical: null, issues: [`Analysis failed: ${e.message}`],
            suggestedTitle: null, suggestedDescription: null, suggestedH1: null,
            aiChecklist: [], status: "pending",
          })
        );
        setAuditPages([...allResults]);
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
    toast.success(`Audit complete — ${allResults.length} pages analyzed`);
  };

  const handleAnalyzeSingle = async () => {
    if (!singleUrl) return toast.error("Enter a URL");
    let u = singleUrl.trim();
    if (!u.startsWith("http")) u = `https://${u}`;
    await analyzeUrls([u]);
  };

  const handleAnalyzeAll = async () => {
    if (!discoveredUrls.length) return;
    await analyzeUrls(discoveredUrls);
  };

  const handleApprove = async (url: string) => {
    setAuditPages((prev) =>
      prev.map((p) => (p.url === url ? { ...p, status: "approved" } : p))
    );
    try {
      await supabase
        .from("seo_audit_pages" as any)
        .update({ status: "approved" } as any)
        .eq("url", url);
      toast.success("Suggestion approved");
    } catch {}
  };

  const handleExportCSV = () => {
    const approved = auditPages.filter((p) => p.status === "approved");
    if (!approved.length) {
      toast.error("Approve at least one suggestion first");
      return;
    }
    const header = "URL,Current Title,Suggested Title,Current Description,Suggested Description,Current H1,Suggested H1,Issues\n";
    const rows = approved
      .map((p) =>
        [
          `"${p.url}"`,
          `"${(p.fetchedTitle || "").replace(/"/g, '""')}"`,
          `"${(p.suggestedTitle || "").replace(/"/g, '""')}"`,
          `"${(p.fetchedDescription || "").replace(/"/g, '""')}"`,
          `"${(p.suggestedDescription || "").replace(/"/g, '""')}"`,
          `"${(p.fetchedH1 || "").replace(/"/g, '""')}"`,
          `"${(p.suggestedH1 || "").replace(/"/g, '""')}"`,
          `"${(p.issues || []).join("; ").replace(/"/g, '""')}"`,
        ].join(",")
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `seo-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success("CSV exported");
  };

  const issueCount = (p: AuditPage) => p.issues?.length || 0;
  const charBadge = (text: string | null, min: number, max: number) => {
    if (!text) return <Badge variant="destructive" className="text-[10px] font-normal">Missing</Badge>;
    const len = text.length;
    const ok = len >= min && len <= max;
    return (
      <Badge variant={ok ? "default" : "secondary"} className="text-[10px] font-normal">
        {len} chars {ok ? "✓" : `(${min}–${max})`}
      </Badge>
    );
  };

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
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Audit Controls
            </CardTitle>
            <CardDescription className="text-xs">Crawl the full site or audit a single page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Crawl site */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleDiscover} disabled={discovering || analyzing} variant="default" size="sm">
                {discovering ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <ScanSearch className="w-3 h-3 mr-1" />}
                Crawl trumoveinc.com
              </Button>
              {discoveredUrls.length > 0 && (
                <Button onClick={handleAnalyzeAll} disabled={analyzing} variant="default" size="sm">
                  {analyzing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                  Analyze {discoveredUrls.length} pages
                </Button>
              )}
              {auditPages.some((p) => p.status === "approved") && (
                <Button onClick={handleExportCSV} variant="outline" size="sm">
                  <Download className="w-3 h-3 mr-1" /> Export Approved (CSV)
                </Button>
              )}
            </div>

            {/* Discovered URLs preview */}
            {discoveredUrls.length > 0 && !auditPages.length && (
              <div className="bg-muted/50 rounded-lg p-3 max-h-40 overflow-auto text-xs space-y-0.5">
                {discoveredUrls.map((u) => (
                  <div key={u} className="flex items-center gap-1.5 text-muted-foreground">
                    <Link2 className="w-3 h-3 shrink-0" />
                    <span className="truncate">{u}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Single URL */}
            <div className="flex gap-2 items-end border-t border-border pt-4">
              <div className="flex-1 space-y-1.5">
                <span className="text-xs font-medium text-foreground">Or audit a single page</span>
                <Input
                  value={singleUrl}
                  onChange={(e) => setSingleUrl(e.target.value)}
                  placeholder="https://trumoveinc.com/long-distance-movers-dallas"
                />
              </div>
              <Button onClick={handleAnalyzeSingle} disabled={analyzing || !singleUrl} variant="secondary" size="sm" className="shrink-0">
                {analyzing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Search className="w-3 h-3 mr-1" />}
                Audit
              </Button>
            </div>

            {/* Progress */}
            {analyzing && analyzeProgress.total > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Analyzing {analyzeProgress.done}/{analyzeProgress.total} pages…
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Table */}
        {auditPages.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ScanSearch className="w-4 h-4 text-primary" /> Audit Results
                <Badge variant="secondary" className="ml-auto text-[10px]">{auditPages.length} pages</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">URL</TableHead>
                    <TableHead className="w-[15%]">Issues</TableHead>
                    <TableHead className="w-[15%]">Title</TableHead>
                    <TableHead className="w-[15%]">Description</TableHead>
                    <TableHead className="w-[15%]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditPages.map((page) => (
                    <Collapsible key={page.url} open={expandedUrl === page.url} onOpenChange={(open) => setExpandedUrl(open ? page.url : null)} asChild>
                      <>
                        <CollapsibleTrigger asChild>
                          <TableRow className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-mono text-xs truncate max-w-[300px]">
                              <div className="flex items-center gap-1">
                                {expandedUrl === page.url ? <ChevronUp className="w-3 h-3 shrink-0" /> : <ChevronDown className="w-3 h-3 shrink-0" />}
                                <span className="truncate">{page.url.replace("https://trumoveinc.com", "")|| "/"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {issueCount(page) > 0 ? (
                                <Badge variant="destructive" className="text-[10px]">{issueCount(page)} issues</Badge>
                              ) : (
                                <Badge variant="default" className="text-[10px]">OK</Badge>
                              )}
                            </TableCell>
                            <TableCell>{charBadge(page.fetchedTitle, 50, 60)}</TableCell>
                            <TableCell>{charBadge(page.fetchedDescription, 150, 160)}</TableCell>
                            <TableCell>
                              <Badge
                                variant={page.status === "approved" ? "default" : "secondary"}
                                className="text-[10px]"
                              >
                                {page.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        </CollapsibleTrigger>
                        <CollapsibleContent asChild>
                          <TableRow>
                            <TableCell colSpan={5} className="bg-muted/30 p-4">
                              <div className="space-y-4 max-w-3xl">
                                {/* Issues */}
                                {page.issues.length > 0 && (
                                  <div className="space-y-1">
                                    <span className="text-xs font-semibold text-destructive">Issues Detected</span>
                                    <ul className="space-y-1">
                                      {page.issues.map((issue, i) => (
                                        <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                                          <AlertCircle className="w-3 h-3 text-destructive mt-0.5 shrink-0" />
                                          {issue}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Current vs Suggested */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <span className="text-xs font-semibold text-muted-foreground">Current</span>
                                    <div className="space-y-1 text-xs">
                                      <div><span className="font-medium">Title:</span> {page.fetchedTitle || <span className="text-destructive">Missing</span>}</div>
                                      <div><span className="font-medium">Description:</span> {page.fetchedDescription || <span className="text-destructive">Missing</span>}</div>
                                      <div><span className="font-medium">H1:</span> {page.fetchedH1 || <span className="text-destructive">Missing</span>}</div>
                                      <div><span className="font-medium">Canonical:</span> {page.fetchedCanonical || <span className="text-destructive">Missing</span>}</div>
                                    </div>
                                  </div>
                                  {page.suggestedTitle && (
                                    <div className="space-y-2">
                                      <span className="text-xs font-semibold text-primary">AI Suggestions</span>
                                      <div className="space-y-1 text-xs">
                                        <div className="flex items-start gap-1">
                                          <span className="font-medium shrink-0">Title:</span>
                                          <span className="font-mono bg-primary/5 px-1.5 py-0.5 rounded">{page.suggestedTitle}</span>
                                          {charBadge(page.suggestedTitle, 50, 60)}
                                        </div>
                                        <div className="flex items-start gap-1">
                                          <span className="font-medium shrink-0">Description:</span>
                                          <span className="font-mono bg-primary/5 px-1.5 py-0.5 rounded">{page.suggestedDescription}</span>
                                          {charBadge(page.suggestedDescription, 150, 160)}
                                        </div>
                                        {page.suggestedH1 && (
                                          <div><span className="font-medium">H1:</span> <span className="font-mono bg-primary/5 px-1.5 py-0.5 rounded">{page.suggestedH1}</span></div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Checklist */}
                                {page.aiChecklist.length > 0 && (
                                  <div className="space-y-1">
                                    <span className="text-xs font-semibold text-foreground">Fix-First Checklist</span>
                                    <ul className="space-y-1">
                                      {page.aiChecklist.map((item, i) => (
                                        <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                                          <CheckCircle2 className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Approve */}
                                <div className="flex gap-2 pt-1">
                                  {page.status !== "approved" && page.suggestedTitle && (
                                    <Button size="sm" onClick={() => handleApprove(page.url)}>
                                      <CheckCircle2 className="w-3 h-3 mr-1" /> Approve Suggestions
                                    </Button>
                                  )}
                                  {page.status === "approved" && (
                                    <div className="flex items-center gap-1.5 text-xs text-primary">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Approved — included in CSV export
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  ))}
                </TableBody>
              </Table>
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

        {/* CMS integration note */}
        <Card className="border-dashed border-primary/20">
          <CardContent className="p-4 flex items-start gap-2">
            <RefreshCw className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-foreground">CMS Integration</p>
              <p className="text-[11px] text-muted-foreground">
                Since trumoveinc.com is built with Lovable, approved changes are saved to the database.
                Use <strong>Export Approved (CSV)</strong> to download and apply them, or a future API integration
                can push meta tags directly to the site's page configuration.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MarketingShell>
  );
}
