import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import MarketingShell from "@/components/layout/MarketingShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, Eye, MousePointerClick, TrendingUp, DollarSign,
  Target, FileText, Activity, RefreshCw, CheckCircle2,
  AlertCircle, Loader2, BarChart3, Globe, Clock, Zap,
  ChevronRight, ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface GscData {
  clicks: number; impressions: number; ctr: number; avgPosition: number;
  trend: Array<{ date: string; clicks: number; impressions: number }>;
  topPages: Array<{ url: string; clicks: number; impressions: number; ctr: number; position: number }>;
  dateRange: string; property: string;
}
interface Ga4Data {
  sessions: number; pageviews: number; bounceRate: number;
  avgSessionDuration: number; newUsers: number; dateRange: string;
}
interface PpcSummary { totalSpend: number; totalClicks: number; totalConversions: number; activeCampaigns: number; }
interface BlogSummary { published: number; drafts: number; lastPublished: string | null; }
interface ConnStatus { connected: boolean; property?: string | null; propertyId?: string | null; loading: boolean; }

function fmt(n: number) { if (n >= 1e6) return (n/1e6).toFixed(1)+"M"; if (n >= 1000) return (n/1000).toFixed(1)+"K"; return String(n); }
function dur(s: number) { if (!s) return "0s"; if (s < 60) return `${s}s`; return `${Math.floor(s/60)}m ${s%60}s`; }
function ago(d: string) { const m = Math.floor((Date.now()-new Date(d).getTime())/60000); const h = Math.floor(m/60); const dy = Math.floor(h/24); if (dy>0) return `${dy}d ago`; if (h>0) return `${h}h ago`; if (m>0) return `${m}m ago`; return "just now"; }

function KpiCard({ icon: Icon, label, value, sub, loading, hl }: { icon: React.ElementType; label: string; value: string; sub: string; loading?: boolean; hl?: "good"|"warn"; }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1.5"><Icon className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-[11px] text-muted-foreground">{label}</span></div>
      {loading ? <div className="h-7 w-16 bg-muted animate-pulse rounded" /> : <div className="text-xl font-bold leading-none">{value}</div>}
      <div className={`text-[10px] mt-1 ${hl==="good"?"text-green-500":hl==="warn"?"text-yellow-500":"text-muted-foreground"}`}>{sub}</div>
    </div>
  );
}

function ConnBadge({ s }: { s: ConnStatus }) {
  if (s.loading) return <Badge variant="outline" className="text-xs"><Loader2 className="w-3 h-3 animate-spin mr-1"/>Checking</Badge>;
  if (s.connected && (s.property || s.propertyId)) return <Badge variant="outline" className="text-xs text-green-600 border-green-500/40"><CheckCircle2 className="w-3 h-3 mr-1"/>Live</Badge>;
  if (s.connected) return <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-500/40"><AlertCircle className="w-3 h-3 mr-1"/>Select property</Badge>;
  return <Badge variant="outline" className="text-xs text-muted-foreground"><AlertCircle className="w-3 h-3 mr-1"/>Not connected</Badge>;
}

export default function MarketingAnalytics() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string|null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date|null>(null);
  const [gscStatus, setGscStatus] = useState<ConnStatus>({ connected: false, loading: true });
  const [ga4Status, setGa4Status] = useState<ConnStatus>({ connected: false, loading: true });
  const [gscData, setGscData] = useState<GscData|null>(null);
  const [ga4Data, setGa4Data] = useState<Ga4Data|null>(null);
  const [ppcData, setPpcData] = useState<PpcSummary|null>(null);
  const [blogData, setBlogData] = useState<BlogSummary|null>(null);
  const [gscProps, setGscProps] = useState<Array<{siteUrl:string;permissionLevel:string}>>([]);
  const [ga4Props, setGa4Props] = useState<Array<{propertyId:string;displayName:string;accountName:string}>>([]);
  const [connecting, setConnecting] = useState<string|null>(null);

  const redirectUri = () => `${window.location.origin}${window.location.pathname}`;

  // Handle OAuth callback
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const code = p.get("code"); const state = p.get("state"); const err = p.get("error");
    if (err) { toast({ title: "Connection cancelled", variant: "destructive" }); window.history.replaceState({},"",window.location.pathname); return; }
    if (!code || !state) return;
    window.history.replaceState({},"",window.location.pathname);
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const fn = state === "ga4" ? "ga4-auth" : "gsc-auth";
      try {
        const { data, error } = await supabase.functions.invoke(fn, { body: { action: "exchange-code", code, redirect_uri: redirectUri(), user_id: session.user.id } });
        if (error || data?.error) throw new Error(error?.message || data?.error);
        toast({ title: `${state.toUpperCase()} connected`, description: "Now select your property." });
        if (state === "ga4") {
          const { data: pd } = await supabase.functions.invoke("ga4-auth", { body: { action: "list-properties", user_id: session.user.id } });
          setGa4Props(pd?.properties || []);
        } else {
          const { data: pd } = await supabase.functions.invoke("gsc-auth", { body: { action: "list-properties", user_id: session.user.id } });
          setGscProps(pd?.sites || []);
        }
      } catch (e: any) { toast({ title: "Connection failed", description: e?.message, variant: "destructive" }); }
    })();
  }, []);

  const checkStatuses = useCallback(async (uid: string) => {
    const [g1, g2] = await Promise.allSettled([
      supabase.functions.invoke("gsc-auth", { body: { action: "status", user_id: uid } }),
      supabase.functions.invoke("ga4-auth", { body: { action: "status", user_id: uid } }),
    ]);
    const gs = g1.status==="fulfilled" ? g1.value.data : null;
    const as = g2.status==="fulfilled" ? g2.value.data : null;
    setGscStatus({ connected: !!gs?.connected, property: gs?.property, loading: false });
    setGa4Status({ connected: !!as?.connected, propertyId: as?.propertyId, loading: false });
    return { gscConnected: !!gs?.connected, gscProperty: gs?.property, ga4Connected: !!as?.connected, ga4PropertyId: as?.propertyId };
  }, []);

  const fetchAll = useCallback(async (uid: string) => {
    setRefreshing(true);
    const { gscConnected, gscProperty, ga4Connected, ga4PropertyId } = await checkStatuses(uid);
    await Promise.allSettled([
      gscConnected && gscProperty
        ? supabase.functions.invoke("gsc-data", { body: { action: "site-overview", user_id: uid } }).then(({ data }) => { if (data && !data.error) setGscData(data); })
        : Promise.resolve(),
      ga4Connected && ga4PropertyId
        ? supabase.functions.invoke("ga4-data", { body: { action: "overview", user_id: uid } }).then(({ data }) => { if (data && !data.error) setGa4Data(data); })
        : Promise.resolve(),
      supabase.from("ppc_campaigns").select("spend,clicks,conversions,status").then(({ data }) => {
        if (data) {
          setPpcData({
            totalSpend: data.reduce((s, c) => s + Number(c.spend || 0), 0),
            totalClicks: data.reduce((s, c) => s + Number(c.clicks || 0), 0),
            totalConversions: data.reduce((s, c) => s + Number(c.conversions || 0), 0),
            activeCampaigns: data.filter(c => c.status === "active").length,
          });
        }
      }),
      supabase.from("blog_posts").select("status,published_at").then(({ data }) => {
        if (data) {
          const pub = data.filter(p => p.status === "published");
          const drafts = data.filter(p => p.status === "draft");
          const lastPub = pub.sort((a, b) => (b.published_at || "").localeCompare(a.published_at || ""))[0];
          setBlogData({ published: pub.length, drafts: drafts.length, lastPublished: lastPub?.published_at || null });
        }
      }),
    ]);
    setRefreshing(false);
    setLastRefreshed(new Date());
  }, [checkStatuses]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      setUserId(session.user.id);
      fetchAll(session.user.id);
    });
  }, []);

  const connect = async (svc: "gsc"|"ga4") => {
    setConnecting(svc);
    const { data, error } = await supabase.functions.invoke(svc==="ga4"?"ga4-auth":"gsc-auth", { body: { action: "get-auth-url", redirect_uri: redirectUri(), state: svc } });
    if (data?.url) { window.location.href = data.url; }
    else { toast({ title: "Error", description: error?.message || "Could not get auth URL", variant: "destructive" }); setConnecting(null); }
  };

  const selectGsc = async (siteUrl: string) => {
    if (!userId) return;
    await supabase.functions.invoke("gsc-auth", { body: { action: "select-property", user_id: userId, property: siteUrl } });
    setGscProps([]); toast({ title: "Search Console ready" }); fetchAll(userId);
  };
  const selectGa4 = async (propId: string) => {
    if (!userId) return;
    await supabase.functions.invoke("ga4-auth", { body: { action: "select-property", user_id: userId, property_id: propId } });
    setGa4Props([]); toast({ title: "GA4 ready" }); fetchAll(userId);
  };

  return (
    <MarketingShell breadcrumb="KPI Dashboard">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary"/>KPI Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{lastRefreshed ? `Last synced ${ago(lastRefreshed.toISOString())}` : "Loading..."}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => userId && fetchAll(userId)} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing?"animate-spin":""}`}/>Refresh
          </Button>
        </div>

        {/* Connection bar */}
        <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 bg-muted/40 rounded-lg border border-border text-sm">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground"/><span className="font-medium text-xs">Search Console</span>
            <ConnBadge s={gscStatus}/>
            {!gscStatus.loading && !gscStatus.connected && <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={()=>connect("gsc")} disabled={connecting==="gsc"}>{connecting==="gsc"?<Loader2 className="w-3 h-3 animate-spin"/>:"Connect"}</Button>}
          </div>
          <div className="w-px h-4 bg-border"/>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground"/><span className="font-medium text-xs">GA4</span>
            <ConnBadge s={ga4Status}/>
            {!ga4Status.loading && !ga4Status.connected && <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={()=>connect("ga4")} disabled={connecting==="ga4"}>{connecting==="ga4"?<Loader2 className="w-3 h-3 animate-spin"/>:"Connect"}</Button>}
          </div>
        </div>

        {/* Property pickers */}
        {gscProps.length > 0 && (
          <div className="p-4 bg-card border border-border rounded-xl">
            <h3 className="text-sm font-semibold mb-3">Select Search Console Property</h3>
            <div className="space-y-1.5">{gscProps.map(s=><button key={s.siteUrl} onClick={()=>selectGsc(s.siteUrl)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted text-sm border border-border">{s.siteUrl}<span className="text-xs text-muted-foreground ml-2">({s.permissionLevel})</span></button>)}</div>
          </div>
        )}
        {ga4Props.length > 0 && (
          <div className="p-4 bg-card border border-border rounded-xl">
            <h3 className="text-sm font-semibold mb-3">Select GA4 Property</h3>
            <div className="space-y-1.5">{ga4Props.map(p=><button key={p.propertyId} onClick={()=>selectGa4(p.propertyId)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted text-sm border border-border"><span className="font-medium">{p.displayName}</span><span className="text-xs text-muted-foreground ml-2">{p.accountName} — {p.propertyId}</span></button>)}</div>
          </div>
        )}

        {/* GA4 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-500"/>Google Analytics<ConnBadge s={ga4Status}/></h2>
            {ga4Data && <span className="text-xs text-muted-foreground">{ga4Data.dateRange}</span>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon={Users} label="Sessions" value={ga4Data?fmt(ga4Data.sessions):"\u2014"} sub={ga4Data?`${fmt(ga4Data.newUsers)} new users`:"Connect GA4"} loading={!ga4Data&&ga4Status.loading}/>
            <KpiCard icon={Eye} label="Pageviews" value={ga4Data?fmt(ga4Data.pageviews):"\u2014"} sub={ga4Data?"last 28 days":"Connect GA4"} loading={!ga4Data&&ga4Status.loading}/>
            <KpiCard icon={Activity} label="Bounce Rate" value={ga4Data?`${ga4Data.bounceRate}%`:"\u2014"} sub={ga4Data?(ga4Data.bounceRate<40?"Good":ga4Data.bounceRate<60?"Average":"High"):"Connect GA4"} hl={ga4Data?(ga4Data.bounceRate<40?"good":ga4Data.bounceRate>60?"warn":undefined):undefined} loading={!ga4Data&&ga4Status.loading}/>
            <KpiCard icon={Clock} label="Avg Session" value={ga4Data?dur(ga4Data.avgSessionDuration):"\u2014"} sub={ga4Data?"per visit":"Connect GA4"} loading={!ga4Data&&ga4Status.loading}/>
          </div>
        </div>

        {/* GSC */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2"><Globe className="w-4 h-4 text-green-500"/>Search Console<ConnBadge s={gscStatus}/></h2>
            {gscData && <span className="text-xs text-muted-foreground">{gscData.dateRange}</span>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon={MousePointerClick} label="Organic Clicks" value={gscData?fmt(gscData.clicks):"\u2014"} sub={gscData?"from search":"Connect Search Console"} loading={!gscData&&gscStatus.loading}/>
            <KpiCard icon={Eye} label="Impressions" value={gscData?fmt(gscData.impressions):"\u2014"} sub={gscData?"total views":"Connect Search Console"} loading={!gscData&&gscStatus.loading}/>
            <KpiCard icon={Target} label="Avg CTR" value={gscData?`${gscData.ctr}%`:"\u2014"} sub={gscData?(gscData.ctr>5?"Good":gscData.ctr>2?"Average":"Needs work"):"Connect Search Console"} hl={gscData?(gscData.ctr>5?"good":gscData.ctr<2?"warn":undefined):undefined} loading={!gscData&&gscStatus.loading}/>
            <KpiCard icon={TrendingUp} label="Avg Position" value={gscData?String(gscData.avgPosition):"\u2014"} sub={gscData?(gscData.avgPosition<=10?"First page":gscData.avgPosition<=20?"Page 2":"Needs improvement"):"Connect Search Console"} hl={gscData?(gscData.avgPosition<=10?"good":gscData.avgPosition>20?"warn":undefined):undefined} loading={!gscData&&gscStatus.loading}/>
          </div>
        </div>

        {/* PPC + Blog */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2"><DollarSign className="w-4 h-4 text-orange-500"/>Paid Ads</h2>
              <button onClick={()=>navigate("/marketing/ppc")} className="text-xs text-primary flex items-center gap-0.5 hover:underline">Manage<ChevronRight className="w-3 h-3"/></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <KpiCard icon={DollarSign} label="Total Spend" value={ppcData?`$${ppcData.totalSpend.toFixed(2)}`:"\u2014"} sub="all time" loading={!ppcData}/>
              <KpiCard icon={MousePointerClick} label="Clicks" value={ppcData?fmt(ppcData.totalClicks):"\u2014"} sub="all campaigns" loading={!ppcData}/>
              <KpiCard icon={Target} label="Conversions" value={ppcData?String(ppcData.totalConversions):"\u2014"} sub="total" loading={!ppcData}/>
              <KpiCard icon={Zap} label="Active" value={ppcData?String(ppcData.activeCampaigns):"\u2014"} sub="campaigns" loading={!ppcData}/>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-purple-500"/>Blog & Content</h2>
              <button onClick={()=>navigate("/marketing/blog")} className="text-xs text-primary flex items-center gap-0.5 hover:underline">Manage<ChevronRight className="w-3 h-3"/></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <KpiCard icon={CheckCircle2} label="Published" value={blogData?String(blogData.published):"\u2014"} sub="posts live" loading={!blogData}/>
              <KpiCard icon={FileText} label="Drafts" value={blogData?String(blogData.drafts):"\u2014"} sub="in progress" loading={!blogData}/>
            </div>
            {blogData?.lastPublished && <p className="text-xs text-muted-foreground mt-2">Last published {ago(blogData.lastPublished)}</p>}
          </div>
        </div>

        {/* Top GSC pages */}
        {gscData?.topPages && gscData.topPages.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Top Pages — Search Console</h2>
              <button onClick={()=>navigate("/marketing/seo")} className="text-xs text-primary flex items-center gap-0.5 hover:underline">SEO Manager<ChevronRight className="w-3 h-3"/></button>
            </div>
            {gscData.topPages.map((page,i)=>(
              <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-border last:border-0">
                <a href={page.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:underline flex-1 min-w-0 mr-4 truncate">
                  <ExternalLink className="w-3 h-3 shrink-0 text-muted-foreground"/><span className="truncate">{page.url}</span>
                </a>
                <div className="flex items-center gap-4 shrink-0 text-muted-foreground">
                  <span>{page.clicks} clicks</span><span>Pos {page.position}</span><span>{page.ctr}% CTR</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tool nav */}
        <div>
          <h2 className="text-sm font-semibold mb-3">Marketing Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "SEO Manager", icon: Globe, path: "/marketing/seo", color: "text-green-500" },
              { label: "Paid Ads (PPC)", icon: DollarSign, path: "/marketing/ppc", color: "text-orange-500" },
              { label: "Blog & Content", icon: FileText, path: "/marketing/blog", color: "text-purple-500" },
              { label: "Competitor Intel", icon: TrendingUp, path: "/marketing/competitor-seo", color: "text-red-500" },
            ].map(t => { const I=t.icon; return (
              <button key={t.path} onClick={()=>navigate(t.path)} className="p-3 bg-card border border-border rounded-xl text-left hover:bg-muted/50 transition-colors group">
                <I className={`w-5 h-5 ${t.color} mb-2`}/>
                <div className="text-xs font-medium">{t.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5 group-hover:text-primary">Open<ChevronRight className="w-3 h-3"/></div>
              </button>
            ); })}
          </div>
        </div>

      </div>
    </MarketingShell>
  );
}
