import { useState } from "react";
import { Upload, Search, Image, Copy, Download, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const FILTERS = ["All", "Blog Heroes", "Ad Creatives", "Social Share", "Route Maps", "Landing Page"];

const MOCK_IMAGES = [
  { id: "1", name: "hero-moving-truck.jpg", category: "Blog Heroes", dimensions: "1920×1080", date: "2026-04-08", usedOn: "Long Distance Moving", url: "/placeholder.svg" },
  { id: "2", name: "family-new-home.jpg", category: "Landing Page", dimensions: "1200×630", date: "2026-04-05", usedOn: "Homepage", url: "/placeholder.svg" },
  { id: "3", name: "la-to-nyc-route.png", category: "Route Maps", dimensions: "1600×900", date: "2026-04-02", usedOn: "LA to NYC Route Page", url: "/placeholder.svg" },
  { id: "4", name: "packing-boxes.jpg", category: "Blog Heroes", dimensions: "1920×1080", date: "2026-03-30", usedOn: "Packing Tips Blog", url: "/placeholder.svg" },
  { id: "5", name: "trust-badge-fmcsa.png", category: "Ad Creatives", dimensions: "1080×1080", date: "2026-03-28", usedOn: "Trust Page", url: "/placeholder.svg" },
  { id: "6", name: "chicago-skyline.jpg", category: "Social Share", dimensions: "1200×630", date: "2026-03-25", usedOn: "Chicago Geo Page", url: "/placeholder.svg" },
];

export default function MediaLibraryTab() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = MOCK_IMAGES.filter(img => {
    const matchSearch = img.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || img.category === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search images..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTERS.map(f => (
                <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" className="text-xs gap-1.5">
          <Upload className="w-3.5 h-3.5" /> Upload
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(img => (
          <Card key={img.id} className="group overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-video bg-muted relative flex items-center justify-center">
              <Image className="w-8 h-8 text-muted-foreground/30" />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(`https://trumoveinc.com${img.url}`); toast.success("URL copied"); }}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors">
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button className="p-2 rounded-lg bg-white/20 hover:bg-destructive/80 text-white transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <CardContent className="p-3 space-y-1">
              <p className="text-[11px] font-medium text-foreground truncate">{img.name}</p>
              <p className="text-[10px] text-muted-foreground">{img.dimensions} · {img.date}</p>
              <p className="text-[10px] text-muted-foreground">Used on: {img.usedOn}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Drop zone hint */}
      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
        <Upload className="w-6 h-6 mx-auto text-muted-foreground/40 mb-2" />
        <p className="text-xs text-muted-foreground">Drag and drop files here to upload</p>
      </div>
    </div>
  );
}
