import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, ArrowUpRight, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const STATIC_KEYWORDS = [
  { keyword: "long distance movers", volume: 33100, difficulty: 72, position: null as number | null, intent: "commercial", value: "high" },
  { keyword: "interstate moving companies", volume: 18100, difficulty: 68, position: null, intent: "commercial", value: "high" },
  { keyword: "cross country movers", volume: 22200, difficulty: 70, position: null, intent: "commercial", value: "high" },
  { keyword: "cheap long distance movers", volume: 12100, difficulty: 65, position: null, intent: "transactional", value: "high" },
  { keyword: "FMCSA certified movers", volume: 2400, difficulty: 35, position: null, intent: "informational", value: "medium" },
  { keyword: "moving company instant quote", volume: 8100, difficulty: 58, position: null, intent: "transactional", value: "high" },
  { keyword: "verified moving companies", volume: 4400, difficulty: 42, position: null, intent: "commercial", value: "high" },
  { keyword: "how to hire a long distance mover", volume: 5400, difficulty: 38, position: null, intent: "informational", value: "medium" },
  { keyword: "moving scam protection", volume: 3600, difficulty: 30, position: null, intent: "informational", value: "medium" },
];

function difficultyColor(d: number) {
  if (d >= 70) return "text-red-600 bg-red-50";
  if (d >= 50) return "text-amber-600 bg-amber-50";
  return "text-green-600 bg-green-50";
}

export default function KeywordsTab() {
  const [search, setSearch] = useState("");
  const [gscPositions, setGscPositions] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase.from("gsc_page_data").select("query,position").then(({ data }) => {
      if (data) {
        const map: Record<string, number> = {};
        data.forEach((row) => {
          if (!map[row.query] || row.position < map[row.query]) {
            map[row.query] = Math.round(row.position * 10) / 10;
          }
        });
        setGscPositions(map);
      }
    });
  }, []);

  const keywords = STATIC_KEYWORDS.map((kw) => ({
    ...kw,
    position: gscPositions[kw.keyword] ?? kw.position,
  }));

  const filtered = keywords.filter((kw) => kw.keyword.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search keywords..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Keyword</th>
              <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Volume</th>
              <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Difficulty</th>
              <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">GSC Position</th>
              <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Intent</th>
              <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Value</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((kw) => (
              <tr key={kw.keyword} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium">{kw.keyword}</td>
                <td className="px-4 py-3 text-right">{kw.volume.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${difficultyColor(kw.difficulty)}`}>
                    {kw.difficulty}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {kw.position ? (
                    <span className={kw.position <= 10 ? "text-green-600 font-semibold" : kw.position <= 20 ? "text-amber-600" : "text-red-600"}>
                      {kw.position}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-[10px]">{kw.intent}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={kw.value === "high" ? "default" : "outline"} className="text-[10px]">{kw.value}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
