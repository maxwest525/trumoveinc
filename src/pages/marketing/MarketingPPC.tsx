import MarketingShell from "@/components/layout/MarketingShell";
import { Megaphone, TrendingUp, DollarSign, MousePointerClick, Target } from "lucide-react";

const placeholderStats = [
  { label: "Monthly Spend", value: "$0", icon: DollarSign, note: "Google Ads not connected" },
  { label: "Total Clicks", value: "—", icon: MousePointerClick, note: "Connect Google Ads" },
  { label: "Conversions", value: "—", icon: Target, note: "Connect Google Ads" },
  { label: "Avg CPC", value: "—", icon: TrendingUp, note: "Connect Google Ads" },
];

export default function MarketingPPC() {
  return (
    <MarketingShell breadcrumb="PPC / Paid Ads">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" />
              PPC / Paid Ads
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Google Ads campaign management and performance tracking</p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Connect Google Ads
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {placeholderStats.map((stat) => {
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

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold mb-1">Campaigns</h2>
          <p className="text-xs text-muted-foreground mb-4">Connect your Google Ads account to manage campaigns, keywords, budgets, and ad copy from here.</p>
          <div className="border border-dashed border-border rounded-lg p-8 text-center">
            <Megaphone className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">No campaigns yet</p>
            <p className="text-xs text-muted-foreground mt-1">Connect Google Ads to import and manage your campaigns</p>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
