import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText, Phone, ClipboardList, Globe, Star, ArrowRight,
  Lightbulb, CheckCircle2, AlertTriangle, BarChart3, Zap,
  Shield, MessageSquare, Search, Target, TrendingUp, Eye,
  HelpCircle, ChevronDown, ChevronUp
} from "lucide-react";
import { useState } from "react";

const PAGE_TYPES = [
  {
    name: "Call-First Landing Page",
    icon: Phone,
    bestFor: "Best for Google Search",
    channel: "google",
    description: "Headline, trust badges, click-to-call CTA. Minimal form. Designed for high-intent searchers ready to talk now.",
    converts: "Highest speed-to-lead. Best for 'movers near me' or 'long distance moving cost' searches.",
    sections: ["Hero with phone CTA", "Trust badges / licenses", "Service area routes", "Reviews", "Sticky call button"],
    recommended: true,
  },
  {
    name: "Quote Form Landing Page",
    icon: ClipboardList,
    bestFor: "Best for Higher Quote Quality",
    channel: "google",
    description: "Multi-step or single-step form collecting origin, destination, move date, size. Captures detailed lead info upfront.",
    converts: "Higher lead quality. Better for filtering serious movers from tire-kickers. Routes to Convoso with full context.",
    sections: ["Hero with form", "Trust badges", "How it works (3 steps)", "Route coverage map", "Reviews", "FAQ"],
    recommended: true,
  },
  {
    name: "Meta Instant Form",
    icon: Zap,
    bestFor: "Best for Meta Traffic",
    channel: "meta",
    description: "In-app form on Facebook/Instagram. User never leaves the platform. Auto-fills name, email, phone from profile.",
    converts: "Highest volume, lowest friction. Leads are less qualified but cheap. Must route to Convoso instantly for speed-to-lead.",
    sections: ["Intro card (2-3 lines)", "Auto-fill fields", "Custom questions (move date, origin, destination)", "Thank you screen"],
    recommended: true,
  },
  {
    name: "Full Landing Page (Long Form)",
    icon: FileText,
    bestFor: "Best for Urgent Leads",
    channel: "google",
    description: "Long-scroll page with social proof, pricing guidance, route info, reviews, and multiple CTAs. Educates and converts.",
    converts: "Best for expensive keywords where you need to maximize every click. Works well for competitive interstate routes.",
    sections: ["Hero with dual CTA (call + form)", "Trust strip", "Route/service area section", "Pricing guidance", "Reviews carousel", "FAQ", "Sticky CTA bar"],
    recommended: false,
  },
  {
    name: "Homepage (Not Recommended for Ads)",
    icon: Globe,
    bestFor: "Not for paid traffic",
    channel: "organic",
    description: "Your main website homepage. Too many navigation options and distractions. Visitors click away instead of converting.",
    converts: "Lowest conversion rate for paid traffic. Fine for organic/SEO but never send ad clicks here.",
    sections: ["General site navigation", "Multiple service pages", "About section"],
    recommended: false,
  },
];

const GALLERY_CONCEPTS = [
  {
    label: "Interstate Quote Funnel",
    tag: "Best for Google Search",
    tagColor: "bg-blue-500/10 text-blue-600",
    desc: "Origin city + destination capture. Multi-step form. Routes like 'LA to NYC' or 'Dallas to Chicago'.",
    metric: "7-12% conversion rate typical",
  },
  {
    label: "Instant Call Page",
    tag: "Best for Urgent Leads",
    tagColor: "bg-red-500/10 text-red-600",
    desc: "Click-to-call hero. Minimal text. Trust badges. For searchers ready to book now.",
    metric: "Fastest speed-to-lead",
  },
  {
    label: "Meta Lead Magnet",
    tag: "Best for Meta Traffic",
    tagColor: "bg-purple-500/10 text-purple-600",
    desc: "Instant form or simple LP. 'Get your free interstate moving quote in 30 seconds.' High volume, fast routing.",
    metric: "Highest lead volume",
  },
  {
    label: "Comparison / Authority Page",
    tag: "Best for Higher Quote Quality",
    tagColor: "bg-green-500/10 text-green-600",
    desc: "Long-form trust builder. Reviews, pricing ranges, route info. Filters out low-intent browsers.",
    metric: "Highest lead quality",
  },
  {
    label: "Route-Specific Page",
    tag: "Best for Geo Targeting",
    tagColor: "bg-amber-500/10 text-amber-600",
    desc: "Dedicated page per route: 'Moving from Miami to Atlanta.' SEO-friendly + great for geo-targeted ads.",
    metric: "Best for route campaigns",
  },
  {
    label: "Calculator / Estimator",
    tag: "Best for Engagement",
    tagColor: "bg-cyan-500/10 text-cyan-600",
    desc: "Interactive cost calculator. Users input details, get a range. Captures lead at the end.",
    metric: "High engagement, moderate volume",
  },
];

export default function GrowthLandingPages() {
  const [showAllTypes, setShowAllTypes] = useState(false);
  const visibleTypes = showAllTypes ? PAGE_TYPES : PAGE_TYPES.filter(t => t.recommended);

  return (
    <GrowthEngineShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Landing Pages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Strategy hub for your interstate moving lead capture pages
          </p>
        </div>

        {/* What is a landing page */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">What is a landing page?</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• A landing page is the page someone sees after clicking your ad</li>
                  <li>• It has one job: get the visitor to call you or fill out a form</li>
                  <li>• Unlike your homepage, it has no navigation or distractions</li>
                  <li>• A good landing page doubles or triples your conversion rate vs sending traffic to your homepage</li>
                </ul>
                <div className="pt-1">
                  <Badge variant="outline" className="text-[10px]">
                    <Lightbulb className="w-3 h-3 mr-1" />
                    For interstate moving: call-first pages and quote forms convert best from Google Search
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Page Type Comparison */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Page Types: When to Use What</h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setShowAllTypes(!showAllTypes)}
            >
              {showAllTypes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showAllTypes ? "Show Recommended" : "Show All Types"}
            </Button>
          </div>

          <div className="space-y-3">
            {visibleTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card key={type.name} className={type.recommended ? "border-primary/20" : "opacity-75"}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        type.channel === 'google' ? 'bg-blue-500/10' :
                        type.channel === 'meta' ? 'bg-purple-500/10' : 'bg-muted'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          type.channel === 'google' ? 'text-blue-600' :
                          type.channel === 'meta' ? 'text-purple-600' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">{type.name}</span>
                          <Badge variant="secondary" className="text-[10px]">{type.bestFor}</Badge>
                          {type.recommended && (
                            <Badge className="text-[10px] bg-green-500/10 text-green-600 border-0">
                              <Star className="w-2.5 h-2.5 mr-0.5" /> Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                        <div className="flex items-start gap-1.5">
                          <TrendingUp className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                          <span className="text-xs text-primary">{type.converts}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {type.sections.map((s) => (
                            <Badge key={s} variant="outline" className="text-[10px] font-normal">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Meta vs Landing Page */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-500" />
              Meta Ads: Instant Form vs Landing Page?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 space-y-2">
                <span className="text-xs font-semibold text-purple-600">Use Instant Forms When:</span>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• You want maximum lead volume</li>
                  <li>• Your speed-to-lead is under 60 seconds (Convoso routes instantly)</li>
                  <li>• You can handle lower-quality leads with fast follow-up</li>
                  <li>• Budget is limited and you need cheap leads to test</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 space-y-2">
                <span className="text-xs font-semibold text-blue-600">Use Landing Page When:</span>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• You want higher-quality leads who read before submitting</li>
                  <li>• Your page includes trust signals, reviews, route info</li>
                  <li>• You are running retargeting campaigns</li>
                  <li>• You want to filter out non-serious browsers</li>
                </ul>
              </div>
            </div>
            <div className="pt-1">
              <Badge variant="outline" className="text-[10px]">
                <Lightbulb className="w-3 h-3 mr-1" />
                For interstate moving: start with instant forms for volume, then test landing pages for quality
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Page Concept Gallery */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Page Concept Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {GALLERY_CONCEPTS.map((concept) => (
              <Card key={concept.label} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">{concept.label}</span>
                  </div>
                  <Badge className={`text-[10px] border-0 ${concept.tagColor}`}>{concept.tag}</Badge>
                  <p className="text-xs text-muted-foreground leading-relaxed">{concept.desc}</p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <BarChart3 className="w-3 h-3 text-primary" />
                    <span className="text-[11px] font-medium text-primary">{concept.metric}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Testing Guidance */}
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Testing & Optimization
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-foreground">How to Test Pages</span>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Start with 2-3 page concepts</li>
                  <li>• Run each for 50-100 clicks minimum</li>
                  <li>• Compare: form rate, call rate, cost per lead</li>
                  <li>• Track all the way to booked/sold</li>
                </ul>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-semibold text-foreground">When to Replace a Page</span>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Conversion rate below 3% after 200+ clicks</li>
                  <li>• Cost per lead 2x higher than other pages</li>
                  <li>• Leads from the page rarely convert to sales</li>
                  <li>• Bounce rate above 80%</li>
                </ul>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px]">
              <Lightbulb className="w-3 h-3 mr-1" />
              Turn off weak converters. Scale winners. Repeat.
            </Badge>
          </CardContent>
        </Card>

        {/* Evolution note */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            As campaigns run, you will learn which page types convert best for your routes. Add new concepts, remove underperformers, and adjust based on real data.
          </p>
        </div>
      </div>
    </GrowthEngineShell>
  );
}
