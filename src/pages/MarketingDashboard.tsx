import MarketingShell from "@/components/layout/MarketingShell";
import { Sparkles, Globe, LineChart, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const TOOLS = [
  {
    title: "AI Marketing Suite",
    description: "Create ads, landing pages, and campaigns with AI assistance",
    icon: Sparkles,
  },
  {
    title: "Website Builder",
    description: "Build and manage your company website pages",
    icon: Globe,
  },
  {
    title: "Analytics Setup",
    description: "Configure tracking, A/B tests, and performance metrics",
    icon: LineChart,
  },
];

export default function MarketingDashboard() {
  return (
    <MarketingShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Marketing Suite</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered marketing tools for your business</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.title}
                onClick={() => toast.info(`${tool.title} coming soon`)}
                className="group text-left p-5 rounded-xl border border-border bg-card hover:border-foreground/20 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3 group-hover:bg-foreground/10 transition-colors">
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{tool.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </MarketingShell>
  );
}
