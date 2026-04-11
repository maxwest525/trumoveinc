import { useState } from "react";
import { Sparkles, Image, RefreshCw, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const STYLE_PRESETS = [
  { value: "moving-truck", label: "Moving Truck Highway", prompt: "Photorealistic long-distance moving truck driving on an interstate highway, professional photography" },
  { value: "family-home", label: "Family New Home", prompt: "Happy family arriving at their new home, warm lighting, welcoming atmosphere" },
  { value: "city-skyline", label: "City Skyline", prompt: "Aerial view of a major city skyline, clear day, vibrant colors" },
  { value: "packing-scene", label: "Packing Scene", prompt: "Organized packing scene with neatly stacked boxes and packing materials, clean bright room" },
  { value: "route-map", label: "Route Map", prompt: "Illustrated route map showing origin to destination with highway path, modern infographic style" },
  { value: "trust-safety", label: "Trust & Safety", prompt: "Professional corporate trust imagery, clean and modern, safety and reliability theme" },
  { value: "custom", label: "Custom", prompt: "" },
];

const ASPECT_RATIOS = [
  { value: "16:9", label: "16:9 — Blog Hero", width: 1920, height: 1080 },
  { value: "1:1", label: "1:1 — Social", width: 1080, height: 1080 },
  { value: "1200x630", label: "1200×630 — Social Share", width: 1200, height: 630 },
  { value: "4:3", label: "4:3 — Landing Page", width: 1600, height: 1200 },
];

export default function AIImageGeneratorTab() {
  const [preset, setPreset] = useState("moving-truck");
  const [customPrompt, setCustomPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [brandColors, setBrandColors] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const selectedPreset = STYLE_PRESETS.find(p => p.value === preset);

  const handleGenerate = () => {
    setGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setResults(["1", "2", "3", "4"]);
      setGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Prompt section */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Style Preset</Label>
            <Select value={preset} onValueChange={setPreset}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STYLE_PRESETS.map(sp => (
                  <SelectItem key={sp.value} value={sp.value} className="text-xs">{sp.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {preset === "custom" ? (
            <div className="space-y-2">
              <Label className="text-xs font-medium">Prompt</Label>
              <Textarea
                placeholder="Describe the image you want to generate..."
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                className="text-xs min-h-[80px]"
              />
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground uppercase font-medium mb-1">Prompt Preview</p>
              <p className="text-xs text-foreground">{selectedPreset?.prompt}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASPECT_RATIOS.map(ar => (
                    <SelectItem key={ar.value} value={ar.value} className="text-xs">{ar.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Brand Colors</Label>
              <div className="flex items-center gap-2 h-9">
                <Switch checked={brandColors} onCheckedChange={setBrandColors} />
                <span className="text-[10px] text-muted-foreground">Include TruMove palette</span>
              </div>
            </div>
          </div>

          {brandColors && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#1a365d] border border-border" />
              <span className="text-[10px] text-muted-foreground">Navy #1a365d</span>
              <div className="w-5 h-5 rounded-full bg-[#38a169] border border-border ml-2" />
              <span className="text-[10px] text-muted-foreground">Green #38a169</span>
            </div>
          )}

          <Button onClick={handleGenerate} disabled={generating} className="w-full text-xs gap-1.5">
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {generating ? "Generating..." : "Generate Images"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-foreground">Generated Results</h3>
          <div className="grid grid-cols-2 gap-3">
            {results.map((r, i) => (
              <Card key={i} className="overflow-hidden group">
                <div className="aspect-video bg-muted flex items-center justify-center relative">
                  <Image className="w-10 h-10 text-muted-foreground/20" />
                  <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" className="text-[10px] h-7 gap-1">
                      <Check className="w-3 h-3" /> Use
                    </Button>
                    <Button size="sm" variant="secondary" className="text-[10px] h-7 gap-1">
                      <RefreshCw className="w-3 h-3" /> Retry
                    </Button>
                  </div>
                </div>
                <CardContent className="p-2">
                  <p className="text-[10px] text-muted-foreground">Variant {i + 1}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
