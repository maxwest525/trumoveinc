import MarketingShell from "@/components/layout/MarketingShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PenTool } from "lucide-react";
import ContentPipelineTab from "@/components/marketing/content-seo/ContentPipelineTab";
import KeywordsTab from "@/components/marketing/content-seo/KeywordsTab";
import MetaTagsTab from "@/components/marketing/content-seo/MetaTagsTab";
import BacklinksAuthorityTab from "@/components/marketing/content-seo/BacklinksAuthorityTab";

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
            <TabsTrigger value="meta-tags">Meta Tags</TabsTrigger>
            <TabsTrigger value="backlinks">Backlinks & Authority</TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline">
            <ContentPipelineTab />
          </TabsContent>
          <TabsContent value="keywords">
            <KeywordsTab />
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
