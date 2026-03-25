import { useState } from "react";
import MarketingShell from "@/components/layout/MarketingShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Sparkles, Globe, CheckCircle2, AlertCircle, Loader2, ExternalLink } from "lucide-react";

interface SEORecommendation {
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedH1: string | null;
  checklist: string[];
}

export default function MarketingSEO() {
  const [url, setUrl] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentDescription, setCurrentDescription] = useState("");
  const [currentH1, setCurrentH1] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [result, setResult] = useState<SEORecommendation | null>(null);

  const handleFetchMeta = async () => {
    if (!url) return toast.error("Enter a page URL first");
    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("firecrawl-scrape", {
        body: { url, options: { formats: ["html"], onlyMainContent: false } },
      });
      if (error) throw error;
      const html = data?.data?.html || data?.html || "";
      if (!html) {
        toast.info("Could not fetch page — fill in the fields manually");
        return;
      }
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i)
        || html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["']/i);
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);

      if (titleMatch?.[1]) setCurrentTitle(titleMatch[1].trim());
      if (descMatch?.[1]) setCurrentDescription(descMatch[1].trim());
      if (h1Match?.[1]) setCurrentH1(h1Match[1].replace(/<[^>]*>/g, "").trim());
      toast.success("Page metadata fetched");
    } catch (e) {
      console.error("Fetch meta error:", e);
      toast.info("Auto-fetch unavailable — fill in the fields manually");
    } finally {
      setFetching(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (!currentTitle && !currentDescription && !currentH1) {
      return toast.error("Enter at least a title or H1 to analyse");
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("seo-helper", {
        body: { url, currentTitle, currentDescription, currentH1, keyword },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as SEORecommendation);
      toast.success("Recommendations ready");
    } catch (e: any) {
      console.error("SEO helper error:", e);
      toast.error(e.message || "Failed to get recommendations");
    } finally {
      setLoading(false);
    }
  };

  const charBadge = (text: string, min: number, max: number) => {
    const len = text.length;
    const ok = len >= min && len <= max;
    return (
      <Badge variant={ok ? "default" : "secondary"} className="text-[10px] ml-2 font-normal">
        {len} chars {ok ? "✓" : `(aim ${min}–${max})`}
      </Badge>
    );
  };

  return (
    <MarketingShell breadcrumbs={[{ label: "SEO Helper" }]}>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-xl font-bold text-foreground">SEO Helper</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Paste a page URL from <span className="font-medium">trumoveinc.com</span>, fetch its current tags, and get AI-powered recommendations.
          </p>
        </div>

        {/* Input card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Page Details
            </CardTitle>
            <CardDescription className="text-xs">Paste a URL and click Fetch, or fill in the fields manually.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* URL + fetch */}
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="url" className="text-xs">Page URL</Label>
                <Input id="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://trumoveinc.com/long-distance-movers-dallas" />
              </div>
              <Button variant="secondary" size="sm" onClick={handleFetchMeta} disabled={fetching || !url} className="shrink-0">
                {fetching ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Search className="w-3 h-3 mr-1" />}
                Fetch
              </Button>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs">Current Title Tag</Label>
              <Input id="title" value={currentTitle} onChange={e => setCurrentTitle(e.target.value)} placeholder="e.g. Long Distance Movers Dallas | TruMove" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc" className="text-xs">Current Meta Description</Label>
              <Textarea id="desc" value={currentDescription} onChange={e => setCurrentDescription(e.target.value)} placeholder="e.g. Trusted long distance movers in Dallas..." rows={2} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="h1" className="text-xs">Current H1</Label>
              <Input id="h1" value={currentH1} onChange={e => setCurrentH1(e.target.value)} placeholder="e.g. Long Distance Moving Services in Dallas" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="keyword" className="text-xs">Target Keyword / City <span className="text-muted-foreground">(optional)</span></Label>
              <Input id="keyword" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g. long distance movers Dallas" />
            </div>

            <Button onClick={handleGetRecommendations} disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Get AI Recommendations
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Title */}
              <div className="space-y-1">
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-foreground">Suggested Title Tag</span>
                  {charBadge(result.suggestedTitle, 50, 60)}
                </div>
                <p className="text-sm bg-muted/50 rounded-lg px-3 py-2 border border-border font-mono">{result.suggestedTitle}</p>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-foreground">Suggested Meta Description</span>
                  {charBadge(result.suggestedDescription, 150, 160)}
                </div>
                <p className="text-sm bg-muted/50 rounded-lg px-3 py-2 border border-border font-mono">{result.suggestedDescription}</p>
              </div>

              {/* H1 */}
              {result.suggestedH1 && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-foreground">Suggested H1</span>
                  <p className="text-sm bg-muted/50 rounded-lg px-3 py-2 border border-border font-mono">{result.suggestedH1}</p>
                </div>
              )}

              {/* Checklist */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-foreground">Fix-First Checklist</span>
                <ul className="space-y-1.5">
                  {result.checklist.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* TODO placeholder */}
              <div className="border border-dashed border-border rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Coming soon: Import top queries</p>
                  <p className="text-[11px] text-muted-foreground">
                    Connect Google Search Console / GA4 to auto-import top-performing queries for this URL.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MarketingShell>
  );
}
