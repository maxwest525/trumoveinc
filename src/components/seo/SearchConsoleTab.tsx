import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Link2, Loader2, CheckCircle2, XCircle, ArrowUpDown, AlertTriangle, ExternalLink, RefreshCw, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { PhaseStatus, SearchConsoleQuery } from "./types";

interface GscStatus {
  connected: boolean;
  property: string | null;
  connectedAt: string | null;
}

interface GscSite {
  siteUrl: string;
  permissionLevel: string;
}

interface PageGscData {
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  fixPriority: number;
}

interface SearchConsoleTabProps {
  status: PhaseStatus;
  auditUrls: string[];
  onGscStatusChange?: (connected: boolean) => void;
}

function getPreferredGscRedirectUri() {
  const host = window.location.hostname;

  const shouldUseCrmCallback =
    host === "trumoveinc.com" ||
    host === "www.trumoveinc.com" ||
    host === "trumoveinc.lovable.app" ||
    host.endsWith(".lovable.app");

  if (shouldUseCrmCallback) {
    return "https://crm.trumoveinc.com/marketing/seo";
  }

  return `${window.location.origin}/marketing/seo`;
}

function buildGscOAuthState(userId: string, redirectUri: string) {
  return new URLSearchParams({ user_id: userId, redirect_uri: redirectUri }).toString();
}

function parseGscOAuthState(rawState: string | null) {
  if (!rawState) return { userId: null, redirectUri: null };

  const params = new URLSearchParams(rawState);
  return {
    userId: params.get("user_id"),
    redirectUri: params.get("redirect_uri"),
  };
}

export default function SearchConsoleTab({ status, auditUrls, onGscStatusChange }: SearchConsoleTabProps) {
  const [connecting, setConnecting] = useState(false);
  const [gscStatus, setGscStatus] = useState<GscStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState<GscSite[]>([]);
  const [selectingProperty, setSelectingProperty] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [pageQueries, setPageQueries] = useState<SearchConsoleQuery[]>([]);
  const [loadingQueries, setLoadingQueries] = useState(false);
  const [pageData, setPageData] = useState<PageGscData[]>([]);
  const [fetchingAll, setFetchingAll] = useState(false);
  const [sortBy, setSortBy] = useState<"priority" | "impressions" | "ctr" | "position">("priority");
  const [userId, setUserId] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const handledOauthResult = useRef<string | null>(null);

  // Get user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  // Check GSC status on mount
  useEffect(() => {
    if (!userId) return;
    checkStatus();
  }, [userId]);

  const checkStatus = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("gsc-auth", {
        body: { action: "status", user_id: userId },
      });
      if (error) throw error;
      setGscStatus(data);
      onGscStatusChange?.(data.connected);
    } catch (e) {
      console.error("GSC status check failed:", e);
      setGscStatus({ connected: false, property: null, connectedAt: null });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!userId) {
      toast.error("Please sign in again before connecting Search Console");
      return;
    }

    setConnecting(true);
    try {
      const redirectUri = getPreferredGscRedirectUri();
      const state = buildGscOAuthState(userId, redirectUri);

      const { data, error } = await supabase.functions.invoke("gsc-auth", {
        body: { action: "get-auth-url", redirect_uri: redirectUri, state },
      });
      if (error) throw error;
      if (data.url) {
        // Store state for callback
        sessionStorage.setItem("gsc_redirect", redirectUri);
        window.location.href = data.url;
      }
    } catch (e: any) {
      console.error("GSC connect error:", e);
      toast.error(e.message || "Failed to start Google authorization");
      setConnecting(false);
    }
  };

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const rawState = params.get("state");
    const oauthError = params.get("error");
    const { userId: stateUserId, redirectUri: stateRedirectUri } = parseGscOAuthState(rawState);

    if (oauthError) {
      const errorKey = `error:${oauthError}`;
      if (handledOauthResult.current === errorKey) return;
      handledOauthResult.current = errorKey;
      window.history.replaceState({}, "", window.location.pathname);
      toast.error(oauthError === "access_denied" ? "Google authorization was canceled" : "Google authorization failed");
      return;
    }

    const callbackUserId = userId || stateUserId;

    if (code && callbackUserId) {
      const codeKey = `code:${code}`;
      if (handledOauthResult.current === codeKey) return;
      handledOauthResult.current = codeKey;

      const redirectUri = stateRedirectUri || sessionStorage.getItem("gsc_redirect") || getPreferredGscRedirectUri();
      sessionStorage.removeItem("gsc_redirect");

      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);

      (async () => {
        try {
          const { error } = await supabase.functions.invoke("gsc-auth", {
            body: { action: "exchange-code", code, redirect_uri: redirectUri, user_id: callbackUserId },
          });
          if (error) throw error;
          toast.success("Google Search Console connected!");
          await checkStatus();
          // Fetch properties
          await loadProperties();
        } catch (e: any) {
          toast.error(e.message || "Failed to complete authorization");
        }
      })();
    } else if (code && !callbackUserId) {
      toast.error("Google returned successfully, but your session was missing. Please retry from the CRM domain.");
    }
  }, [userId]);

  const loadProperties = async () => {
    if (!userId) return;
    setSelectingProperty(true);
    try {
      const { data, error } = await supabase.functions.invoke("gsc-auth", {
        body: { action: "list-properties", user_id: userId },
      });
      if (error) throw error;
      setSites(data.sites || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load properties");
    } finally {
      setSelectingProperty(false);
    }
  };

  const handleSelectProperty = async (siteUrl: string) => {
    if (!userId) return;
    try {
      const { error } = await supabase.functions.invoke("gsc-auth", {
        body: { action: "select-property", user_id: userId, property: siteUrl },
      });
      if (error) throw error;
      toast.success(`Selected property: ${siteUrl}`);
      setSites([]);
      await checkStatus();
    } catch (e: any) {
      toast.error(e.message || "Failed to select property");
    }
  };

  const handleDisconnect = async () => {
    if (!userId) return;
    try {
      const { error } = await supabase.functions.invoke("gsc-auth", {
        body: { action: "disconnect", user_id: userId },
      });
      if (error) throw error;
      setGscStatus({ connected: false, property: null, connectedAt: null });
      setPageData([]);
      setPageQueries([]);
      onGscStatusChange?.(false);
      toast.success("Google Search Console disconnected");
    } catch (e: any) {
      toast.error(e.message || "Failed to disconnect");
    }
  };

  const fetchPageQueries = async (pageUrl: string) => {
    if (!userId) return;
    setLoadingQueries(true);
    setSelectedUrl(pageUrl);
    try {
      const { data, error } = await supabase.functions.invoke("gsc-data", {
        body: { action: "fetch-page-queries", user_id: userId, page_url: pageUrl },
      });
      if (error) throw error;
      setPageQueries(data.queries || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch queries");
      setPageQueries([]);
    } finally {
      setLoadingQueries(false);
    }
  };

  const fetchAllPageData = async () => {
    if (!userId || auditUrls.length === 0) return;
    setFetchingAll(true);
    try {
      const { data, error } = await supabase.functions.invoke("gsc-data", {
        body: { action: "fetch-all-pages", user_id: userId, urls: auditUrls },
      });
      if (error) throw error;
      const results = data.results || [];
      // Debug: log URL matching info
      results.forEach((r: any) => {
        if (r._debug) {
          console.debug("[GSC match]", r._debug);
        }
      });
      setPageData(results);
      toast.success(`Fetched GSC data for ${auditUrls.length} pages`);
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch page data");
    } finally {
      setFetchingAll(false);
    }
  };

  const sortedPageData = [...pageData].sort((a, b) => {
    switch (sortBy) {
      case "priority": return b.fixPriority - a.fixPriority;
      case "impressions": return b.impressions - a.impressions;
      case "ctr": return a.ctr - b.ctr;
      case "position": return a.position - b.position;
      default: return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not connected state
  if (!gscStatus?.connected) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Connect Google Search Console</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Import real search query data per URL — see impressions, clicks, CTR, and avg position to power smarter AI recommendations.
              </p>
            </div>
            <Button onClick={handleConnect} disabled={connecting} size="lg">
              {connecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
              {connecting ? "Redirecting to Google…" : "Connect Search Console"}
            </Button>
            <div>
              <Button variant="ghost" size="sm" className="text-[11px] text-muted-foreground" onClick={() => setShowSetup(!showSetup)}>
                <Info className="w-3 h-3 mr-1" /> Setup Instructions
              </Button>
            </div>
          </CardContent>
        </Card>

        {showSetup && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Google Cloud Console Setup Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <div className="space-y-2">
                <p className="font-medium text-foreground">1. Create OAuth 2.0 Credentials</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Go to <span className="font-mono text-[10px] bg-muted px-1 rounded">console.cloud.google.com</span> → APIs & Services → Credentials</li>
                  <li>Create OAuth 2.0 Client ID (Web application)</li>
                  <li>Add <span className="font-mono text-[10px] bg-muted px-1 rounded">{window.location.origin}/marketing/seo</span> as an Authorized redirect URI</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-foreground">2. Enable API</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Enable the <strong>Google Search Console API</strong> in your project</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-foreground">3. Configure OAuth Consent Screen</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Set up an External consent screen</li>
                  <li>Add scope: <span className="font-mono text-[10px] bg-muted px-1 rounded">https://www.googleapis.com/auth/webmasters.readonly</span></li>
                  <li>Add your email as a test user (while in testing mode)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-foreground">4. Add Secrets</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Copy Client ID → add as <span className="font-mono text-[10px] bg-muted px-1 rounded">GSC_CLIENT_ID</span> secret</li>
                  <li>Copy Client Secret → add as <span className="font-mono text-[10px] bg-muted px-1 rounded">GSC_CLIENT_SECRET</span> secret</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Connected but no property selected — show property picker
  if (!gscStatus.property) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Google Account Connected
                </CardTitle>
                <CardDescription className="text-xs mt-1">Select the Search Console property to use</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDisconnect}>
                <XCircle className="w-3 h-3 mr-1" /> Disconnect
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {sites.length === 0 ? (
              <div className="text-center py-4">
                <Button onClick={loadProperties} disabled={selectingProperty}>
                  {selectingProperty ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                  Load Properties
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Available Properties</p>
                {sites.map((site) => (
                  <div key={site.siteUrl} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm font-mono">{site.siteUrl}</span>
                      <Badge variant="outline" className="text-[9px]">{site.permissionLevel}</Badge>
                    </div>
                    <Button size="sm" onClick={() => handleSelectProperty(site.siteUrl)}>
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fully connected — show data
  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" /> Search Console Data
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Property: <span className="font-mono">{gscStatus.property}</span> · Last 28 days
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px]">Connected</Badge>
              <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={fetchAllPageData}
              disabled={fetchingAll || auditUrls.length === 0}
              variant="default"
              size="sm"
            >
              {fetchingAll ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
              {fetchingAll ? "Fetching…" : `Fetch Data for ${auditUrls.length} Audit URLs`}
            </Button>
            {auditUrls.length === 0 && (
              <p className="text-[11px] text-muted-foreground self-center">Run a crawl in Phase 1 first to populate URLs</p>
            )}
          </div>

          {/* Page-level overview with priority scores */}
          {pageData.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-foreground">Performance & Fix Priority</p>
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-[10px] text-muted-foreground">Sort:</span>
                  {(["priority", "impressions", "ctr", "position"] as const).map(s => (
                    <Button key={s} variant={sortBy === s ? "default" : "ghost"} size="sm" className="h-6 text-[10px] px-2"
                      onClick={() => setSortBy(s)}>
                      {s === "priority" ? "Priority" : s === "impressions" ? "Impr." : s === "ctr" ? "CTR" : "Pos."}
                    </Button>
                  ))}
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">Avg Pos.</TableHead>
                    <TableHead className="text-right">Fix Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPageData.map((p) => (
                    <Collapsible key={p.url} asChild>
                      <>
                        <CollapsibleTrigger asChild>
                          <TableRow className="cursor-pointer hover:bg-muted/50">
                            <TableCell>
                              <span className="font-mono text-xs">{p.url.replace("https://trumoveinc.com", "") || "/"}</span>
                            </TableCell>
                            <TableCell className="text-right text-sm">{p.impressions.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-sm">{p.clicks.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-sm">{p.ctr}%</TableCell>
                            <TableCell className="text-right text-sm">{p.position.toFixed(1)}</TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant={p.fixPriority >= 40 ? "destructive" : p.fixPriority >= 20 ? "secondary" : "outline"}
                                className="text-[10px]"
                              >
                                {p.fixPriority}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        </CollapsibleTrigger>
                        <CollapsibleContent asChild>
                          <TableRow>
                            <TableCell colSpan={6} className="bg-muted/20 p-4">
                              <PageQueryDetail
                                pageUrl={p.url}
                                userId={userId}
                                onLoadQueries={fetchPageQueries}
                                queries={selectedUrl === p.url ? pageQueries : []}
                                loading={selectedUrl === p.url && loadingQueries}
                              />
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {pageData.length === 0 && auditUrls.length > 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Click "Fetch Data" to pull GSC performance metrics</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Sub-component for per-page query detail
function PageQueryDetail({
  pageUrl,
  userId,
  onLoadQueries,
  queries,
  loading,
}: {
  pageUrl: string;
  userId: string | null;
  onLoadQueries: (url: string) => void;
  queries: SearchConsoleQuery[];
  loading: boolean;
}) {
  useEffect(() => {
    if (queries.length === 0 && !loading) {
      onLoadQueries(pageUrl);
    }
  }, [pageUrl]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span className="text-xs text-muted-foreground">Loading top queries…</span>
      </div>
    );
  }

  if (queries.length === 0) {
    return <p className="text-xs text-muted-foreground py-2">No query data available for this page</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground">Top Search Queries (Last 28 days)</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Query</TableHead>
            <TableHead className="text-right text-xs">Impressions</TableHead>
            <TableHead className="text-right text-xs">Clicks</TableHead>
            <TableHead className="text-right text-xs">CTR</TableHead>
            <TableHead className="text-right text-xs">Avg Pos.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {queries.map((q, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium text-xs">{q.query}</TableCell>
              <TableCell className="text-right text-xs">{q.impressions.toLocaleString()}</TableCell>
              <TableCell className="text-right text-xs">{q.clicks.toLocaleString()}</TableCell>
              <TableCell className="text-right text-xs">{q.ctr}%</TableCell>
              <TableCell className="text-right text-xs">{q.position.toFixed(1)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
