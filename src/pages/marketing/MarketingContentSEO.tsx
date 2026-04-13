import MarketingShell from "@/components/layout/MarketingShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PenTool, Plus, Globe, FileText, TrendingUp, TrendingDown } from "lucide-react";
import ContentPipelineTab from "@/components/marketing/content-seo/ContentPipelineTab";
import KeywordsTab from "@/components/marketing/content-seo/KeywordsTab";
import MetaTagsTab from "@/components/marketing/content-seo/MetaTagsTab";
import BacklinksAuthorityTab from "@/components/marketing/content-seo/BacklinksAuthorityTab";

const SITE_PAGES = [
  { url: "/", type: "landing", status: "live", traffic: "12,400", convRate: "6.0%", trend: "down" as const },
  { url: "/get-quote", type: "landing", status: "live", traffic: "8,420", convRate: "15.0%", trend: "up" as const },
  { url: "/long-distance", type: "service", status: "live", traffic: "5,130", convRate: "9.0%", trend: "up" as const },
  { url: "/cross-country", type: "route", status: "live", traffic: "3,200", convRate: "7.0%", trend: "stable" as const },
  { url: "/pricing", type: "cost", status: "live", traffic: "2,800", convRate: "11.0%", trend: "up" as const },
  { url: "/reviews", type: "trust", status: "live", traffic: "1,950", convRate: "6.0%", trend: "down" as const },
  { url: "/ny-to-la", type: "route", status: "draft", traffic: "—", convRate: "—", trend: "stable" as const },
  { url: "/fmcsa-compliance", type: "trust", status: "draft", traffic: "—", convRate: "—", trend: "stable" as const },
];

const typeColors: Record<string, string> = {
  landing: "bg-blue-50 text-blue-700",
  route: "bg-purple-50 text-purple-700",
  service: "bg-emerald-50 text-emerald-700",
  trust: "bg-amber-50 text-amber-700",
  cost: "bg-pink-50 text-pink-700",
  geo: "bg-cyan-50 text-cyan-700",
};

function PagesTab() {
  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" /> Site Pages
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Landing page builder for trumoveinc.com — manage, create, and publish pages.</p>
        </div>
        <Button size="sm" className="text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" /> New Page
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">URL</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Traffic</TableHead>
                <TableHead className="text-xs text-right">Conv. Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SITE_PAGES.map((page) => (
                <TableRow key={page.url} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs font-medium text-foreground">{page.url}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeColors[page.type] || "bg-muted text-muted-foreground"}`}>
                      {page.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={page.status === "live" ? "default" : "secondary"} className="text-[10px]">
                      {page.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-right font-medium">{page.traffic}</TableCell>
                  <TableCell className="text-xs text-right">
                    <div className="flex items-center justify-end gap-1">
                      {page.trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                      {page.trend === "down" && <TrendingDown className="w-3 h-3 text-red-500" />}
                      <span>{page.convRate}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="py-6 text-center text-muted-foreground">
          <p className="text-xs">Select a page type when creating to get AI-generated content: hero, benefits, trust block (FMCSA/carrier vetting/binding estimates), FAQ, CTA with quote form + phone, and unique data sections.</p>
          <p className="text-[10px] mt-1">Route pages include distance, cost range, transit time, and state regulation fields. Schema markup is auto-generated.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MarketingContentSEO() {
  return (
    <MarketingShell breadcrumb="Content & SEO">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <PenTool className="w-5 h-5 text-primary" />
            Content & SEO
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Keywords, briefs, blog, pages & rankings
          </p>
        </div>

        <Tabs defaultValue="pipeline" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="meta-tags">Meta Tags</TabsTrigger>
            <TabsTrigger value="backlinks">Backlinks & Authority</TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline">
            <ContentPipelineTab />
          </TabsContent>
          <TabsContent value="keywords">
            <KeywordsTab />
          </TabsContent>
          <TabsContent value="pages">
            <PagesTab />
          </TabsContent>
          <TabsContent value="meta-tags">
            <MetaTagsTab />
          </TabsContent>
          <TabsContent value="backlinks">
            <BacklinksAuthorityTab />
          </TabsContent>
        </Tabs>
      </div>
    </MarketingShell>
  );
}
