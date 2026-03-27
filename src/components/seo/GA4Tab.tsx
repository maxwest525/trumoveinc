import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Link2, Loader2, ArrowUpDown, TrendingUp } from "lucide-react";
import type { PhaseStatus, GA4PageData } from "./types";

interface GA4TabProps {
  status: PhaseStatus;
}

export default function GA4Tab({ status }: GA4TabProps) {
  const connected = status === "connected";
  const [sortBy, setSortBy] = useState<"sessions" | "conversions" | "conversionRate">("conversionRate");

  if (!connected) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Connect Google Analytics 4</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Pull session and conversion data per URL to prioritize SEO fixes by actual business impact — focus on pages that drive bookings.
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground">GA4 integration is planned for a future release.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardContent className="p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-foreground">GA4 Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Once connected, session and conversion data will appear here — no mock data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
