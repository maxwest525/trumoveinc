import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Sparkles, CheckCircle2, Layout, Target, TrendingUp,
  FileText, Calculator, Users, MapPin, Zap, ArrowRight,
  Loader2, Image, Play, ExternalLink, Copy, Download,
  ChevronRight, Rocket, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SimpleMarketingFlowProps {
  onComplete: (result: { type: string; data: any }) => void;
  onCancel: () => void;
}

type FlowType = 'ad' | 'landing' | 'campaign' | null;

interface QuickTemplate {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  conversionRate: string;
  popular?: boolean;
}

const AD_TEMPLATES: QuickTemplate[] = [
  { id: 'quote', title: 'Get Free Quote', subtitle: 'Lead generation focus', icon: FileText, color: '#7C3AED', conversionRate: '12.4%', popular: true },
  { id: 'savings', title: 'Save 30% Today', subtitle: 'Discount messaging', icon: Target, color: '#3B82F6', conversionRate: '9.8%' },
  { id: 'trust', title: '50K+ Happy Families', subtitle: 'Social proof focus', icon: Users, color: '#3B82F6', conversionRate: '8.2%' },
  { id: 'local', title: 'Local Movers Near You', subtitle: 'Geo-targeted', icon: MapPin, color: '#F59E0B', conversionRate: '11.1%' },
];

const LANDING_TEMPLATES: QuickTemplate[] = [
  { id: 'funnel-quote', title: 'Quote Funnel', subtitle: 'High-converting lead capture', icon: FileText, color: '#7C3AED', conversionRate: '15.8%', popular: true },
  { id: 'calculator', title: 'Cost Calculator', subtitle: 'Interactive pricing tool', icon: Calculator, color: '#3B82F6', conversionRate: '18.2%' },
  { id: 'comparison', title: 'Why Choose Us', subtitle: 'Competitor comparison', icon: Star, color: '#F59E0B', conversionRate: '12.4%' },
  { id: 'local-seo', title: 'City Landing Page', subtitle: 'Local SEO optimized', icon: MapPin, color: '#3B82F6', conversionRate: '9.6%' },
];

const CAMPAIGN_TEMPLATES: QuickTemplate[] = [
  { id: 'google-search', title: 'Google Search Ads', subtitle: 'High-intent keywords', icon: Target, color: '#4285F4', conversionRate: '4.2% CTR', popular: true },
  { id: 'meta-awareness', title: 'Facebook/Instagram', subtitle: 'Brand awareness + leads', icon: Users, color: '#0668E1', conversionRate: '2.8% CTR' },
  { id: 'google-display', title: 'Display Network', subtitle: 'Retargeting banners', icon: Image, color: '#34A853', conversionRate: '1.2% CTR' },
  { id: 'local-services', title: 'Local Services Ads', subtitle: 'Google Guaranteed badge', icon: MapPin, color: '#EA4335', conversionRate: '8.5% CTR' },
];

export function SimpleMarketingFlow({ onComplete, onCancel }: SimpleMarketingFlowProps) {
  const [flowType, setFlowType] = useState<FlowType>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState(0);

  const creationSteps = [
    'Analyzing best practices...',
    'Generating content...',
    'Optimizing for conversions...',
    'Ready to launch!'
  ];

  const handleSelectFlow = (type: FlowType) => {
    setFlowType(type);
    setSelectedTemplate(null);
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    // Auto-create after selection
    handleCreate(templateId);
  };

  const handleCreate = (templateId: string) => {
    setIsCreating(true);
    setCreationStep(0);

    const interval = setInterval(() => {
      setCreationStep(prev => {
        if (prev >= creationSteps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            const templates = flowType === 'ad' ? AD_TEMPLATES : flowType === 'landing' ? LANDING_TEMPLATES : CAMPAIGN_TEMPLATES;
            const template = templates.find(t => t.id === templateId);
            onComplete({ 
              type: flowType!, 
              data: { 
                templateId, 
                templateName: template?.title,
                createdAt: new Date() 
              } 
            });
            toast.success(`${template?.title} created!`, {
              description: 'Click to view and customize',
              action: {
                label: 'View',
                onClick: () => {}
              }
            });
          }, 300);
          return prev;
        }
        return prev + 1;
      });
    }, 400);
  };

  // Creating state
  if (isCreating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 space-y-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">Creating your {flowType}...</h2>
          <p className="text-sm text-muted-foreground">AI is building everything for you</p>
        </div>

        <div className="w-full max-w-xs space-y-3">
          <Progress value={((creationStep + 1) / creationSteps.length) * 100} className="h-2" />
          <div className="space-y-1.5">
            {creationSteps.map((step, i) => (
              <div 
                key={i}
                className={cn(
                  "flex items-center gap-2 text-sm transition-all",
                  i < creationStep ? 'text-primary' : 
                  i === creationStep ? 'text-foreground' : 
                  'text-muted-foreground/40'
                )}
              >
                {i < creationStep ? (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                ) : i === creationStep ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-muted" />
                )}
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Choose what to create
  if (!flowType) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">What do you want to create?</h2>
          <p className="text-muted-foreground">Pick one and we'll handle the rest</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { 
              type: 'ad' as FlowType, 
              title: 'Ad', 
              description: 'Google or Facebook ad',
              icon: Target,
              color: '#7C3AED',
              gradient: 'from-purple-500 to-purple-600'
            },
            { 
              type: 'landing' as FlowType, 
              title: 'Landing Page', 
              description: 'High-converting page',
              icon: Layout,
               color: '#3B82F6',
               gradient: 'from-blue-500 to-blue-600'
            },
            { 
              type: 'campaign' as FlowType, 
              title: 'Campaign', 
              description: 'Full ad campaign',
              icon: Rocket,
              color: '#F59E0B',
              gradient: 'from-amber-500 to-orange-500'
            },
          ].map((item) => (
            <Card
              key={item.type}
              onClick={() => handleSelectFlow(item.type)}
              className="group cursor-pointer border-2 border-transparent hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="p-6 text-center space-y-4">
                <div 
                  className={cn(
                    "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-gradient-to-br",
                    item.gradient
                  )}
                >
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 mx-auto text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="ghost" onClick={onCancel} className="text-muted-foreground">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Step 2: Choose template (one-click creates it)
  const templates = flowType === 'ad' ? AD_TEMPLATES : flowType === 'landing' ? LANDING_TEMPLATES : CAMPAIGN_TEMPLATES;
  const flowLabel = flowType === 'ad' ? 'Ad' : flowType === 'landing' ? 'Landing Page' : 'Campaign';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setFlowType(null)}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          ← Back
        </button>
        <Badge variant="secondary" className="gap-1">
          <Zap className="w-3 h-3" />
          One-Click Create
        </Badge>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">Choose a {flowLabel} Template</h2>
        <p className="text-muted-foreground text-sm">Click any template to instantly create it</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {templates.map((template) => (
          <Card
            key={template.id}
            onClick={() => handleSelectTemplate(template.id)}
            className={cn(
              "group cursor-pointer border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden",
              "border-transparent hover:border-primary/50"
            )}
          >
            {template.popular && (
              <div className="absolute top-2 right-2">
                <Badge 
                  className="text-[10px] px-1.5 py-0" 
                  style={{ background: '#7C3AED', color: 'white' }}
                >
                  Popular
                </Badge>
              </div>
            )}
            <div className="p-4 flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                style={{ background: `${template.color}20` }}
              >
                <template.icon className="w-6 h-6" style={{ color: template.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {template.title}
                </h3>
                <p className="text-xs text-muted-foreground">{template.subtitle}</p>
              </div>
              <div className="text-right shrink-0">
                <Badge 
                  variant="outline" 
                  className="text-[10px]"
                  style={{ borderColor: `${template.color}40`, color: template.color }}
                >
                  {template.conversionRate}
                </Badge>
              </div>
            </div>
            <div 
              className="h-1 w-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: `linear-gradient(90deg, ${template.color}, ${template.color}80)` }}
            />
          </Card>
        ))}
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground">
          💡 All templates are pre-optimized for TruMove branding
        </p>
      </div>
    </div>
  );
}
