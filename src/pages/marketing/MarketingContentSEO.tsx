import { useState, lazy, Suspense } from "react";
import MarketingShell from "@/components/layout/MarketingShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PenTool } from "lucide-react";

// Lazy-load the existing page content — we import the default exports and render their inner content
// For now we import them directly since they're already loaded
import MarketingSEO from "./MarketingSEO";
import MarketingBlog from "./MarketingBlog";
import MarketingContentCenter from "./MarketingContentCenter";
import MarketingBacklinks from "./MarketingBacklinks";
import MarketingDomainAuthority from "./MarketingDomainAuthority";

// We need to extract the inner content from these pages.
// Since those pages wrap themselves in MarketingShell, we'll create wrapper components
// that strip MarketingShell. For now we'll embed them as sub-sections.

// Instead, let's create a page that references the existing components' inner content.
// The cleanest approach: render the existing pages' content directly.
// But since they each wrap in MarketingShell, we need lightweight inner components.
// For a quick restructure without breaking anything, we'll use an iframe-less tab approach
// that renders simplified placeholder content pointing to the existing feature sets.

// Actually, the simplest correct approach: since the old pages still exist at their routes,
// we create this as the new entry point with tabs that render the OLD pages inline
// by temporarily removing their shell. But that's a huge refactor.

// PRAGMATIC APPROACH: Create this as a tabbed page that renders each old page's
// core content. We'll embed them by extracting their exports.
// Since we can't modify old pages (they still need to work for old routes),
// we'll create new tab components that duplicate the core UI.
// But the instructions say DON'T delete existing components.

// SIMPLEST: Just render the old page components — they'll each have their own MarketingShell
// nested, which will look bad. So instead, let's create simple tab panels
// that show the key content, and old routes still work.

// FINAL APPROACH: Create a clean tabbed interface. For Pipeline and Backlinks & Authority
// tabs, build new lightweight panels. For Keywords and Meta Tags, reference SEO page content.

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
