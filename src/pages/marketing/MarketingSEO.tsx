import { useState, useCallback, useMemo, useEffect } from "react";
import { scorePage, applyOpportunityBonus, severityColor, type PageScore } from "@/components/seo/seoScoring";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MarketingShell from "@/components/layout/MarketingShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Search, Sparkles, Globe, CheckCircle2, AlertCircle, Loader2,
  Download, ChevronDown, ChevronUp, RefreshCw, ScanSearch, Link2,
  AlertTriangle, CircleCheck, Filter, XCircle, EyeOff, Expand,
  BarChart3, ExternalLink, Shield, HelpCircle,
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import AuditPageDetail, { type PageDecisions, type FieldStatus } from "@/components/seo/AuditPageDetail";
import SeoOverviewStrip from "@/components/seo/SeoOverviewStrip";
import SearchConsoleTab from "@/components/seo/SearchConsoleTab";
import GA4Tab from "@/components/seo/GA4Tab";
import BacklinksTab from "@/components/seo/BacklinksTab";
import SeoComplianceSettings, { checkViolations, useSeoCompliance } from "@/components/seo/SeoComplianceSettings";
import type { PhaseInfo } from "@/components/seo/types";

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
  violations?: string[];
  // Two-pass debug fields
  rawTitle?: string | null;
  renderedTitle?: string | null;
  rawDescription?: string | null;
  renderedDescription?: string | null;
  sourceUsed?: "raw" | "rendered";
}

const defaultDecisions = (): PageDecisions => ({
  title: { status: "pending" },
  description: { status: "pending" },
  h1: { status: "pending" },
  issues: {},
});

type FilterMode = "all" | "issues" | "ok";
type SidebarItem = { url: string; field: string; fieldKey: "title" | "description" | "h1" | string; value: string; status: FieldStatus; isIssue: boolean };

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
  const [complianceOpen, setComplianceOpen] = useState(false);

  const sitemapPages = useMemo(() => {
    const all = new Set([...discoveredUrls, ...auditPages.map(p => p.url)]);
    return Array.from(all).sort();
  }, [discoveredUrls, auditPages]);
  const [regeneratingUrl, setRegeneratingUrl] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [expandedSidebarItem, setExpandedSidebarItem] = useState<SidebarItem | null>(null);
  const [activeTab, setActiveTab] = useState("phase1");
  const [regeneratingAll, setRegeneratingAll] = useState(false);
  const [gscConnected, setGscConnected] = useState(false);
  const [ga4Connected, setGa4Connected] = useState(false);
  const [refreshingStatus, setRefreshingStatus] = useState(false);
  const { settings: complianceSettings, reload: reloadCompliance } = useSeoCompliance();

  const checkConnections = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [gscRes, ga4Res] = await Promise.all([
      supabase.from("gsc_connections").select("id").eq("user_id", user.id).limit(1),
      supabase.from("integration_connections").select("id").eq("user_id", user.id).eq("integration_id", "ga4").eq("connected", true).limit(1),
    ]);
    setGscConnected(!!(gscRes.data && gscRes.data.length > 0));
    setGa4Connected(!!(ga4Res.data && ga4Res.data.length > 0));
  }, []);

  // Auto-detect connections on mount
  useEffect(() => { checkConnections(); }, [checkConnections]);

  const handleRefreshStatus = useCallback(async () => {
    setRefreshingStatus(true);
    await checkConnections();
    setRefreshingStatus(false);
  }, [checkConnections]);

  // Phase statuses — purely audit progress (pizza tracker)
  const phase1Status = analyzing || discovering ? "in_progress" : auditPages.length > 0 ? "completed" : "not_started";
  // Phase 2: has GSC data been pulled for any page?
  const [phase2Done, setPhase2Done] = useState(false);
  const phase2Status = phase2Done ? "completed" : "not_started";

  const phases: PhaseInfo[] = [
    { id: 1, label: "Crawl / Audit", status: phase1Status, lastSync: auditPages.length > 0 ? new Date().toISOString() : null },
    { id: 2, label: "Search Console Review", status: phase2Status },
    { id: 3, label: "GA4 Review", status: "not_started" },
    { id: 4, label: "Backlinks", status: "coming_soon" },
  ];

  // Integration connection info (separate from phases)
  const integrations = [
    { name: "Google Search Console", connected: gscConnected, helpUrl: "https://search.google.com/search-console/about" },
    { name: "Google Analytics 4", connected: ga4Connected, helpUrl: "https://analytics.google.com" },
  ];

  // Compute weighted scores for all pages
  const pageScores = useMemo(() => {
    const scoreMap: Record<string, PageScore> = {};
    auditPages.forEach((page) => {
      scoreMap[page.url] = scorePage(page, auditPages);
    });
    return scoreMap;
  }, [auditPages]);

  const totalIssues = Object.values(pageScores).reduce((sum, s) => sum + s.issue_count, 0);

  const phaseMeta: Record<string, { icon: typeof ScanSearch; title: string; description: string; status: PhaseInfo["status"] }> = {
    phase1: { icon: ScanSearch, title: "Crawl / Audit", description: "Discover pages and audit metadata.", status: phases[0].status },
    phase2: { icon: Search, title: "Search Console", description: "Pull query and ranking data.", status: phases[1].status },
    phase3: { icon: BarChart3, title: "GA4", description: "Review sessions and conversions.", status: phases[2].status },
    phase4: { icon: ExternalLink, title: "Backlinks", description: "Track authority and referring domains.", status: phases[3].status },
  };

  const phaseStatusBadgeVariant = (status: PhaseInfo["status"]) => {
    if (status === "completed" || status === "connected") return "default";
    if (status === "in_progress" || status === "syncing") return "default";
    if (status === "error") return "destructive";
    if (status === "coming_soon") return "outline";
    if (status === "not_started") return "secondary";
    return "secondary";
  };

  const phaseStatusLabel = (phase: PhaseInfo) => {
    if (phase.status === "completed") return "✓ Completed";
    if (phase.status === "in_progress") return "In Progress…";
    if (phase.status === "not_started") return "Not Started";
    if (phase.status === "connected") return `Connected`;
    if (phase.status === "syncing") return "Syncing";
    if (phase.status === "error") return "Error";
    if (phase.status === "coming_soon") return "Coming Soon";
    return "Not Connected";
  };

  // ─── Phase 1 Logic (unchanged) ───
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
          issueSuggestions: r.issueSuggestions || [],
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
            aiChecklist: [], issueSuggestions: [],
          });
          allDecisions[u] = defaultDecisions();
        });
        setAuditPages([...allResults]);
        setDecisions({ ...allDecisions });
      }
    }

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

  const handleDecisionChange = async (url: string, d: PageDecisions) => {
    setDecisions((prev) => ({ ...prev, [url]: d }));

    const updates: any = {};
    if (d.title.status === "approved") updates.suggested_title = auditPages.find(p => p.url === url)?.suggestedTitle;
    if (d.title.status === "edited") updates.suggested_title = d.title.editedValue;
    if (d.description.status === "approved") updates.suggested_description = auditPages.find(p => p.url === url)?.suggestedDescription;
    if (d.description.status === "edited") updates.suggested_description = d.description.editedValue;
    if (d.h1.status === "approved") updates.suggested_h1 = auditPages.find(p => p.url === url)?.suggestedH1;
    if (d.h1.status === "edited") updates.suggested_h1 = d.h1.editedValue;

    const anyApproved = ["approved", "edited", "published"].includes(d.title.status) ||
      ["approved", "edited", "published"].includes(d.description.status) ||
      ["approved", "edited", "published"].includes(d.h1.status);
    if (anyApproved) updates.status = "approved";

    if (Object.keys(updates).length > 0) {
      supabase.from("seo_audit_pages" as any).update(updates as any).eq("url", url).then();
    }

    const page = auditPages.find(p => p.url === url);
    if (!page) return;

    const finalTitle = d.title.status === "published"
      ? (d.title.editedValue || page.suggestedTitle)
      : null;
    const finalDesc = d.description.status === "published"
      ? (d.description.editedValue || page.suggestedDescription)
      : null;

    if (finalTitle || finalDesc) {
      let rawPath = "/";
      try { rawPath = new URL(url).pathname; } catch {}
      const urlPath = rawPath === "/" ? "/site" : `/site${rawPath}`;

      const override: Record<string, any> = { url_path: urlPath, updated_at: new Date().toISOString() };
      if (finalTitle) override.title = finalTitle;
      if (finalDesc) override.description = finalDesc;

      const { error } = await supabase
        .from("seo_overrides" as any)
        .upsert(override as any, { onConflict: "url_path" });

      if (error) {
        console.error("Failed to save SEO override:", error);
      } else {
        toast.success(`Published SEO changes for ${urlPath}`);
      }
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
          p.url === url ? { ...p, suggestedTitle: result.suggestedTitle, suggestedDescription: result.suggestedDescription, suggestedH1: result.suggestedH1, aiChecklist: result.aiChecklist || [], issueSuggestions: result.issueSuggestions || [] } : p
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

  const handleRegenerateAll = async () => {
    if (auditPages.length === 0) return;
    setRegeneratingAll(true);
    const allUrls = auditPages.map(p => p.url);
    toast.info(`Regenerating suggestions for ${allUrls.length} pages with updated compliance rules...`);
    await analyzeUrls(allUrls);
    setRegeneratingAll(false);
    toast.success("All suggestions regenerated with compliance constraints");
  };

  const getViolationsForPage = (page: AuditPage): string[] => {
    if (!complianceSettings) return page.violations || [];
    const textsToCheck = [
      page.suggestedTitle, page.suggestedDescription, page.suggestedH1,
      ...page.aiChecklist,
      ...(page.issueSuggestions || []).map(s => s.suggestion),
    ].filter(Boolean) as string[];
    const allViolations: string[] = [];
    textsToCheck.forEach(text => {
      allViolations.push(...checkViolations(text, complianceSettings.forbiddenTerms));
    });
    return [...new Set(allViolations)];
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

  const handleApplyToCode = () => {
    const lines: string[] = ["Apply these approved SEO changes to the source code:\n"];
    auditPages.forEach((p) => {
      const d = decisions[p.url];
      if (!d) return;
      const titleVal = d.title.status === "edited" ? d.title.editedValue : d.title.status === "approved" ? p.suggestedTitle : null;
      const descVal = d.description.status === "edited" ? d.description.editedValue : d.description.status === "approved" ? p.suggestedDescription : null;
      const h1Val = d.h1.status === "edited" ? d.h1.editedValue : d.h1.status === "approved" ? p.suggestedH1 : null;
      if (!titleVal && !descVal && !h1Val) return;

      lines.push(`## ${p.url}`);
      if (titleVal) lines.push(`- **Title**: ${titleVal}`);
      if (descVal) lines.push(`- **Meta Description**: ${descVal}`);
      if (h1Val) lines.push(`- **H1**: ${h1Val}`);

      const issueKeys = Object.keys(d.issues || {});
      issueKeys.forEach((key) => {
        const id = d.issues[key];
        if (id.status === "approved" || id.status === "edited") {
          const matched = p.issueSuggestions?.find(s => s.issue === key);
          const fix = id.status === "edited" ? id.editedValue : matched?.suggestion;
          if (fix) lines.push(`- **Fix "${key}"**: ${fix}`);
        }
      });
      lines.push("");
    });

    if (lines.length <= 1) {
      toast.error("Approve or edit at least one field first");
      return;
    }

    const prompt = lines.join("\n");
    navigator.clipboard.writeText(prompt).then(() => {
      toast.success("Copied! Paste this into the Lovable chat to apply changes to your code.");
    }).catch(() => {
      const w = window.open("", "_blank");
      if (w) { w.document.write(`<pre>${prompt}</pre>`); }
    });
  };

  const getPageStatus = (url: string) => {
    const d = decisions[url];
    if (!d) return "pending";
    const statuses = [d.title.status, d.description.status, d.h1.status, ...Object.values(d.issues || {}).map(v => v.status)];
    if (statuses.every((s) => s === "ignored" || s === "published")) return "ignored";
    if (statuses.some((s) => s === "approved" || s === "edited")) return "actioned";
    if (statuses.some((s) => s === "published")) return "actioned";
    return "pending";
  };

  const issueCount = (p: AuditPage) => pageScores[p.url]?.issue_count || 0;
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
  const pagesWithIssues = auditPages.filter(p => issueCount(p) > 0);
  const pagesOk = auditPages.filter(p => issueCount(p) === 0);

  const filteredPages = useMemo(() => {
    const base = filterMode === "issues"
      ? pagesWithIssues
      : filterMode === "ok"
        ? pagesOk
        : [...pagesWithIssues, ...pagesOk];
    return base.sort((a, b) => (pageScores[b.url]?.weighted_score || 0) - (pageScores[a.url]?.weighted_score || 0));
  }, [filterMode, pagesWithIssues, pagesOk, pageScores]);

  // Sidebar items
  const sidebarItems: SidebarItem[] = auditPages.flatMap((page) => {
    const d = decisions[page.url];
    if (!d) return [];
    const items: SidebarItem[] = [];
    const fields: Array<{ key: "title" | "description" | "h1"; label: string; suggested: string | null }> = [
      { key: "title", label: "Title", suggested: page.suggestedTitle },
      { key: "description", label: "Description", suggested: page.suggestedDescription },
      { key: "h1", label: "H1", suggested: page.suggestedH1 },
    ];
    fields.forEach(({ key, label, suggested }) => {
      const fd = d[key];
      if (["approved", "edited", "ignored", "published"].includes(fd.status)) {
        items.push({ url: page.url, field: label, fieldKey: key, value: fd.editedValue || suggested || "", status: fd.status, isIssue: false });
      }
    });
    Object.entries(d.issues || {}).forEach(([issueKey, fd]) => {
      if (["approved", "edited", "ignored", "published"].includes(fd.status)) {
        const matched = page.issueSuggestions?.find(s => s.issue === issueKey);
        items.push({ url: page.url, field: issueKey, fieldKey: issueKey, value: fd.editedValue || matched?.suggestion || "", status: fd.status, isIssue: true });
      }
    });
    return items;
  });

  const acceptedItems = sidebarItems.filter(i => i.status === "approved" || i.status === "edited");
  const ignoredItems = sidebarItems.filter(i => i.status === "ignored");
  const publishedSidebarItems = sidebarItems.filter(i => i.status === "published");

  const handleSidebarPublish = (item: SidebarItem) => {
    const d = decisions[item.url];
    if (!d) return;
    if (item.isIssue) {
      handleDecisionChange(item.url, { ...d, issues: { ...d.issues, [item.fieldKey]: { ...d.issues[item.fieldKey], status: "published" } } });
    } else {
      handleDecisionChange(item.url, { ...d, [item.fieldKey]: { ...d[item.fieldKey as "title" | "description" | "h1"], status: "published" } });
    }
  };

  const handlePublishAll = async () => {
    let updatedDecisions = { ...decisions };
    for (const item of acceptedItems) {
      const d = updatedDecisions[item.url];
      if (!d) continue;
      if (item.isIssue) {
        updatedDecisions[item.url] = { ...d, issues: { ...d.issues, [item.fieldKey]: { ...d.issues[item.fieldKey], status: "published" as const } } };
      } else {
        updatedDecisions[item.url] = { ...d, [item.fieldKey]: { ...d[item.fieldKey as "title" | "description" | "h1"], status: "published" as const } };
      }
    }
    setDecisions(updatedDecisions);

    const affectedUrls = [...new Set(acceptedItems.map(i => i.url))];
    for (const url of affectedUrls) {
      const d = updatedDecisions[url];
      const page = auditPages.find(p => p.url === url);
      if (!d || !page) continue;

      const finalTitle = d.title.status === "published" ? (d.title.editedValue || page.suggestedTitle) : null;
      const finalDesc = d.description.status === "published" ? (d.description.editedValue || page.suggestedDescription) : null;

      if (finalTitle || finalDesc) {
        let rawPath = "/";
        try { rawPath = new URL(url).pathname; } catch {}
        const urlPath = rawPath === "/" ? "/site" : `/site${rawPath}`;
        const override: Record<string, any> = { url_path: urlPath, updated_at: new Date().toISOString() };
        if (finalTitle) override.title = finalTitle;
        if (finalDesc) override.description = finalDesc;
        await supabase.from("seo_overrides" as any).upsert(override as any, { onConflict: "url_path" });
      }
    }
    toast.success(`Published ${acceptedItems.length} changes`);
  };

  const handleSidebarRemove = async (item: SidebarItem) => {
    const d = decisions[item.url];
    if (!d) return;

    if (item.status === "published" && !item.isIssue) {
      let rawPath = "/";
      try { rawPath = new URL(item.url).pathname; } catch {}
      const urlPath = rawPath === "/" ? "/site" : `/site${rawPath}`;

      const updatedField = { ...d[item.fieldKey as "title" | "description" | "h1"], status: "approved" as const };
      const newD = { ...d, [item.fieldKey]: updatedField };

      const stillPublished = ["title", "description", "h1"].some(
        f => f !== item.fieldKey && newD[f as "title" | "description" | "h1"].status === "published"
      );

      if (!stillPublished) {
        await supabase.from("seo_overrides" as any).delete().eq("url_path", urlPath);
      } else {
        const nullUpdate: Record<string, any> = { updated_at: new Date().toISOString() };
        nullUpdate[item.fieldKey] = null;
        await supabase.from("seo_overrides" as any).update(nullUpdate as any).eq("url_path", urlPath);
      }

      handleDecisionChange(item.url, newD);
      toast.success(`Unpublished ${item.field} — reverted to approved`);
      return;
    }

    if (item.isIssue) {
      handleDecisionChange(item.url, { ...d, issues: { ...d.issues, [item.fieldKey]: { status: "pending" } } });
    } else {
      handleDecisionChange(item.url, { ...d, [item.fieldKey]: { status: "pending" } });
    }
  };

  return (
    <MarketingShell breadcrumbs={[{ label: "SEO Module" }]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">SEO Module</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Full SEO pipeline — crawl, audit, analyze search data, and track backlinks in one place.
          </p>
        </div>

        {/* Overview Strip */}
        <SeoOverviewStrip
          totalUrls={auditPages.length}
          totalIssues={totalIssues}
          phases={phases}
          integrations={integrations}
          onRefresh={handleRefreshStatus}
          refreshing={refreshingStatus}
        />


        {/* Phase Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid h-auto w-full grid-cols-1 gap-2 bg-transparent p-0 md:grid-cols-2 xl:grid-cols-4">
            {Object.entries(phaseMeta).map(([value, meta], index) => {
              const Icon = meta.icon;
              const phase = phases[index];
              return (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="h-auto items-start justify-start rounded-xl border bg-muted/20 p-4 text-left data-[state=active]:border-primary data-[state=active]:bg-background"
                >
                  <div className="flex w-full items-start justify-between gap-3">
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2 text-foreground">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Phase {index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{meta.title}</p>
                        <p className="text-xs text-muted-foreground">{meta.description}</p>
                      </div>
                    </div>
                    <Badge variant={phaseStatusBadgeVariant(phase.status)} className="text-[10px] shrink-0">
                      {phaseStatusLabel(phase)}
                    </Badge>
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Phase 1: Crawl / Audit */}
          <TabsContent value="phase1" className="mt-4">
            <div className="flex gap-6">
              <div className="space-y-6 flex-1 min-w-0">
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
                        <Select value={singleUrl} onValueChange={(v) => setSingleUrl(v)}>
                          <SelectTrigger className="h-8 w-56 text-xs">
                            <SelectValue placeholder="Select a page…" />
                          </SelectTrigger>
                          <SelectContent className="max-h-64">
                            {sitemapPages.length === 0 && (
                              <SelectItem value="__empty" disabled className="text-xs text-muted-foreground">
                                Run a crawl first to populate pages
                              </SelectItem>
                            )}
                            {sitemapPages.map((u) => (
                              <SelectItem key={u} value={u} className="text-xs font-mono">
                                {u.replace("https://trumoveinc.com", "") || "/"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <>
                          <Button onClick={handleApplyToCode} variant="default" size="sm">
                            <Sparkles className="w-3 h-3 mr-1" /> Apply to Code (Copy Prompt)
                          </Button>
                          <Button onClick={handleExportCSV} variant="outline" size="sm">
                            <Download className="w-3 h-3 mr-1" /> Export CSV
                          </Button>
                        </>
                      )}
                      {auditPages.length > 0 && (
                        <Button onClick={handleRegenerateAll} disabled={regeneratingAll || analyzing} variant="outline" size="sm">
                          {regeneratingAll ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                          {regeneratingAll ? "Regenerating…" : "Regenerate All (New Constraints)"}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setComplianceOpen(true)}>
                        <Shield className="w-3 h-3 mr-1" /> Allowed & Forbidden Terms
                      </Button>
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

                {/* Compliance Settings Modal */}
                <SeoComplianceSettings open={complianceOpen} onOpenChange={setComplianceOpen} onSettingsChange={() => reloadCompliance()} />

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

                {/* Results Table */}
                {auditPages.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <ScanSearch className="w-4 h-4 text-primary" /> Audit Results
                        </CardTitle>
                        <div className="flex items-center gap-1.5">
                          <Filter className="w-3 h-3 text-muted-foreground" />
                          <Button variant={filterMode === "all" ? "default" : "ghost"} size="sm" className="h-6 text-[11px] px-2" onClick={() => setFilterMode("all")}>
                            All ({auditPages.length})
                          </Button>
                          <Button variant={filterMode === "issues" ? "destructive" : "ghost"} size="sm" className="h-6 text-[11px] px-2" onClick={() => setFilterMode("issues")}>
                            <AlertTriangle className="w-3 h-3 mr-1" /> Needs Work ({pagesWithIssues.length})
                          </Button>
                          <Button variant={filterMode === "ok" ? "default" : "ghost"} size="sm" className="h-6 text-[11px] px-2" onClick={() => setFilterMode("ok")}>
                            <CircleCheck className="w-3 h-3 mr-1" /> OK ({pagesOk.length})
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[30%]">Page</TableHead>
                            <TableHead className="w-[10%]">Score</TableHead>
                            <TableHead className="w-[20%]">Top Issues</TableHead>
                            <TableHead className="w-[12%]">Title</TableHead>
                            <TableHead className="w-[12%]">Description</TableHead>
                            <TableHead className="w-[16%]">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPages.map((page) => {
                            const status = getPageStatus(page.url);
                            const score = pageScores[page.url];
                            const hasIssues = (score?.issue_count || 0) > 0;
                            const violations = getViolationsForPage(page);
                            const topIssues = score?.issues.slice(0, 2) || [];
                            return (
                              <Collapsible key={page.url} open={expandedUrl === page.url} onOpenChange={(open) => setExpandedUrl(open ? page.url : null)} asChild>
                                <>
                                  <CollapsibleTrigger asChild>
                                    <TableRow className={`cursor-pointer hover:bg-muted/50 ${hasIssues ? "border-l-2 border-l-destructive" : ""}`}>
                                      <TableCell>
                                        <div className="flex items-center gap-1.5">
                                          {expandedUrl === page.url ? <ChevronUp className="w-3 h-3 shrink-0 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" />}
                                          <p className="font-mono text-xs truncate min-w-0">{page.url.replace("https://trumoveinc.com", "") || "/"}</p>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <TooltipProvider delayDuration={200}>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <div>
                                                {hasIssues ? (
                                                  <Badge variant={score.weighted_score >= 40 ? "destructive" : "secondary"} className="text-[10px] cursor-help">
                                                    {score.weighted_score} pts
                                                  </Badge>
                                                ) : (
                                                  <Badge variant="default" className="text-[10px]">
                                                    <CircleCheck className="w-2.5 h-2.5 mr-0.5" /> 0
                                                  </Badge>
                                                )}
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="right" className="max-w-xs">
                                              <p className="font-semibold text-xs mb-1">Why this score? ({score?.issue_count || 0} issues)</p>
                                              {score?.issues.length ? (
                                                <ul className="space-y-0.5">
                                                  {score.issues.map((iss, idx) => (
                                                    <li key={idx} className="text-[11px] flex items-center gap-1">
                                                      <Badge variant={severityColor(iss.severity)} className="text-[9px] h-3.5 px-1 shrink-0">
                                                        {iss.severity} +{iss.points}
                                                      </Badge>
                                                      <span className="truncate">{iss.label}</span>
                                                    </li>
                                                  ))}
                                                </ul>
                                              ) : (
                                                <p className="text-[11px] text-muted-foreground">No issues detected</p>
                                              )}
                                              {score?.opportunity_bonus > 0 && (
                                                <p className="text-[11px] mt-1 text-primary">+{score.opportunity_bonus} opportunity bonus (GSC data)</p>
                                              )}
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </TableCell>
                                      <TableCell>
                                        <div className="space-y-0.5">
                                          {topIssues.length > 0 ? topIssues.map((iss, i) => (
                                            <p key={i} className="text-[10px] text-muted-foreground truncate">{iss.label}</p>
                                          )) : (
                                            <p className="text-[10px] text-muted-foreground">—</p>
                                          )}
                                          {(score?.issue_count || 0) > 2 && (
                                            <p className="text-[9px] text-muted-foreground/60">+{score.issue_count - 2} more</p>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell>{charBadge(page.fetchedTitle, 50, 60)}</TableCell>
                                      <TableCell>{charBadge(page.fetchedDescription, 150, 160)}</TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-1 flex-wrap">
                                          <Badge variant={status === "actioned" ? "default" : status === "ignored" ? "outline" : "secondary"} className="text-[10px]">
                                            {status === "actioned" ? "✓ Reviewed" : status}
                                          </Badge>
                                          {violations.length > 0 && (
                                            <Badge variant="destructive" className="text-[9px] h-4 gap-0.5">
                                              <AlertTriangle className="w-2.5 h-2.5" /> {violations.length} violation{violations.length > 1 ? "s" : ""}
                                            </Badge>
                                          )}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent asChild>
                                    <TableRow>
                                      <TableCell colSpan={6} className="bg-muted/20 p-5">
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
              </div>

              {/* Changes Sidebar */}
              <div className="w-72 shrink-0 hidden lg:block">
                <div className="sticky top-6 space-y-4">
                  {/* Accepted Changes */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" /> Accepted ({acceptedItems.length})
                        </CardTitle>
                        {acceptedItems.length > 0 && (
                          <Button variant="default" size="sm" className="h-6 text-[10px] px-2 gap-1" onClick={handlePublishAll}>
                            <Sparkles className="w-3 h-3" /> Publish All
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1.5">
                      {acceptedItems.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground py-2 text-center">No accepted changes yet</p>
                      ) : (
                        acceptedItems.map((item, i) => (
                          <div key={`a-${item.url}-${item.fieldKey}-${i}`} className="rounded-lg border border-primary/20 bg-primary/5 p-2 space-y-0.5">
                            <div className="flex items-center justify-between gap-1">
                              <Badge variant="default" className="text-[9px] h-4 px-1.5 shrink-0">{item.field}</Badge>
                              <div className="flex items-center gap-0.5 shrink-0">
                                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => setExpandedSidebarItem(item)}>
                                  <Expand className="w-3 h-3 text-muted-foreground" />
                                </Button>
                                <Button variant="default" size="sm" className="h-5 text-[9px] px-1.5" onClick={() => handleSidebarPublish(item)}>
                                  Publish
                                </Button>
                                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => handleSidebarRemove(item)}>
                                  <XCircle className="w-3 h-3 text-muted-foreground" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-[10px] font-mono text-muted-foreground truncate">
                              {item.url.replace("https://trumoveinc.com", "") || "/"}
                            </p>
                            <p className="text-[11px] text-foreground line-clamp-2 cursor-pointer hover:text-primary transition-colors" onClick={() => setExpandedSidebarItem(item)}>
                              {item.value}
                            </p>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {/* Ignored Changes */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <EyeOff className="w-4 h-4 text-muted-foreground" /> Ignored ({ignoredItems.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1.5">
                      {ignoredItems.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground py-2 text-center">No ignored changes</p>
                      ) : (
                        ignoredItems.map((item, i) => (
                          <div key={`i-${item.url}-${item.fieldKey}-${i}`} className="rounded-lg border border-border bg-muted/20 p-2 space-y-0.5 opacity-70">
                            <div className="flex items-center justify-between gap-1">
                              <Badge variant="secondary" className="text-[9px] h-4 px-1.5 shrink-0">{item.field}</Badge>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => handleSidebarRemove(item)}>
                                <XCircle className="w-3 h-3 text-muted-foreground" />
                              </Button>
                            </div>
                            <p className="text-[10px] font-mono text-muted-foreground truncate">
                              {item.url.replace("https://trumoveinc.com", "") || "/"}
                            </p>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {/* Published Changes */}
                  <Card className="border-primary/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" /> Published ({publishedSidebarItems.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1.5">
                      {publishedSidebarItems.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground py-2 text-center">No published changes yet</p>
                      ) : (
                        publishedSidebarItems.map((item, i) => (
                          <div key={`p-${item.url}-${item.fieldKey}-${i}`} className="rounded-lg border border-primary/30 bg-primary/10 p-2 space-y-0.5">
                            <div className="flex items-center justify-between gap-1">
                              <Badge variant="default" className="text-[9px] h-4 px-1.5 shrink-0">{item.field}</Badge>
                              <div className="flex items-center gap-0.5 shrink-0">
                                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => setExpandedSidebarItem(item)}>
                                  <Expand className="w-3 h-3 text-muted-foreground" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => handleSidebarRemove(item)}>
                                  <XCircle className="w-3 h-3 text-muted-foreground" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-[10px] font-mono text-muted-foreground truncate">
                              {item.url.replace("https://trumoveinc.com", "") || "/"}
                            </p>
                            <p className="text-[11px] text-foreground line-clamp-2 cursor-pointer hover:text-primary transition-colors" onClick={() => setExpandedSidebarItem(item)}>
                              {item.value}
                            </p>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Phase 2: Search Console */}
          <TabsContent value="phase2" className="mt-4">
            <SearchConsoleTab status={gscConnected ? "connected" : "not_connected"} auditUrls={auditPages.map(p => p.url)} onGscStatusChange={setGscConnected} />
          </TabsContent>

          {/* Phase 3: GA4 */}
          <TabsContent value="phase3" className="mt-4">
            <GA4Tab status="not_connected" />
          </TabsContent>

          {/* Phase 4: Backlinks */}
          <TabsContent value="phase4" className="mt-4">
            <BacklinksTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Expand Detail Dialog */}
      <Dialog open={!!expandedSidebarItem} onOpenChange={(open) => !open && setExpandedSidebarItem(null)}>
        <DialogContent className="max-w-lg">
          {expandedSidebarItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-sm">
                  <Badge variant={expandedSidebarItem.status === "published" ? "default" : expandedSidebarItem.status === "ignored" ? "secondary" : "default"} className="text-[10px]">
                    {expandedSidebarItem.status}
                  </Badge>
                  {expandedSidebarItem.field}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Page</p>
                  <p className="text-xs font-mono text-foreground bg-muted/40 rounded px-3 py-2 border border-border/50 break-all">
                    {expandedSidebarItem.url}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Value</p>
                  <div className="text-sm text-foreground bg-primary/5 rounded px-3 py-3 border border-primary/10 whitespace-pre-wrap break-words">
                    {expandedSidebarItem.value}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  {(expandedSidebarItem.status === "approved" || expandedSidebarItem.status === "edited") && (
                    <Button variant="default" size="sm" className="gap-1" onClick={() => { handleSidebarPublish(expandedSidebarItem); setExpandedSidebarItem(null); }}>
                      <Sparkles className="w-3 h-3" /> Publish
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => { handleSidebarRemove(expandedSidebarItem); setExpandedSidebarItem(null); }}>
                    <XCircle className="w-3 h-3" /> Remove
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MarketingShell>
  );
}
