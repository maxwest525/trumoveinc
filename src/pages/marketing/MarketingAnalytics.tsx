import MarketingShell from "@/components/layout/MarketingShell";
import { BarChart3, Users, Eye, MousePointerClick, TrendingUp } from "lucide-react";

const stats = [
  { label: "Monthly Visitors", value: "—", icon: Users, note: "Connect GA4" },
  { label: "Page Views", value: "—", icon: Eye, note: "Connect GA4" },
  { label: "Organic Clicks", value: "—", icon: MousePointerClick, note: "Connect Google Search Console" },
  { label: "Avg. Position", value: "—", icon: TrendingUp, note: "Connect Google Search Console" },
];

export default function MarketingAnalytics() {
  return (
    <MarketingShell breadcrumb="Analytics">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Analytics
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">GA4 and Google Search Console data for trumoveinc.com</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors border border-border">
              Connect GA4
            </button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Connect Search Console
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{stat.note}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-semibold mb-1">Traffic Over Time</h2>
            <p className="text-xs text-muted-foreground mb-4">Connect GA4 to see visitor trends</p>
            <div className="border border-dashed border-border rounded-lg p-8 text-center">
              <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-xs text-muted-foreground">No data — connect GA4</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-semibold mb-1">Top Pages</h2>
            <p className="text-xs text-muted-foreground mb-4">Connect Search Console to see top performing pages</p>
            <div className="border border-dashed border-border rounded-lg p-8 text-center">
              <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-xs text-muted-foreground">No data — connect Search Console</p>
            </div>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
