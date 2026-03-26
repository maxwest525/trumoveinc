import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Clock } from "lucide-react";

export default function BacklinksTab() {
  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
            <ExternalLink className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <h3 className="text-base font-semibold text-foreground">Authority & Backlinks</h3>
              <Badge variant="outline" className="text-[10px]">
                <Clock className="w-2.5 h-2.5 mr-0.5" /> Coming Soon
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Connect Ahrefs or Semrush to pull domain authority scores, backlink counts, and referring domain data per URL — then prioritize link-building efforts alongside your SEO audit.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto pt-2">
            <div className="text-center">
              <p className="text-lg font-bold text-muted-foreground/40">—</p>
              <p className="text-[10px] text-muted-foreground">Domain Authority</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-muted-foreground/40">—</p>
              <p className="text-[10px] text-muted-foreground">Total Backlinks</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-muted-foreground/40">—</p>
              <p className="text-[10px] text-muted-foreground">Referring Domains</p>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-[11px] text-muted-foreground">
              Planned schema: <code className="text-[10px] bg-muted px-1 py-0.5 rounded">url, backlinks, referring_domains, domain_authority, top_referrers[]</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
