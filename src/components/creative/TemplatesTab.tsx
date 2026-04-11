import { FileText, Eye, Copy, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TEMPLATES = [
  {
    id: "route",
    name: "Route Page Template",
    type: "Route",
    description: "Moving from [City A] to [City B] — hero, route data, cost estimate, trust block, FAQ, CTA",
    pagesUsing: 12,
  },
  {
    id: "geo",
    name: "Geo Page Template",
    type: "Geo",
    description: "[City] Long Distance Movers — local focus, service area, trust block, reviews, CTA",
    pagesUsing: 8,
  },
  {
    id: "trust",
    name: "Trust Page Template",
    type: "Trust",
    description: "Scam prevention, FMCSA verification, broker vs carrier explanation",
    pagesUsing: 3,
  },
  {
    id: "cost",
    name: "Cost Page Template",
    type: "Cost",
    description: "Cost calculator, pricing breakdown, comparison table, CTA",
    pagesUsing: 4,
  },
  {
    id: "service",
    name: "Service Page Template",
    type: "Service",
    description: "Service description, process steps, trust elements, CTA",
    pagesUsing: 6,
  },
];

export default function TemplatesTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map(tpl => (
          <Card key={tpl.id} className="hover:shadow-md transition-shadow">
            {/* Preview thumbnail */}
            <div className="aspect-[4/3] bg-muted rounded-t-lg flex items-center justify-center border-b border-border">
              <div className="text-center space-y-2">
                <FileText className="w-8 h-8 mx-auto text-muted-foreground/30" />
                <Badge variant="secondary" className="text-[9px]">{tpl.type}</Badge>
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="text-xs font-semibold text-foreground">{tpl.name}</h3>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{tpl.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{tpl.pagesUsing} pages using this</span>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1 px-2">
                    <Eye className="w-3 h-3" /> Edit
                  </Button>
                  <Button size="sm" className="text-[10px] h-7 gap-1 px-2">
                    <Copy className="w-3 h-3" /> Create
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
