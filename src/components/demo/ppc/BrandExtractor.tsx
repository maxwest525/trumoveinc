import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Loader2, Plus, X, Palette, Zap, ExternalLink, Check, Sparkles, ChevronDown
} from "lucide-react";
import { firecrawlApi, ExtractedBranding } from "@/lib/api/firecrawl";
import { PRESET_STYLES } from "./brandPresets";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExtractedSite {
  url: string;
  branding: ExtractedBranding;
  screenshot?: string;
  title?: string;
  loading?: boolean;
}

interface BrandExtractorProps {
  onApplyTheme: (branding: ExtractedBranding) => void;
  currentThemeId?: string;
}

export function BrandExtractor({ onApplyTheme, currentThemeId }: BrandExtractorProps) {
  const [urls, setUrls] = useState<string[]>([""]);
  const [extractedSites, setExtractedSites] = useState<ExtractedSite[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const handleAddUrl = () => {
    if (urls.length < 3) setUrls([...urls, ""]);
  };

  const handleRemoveUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const handleExtract = async () => {
    const validUrls = urls.filter(u => u.trim().length > 0);
    if (validUrls.length === 0) {
      toast.error("Enter at least one URL");
      return;
    }

    setIsExtracting(true);
    setExtractedSites([]);

    try {
      const results = await Promise.allSettled(
        validUrls.map(async (url) => {
          const response = await firecrawlApi.scrape(url, {
            formats: ['branding', 'screenshot'],
            onlyMainContent: false,
          });

          if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to scrape');
          }

          return {
            url,
            branding: response.data.branding || {},
            screenshot: response.data.screenshot,
            title: response.data.metadata?.title || url,
          };
        })
      );

      const successful: ExtractedSite[] = [];
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          successful.push(r.value);
        } else {
          toast.error(`Failed to extract from ${validUrls[i]}: ${r.reason?.message || 'Unknown error'}`);
        }
      });

      setExtractedSites(successful);
      if (successful.length > 0) {
        toast.success(`Extracted branding from ${successful.length} site(s)`);
      }
    } catch (error) {
      toast.error("Extraction failed");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_STYLES.find(p => p.id === presetId);
    if (preset) {
      setActivePreset(preset.id);
      onApplyTheme(preset.branding);
      toast.success(`Applied ${preset.name} style`);
    }
  };

  const handleApplyExtracted = (site: ExtractedSite) => {
    setActivePreset(null);
    onApplyTheme(site.branding);
    toast.success(`Applied style from ${site.title || site.url}`);
  };

  const activePresetData = activePreset ? PRESET_STYLES.find(p => p.id === activePreset) : null;

  return (
    <div className="space-y-4">
      {/* Preset Dropdown */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-primary" />
          <span className="text-xs font-semibold">Steal This Style</span>
        </div>
        <Select value={activePreset || ""} onValueChange={handleSelectPreset}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Choose a brand style...">
              {activePresetData && (
                <span className="flex items-center gap-2">
                  <span className="flex gap-0.5">
                    {[activePresetData.branding.colors?.primary, activePresetData.branding.colors?.secondary, activePresetData.branding.colors?.accent]
                      .filter(Boolean)
                      .map((c, i) => (
                        <span key={i} style={{ background: c }} className="w-3 h-3 rounded-full border border-border/50 inline-block" />
                      ))}
                  </span>
                  <span>{activePresetData.name}</span>
                  <span className="text-muted-foreground ml-1">— {activePresetData.desc}</span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PRESET_STYLES.map(p => {
              const colors = [p.branding.colors?.primary, p.branding.colors?.secondary, p.branding.colors?.accent].filter(Boolean);
              return (
                <SelectItem key={p.id} value={p.id} className="text-xs py-2">
                  <span className="flex items-center gap-2.5">
                    <span className="flex gap-0.5 shrink-0">
                      {colors.map((c, i) => (
                        <span key={i} style={{ background: c }} className="w-3 h-3 rounded-full border border-border/50 inline-block" />
                      ))}
                    </span>
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground">{p.desc}</span>
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* URL Extraction */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Palette size={14} className="text-primary" />
          <span className="text-xs font-semibold">Extract from URL</span>
        </div>
        <div className="space-y-2">
          {urls.map((url, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={url}
                onChange={e => {
                  const newUrls = [...urls];
                  newUrls[i] = e.target.value;
                  setUrls(newUrls);
                }}
                placeholder="https://example.com"
                className="text-xs h-8"
              />
              {urls.length > 1 && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveUrl(i)}>
                  <X size={12} />
                </Button>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            {urls.length < 3 && (
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleAddUrl}>
                <Plus size={12} className="mr-1" /> Add URL
              </Button>
            )}
            <Button size="sm" className="h-7 text-xs" onClick={handleExtract} disabled={isExtracting}>
              {isExtracting ? <Loader2 size={12} className="mr-1 animate-spin" /> : <Zap size={12} className="mr-1" />}
              {isExtracting ? "Extracting..." : "Extract Branding"}
            </Button>
          </div>
        </div>
      </div>

      {/* Extracted Results */}
      {extractedSites.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold">Extracted Styles</span>
          {extractedSites.map((site, i) => (
            <div key={i} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <ExternalLink size={10} className="text-muted-foreground shrink-0" />
                  <span className="text-[11px] font-medium truncate">{site.title || site.url}</span>
                </div>
                <Button size="sm" variant="outline" className="h-6 text-[10px] shrink-0" onClick={() => handleApplyExtracted(site)}>
                  Apply Style
                </Button>
              </div>

              {/* Color preview */}
              {site.branding.colors && (
                <div className="flex gap-1">
                  {Object.entries(site.branding.colors).map(([key, val]) => (
                    <div
                      key={key}
                      style={{ background: val }}
                      className="w-5 h-5 rounded border border-border/50"
                      title={`${key}: ${val}`}
                    />
                  ))}
                </div>
              )}

              {/* Screenshot preview */}
              {site.screenshot && (
                <div className="rounded overflow-hidden border border-border">
                  <img
                    src={site.screenshot}
                    alt={`Screenshot of ${site.url}`}
                    className="w-full h-24 object-cover object-top"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
