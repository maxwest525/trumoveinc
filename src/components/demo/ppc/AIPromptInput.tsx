import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Wand2, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AIPromptInputProps {
  onSubmit: (prompt: string, action: string, aiContent?: any) => void;
  isProcessing?: boolean;
}

const QUICK_PROMPTS = [
  { label: "Landing page for seniors", action: "landing" },
  { label: "Ad copy for local moves", action: "ads" },
  { label: "Compare my keywords", action: "analytics" },
  { label: "Run A/B test on CTA", action: "abtest" },
];

const ACTION_MAPPINGS: Record<string, { action: string; message: string }> = {
  "landing": { action: "landing", message: "Creating your landing page..." },
  "page": { action: "landing", message: "Creating your landing page..." },
  "website": { action: "landing", message: "Creating your landing page..." },
  "ad": { action: "ads", message: "Generating ad copy..." },
  "ads": { action: "ads", message: "Generating ad copy..." },
  "copy": { action: "ads", message: "Generating ad copy..." },
  "headline": { action: "ads", message: "Generating headlines..." },
  "keyword": { action: "analytics", message: "Analyzing keywords..." },
  "keywords": { action: "analytics", message: "Analyzing keywords..." },
  "seo": { action: "analytics", message: "Running SEO analysis..." },
  "test": { action: "abtest", message: "Setting up A/B test..." },
  "a/b": { action: "abtest", message: "Setting up A/B test..." },
  "experiment": { action: "abtest", message: "Setting up experiment..." },
  "analytics": { action: "analytics", message: "Opening analytics..." },
  "performance": { action: "analytics", message: "Loading performance data..." },
  "compare": { action: "analytics", message: "Running comparison..." },
};

export function AIPromptInput({ onSubmit, isProcessing = false }: AIPromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const detectAction = (text: string): string => {
    const lowerText = text.toLowerCase();
    for (const [keyword, mapping] of Object.entries(ACTION_MAPPINGS)) {
      if (lowerText.includes(keyword)) {
        return mapping.action;
      }
    }
    return "landing"; // default action
  };

  const generateLandingPageContent = async (userPrompt: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-landing-page', {
        body: { 
          prompt: userPrompt,
          businessName: 'TruMove',
        }
      });

      if (error) {
        console.error('Landing page generation error:', error);
        throw error;
      }

      return data?.content;
    } catch (error) {
      console.error('Failed to generate landing page:', error);
      toast.error('Failed to generate content', {
        description: 'Using template content instead'
      });
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim() || isProcessing || isGenerating) return;
    
    const action = detectAction(prompt);
    const mapping = Object.entries(ACTION_MAPPINGS).find(([k]) => 
      prompt.toLowerCase().includes(k)
    );
    
    toast.success(mapping?.[1].message || "Processing your request...", {
      description: `"${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}"`,
    });

    // For landing page requests, use real AI
    if (action === 'landing') {
      setIsGenerating(true);
      const aiContent = await generateLandingPageContent(prompt);
      setIsGenerating(false);
      onSubmit(prompt, action, aiContent);
    } else {
      onSubmit(prompt, action);
    }
    
    setPrompt("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickPrompt = async (qp: typeof QUICK_PROMPTS[0]) => {
    setPrompt(qp.label);
    toast.success(`Creating: ${qp.label}`, {
      description: "AI is working on your request..."
    });

    if (qp.action === 'landing') {
      setIsGenerating(true);
      const aiContent = await generateLandingPageContent(qp.label);
      setIsGenerating(false);
      onSubmit(qp.label, qp.action, aiContent);
    } else {
      onSubmit(qp.label, qp.action);
    }
  };

  const processing = isProcessing || isGenerating;

  return (
    <div className="space-y-3">
      {/* Main Input */}
      <div 
        className={`relative rounded-xl border-2 transition-all ${
          isFocused 
            ? 'border-primary shadow-lg shadow-primary/10' 
            : 'border-border hover:border-primary/50'
        }`}
        style={{
          background: isFocused 
            ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)'
            : undefined
        }}
      >
        <div className="flex items-start gap-3 p-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)' }}
          >
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to create... e.g., 'Create a landing page for senior moving services with a free quote form'"
              className="w-full bg-transparent border-none outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground min-h-[60px]"
              rows={2}
              disabled={processing}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim() || processing}
            className="shrink-0 gap-2 h-10"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)' }}
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isGenerating ? 'Generating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Create
              </>
            )}
          </Button>
        </div>

        {/* Capability badges */}
        <div className="px-3 pb-3 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-muted-foreground">AI can:</span>
          {['Landing Pages', 'Ad Copy', 'A/B Tests', 'Keywords', 'SEO Fixes'].map(cap => (
            <Badge key={cap} variant="secondary" className="text-[9px] h-5">
              {cap}
            </Badge>
          ))}
          <Badge className="text-[9px] h-5 bg-green-500/10 text-green-600">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by Lovable AI
          </Badge>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Try:</span>
        {QUICK_PROMPTS.map((qp) => (
          <button
            key={qp.label}
            onClick={() => handleQuickPrompt(qp)}
            disabled={processing}
            className="px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-background hover:border-primary hover:text-primary transition-colors flex items-center gap-1 group disabled:opacity-50"
          >
            {qp.label}
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-1 group-hover:ml-0 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}
