import MarketingShell from "@/components/layout/MarketingShell";
import {
  Settings, Globe, Search, Megaphone, Key, Link2, Bell,
  ExternalLink, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const INTEGRATIONS = [
  { name: "Google Search Console", connected: true, icon: Search },
  { name: "Google Ads", connected: true, icon: Megaphone },
  { name: "Meta Ads Manager", connected: true, icon: Globe },
  { name: "Google Analytics 4", connected: true, icon: Globe },
  { name: "Ahrefs / SEMrush", connected: false, icon: Link2 },
];

const NOTIFICATION_SETTINGS = [
  { label: "Agent completes a task", enabled: true },
  { label: "Campaign CPA exceeds target", enabled: true },
  { label: "New keyword enters top 10", enabled: true },
  { label: "A/B test reaches significance", enabled: true },
  { label: "Weekly performance digest", enabled: false },
];

export default function MarketingSettings() {
  return (
    <MarketingShell breadcrumb=" / Settings">
      <div className="space-y-4 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Settings</h1>
            <p className="text-xs text-muted-foreground">Configure your AI marketing agents</p>
          </div>
        </div>

        {/* GoMega Link */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-foreground">GoMega.ai Account</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Manage your account, billing, and agent configuration directly on GoMega.ai</p>
            </div>
            <a
              href="https://app.gomega.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-primary text-primary-foreground text-[11px] font-medium px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Open GoMega <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Key className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold text-foreground">Connected Integrations</h2>
          </div>
          <div className="divide-y divide-border/30">
            {INTEGRATIONS.map((int, i) => {
              const Icon = int.icon;
              return (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[12px] font-medium text-foreground">{int.name}</span>
                  </div>
                  {int.connected ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </span>
                  ) : (
                    <button className="text-[10px] text-primary font-medium hover:underline">Connect</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Bell className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold text-foreground">Notifications</h2>
          </div>
          <div className="divide-y divide-border/30">
            {NOTIFICATION_SETTINGS.map((n, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <span className="text-[12px] text-foreground">{n.label}</span>
                <div className={cn(
                  "w-8 h-4.5 rounded-full relative cursor-pointer transition-colors",
                  n.enabled ? "bg-primary" : "bg-muted"
                )}>
                  <div className={cn(
                    "absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform",
                    n.enabled ? "left-[calc(100%-0.5rem-0.125rem)]" : "left-0.5"
                  )} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
