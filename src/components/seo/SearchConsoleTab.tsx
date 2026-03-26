import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Link2, ExternalLink, ArrowUpDown, Loader2 } from "lucide-react";
import type { PhaseStatus, SearchConsoleQuery } from "./types";

// Mock data for placeholder
const mockQueries: Record<string, SearchConsoleQuery[]> = {
  "https://trumoveinc.com": [
    { query: "long distance movers", impressions: 12400, clicks: 890, ctr: 7.2, position: 4.3 },
    { query: "interstate moving company", impressions: 8200, clicks: 520, ctr: 6.3, position: 5.1 },
    { query: "cross country movers", impressions: 6100, clicks: 310, ctr: 5.1, position: 7.8 },
    { query: "household goods shipping", impressions: 3400, clicks: 180, ctr: 5.3, position: 6.2 },
  ],
  "https://trumoveinc.com/online-estimate": [
    { query: "moving cost calculator", impressions: 4500, clicks: 340, ctr: 7.6, position: 3.9 },
    { query: "moving estimate online", impressions: 3200, clicks: 210, ctr: 6.6, position: 5.5 },
  ],
};

interface SearchConsoleTabProps {
  status: PhaseStatus;
  auditUrls: string[];
}

export default function SearchConsoleTab({ status, auditUrls }: SearchConsoleTabProps) {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(status === "connected");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const handleConnect = () => {
    setConnecting(true);
    // Simulate OAuth flow
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 2000);
  };

  if (!connected) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Connect Google Search Console</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Import real search query data per URL — see impressions, clicks, CTR, and avg position to match your SEO titles to actual search demand.
              </p>
            </div>
            <Button onClick={handleConnect} disabled={connecting} size="lg">
              {connecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
              {connecting ? "Connecting…" : "Connect Search Console"}
            </Button>
            <p className="text-[11px] text-muted-foreground">Requires Google account with Search Console access for trumoveinc.com</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const urlsWithData = Object.keys(mockQueries);
  const queries = selectedUrl ? (mockQueries[selectedUrl] || []) : [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" /> Search Console Data
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Top queries per URL from Google Search Console (demo data)
              </CardDescription>
            </div>
            <Badge variant="default" className="text-[10px]">Connected</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {urlsWithData.map(url => (
              <Button
                key={url}
                variant={selectedUrl === url ? "default" : "outline"}
                size="sm"
                className="h-7 text-[11px]"
                onClick={() => setSelectedUrl(selectedUrl === url ? null : url)}
              >
                {url.replace("https://trumoveinc.com", "") || "/"}
              </Button>
            ))}
          </div>

          {selectedUrl && queries.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                  <TableHead className="text-right">Avg Position</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queries.map((q, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-sm">{q.query}</TableCell>
                    <TableCell className="text-right text-sm">{q.impressions.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm">{q.clicks.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm">{q.ctr}%</TableCell>
                    <TableCell className="text-right text-sm">{q.position.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!selectedUrl && (
            <p className="text-sm text-muted-foreground text-center py-4">Select a URL above to view its top search queries</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
