import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, TrendingUp, Target, FileText, Search, Globe, AlertCircle, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import MarketingShell from "@/components/layout/MarketingShell";

// ─── Static intelligence data from HyperSEO research (April 2026) ────────────

const KEYWORD_OPPORTUNITIES = [
  { keyword: "best cross country movers",          volume: 2400,  difficulty: 12, cpc: 47.33, intent: "Transactional", priority: "Quick Win",   trumoveRank: null, topCompetitor: "move.org" },
  { keyword: "moving broker vs carrier",           volume: 480,   difficulty: 17, cpc: 22.10, intent: "Informational", priority: "Quick Win",   trumoveRank: null, topCompetitor: "none" },
  { keyword: "state to state moving companies",    volume: 3600,  difficulty: 24, cpc: 62.92, intent: "Transactional", priority: "Quick Win",   trumoveRank: null, topCompetitor: "move.org" },
  { keyword: "movers out of state",                volume: 9900,  difficulty: 27, cpc: 60.13, intent: "Transactional", priority: "Quick Win",   trumoveRank: null, topCompetitor: "uship.com" },
  { keyword: "best long distance moving companies",volume: 6600,  difficulty: 27, cpc: 44.10, intent: "Transactional", priority: "Quick Win",   trumoveRank: null, topCompetitor: "move.org" },
  { keyword: "reputable moving companies",         volume: 2900,  difficulty: 41, cpc: 34.66, intent: "Transactional", priority: "Medium",      trumoveRank: null, topCompetitor: "move.org" },
  { keyword: "how to avoid moving scams",          volume: 1300,  difficulty: 42, cpc: 18.40, intent: "Informational", priority: "Medium",      trumoveRank: null, topCompetitor: "getbellhops.com" },
  { keyword: "long distance movers",               volume: 14800, difficulty: 32, cpc: 62.59, intent: "Transactional", priority: "Medium",      trumoveRank: null, topCompetitor: "uship.com" },
  { keyword: "how to find reputable moving company",volume: 880,  difficulty: 49, cpc: 31.20, intent: "Informational", priority: "Medium",      trumoveRank: null, topCompetitor: "getbellhops.com" },
  { keyword: "best moving companies long distance",volume: 6600,  difficulty: 44, cpc: 44.10, intent: "Transactional", priority: "Medium",      trumoveRank: null, topCompetitor: "move.org" },
  { keyword: "cross country moving cost calculator",volume: 3200, difficulty: 55, cpc: 58.40, intent: "Informational", priority: "Long Term",   trumoveRank: null, topCompetitor: "move.org" },
  { keyword: "interstate moving companies",        volume: 8100,  difficulty: 56, cpc: 75.27, intent: "Transactional", priority: "Long Term",   trumoveRank: null, topCompetitor: "uship.com" },
  { keyword: "cross country moving companies",     volume: 22200, difficulty: 51, cpc: 72.06, intent: "Transactional", priority: "Long Term",   trumoveRank: null, topCompetitor: "move.org" },
  { keyword: "long distance moving companies",     volume: 33100, difficulty: 57, cpc: 76.39, intent: "Transactional", priority: "Long Term",   trumoveRank: null, topCompetitor: "move.org" },
  { keyword: "FMCSA moving company lookup",        volume: 1600,  difficulty: 18, cpc: 12.30, intent: "Informational", priority: "Quick Win",   trumoveRank: null, topCompetitor: "none" },
];

const COMPETITORS = [
  { name: "move.org",                    domain: "move.org",                   type: "Lead Aggregator",   tier: 1, organicKeywords: 43000, monthlyETV: 623000, paidETV: 0,     threatLevel: "Critical",  ppcSpend: "Low" },
  { name: "uShip",                       domain: "uship.com",                  type: "Marketplace",       tier: 1, organicKeywords: 28000, monthlyETV: 358000, paidETV: 0,     threatLevel: "Critical",  ppcSpend: "Medium" },
  { name: "Bellhop",                     domain: "getbellhops.com",            type: "Broker/Platform",   tier: 1, organicKeywords: 23000, monthlyETV: 143000, paidETV: 0,     threatLevel: "High",      ppcSpend: "High" },
  { name: "Billy.com",                   domain: "billy.com",                  type: "Lead Aggregator",   tier: 2, organicKeywords: 3900,  monthlyETV: 12600,  paidETV: 0,     threatLevel: "High",      ppcSpend: "High" },
  { name: "SafeShip Moving Services",    domain: "safeshipmovingservices.com", type: "Broker",            tier: 2, organicKeywords: 95,    monthlyETV: 1500,   paidETV: 10300, threatLevel: "Medium",    ppcSpend: "Heavy" },
  { name: "MoveAdvisor",                 domain: "moveadvisor.us",             type: "Lead Aggregator",   tier: 2, organicKeywords: 221,   monthlyETV: 738,    paidETV: 0,     threatLevel: "Medium",    ppcSpend: "Low" },
  { name: "BudgetVanLines",              domain: "budgetvanlines.com",         type: "Lead Aggregator",   tier: 3, organicKeywords: 149,   monthlyETV: 1500,   paidETV: 0,     threatLevel: "Low",       ppcSpend: "Low" },
];

const CONTENT_BRIEFS = [
  {
    id: 1,
    title: "Moving Broker vs. Carrier: What's the Difference and Why It Matters",
    primaryKeyword: "moving broker vs carrier",
    volume: 480,
    difficulty: 17,
    wordCount: 1800,
    intent: "Informational",
    angle: "TruMove's FMCSA-verified carrier network eliminates the blind trust problem",
    estimatedTrafficAtRank3: 120,
    status: "Ready to Assign",
  },
  {
    id: 2,
    title: "Best Cross Country Moving Companies: Ranked by Safety Data, Not Ad Budget",
    primaryKeyword: "best cross country movers",
    volume: 2400,
    difficulty: 12,
    wordCount: 2400,
    intent: "Transactional",
    angle: "Use FMCSA data to rank movers by actual safety/reliability, not just reviews",
    estimatedTrafficAtRank3: 600,
    status: "Ready to Assign",
  },
  {
    id: 3,
    title: "How to Avoid Moving Scams: The FMCSA Red Flags Every Customer Should Know",
    primaryKeyword: "how to avoid moving scams",
    volume: 1300,
    difficulty: 42,
    wordCount: 2000,
    intent: "Informational",
    angle: "Educational trust-builder — TruMove surfaces FMCSA data automatically",
    estimatedTrafficAtRank3: 325,
    status: "Ready to Assign",
  },
  {
    id: 4,
    title: "State to State Moving Companies: What to Look For Before You Book",
    primaryKeyword: "state to state moving companies",
    volume: 3600,
    difficulty: 24,
    wordCount: 2200,
    intent: "Transactional",
    angle: "Checklist-driven guide that positions TruMove's vetting process as the solution",
    estimatedTrafficAtRank3: 900,
    status: "Ready to Assign",
  },
  {
    id: 5,
    title: "What Is FMCSA and How to Use It to Verify Your Moving Company",
    primaryKeyword: "FMCSA moving company lookup",
    volume: 1600,
    difficulty: 18,
    wordCount: 1600,
    intent: "Informational",
    angle: "TruMove is the only broker that runs FMCSA checks automatically at booking",
    estimatedTrafficAtRank3: 400,
    status: "Ready to Assign",
  },
];

const INDEXED_PAGES = [
  { url: "trumoveinc.com/",                     type: "Homepage",          clicks90d: 8,  impressions90d: 312 },
  { url: "trumoveinc.com/about-us",             type: "About",             clicks90d: 0,  impressions90d: 18 },
  { url: "trumoveinc.com/free-online-estimate", type: "Landing Page",      clicks90d: 2,  impressions90d: 87 },
  { url: "trumoveinc.com/book-video-consult",   type: "Landing Page",      clicks90d: 0,  impressions90d: 44 },
  { url: "trumoveinc.com/vetting-process",      type: "Content Page",      clicks90d: 0,  impressions90d: 22 },
  { url: "trumoveinc.com/property-lookup",      type: "Tool Page",         clicks90d: 3,  impressions90d: 61 },
];

// ─── Helper components ────────────────────────────────────────────────────────

function DifficultyBadge({ score }: { score: number }) {
  if (score <= 25) return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Easy {score}</Badge>;
  if (score <= 45) return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium {score}</Badge>;
  return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Hard {score}</Badge>;
}

function ThreatBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    Critical: "bg-red-100 text-red-800",
    High:     "bg-orange-100 text-orange-800",
    Medium:   "bg-yellow-100 text-yellow-800",
    Low:      "bg-green-100 text-green-800",
  };
  return <Badge className={`${map[level] ?? ""} hover:${map[level]}`}>{level}</Badge>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    "Quick Win": "bg-emerald-100 text-emerald-800",
    "Medium":    "bg-blue-100 text-blue-800",
    "Long Term": "bg-slate-100 text-slate-700",
  };
  return <Badge className={`${map[priority] ?? ""} hover:${map[priority]}`}>{priority}</Badge>;
}

function formatETV(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
}

function formatVolume(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MarketingSEO() {
  const [activeTab, setActiveTab] = useState("overview");

  const quickWins = KEYWORD_OPPORTUNITIES.filter(k => k.priority === "Quick Win");
  const totalEstimatedTraffic = CONTENT_BRIEFS.reduce((sum, b) => sum + b.estimatedTrafficAtRank3, 0);
  const totalKeywordVolume = quickWins.reduce((sum, k) => sum + k.volume, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">SEO Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pre-launch competitive research — updated April 2026
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-normal">
          <Clock className="w-3 h-3 mr-1" />
          Pre-Launch Mode
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Organic Keywords</CardDescription>
            <CardTitle className="text-2xl font-bold">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Site not yet launched</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Quick-Win Keywords</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">{quickWins.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{formatVolume(totalKeywordVolume)}/mo combined volume</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Competitors Tracked</CardDescription>
            <CardTitle className="text-2xl font-bold">{COMPETITORS.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">2 critical threats identified</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Est. Traffic at Rank 3</CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600">{formatVolume(totalEstimatedTraffic)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Across 5 content briefs</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="site">Site Audit</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW ───────────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" /> SEO Readiness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Domain Indexed by Google",     done: true },
                  { label: "Google Search Console Connected", done: true },
                  { label: "GA4 Tracking Active",           done: false },
                  { label: "Blog / Content Section Live",   done: false },
                  { label: "First Content Brief Published", done: false },
                  { label: "Target Keywords Mapped",        done: true },
                  { label: "Competitor Monitoring Active",  done: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    {item.done
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      : <AlertCircle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                    <span className={item.done ? "text-foreground" : "text-muted-foreground"}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Immediate Priorities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { rank: 1, action: "Add a blog or /resources section to trumoveinc.com", impact: "Critical" },
                  { rank: 2, action: "Publish content brief #2: Best Cross Country Movers", impact: "High" },
                  { rank: 3, action: "Publish content brief #1: Moving Broker vs. Carrier", impact: "High" },
                  { rank: 4, action: "Fix GA4 tracking (currently 0 conversion data)", impact: "High" },
                  { rank: 5, action: "Set up Google Ads on Quick Win keywords defensively", impact: "Medium" },
                ].map((item) => (
                  <div key={item.rank} className="flex gap-3 text-sm">
                    <span className="text-muted-foreground font-mono text-xs mt-0.5">{item.rank}.</span>
                    <div className="flex-1">
                      <p>{item.action}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs flex-shrink-0 ${
                        item.impact === "Critical" ? "border-red-300 text-red-700" :
                        item.impact === "High" ? "border-orange-300 text-orange-700" :
                        "border-slate-300 text-slate-600"
                      }`}
                    >
                      {item.impact}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Competitive Landscape — Organic Traffic Estimate (ETV)</CardTitle>
              <CardDescription className="text-xs">Monthly estimated organic traffic value by competitor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {COMPETITORS.slice(0, 5).map((c) => (
                  <div key={c.domain} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground">{formatETV(c.monthlyETV)}</span>
                    </div>
                    <Progress
                      value={Math.min((c.monthlyETV / 623000) * 100, 100)}
                      className="h-1.5"
                    />
                  </div>
                ))}
                <div className="space-y-1 pt-1 border-t">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-blue-600">TruMove (you)</span>
                    <span className="text-muted-foreground">$0 — pre-launch</span>
                  </div>
                  <Progress value={0} className="h-1.5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── KEYWORDS ───────────────────────────────────────────────────── */}
        <TabsContent value="keywords" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Search className="w-4 h-4" /> Keyword Opportunity Matrix
              </CardTitle>
              <CardDescription className="text-xs">
                15 validated targets — sorted by opportunity score. Quick Wins have difficulty under 30.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead className="text-right">CPC</TableHead>
                    <TableHead>Intent</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Top Comp.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {KEYWORD_OPPORTUNITIES.map((kw) => (
                    <TableRow key={kw.keyword}>
                      <TableCell className="font-medium text-sm max-w-[220px]">{kw.keyword}</TableCell>
                      <TableCell className="text-right text-sm">{formatVolume(kw.volume)}</TableCell>
                      <TableCell><DifficultyBadge score={kw.difficulty} /></TableCell>
                      <TableCell className="text-right text-sm">${kw.cpc.toFixed(2)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{kw.intent}</TableCell>
                      <TableCell><PriorityBadge priority={kw.priority} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{kw.topCompetitor}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── COMPETITORS ────────────────────────────────────────────────── */}
        <TabsContent value="competitors" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="w-4 h-4" /> Competitor Intelligence
              </CardTitle>
              <CardDescription className="text-xs">
                Broker and lead aggregator competitive landscape — organic and paid traffic data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Competitor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Organic Keywords</TableHead>
                    <TableHead className="text-right">Organic ETV/mo</TableHead>
                    <TableHead className="text-right">Paid ETV/mo</TableHead>
                    <TableHead>PPC Spend</TableHead>
                    <TableHead>Threat</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {COMPETITORS.map((c) => (
                    <TableRow key={c.domain}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.domain}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.type}</TableCell>
                      <TableCell className="text-right text-sm">{c.organicKeywords.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm">{formatETV(c.monthlyETV)}</TableCell>
                      <TableCell className="text-right text-sm">
                        {c.paidETV > 0 ? formatETV(c.paidETV) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.ppcSpend}</TableCell>
                      <TableCell><ThreatBadge level={c.threatLevel} /></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
                          <a href={`https://${c.domain}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-800">
                  <strong>Key Insight:</strong> SafeShip spends heavily on Google Ads ({formatETV(10300)}/mo paid ETV) with minimal organic presence. They are the most direct PPC competitor. Move.org and uShip dominate organic — TruMove should pursue content SEO to reduce dependence on paid search.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CONTENT ────────────────────────────────────────────────────── */}
        <TabsContent value="content" className="pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Content Briefs</h3>
                <p className="text-xs text-muted-foreground">5 ready-to-assign briefs — estimated {formatVolume(totalEstimatedTraffic)} monthly visits at rank 3</p>
              </div>
            </div>
            {CONTENT_BRIEFS.map((brief) => (
              <Card key={brief.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-sm font-medium leading-snug">{brief.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Primary: <code className="bg-muted px-1 rounded">{brief.primaryKeyword}</code>
                      </CardDescription>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 flex-shrink-0 text-xs">
                      {brief.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Search Volume</p>
                      <p className="text-sm font-medium">{formatVolume(brief.volume)}/mo</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Difficulty</p>
                      <DifficultyBadge score={brief.difficulty} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Target Length</p>
                      <p className="text-sm font-medium">{brief.wordCount.toLocaleString()} words</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Est. Traffic @ Rank 3</p>
                      <p className="text-sm font-medium text-blue-600">{formatVolume(brief.estimatedTrafficAtRank3)}/mo</p>
                    </div>
                  </div>
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">TruMove Angle</p>
                    <p className="text-xs">{brief.angle}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── SITE AUDIT ─────────────────────────────────────────────────── */}
        <TabsContent value="site" className="pt-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Indexed Pages — Last 90 Days
                </CardTitle>
                <CardDescription className="text-xs">
                  6 pages indexed by Google. 0 organic clicks from non-branded queries.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>URL</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Clicks (90d)</TableHead>
                      <TableHead className="text-right">Impressions (90d)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {INDEXED_PAGES.map((page) => (
                      <TableRow key={page.url}>
                        <TableCell className="text-xs font-mono">{page.url}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{page.type}</TableCell>
                        <TableCell className="text-right text-sm">{page.clicks90d}</TableCell>
                        <TableCell className="text-right text-sm">{page.impressions90d}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">Indexed</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-xs text-blue-800">
                    <strong>Crawl Note:</strong> No blog or content section detected. All current pages are product/landing pages with minimal keyword targeting. Adding a content section is the single highest-leverage SEO action available right now.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4" /> Google Search Console
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm">sc-domain:trumoveinc.com — Domain property connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm">https://trumoveinc.com/ — URL prefix property connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-muted-foreground">GA4 property 530201978 — tracking needs verification</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
