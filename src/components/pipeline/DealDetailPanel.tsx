import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Deal, Activity, PipelineStage } from "./types";
import { ActivityTimeline } from "./ActivityTimeline";
import { AddActivityForm } from "./AddActivityForm";
import { DealAIAssistant } from "./DealAIAssistant";
import { DealEmailComposer } from "./DealEmailComposer";
import { DealQuickActions } from "./DealQuickActions";
import { Phone, PhoneCall, Mail, MapPin, Calendar, DollarSign, Globe, Monitor, MousePointer, Shield, ExternalLink } from "lucide-react";
import { format, parseISO } from "date-fns";
import { DialerProvider } from "@/components/dialer/dialerProvider";

interface DealDetailPanelProps {
  deal: Deal | null;
  stages: PipelineStage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStageChange: (dealId: string, newStage: string) => void;
}

export function DealDetailPanel({ deal, stages, open, onOpenChange, onStageChange }: DealDetailPanelProps) {
  const [activities, setActivities] = useState<Activity[]>([]);

  const fetchActivities = async () => {
    if (!deal) return;
    const { data } = await supabase
      .from("activities" as any)
      .select("*")
      .eq("deal_id", deal.id)
      .order("created_at", { ascending: false });
    setActivities((data as any as Activity[]) || []);
  };

  useEffect(() => {
    if (deal && open) fetchActivities();
  }, [deal?.id, open]);

  if (!deal) return null;
  const lead = deal.leads;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg">
            {lead ? `${lead.first_name} ${lead.last_name}` : "Deal Details"}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Stage selector */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Stage</label>
            <Select value={deal.stage} onValueChange={(v) => onStageChange(deal.id, v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {stages.map((s) => (
                  <SelectItem key={s.stage_key} value={s.stage_key}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Deal value */}
          {deal.deal_value ? (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">${deal.deal_value.toLocaleString()}</span>
            </div>
          ) : null}

          {/* Contact info */}
          {lead && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact</h5>
              {lead.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{lead.phone}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full text-muted-foreground hover:text-primary ml-1"
                    onClick={() => DialerProvider.startCall(lead.phone!, undefined, `${lead.first_name} ${lead.last_name}`)}
                    title={`Call ${lead.phone}`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{lead.email}</span>
                </div>
              )}
            </div>
          )}

          {/* Move details */}
          {lead && (lead.origin_address || lead.move_date) && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Move Details</h5>
              {lead.move_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{format(parseISO(lead.move_date), "MMMM d, yyyy")}</span>
                </div>
              )}
              {lead.origin_address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{lead.origin_address} → {lead.destination_address || "TBD"}</span>
                </div>
              )}
              {lead.estimated_value && (
                <Badge variant="secondary" className="text-xs">Est. ${lead.estimated_value.toLocaleString()}</Badge>
              )}
            </div>
          )}

          {/* Lead Enrichment Data */}
          {lead && (lead.utm_source || lead.device_type || lead.consent_ad_storage || lead.ga_client_id || lead.landing_page_url || lead.geo_city) && (
            <div className="space-y-3">
              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Marketing & Device</h5>
              
              {/* UTM Data */}
              {(lead.utm_source || lead.utm_medium || lead.utm_campaign) && (
                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                    <MousePointer className="h-3 w-3" /> Attribution
                  </div>
                  {lead.utm_source && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Source</span><span className="font-medium">{lead.utm_source}</span></div>}
                  {lead.utm_medium && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Medium</span><span className="font-medium">{lead.utm_medium}</span></div>}
                  {lead.utm_campaign && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Campaign</span><span className="font-medium">{lead.utm_campaign}</span></div>}
                  {lead.utm_term && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Term</span><span className="font-medium">{lead.utm_term}</span></div>}
                  {lead.utm_content && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Content</span><span className="font-medium">{lead.utm_content}</span></div>}
                  {lead.gclid && <div className="flex justify-between text-xs"><span className="text-muted-foreground">GCLID</span><span className="font-medium font-mono truncate max-w-[160px]">{lead.gclid}</span></div>}
                  {lead.ga_client_id && <div className="flex justify-between text-xs"><span className="text-muted-foreground">GA Client</span><span className="font-medium font-mono truncate max-w-[160px]">{lead.ga_client_id}</span></div>}
                </div>
              )}

              {/* Device Info */}
              {(lead.device_type || lead.screen_resolution || lead.browser_language) && (
                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                    <Monitor className="h-3 w-3" /> Device
                  </div>
                  {lead.device_type && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Type</span><Badge variant="outline" className="text-[10px] h-5 capitalize">{lead.device_type}</Badge></div>}
                  {lead.screen_resolution && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Screen</span><span className="font-medium">{lead.screen_resolution}</span></div>}
                  {lead.browser_language && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Language</span><span className="font-medium">{lead.browser_language}</span></div>}
                  {lead.referrer && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Referrer</span><span className="font-medium truncate max-w-[180px]">{lead.referrer}</span></div>}
                  {lead.landing_page_url && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Landing Page</span>
                      <a href={lead.landing_page_url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline inline-flex items-center gap-0.5 truncate max-w-[180px]">
                        {(() => { try { return new URL(lead.landing_page_url).pathname || "/"; } catch { return lead.landing_page_url; } })()}
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Geo Location */}
              {(lead.geo_city || lead.geo_region || lead.geo_country) && (
                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                    <MapPin className="h-3 w-3" /> Visitor Location
                  </div>
                  {lead.geo_city && <div className="flex justify-between text-xs"><span className="text-muted-foreground">City</span><span className="font-medium">{lead.geo_city}</span></div>}
                  {lead.geo_region && <div className="flex justify-between text-xs"><span className="text-muted-foreground">State</span><span className="font-medium">{lead.geo_region}</span></div>}
                  {lead.geo_country && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Country</span><span className="font-medium">{lead.geo_country}</span></div>}
                </div>
              )}

              {/* Consent State */}
              {lead.consent_ad_storage && (
                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                    <Shield className="h-3 w-3" /> Consent
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: 'Ad Storage', val: lead.consent_ad_storage },
                      { label: 'Analytics', val: lead.consent_analytics_storage },
                      { label: 'Ad Data', val: lead.consent_ad_user_data },
                      { label: 'Personalization', val: lead.consent_ad_personalization },
                    ].map(({ label, val }) => val && (
                      <div key={label} className="flex items-center gap-1 text-[10px]">
                        <span className={`h-1.5 w-1.5 rounded-full ${val === 'granted' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                        <span className="text-muted-foreground">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Quick Actions: Auto Follow-Up & E-Sign */}
          <DealQuickActions deal={deal} activities={activities} onActivityAdded={fetchActivities} />

          <Separator />

          {/* AI Assistant */}
          <DealAIAssistant deal={deal} activities={activities} />

          <Separator />

          {/* Email Composer */}
          <DealEmailComposer deal={deal} activities={activities} />

          <Separator />

          {/* Add Activity */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Add Activity</h5>
            <AddActivityForm dealId={deal.id} leadId={deal.lead_id} onAdded={fetchActivities} />
          </div>

          <Separator />

          {/* Activity Timeline */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Activity History</h5>
            <ActivityTimeline activities={activities} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
