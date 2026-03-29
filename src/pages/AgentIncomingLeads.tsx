import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AgentShell from "@/components/layout/AgentShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Inbox, MapPin, Phone, Mail, Calendar, Globe, Smartphone,
  Monitor, MousePointer, Clock, RefreshCw, UserPlus, ChevronDown, ChevronUp,
  Tag, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface IncomingLead {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  origin_address: string | null;
  destination_address: string | null;
  move_date: string | null;
  source: string;
  status: string;
  created_at: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  ga_client_id: string | null;
  referrer: string | null;
  user_agent: string | null;
  screen_resolution: string | null;
  browser_language: string | null;
  device_type: string | null;
  consent_ad_storage: string | null;
  consent_analytics_storage: string | null;
  consent_ad_user_data: string | null;
  consent_ad_personalization: string | null;
  estimated_weight: number | null;
  estimated_value: number | null;
  landing_page_url: string | null;
  geo_city: string | null;
  geo_region: string | null;
  geo_country: string | null;
}

const SOURCE_COLORS: Record<string, string> = {
  website: "bg-primary/10 text-primary",
  phone: "bg-emerald-500/10 text-emerald-600",
  referral: "bg-amber-500/10 text-amber-600",
  social: "bg-violet-500/10 text-violet-600",
  ppc: "bg-rose-500/10 text-rose-600",
  walk_in: "bg-sky-500/10 text-sky-600",
  other: "bg-muted text-muted-foreground",
};

function ConsentDot({ value }: { value: string | null }) {
  const granted = value === "granted";
  return (
    <span className={cn("inline-block w-2 h-2 rounded-full", granted ? "bg-emerald-500" : "bg-red-400")} />
  );
}

function DeviceIcon({ type }: { type: string | null }) {
  if (type === "mobile") return <Smartphone className="w-3.5 h-3.5" />;
  return <Monitor className="w-3.5 h-3.5" />;
}

export default function AgentIncomingLeads() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const { data: leads = [], isLoading, refetch } = useQuery({
    queryKey: ["incoming-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .is("assigned_agent_id", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as IncomingLead[];
    },
    refetchInterval: 15000,
  });

  // Realtime subscription for new unassigned leads
  useEffect(() => {
    const channel = supabase
      .channel("incoming-leads-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leads" }, (payload) => {
        if (!payload.new.assigned_agent_id) {
          refetch();
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "leads" }, () => {
        refetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  const handleClaim = async (leadId: string) => {
    setClaimingId(leadId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const { error } = await supabase
        .from("leads")
        .update({ assigned_agent_id: user.id, status: "contacted" })
        .eq("id", leadId);

      if (error) throw error;
      toast({ title: "Lead claimed", description: "This lead is now assigned to you." });
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setClaimingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <AgentShell breadcrumb=" / Incoming Leads">
      <div className="p-3 sm:p-6 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <Inbox className="w-5 h-5 text-primary" />
              Incoming Leads
              {leads.length > 0 && (
                <span className="ml-2 text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {leads.length}
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Unassigned leads from website, ads, and external sources
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <RefreshCw className="w-8 h-8 text-muted-foreground/30 mb-3 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading leads…</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && leads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Inbox className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <p className="text-sm font-medium text-muted-foreground">No incoming leads</p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">
              When customers submit quotes or leads arrive from external sources, they'll appear here in real time.
            </p>
          </div>
        )}

        {/* Lead cards */}
        {!isLoading && leads.length > 0 && (
          <div className="space-y-3">
            {leads.map((lead) => {
              const isExpanded = expandedId === lead.id;
              const hasEnrichment = lead.utm_source || lead.gclid || lead.ga_client_id || lead.device_type || lead.referrer || lead.landing_page_url || lead.geo_city;
              const hasConsent = lead.consent_ad_storage || lead.consent_analytics_storage;

              return (
                <div
                  key={lead.id}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors"
                >
                  {/* Main row */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Name + source */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground text-sm truncate">
                          {lead.first_name} {lead.last_name}
                        </h3>
                        <span className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded-full uppercase tracking-wide",
                          SOURCE_COLORS[lead.source] || SOURCE_COLORS.other
                        )}>
                          {lead.source}
                        </span>
                        {lead.utm_source && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-600 flex items-center gap-0.5">
                            <Globe className="w-2.5 h-2.5" />
                            {lead.utm_source}{lead.utm_medium ? ` / ${lead.utm_medium}` : ""}
                          </span>
                        )}
                        {lead.gclid && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
                            Google Ads
                          </span>
                        )}
                        {lead.device_type && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <DeviceIcon type={lead.device_type} />
                            {lead.device_type}
                          </span>
                        )}
                      </div>

                      {/* Contact + route */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {lead.phone}
                          </span>
                        )}
                        {lead.email && (
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <Mail className="w-3 h-3" /> {lead.email}
                          </span>
                        )}
                        {(lead.origin_address || lead.destination_address) && (
                          <span className="flex items-center gap-1 truncate max-w-[300px]">
                            <MapPin className="w-3 h-3" />
                            {lead.origin_address || "?"} → {lead.destination_address || "?"}
                          </span>
                        )}
                        {lead.move_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(lead.move_date), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Time + actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(lead.created_at), "MMM d, h:mm a")}
                      </span>

                      {hasEnrichment && (
                        <button
                          onClick={() => toggleExpand(lead.id)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                          title="View enrichment data"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}

                      <button
                        onClick={() => handleClaim(lead.id)}
                        disabled={claimingId === lead.id}
                        className="flex items-center gap-1.5 text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        {claimingId === lead.id ? "Claiming…" : "Claim"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded enrichment panel */}
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/30 px-4 py-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                        {/* Attribution */}
                        <div>
                          <p className="font-medium text-foreground mb-1.5 flex items-center gap-1">
                            <Tag className="w-3 h-3 text-primary" /> Attribution
                          </p>
                          <div className="space-y-1 text-muted-foreground">
                            {lead.utm_source && <p>Source: <span className="text-foreground">{lead.utm_source}</span></p>}
                            {lead.utm_medium && <p>Medium: <span className="text-foreground">{lead.utm_medium}</span></p>}
                            {lead.utm_campaign && <p>Campaign: <span className="text-foreground">{lead.utm_campaign}</span></p>}
                            {lead.utm_term && <p>Term: <span className="text-foreground">{lead.utm_term}</span></p>}
                            {lead.utm_content && <p>Content: <span className="text-foreground">{lead.utm_content}</span></p>}
                            {lead.gclid && <p>GCLID: <span className="text-foreground font-mono text-[10px]">{lead.gclid.slice(0, 20)}…</span></p>}
                            {lead.ga_client_id && <p>GA ID: <span className="text-foreground font-mono text-[10px]">{lead.ga_client_id}</span></p>}
                            {lead.referrer && <p>Referrer: <span className="text-foreground truncate inline-block max-w-[180px] align-bottom">{lead.referrer}</span></p>}
                            {!lead.utm_source && !lead.gclid && !lead.ga_client_id && !lead.referrer && (
                              <p className="text-muted-foreground/50 italic">No attribution data</p>
                            )}
                          </div>
                        </div>

                        {/* Location & Page */}
                        <div>
                          <p className="font-medium text-foreground mb-1.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-primary" /> Location & Page
                          </p>
                          <div className="space-y-1 text-muted-foreground">
                            {(lead.geo_city || lead.geo_region || lead.geo_country) ? (
                              <p>
                                <span className="text-foreground">
                                  {[lead.geo_city, lead.geo_region, lead.geo_country].filter(Boolean).join(", ")}
                                </span>
                              </p>
                            ) : (
                              <p className="text-muted-foreground/50 italic">No geo data</p>
                            )}
                            {lead.landing_page_url ? (
                              <p className="truncate" title={lead.landing_page_url}>
                                Page: <a href={lead.landing_page_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                                  {new URL(lead.landing_page_url).pathname || "/"} <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </p>
                            ) : (
                              <p className="text-muted-foreground/50 italic">No landing page</p>
                            )}
                          </div>
                        </div>

                        {/* Device */}
                        <div>
                          <p className="font-medium text-foreground mb-1.5 flex items-center gap-1">
                            <Monitor className="w-3 h-3 text-primary" /> Device
                          </p>
                          <div className="space-y-1 text-muted-foreground">
                            {lead.device_type && <p>Type: <span className="text-foreground capitalize">{lead.device_type}</span></p>}
                            {lead.screen_resolution && <p>Screen: <span className="text-foreground">{lead.screen_resolution}</span></p>}
                            {lead.browser_language && <p>Language: <span className="text-foreground">{lead.browser_language}</span></p>}
                            {lead.user_agent && (
                              <p className="truncate" title={lead.user_agent}>
                                UA: <span className="text-foreground font-mono text-[10px]">{lead.user_agent.slice(0, 50)}…</span>
                              </p>
                            )}
                            {!lead.device_type && !lead.screen_resolution && (
                              <p className="text-muted-foreground/50 italic">No device data</p>
                            )}
                          </div>
                        </div>

                        {/* Consent */}
                        <div>
                          <p className="font-medium text-foreground mb-1.5 flex items-center gap-1">
                            <MousePointer className="w-3 h-3 text-primary" /> Consent
                          </p>
                          {hasConsent ? (
                            <div className="space-y-1 text-muted-foreground">
                              <p className="flex items-center gap-1.5">
                                <ConsentDot value={lead.consent_ad_storage} /> Ad Storage
                              </p>
                              <p className="flex items-center gap-1.5">
                                <ConsentDot value={lead.consent_analytics_storage} /> Analytics
                              </p>
                              <p className="flex items-center gap-1.5">
                                <ConsentDot value={lead.consent_ad_user_data} /> Ad Data
                              </p>
                              <p className="flex items-center gap-1.5">
                                <ConsentDot value={lead.consent_ad_personalization} /> Personalization
                              </p>
                            </div>
                          ) : (
                            <p className="text-muted-foreground/50 italic">No consent data</p>
                          )}
                        </div>
                      </div>

                      {/* Estimate info if available */}
                      {(lead.estimated_weight || lead.estimated_value) && (
                        <div className="mt-3 pt-3 border-t border-border/50 flex gap-4 text-xs text-muted-foreground">
                          {lead.estimated_weight && (
                            <p>Est. Weight: <span className="text-foreground font-medium">{lead.estimated_weight.toLocaleString()} lbs</span></p>
                          )}
                          {lead.estimated_value && (
                            <p>Est. Value: <span className="text-foreground font-medium">${lead.estimated_value.toLocaleString()}</span></p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AgentShell>
  );
}
