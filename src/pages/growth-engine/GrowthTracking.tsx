import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight, CheckCircle2, AlertTriangle, XCircle, HelpCircle,
  Lightbulb, Phone, ClipboardList, BarChart3, Globe, Link2,
  Copy, Crosshair, Zap, Shield, Eye, TrendingUp, Activity
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CONVERSION_PATHS = [
  { from: "Click", to: "Form", icon: ClipboardList, color: "text-blue-500" },
  { from: "Click", to: "Call", icon: Phone, color: "text-green-500" },
  { from: "Form", to: "Sale", icon: TrendingUp, color: "text-purple-500" },
  { from: "Call", to: "Sale", icon: TrendingUp, color: "text-amber-500" },
  { from: "Landing Page", to: "Sale", icon: BarChart3, color: "text-cyan-500" },
  { from: "Source", to: "Sale", icon: Globe, color: "text-red-500" },
];

const PIXEL_HEALTH = [
  { name: "Google Ads Conversion Tag", status: "active", lastFired: "2 min ago", events: 847 },
  { name: "Meta Pixel", status: "active", lastFired: "5 min ago", events: 1203 },
  { name: "Google Analytics 4", status: "active", lastFired: "1 min ago", events: 3241 },
  { name: "CallRail Tracking", status: "warning", lastFired: "3 hours ago", events: 156 },
  { name: "Google Search Console", status: "active", lastFired: "1 hour ago", events: null },
];

const TROUBLESHOOTING = [
  { issue: "Leads not showing source", fix: "Check UTM parameters on ad URLs. Ensure utm_source and utm_medium are set." },
  { issue: "Calls not tracked", fix: "Verify CallRail number pool is active. Check that dynamic number insertion script is on your landing pages." },
  { issue: "Conversions not in Google Ads", fix: "Confirm conversion action is set to 'Primary'. Check that the Google tag fires on your thank-you page or form submit." },
  { issue: "Meta pixel not firing", fix: "Use Meta Pixel Helper browser extension. Confirm pixel ID matches your ad account." },
  { issue: "Duplicate leads", fix: "Check webhook deduplication rules. Ensure forms have duplicate submission prevention." },
];

export default function GrowthTracking() {
  const [utmSource, setUtmSource] = useState("google");
  const [utmMedium, setUtmMedium] = useState("cpc");
  const [utmCampaign, setUtmCampaign] = useState("interstate-moving-ca");
  const [utmTerm, setUtmTerm] = useState("long distance movers");
  const [baseUrl, setBaseUrl] = useState("https://yourdomain.com/quote");

  const utmUrl = `${baseUrl}?utm_source=${encodeURIComponent(utmSource)}&utm_medium=${encodeURIComponent(utmMedium)}&utm_campaign=${encodeURIComponent(utmCampaign)}${utmTerm ? `&utm_term=${encodeURIComponent(utmTerm)}` : ''}`;

  const copyUtm = () => {
    navigator.clipboard.writeText(utmUrl);
    toast.success("UTM URL copied");
  };

  return (
    <GrowthEngineShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Tracking & Attribution</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Understand what is converting and where your best leads come from
          </p>
        </div>

        {/* What is attribution */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">What is attribution?</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Attribution tells you which ad, keyword, or page brought each lead</li>
                  <li>• Without it, you cannot tell what is working and what is wasting money</li>
                  <li>• It connects the dots from click all the way to a booked move</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visual Attribution Flow */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Your Attribution Flow</h3>
            <div className="flex items-center gap-2 flex-wrap py-2">
              {["Ad Click", "Landing Page", "Form / Call", "Attribution Capture", "Webhook / Router", "Convoso / CRM", "Booked / Sale"].map((step, i, arr) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    i === 0 ? 'bg-blue-500/10 text-blue-600' :
                    i === arr.length - 1 ? 'bg-green-500/10 text-green-600' :
                    i === 5 ? 'bg-emerald-500/10 text-emerald-600' :
                    'bg-muted text-foreground'
                  }`}>
                    {step}
                  </div>
                  {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Leads are captured on your page or form, attributed with UTM tags, then routed via webhook to Convoso and your CRM.
            </p>
          </CardContent>
        </Card>

        {/* Conversion Paths */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Conversion Paths You Track</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CONVERSION_PATHS.map((path) => {
              const Icon = path.icon;
              return (
                <Card key={`${path.from}-${path.to}`}>
                  <CardContent className="p-3 flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${path.color}`} />
                    <div>
                      <span className="text-xs font-semibold text-foreground">{path.from} → {path.to}</span>
                      <p className="text-[10px] text-muted-foreground">Track conversion rate</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* First Touch vs Last Touch */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">First Touch vs Last Touch</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 space-y-1.5">
                <span className="text-xs font-semibold text-blue-600">First Touch</span>
                <p className="text-xs text-muted-foreground">
                  How did this lead first discover you? (e.g., Google Search for "interstate movers California")
                </p>
                <Badge variant="outline" className="text-[10px]">Best for: understanding what drives awareness</Badge>
              </div>
              <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 space-y-1.5">
                <span className="text-xs font-semibold text-green-600">Last Touch</span>
                <p className="text-xs text-muted-foreground">
                  What was the last thing they did before converting? (e.g., clicked a Meta retargeting ad)
                </p>
                <Badge variant="outline" className="text-[10px]">Best for: understanding what closes the deal</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pixel & Event Health */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Pixel & Event Health</h2>
          <div className="space-y-2">
            {PIXEL_HEALTH.map((pixel) => (
              <Card key={pixel.name}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      pixel.status === 'active' ? 'bg-green-500' :
                      pixel.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <span className="text-xs font-semibold text-foreground">{pixel.name}</span>
                      <p className="text-[10px] text-muted-foreground">Last fired: {pixel.lastFired}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pixel.events !== null && (
                      <Badge variant="secondary" className="text-[10px]">{pixel.events.toLocaleString()} events</Badge>
                    )}
                    <Badge variant={pixel.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                      {pixel.status === 'active' ? <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> :
                       pixel.status === 'warning' ? <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> :
                       <XCircle className="w-2.5 h-2.5 mr-0.5" />}
                      {pixel.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* UTM Builder */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" /> UTM Builder
            </h3>
            <p className="text-xs text-muted-foreground">
              UTM tags tell you exactly which campaign, source, and keyword brought each lead. Add them to every ad URL.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground uppercase">Base URL</label>
                <Input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground uppercase">Source</label>
                <Input value={utmSource} onChange={e => setUtmSource(e.target.value)} className="h-8 text-xs" placeholder="google, facebook" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground uppercase">Medium</label>
                <Input value={utmMedium} onChange={e => setUtmMedium(e.target.value)} className="h-8 text-xs" placeholder="cpc, social" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground uppercase">Campaign</label>
                <Input value={utmCampaign} onChange={e => setUtmCampaign(e.target.value)} className="h-8 text-xs" placeholder="interstate-moving-ca" />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-medium text-muted-foreground uppercase">Term (keyword)</label>
                <Input value={utmTerm} onChange={e => setUtmTerm(e.target.value)} className="h-8 text-xs" placeholder="long distance movers" />
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
              <code className="text-[10px] text-muted-foreground flex-1 truncate">{utmUrl}</code>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1 shrink-0" onClick={copyUtm}>
                <Copy className="w-3 h-3" /> Copy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Troubleshooting Broken Attribution
          </h2>
          <div className="space-y-2">
            {TROUBLESHOOTING.map((item) => (
              <Card key={item.issue}>
                <CardContent className="p-3 space-y-1">
                  <span className="text-xs font-semibold text-foreground">{item.issue}</span>
                  <p className="text-xs text-muted-foreground">{item.fix}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Evolution note */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            As real data flows in, use this page to identify broken tracking, verify pixel health, and understand which sources drive actual booked moves.
          </p>
        </div>
      </div>
    </GrowthEngineShell>
  );
}
