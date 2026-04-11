import { useState } from "react";
import { Plus, Globe, FileText, Eye, Rocket, Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PAGE_TYPES = [
  { value: "route", label: "Route Page", desc: "Moving from City A to City B" },
  { value: "geo", label: "Geo Page", desc: "City-specific long distance movers" },
  { value: "service", label: "Service Page", desc: "Service description & process" },
  { value: "trust", label: "Trust Page", desc: "FMCSA verification & scam prevention" },
  { value: "cost", label: "Cost Page", desc: "Pricing breakdowns & calculators" },
  { value: "landing", label: "Landing Page", desc: "Campaign-specific landing pages" },
];

const MOCK_PAGES = [
  { id: "1", title: "Long Distance Moving Services", url: "/long-distance-moving", type: "service", status: "live", traffic: 1240, conversion: 3.2, updated: "2026-04-08" },
  { id: "2", title: "Moving from LA to NYC", url: "/moving/los-angeles-to-new-york", type: "route", status: "live", traffic: 890, conversion: 4.1, updated: "2026-04-05" },
  { id: "3", title: "Chicago Long Distance Movers", url: "/chicago-long-distance-movers", type: "geo", status: "live", traffic: 620, conversion: 2.8, updated: "2026-04-02" },
  { id: "4", title: "How Much Does Moving Cost?", url: "/moving-cost-calculator", type: "cost", status: "draft", traffic: 0, conversion: 0, updated: "2026-04-10" },
  { id: "5", title: "Is Your Mover Licensed?", url: "/fmcsa-verification", type: "trust", status: "live", traffic: 340, conversion: 5.6, updated: "2026-03-28" },
];

export default function SiteBuilderTab() {
  const [search, setSearch] = useState("");
  const [newPageOpen, setNewPageOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  const filtered = MOCK_PAGES.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) || p.url.includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <Dialog open={newPageOpen} onOpenChange={setNewPageOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs gap-1.5">
              <Plus className="w-3.5 h-3.5" /> New Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm">Create New Page</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <label className="text-xs font-medium text-muted-foreground">Page Type</label>
              <div className="grid grid-cols-2 gap-2">
                {PAGE_TYPES.map(pt => (
                  <button
                    key={pt.value}
                    onClick={() => setSelectedType(pt.value)}
                    className={`text-left p-3 rounded-lg border text-xs transition-all ${
                      selectedType === pt.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <p className="font-medium text-foreground">{pt.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{pt.desc}</p>
                  </button>
                ))}
              </div>
              {selectedType && (
                <>
                  <Input placeholder="Page title..." className="h-9 text-xs" />
                  {selectedType === "route" && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Origin city..." className="h-9 text-xs" />
                      <Input placeholder="Destination city..." className="h-9 text-xs" />
                    </div>
                  )}
                  {selectedType === "geo" && (
                    <Input placeholder="Target city..." className="h-9 text-xs" />
                  )}
                  <Button className="w-full text-xs" size="sm">
                    <Rocket className="w-3.5 h-3.5 mr-1.5" /> Generate with AI
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pages list */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left font-medium px-4 py-3">Page</th>
                  <th className="text-left font-medium px-4 py-3">Type</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-right font-medium px-4 py-3">Traffic</th>
                  <th className="text-right font-medium px-4 py-3">Conv. %</th>
                  <th className="text-right font-medium px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(page => (
                  <tr key={page.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{page.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{page.url}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-[10px] capitalize">{page.type}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={page.status === "live" ? "default" : "outline"} className="text-[10px]">
                        {page.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{page.traffic.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{page.conversion}%</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{page.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
