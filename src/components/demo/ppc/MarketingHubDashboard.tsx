import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Layout, TrendingUp, Target,
  DollarSign, BarChart3,
  ChevronRight, MessageSquare, Sparkles, Rocket, Wand2
} from "lucide-react";
import { RecentCreations } from "./RecentCreations";
import { cn } from "@/lib/utils";
import { LandingPage } from "./types";

interface MarketingHubDashboardProps {
  onNavigate: (section: string) => void;
  onQuickCreate?: (type: 'ad' | 'landing' | 'campaign') => void;
  liveMode?: boolean;
  stats: {
    totalSpend: number;
    conversions: number;
    activePages: number;
    testsRunning: number;
  };
  recentPages?: LandingPage[];
  onViewPage?: (page: LandingPage) => void;
  onEditPage?: (page: LandingPage) => void;
}

export function MarketingHubDashboard({ 
  onNavigate, 
  onQuickCreate, 
  liveMode = false, 
  stats,
  recentPages = [],
  onViewPage,
  onEditPage
}: MarketingHubDashboardProps) {
  
  const handleCreateLandingPage = () => {
    if (onQuickCreate) {
      onQuickCreate('landing');
    }
  };

  const handleViewPage = (page: LandingPage) => {
    if (onViewPage) {
      onViewPage(page);
    } else {
      onNavigate('manage');
    }
  };

  const handleEditPage = (page: LandingPage) => {
    if (onEditPage) {
      onEditPage(page);
    } else {
      onNavigate('manage');
    }
  };

  const entryOptions = [
    {
      id: 'trudy',
      title: 'Tell Trudy',
      subtitle: 'Describe what you want and she\'ll build it',
      icon: MessageSquare,
      gradient: 'from-purple-500 to-pink-500',
      action: () => onNavigate('trudy-chat'),
    },
    {
      id: 'manual',
      title: 'Build Manual',
      subtitle: 'Choose template, customize, and publish',
      icon: Wand2,
      gradient: 'from-emerald-500 to-teal-500',
      action: () => handleCreateLandingPage(),
    },
    {
      id: 'dashboard',
      title: 'Marketing Dashboard',
      subtitle: 'Analytics, A/B tests, and performance',
      icon: BarChart3,
      gradient: 'from-blue-500 to-indigo-500',
      action: () => onNavigate('performance'),
    },
    {
      id: 'auto',
      title: 'Just Build It For Me',
      subtitle: 'Most optimized pages based on your data',
      icon: Rocket,
      gradient: 'from-amber-500 to-orange-500',
      action: () => onNavigate('auto-build'),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-foreground">What would you like to do?</h2>
          <p className="text-sm text-muted-foreground">Choose how you'd like to get started</p>
        </div>

        {/* 4 Entry Options */}
        <div className="grid grid-cols-2 gap-4">
          {entryOptions.map((option) => (
            <Card
              key={option.id}
              onClick={option.action}
              className="group cursor-pointer border-2 border-transparent hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            >
              <CardContent className="p-5 space-y-3">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
                  option.gradient
                )}>
                  <option.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {option.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{option.subtitle}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Spend', value: `$${stats.totalSpend.toLocaleString()}`, icon: DollarSign },
            { label: 'Conversions', value: stats.conversions.toString(), icon: Target },
            { label: 'Active Pages', value: stats.activePages.toString(), icon: Layout },
            { label: 'Tests Running', value: stats.testsRunning.toString(), icon: TrendingUp },
          ].map((stat) => (
            <div 
              key={stat.label} 
              className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border"
            >
              <stat.icon className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Creations */}
        {recentPages.length > 0 && (
          <RecentCreations 
            pages={recentPages}
            onView={handleViewPage}
            onEdit={handleEditPage}
          />
        )}
      </div>
    </div>
  );
}
