import { useState } from "react";
import MarketingShell from "@/components/layout/MarketingShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, CheckCircle2, Clock, ArrowUpRight, TrendingUp, BarChart3 } from "lucide-react";
import { useImplementationQueue } from "@/contexts/ImplementationQueueContext";

// Re-export existing page content as tabs
import MarketingRecommendations from "./MarketingRecommendations";
import MarketingImplementation from "./MarketingImplementation";

// We need to extract inner content. Since those pages wrap in MarketingShell,
// the cleanest approach for now is to build inline tab content.
// But to preserve ALL existing functionality, we'll import and render
// the recommendation + implementation components.
// Workaround: render them but they'll have nested shells. Instead, build lightweight wrappers.

import RecommendationsContent from "@/components/marketing/action-items/RecommendationsContent";
import ImplementationContent from "@/components/marketing/action-items/ImplementationContent";
import ResultsContent from "@/components/marketing/action-items/ResultsContent";

export default function MarketingActionItems() {
  return (
    <MarketingShell breadcrumb="Action Items">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Action Items
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Recommendations, approvals & results
          </p>
        </div>

        <Tabs defaultValue="recommendations" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations">
            <RecommendationsContent />
          </TabsContent>
          <TabsContent value="implementation">
            <ImplementationContent />
          </TabsContent>
          <TabsContent value="results">
            <ResultsContent />
          </TabsContent>
        </Tabs>
      </div>
    </MarketingShell>
  );
}
