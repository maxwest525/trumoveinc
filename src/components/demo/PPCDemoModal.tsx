import { useState, useEffect, useRef, useCallback } from "react";
import DraggableModal from "@/components/ui/DraggableModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Sparkles, Target, 
  BarChart3, DollarSign,
  Layout, RefreshCw, 
  ExternalLink,
  Play, Pause, FlaskConical,
  Radio, Mail, Home, ArrowLeft
} from "lucide-react";
import { ABTest, ConversionEvent, FunnelStage, Stats, Ad } from "./ppc/types";
import { AnalyticsPrefillData } from "./ppc/UnifiedAnalyticsDashboard";
import { ABTestManager } from "./ppc/ABTestManager";
import { AILandingPageGenerator } from "./ppc/AILandingPageGenerator";
import { MarketingHubDashboard } from "./ppc/MarketingHubDashboard";
import { UnifiedAnalyticsDashboard } from "./ppc/UnifiedAnalyticsDashboard";
import { SimpleMarketingFlow } from "./ppc/SimpleMarketingFlow";
import { TrudyMarketingChat } from "./ppc/TrudyMarketingChat";
import { useMarketingPreferences } from "@/hooks/useMarketingPreferences";

interface PPCDemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Initial demo data
const INITIAL_KEYWORDS = [
  { keyword: "long distance moving", volume: 12400, cpc: "$4.82", competition: "High", score: 92, trend: "up" },
  { keyword: "interstate movers near me", volume: 8200, cpc: "$5.15", competition: "High", score: 88, trend: "up" },
  { keyword: "cross country moving companies", volume: 6800, cpc: "$4.20", competition: "Medium", score: 85, trend: "stable" },
  { keyword: "affordable long distance movers", volume: 4500, cpc: "$3.90", competition: "Medium", score: 82, trend: "up" },
  { keyword: "best moving company reviews", volume: 3200, cpc: "$2.85", competition: "Low", score: 78, trend: "stable" },
  { keyword: "moving cost calculator", volume: 9100, cpc: "$2.40", competition: "Medium", score: 75, trend: "down" },
];

const INITIAL_ADS = [
  { 
    id: 1,
    headline: "TruMove - AI-Powered Moving Quotes",
    description: "Get accurate quotes in 60 seconds. Compare verified movers. No hidden fees.",
    status: "active",
    clicks: 1247,
    impressions: 28450,
    ctr: 4.38,
    spend: 892.40,
    conversions: 34
  },
  { 
    id: 2,
    headline: "Compare Top Movers & Save 30%",
    description: "Trusted by 50,000+ families. Real-time tracking. Damage protection included.",
    status: "active",
    clicks: 892,
    impressions: 21340,
    ctr: 4.18,
    spend: 654.20,
    conversions: 28
  },
  { 
    id: 3,
    headline: "Free Moving Estimate in Minutes",
    description: "AI inventory scanner. Transparent pricing. Book online 24/7.",
    status: "paused",
    clicks: 234,
    impressions: 8920,
    ctr: 2.62,
    spend: 189.60,
    conversions: 8
  },
];

const INITIAL_AB_TESTS: ABTest[] = [
  {
    id: 1,
    name: "Homepage Hero CTA",
    status: "running",
    startDate: "Jan 28",
    variants: [
      { name: "Control", visitors: 4521, conversions: 312, rate: 6.9 },
      { name: "Variant A", visitors: 4489, conversions: 387, rate: 8.6 },
    ],
    winner: "Variant A",
    confidence: 94,
    lift: "+24.6%"
  },
  {
    id: 2,
    name: "Quote Form Layout",
    status: "running",
    startDate: "Jan 25",
    variants: [
      { name: "Single Step", visitors: 3212, conversions: 198, rate: 6.2 },
      { name: "Multi Step", visitors: 3198, conversions: 256, rate: 8.0 },
    ],
    winner: "Multi Step",
    confidence: 89,
    lift: "+29.0%"
  },
  {
    id: 3,
    name: "Pricing Display",
    status: "completed",
    startDate: "Jan 15",
    variants: [
      { name: "Range", visitors: 5840, conversions: 321, rate: 5.5 },
      { name: "Starting At", visitors: 5812, conversions: 412, rate: 7.1 },
    ],
    winner: "Starting At",
    confidence: 98,
    lift: "+28.4%"
  },
];

const INITIAL_CONVERSION_EVENTS: ConversionEvent[] = [
  { event: "Quote Requested", count: 847, trend: "+12%", value: "$42.35", source: "Google Ads" },
  { event: "Phone Call", count: 234, trend: "+8%", value: "$68.20", source: "Direct" },
  { event: "Form Submitted", count: 1203, trend: "+18%", value: "$28.50", source: "Organic" },
  { event: "Chat Started", count: 456, trend: "+24%", value: "$15.80", source: "Facebook" },
  { event: "Booking Completed", count: 89, trend: "+6%", value: "$285.00", source: "Google Ads" },
];

const INITIAL_FUNNEL_STAGES: FunnelStage[] = [
  { stage: "Landing Page Views", count: 28450, rate: 100 },
  { stage: "Quote Started", count: 8234, rate: 28.9 },
  { stage: "Inventory Added", count: 4521, rate: 15.9 },
  { stage: "Quote Completed", count: 2847, rate: 10.0 },
  { stage: "Booking Made", count: 847, rate: 3.0 },
];

const INITIAL_STATS: Stats = {
  totalSpend: 1736,
  clicks: 2373,
  conversions: 70,
  costPerConv: 24.80
};

export default function PPCDemoModal({ open, onOpenChange }: PPCDemoModalProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [viewMode, setViewMode] = useState<'hub' | 'quickcreate' | 'detail' | 'trudy-chat' | 'auto-build'>('hub');
  const [quickCreateType, setQuickCreateType] = useState<'ad' | 'landing' | 'campaign' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Persisted marketing preferences
  const { preferences, completeTour, isReturningUser } = useMarketingPreferences();
  
  // Live demo mode
  const [liveMode, setLiveMode] = useState(false);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [ads, setAds] = useState(INITIAL_ADS);
  const [abTests, setAbTests] = useState(INITIAL_AB_TESTS);
  const [conversionEvents, setConversionEvents] = useState(INITIAL_CONVERSION_EVENTS);
  const [funnelStages, setFunnelStages] = useState(INITIAL_FUNNEL_STAGES);
  const [chartData, setChartData] = useState([35, 45, 30, 60, 75, 55, 80, 65, 90, 70, 85, 95, 75, 88]);
  
  // Prefill data from analytics
  const [landingPagePrefill, setLandingPagePrefill] = useState<AnalyticsPrefillData | null>(null);
  
  // Export states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [exportEmail, setExportEmail] = useState("");
  const [exportType, setExportType] = useState<"abtest" | "conversions">("abtest");
  const [isExporting, setIsExporting] = useState(false);

  // Scroll ref for scroll-to-top
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to top whenever view changes
  const scrollToTop = useCallback(() => {
    // Find the ScrollArea viewport and scroll to top
    setTimeout(() => {
      const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = 0;
      }
    }, 50);
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [viewMode, activeTab, scrollToTop]);

  // Live mode simulation
  useEffect(() => {
    if (!liveMode || !open) return;
    
    const interval = setInterval(() => {
      setStats(prev => ({
        totalSpend: prev.totalSpend + Math.random() * 5,
        clicks: prev.clicks + Math.floor(Math.random() * 3),
        conversions: prev.conversions + (Math.random() > 0.7 ? 1 : 0),
        costPerConv: prev.totalSpend / prev.conversions
      }));
      
      setAds(prev => prev.map(ad => ad.status === "active" ? {
        ...ad,
        clicks: ad.clicks + Math.floor(Math.random() * 2),
        impressions: ad.impressions + Math.floor(Math.random() * 15),
        spend: ad.spend + Math.random() * 2,
        conversions: ad.conversions + (Math.random() > 0.85 ? 1 : 0)
      } : ad));
      
      setAbTests(prev => prev.map(test => test.status === "running" ? {
        ...test,
        variants: test.variants.map(v => ({
          ...v,
          visitors: v.visitors + Math.floor(Math.random() * 3),
          conversions: v.conversions + (Math.random() > 0.9 ? 1 : 0),
          rate: parseFloat(((v.conversions / v.visitors) * 100).toFixed(1))
        })),
        confidence: Math.min(99, test.confidence + (Math.random() > 0.8 ? 0.1 : 0))
      } : test));
      
      setConversionEvents(prev => prev.map(event => ({
        ...event,
        count: event.count + (Math.random() > 0.7 ? 1 : 0)
      })));
      
      setFunnelStages(prev => prev.map((stage, i) => ({
        ...stage,
        count: stage.count + (i === 0 ? Math.floor(Math.random() * 5) : (Math.random() > 0.8 ? 1 : 0))
      })));
      
      setChartData(prev => {
        const newData = [...prev.slice(1), Math.floor(Math.random() * 40) + 60];
        return newData;
      });
      
    }, 2000);
    
    return () => clearInterval(interval);
  }, [liveMode, open]);

  const handleGenerateContent = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };
  
  const handleEmailExport = async () => {
    if (!exportEmail) {
      toast.error("Please enter an email address");
      return;
    }
    
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExporting(false);
    setShowEmailModal(false);
    setExportEmail("");
    toast.success(`Report sent to ${exportEmail}!`);
  };

  const openEmailModal = (type: "abtest" | "conversions") => {
    setExportType(type);
    setShowEmailModal(true);
  };

  // Handle quick create from hub
  const handleQuickCreate = (type: 'ad' | 'landing' | 'campaign') => {
    setQuickCreateType(type);
    setViewMode('quickcreate');
  };

  // Handle flow completion
  const handleFlowComplete = (result: { type: string; data: any }) => {
    setViewMode('detail');
    if (result.type === 'landing') {
      setActiveTab('landing');
    } else if (result.type === 'ad' || result.type === 'campaign') {
      setActiveTab('ads');
    }
  };
 
  const handleNavigate = (section: string) => {
    if (section === 'trudy-chat') {
      setViewMode('trudy-chat');
    } else if (section === 'auto-build') {
      // Auto-build: go to analytics with auto-selected data, then to landing pages
      setViewMode('detail');
      setActiveTab('analytics');
    } else if (section === 'ai-create' || section === 'landing') {
      handleQuickCreate('landing');
    } else if (section === 'performance') {
      setViewMode('detail');
      setActiveTab('analytics');
    } else if (section === 'abtest') {
      setViewMode('detail');
      setActiveTab('abtest');
    } else if (section === 'keywords') {
      setViewMode('detail');
      setActiveTab('analytics');
    } else if (section === 'seo') {
      setViewMode('detail');
      setActiveTab('analytics');
    } else if (section === 'campaigns') {
      setViewMode('detail');
      setActiveTab('ads');
    } else {
      setViewMode('detail');
      setActiveTab(section === 'dashboard' ? 'analytics' : section);
    }
  };
 
  return (
    <DraggableModal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      storageKey="tm_modal_ppc"
      defaultWidth={950}
      defaultHeight={700}
      minWidth={600}
      minHeight={400}
      maxWidth={1200}
      maxHeight={900}
      headerStyle={{ background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #EC4899 100%)" }}
      title={
        <div className="flex items-center gap-3 flex-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <span className="block text-white font-bold">AI Marketing Suite</span>
            <span className="text-sm font-normal text-white/80">PPC • SEO • A/B Testing • Conversion Tracking</span>
          </div>
          {/* Home Button */}
          {viewMode !== 'hub' && (
            <button
              onClick={(e) => { e.stopPropagation(); setViewMode('hub'); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all bg-white/20 text-white hover:bg-white/30"
            >
              <Home className="w-3 h-3" />
              Hub
            </button>
          )}
          {/* Live Mode Toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); setLiveMode(!liveMode); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              liveMode 
                ? "bg-white text-purple-600" 
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <Radio className={`w-3 h-3 ${liveMode ? "animate-pulse text-red-500" : ""}`} />
            {liveMode ? "Live" : "Static"}
          </button>
        </div>
      }
      footer={
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40">
          <div className="flex items-center gap-3">
            {(viewMode === 'detail' || viewMode === 'trudy-chat' || viewMode === 'auto-build' || viewMode === 'quickcreate') && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 h-7 text-xs"
                onClick={() => setViewMode('hub')}
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Hub
              </Button>
            )}
            <div className="relative flex items-center gap-2">
              {liveMode ? (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
              )}
              <span className="text-xs text-muted-foreground">
                {liveMode ? "Live Demo Mode - Data updates in real-time" : "Demo Mode - No real campaigns affected"}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <ExternalLink className="w-3 h-3" />
            Learn More
          </Button>
        </div>
      }
    >

        {/* Navigation - Only show in detail view */}
        {viewMode === 'detail' && (
          <div className="flex gap-1 px-4 py-2.5 overflow-x-auto bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            {[
              { id: "analytics", label: "All Analytics", icon: BarChart3, color: "from-blue-500 to-indigo-500" },
              { id: "ads", label: "Google Ads", icon: Target, color: "from-emerald-500 to-teal-500" },
              { id: "landing", label: "Landing Pages", icon: Layout, color: "from-violet-500 to-purple-500" },
              { id: "abtest", label: "A/B Tests", icon: FlaskConical, color: "from-pink-500 to-rose-500" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'text-white shadow-lg scale-[1.02]' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                style={activeTab === tab.id ? {
                  background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #EC4899 100%)",
                } : {}}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Email Export Modal */}
        {showEmailModal && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card rounded-xl p-6 w-96 shadow-xl border border-border">
              <h3 className="font-semibold text-lg mb-4 text-foreground">Email Report</h3>
              <Input
                type="email"
                placeholder="Enter email address..."
                value={exportEmail}
                onChange={(e) => setExportEmail(e.target.value)}
                className="mb-4"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowEmailModal(false)}>Cancel</Button>
                <Button 
                  onClick={handleEmailExport}
                  disabled={isExporting}
                  style={{ background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)" }}
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Hub View */}
        {viewMode === 'hub' && (
          <ScrollArea className="flex-1 max-h-[calc(90vh-140px)]" ref={scrollAreaRef}>
            <MarketingHubDashboard 
              onNavigate={handleNavigate}
              onQuickCreate={handleQuickCreate}
              liveMode={liveMode}
              stats={{
                totalSpend: Math.round(stats.totalSpend),
                conversions: stats.conversions,
                activePages: 4,
                testsRunning: abTests.filter(t => t.status === 'running').length
              }}
            />
          </ScrollArea>
        )}

        {/* Trudy Chat View */}
        {viewMode === 'trudy-chat' && (
          <div className="flex-1 flex flex-col min-h-0 max-h-[calc(90vh-140px)]">
            <TrudyMarketingChat 
              onNavigate={handleNavigate}
              onCreateLandingPage={() => handleQuickCreate('landing')}
            />
          </div>
        )}
 
        {/* Quick Create Flow */}
        {viewMode === 'quickcreate' && (
          <ScrollArea className="flex-1 max-h-[calc(90vh-140px)]" ref={scrollAreaRef}>
            <SimpleMarketingFlow 
              onComplete={handleFlowComplete}
              onCancel={() => setViewMode('hub')}
            />
          </ScrollArea>
        )}

        {/* Auto-Build Flow - goes to analytics with auto-selected data */}
        {viewMode === 'auto-build' && (
          <ScrollArea className="flex-1 max-h-[calc(90vh-140px)]" ref={scrollAreaRef}>
            <UnifiedAnalyticsDashboard 
              onCreateLandingPage={(prefillData) => {
                setLandingPagePrefill(prefillData);
                setViewMode('detail');
                setActiveTab("landing");
              }}
              liveMode={liveMode}
              simplified
            />
          </ScrollArea>
        )}
 
        {/* Detail View - Original Content */}
        {viewMode === 'detail' && (
          <ScrollArea className="flex-1 max-h-[calc(90vh-180px)]" ref={scrollAreaRef}>
          <div className="p-4">
            {/* Unified Analytics Dashboard */}
            {activeTab === "analytics" && (
              <UnifiedAnalyticsDashboard 
                onCreateLandingPage={(prefillData) => {
                  setLandingPagePrefill(prefillData);
                  setActiveTab("landing");
                }}
                liveMode={liveMode}
              />
            )}

            {/* Google Ads */}
            {activeTab === "ads" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Active Campaigns</h3>
                  <Button size="sm" className="gap-2" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)" }}>
                    <Sparkles className="w-4 h-4" />
                    Generate New Ad
                  </Button>
                </div>

                <div className="space-y-3">
                  {ads.map((ad) => (
                    <div key={ad.id} className={`p-4 rounded-xl border border-border bg-card ${liveMode ? "transition-all duration-500" : ""}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">{ad.headline}</h4>
                            <Badge 
                              className="text-[10px]"
                              style={{ 
                                background: ad.status === "active" ? "#10B98120" : "#F59E0B20",
                                color: ad.status === "active" ? "#10B981" : "#F59E0B"
                              }}
                            >
                              {ad.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{ad.description}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          {ad.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                      </div>
                      <div className="grid grid-cols-5 gap-4 pt-3 border-t border-border">
                        <div>
                          <div className={`text-lg font-bold text-foreground ${liveMode ? "transition-all duration-300" : ""}`}>{ad.clicks.toLocaleString()}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">Clicks</div>
                        </div>
                        <div>
                          <div className={`text-lg font-bold text-foreground ${liveMode ? "transition-all duration-300" : ""}`}>{ad.impressions.toLocaleString()}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">Impressions</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold" style={{ color: "#7C3AED" }}>{((ad.clicks / ad.impressions) * 100).toFixed(2)}%</div>
                          <div className="text-[10px] text-muted-foreground uppercase">CTR</div>
                        </div>
                        <div>
                          <div className={`text-lg font-bold text-foreground ${liveMode ? "transition-all duration-300" : ""}`}>${ad.spend.toFixed(2)}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">Spend</div>
                        </div>
                        <div>
                          <div className={`text-lg font-bold ${liveMode ? "transition-all duration-300" : ""}`} style={{ color: "#10B981" }}>{ad.conversions}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">Conversions</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Landing Pages */}
            {activeTab === "landing" && (
              <AILandingPageGenerator 
                isGenerating={isGenerating}
                onGenerate={handleGenerateContent}
                prefillData={landingPagePrefill}
              />
            )}

            {/* A/B Testing - Using new component with drag-and-drop */}
            {activeTab === "abtest" && (
              <ABTestManager
                tests={abTests}
                setTests={setAbTests}
                liveMode={liveMode}
                onEmailExport={() => openEmailModal("abtest")}
              />
            )}


          </div>
        </ScrollArea>
        )}
    </DraggableModal>
  );
}
