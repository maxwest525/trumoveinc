import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import AgentShell from "@/components/layout/AgentShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, formatDistanceToNowStrict } from "date-fns";
import {
  Inbox, MapPin, Phone, Mail, Calendar, Globe, Smartphone,
  Monitor, MousePointer, Clock, RefreshCw, UserPlus, ChevronDown, ChevronUp,
  Tag, ExternalLink, Plus, Cookie, FileText, PhoneCall, Share2,
  GitBranch, Timer
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  const denied = value === "denied";
  return (
    <span className={cn("inline-block w-2 h-2 rounded-full", granted ? "bg-emerald-500" : denied ? "bg-red-400" : "bg-muted-foreground/20")} />
  );
}

function DeviceIcon({ type }: { type: string | null }) {
  if (type === "mobile") return <Smartphone className="w-3.5 h-3.5" />;
  return <Monitor className="w-3.5 h-3.5" />;
}

/** Shows N/A in muted style when value is missing */
function Val({ v, mono }: { v: string | null | undefined; mono?: boolean }) {
  if (!v) return <span className="text-muted-foreground/40 italic">N/A</span>;
  return <span className={cn("text-foreground", mono && "font-mono text-[10px]")}>{v}</span>;
}

/** Live elapsed timer that updates every second */
function ElapsedTimer({ since }: { since: string }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, []);
  const seconds = Math.floor((Date.now() - new Date(since).getTime()) / 1000);
  if (seconds < 60) return <>{seconds}s</>;
  if (seconds < 3600) return <>{Math.floor(seconds / 60)}m {seconds % 60}s</>;
  return <>{Math.floor(seconds / 3600)}h {Math.floor((seconds % 3600) / 60)}m</>;
}

/** Routing status badge */
function RoutingBadge({ lead }: { lead: IncomingLead }) {
  // Unassigned = waiting for routing
  return (
    <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
      <GitBranch className="w-2.5 h-2.5" />
      Unrouted
    </span>
  );
}

// ── Demo lead factory ─────────────────────────────────────────────
function randomName() {
  const names = ["Sarah Johnson","Mike Chen","Emily Davis","James Wilson","Lisa Martinez","David Kim","Rachel Brown","Tom Anderson","Ana Garcia","Chris Lee"];
  return names[Math.floor(Math.random() * names.length)].split(" ") as [string, string];
}
function randomCity() {
  const c = ["Miami","New York","Chicago","Dallas","Los Angeles","Atlanta","Denver","Seattle","Houston","Phoenix"];
  return c[Math.floor(Math.random() * c.length)];
}
function randomPhone() {
  return `(${Math.floor(Math.random()*900)+100}) ${Math.floor(Math.random()*900)+100}-${Math.floor(Math.random()*9000)+1000}`;
}
function futureDate(minDays = 7, maxDays = 37) {
  return new Date(Date.now() + (Math.floor(Math.random()*(maxDays-minDays))+minDays)*86400000).toISOString().split("T")[0];
}

const DEMO_LEAD_TYPES = [
  {
    key: "cookie",
    label: "Cookie Consent Visitor",
    icon: Cookie,
    description: "Consent banner interaction — no contact info, enrichment only",
    build: () => {
      const [fn, ln] = ["Website", "Visitor"];
      return {
        first_name: fn, last_name: ln,
        source: "website" as const,
        // NO email, phone, addresses, move_date — cookie visitors don't fill forms
        // Full enrichment data:
        utm_source: ["google","facebook","bing","direct"][Math.floor(Math.random()*4)],
        utm_medium: ["cpc","organic","social","referral"][Math.floor(Math.random()*4)],
        utm_campaign: ["spring_movers_2026","brand_awareness","retarget_q1"][Math.floor(Math.random()*3)],
        utm_term: ["long distance movers","moving company near me","interstate moving"][Math.floor(Math.random()*3)],
        utm_content: ["hero_cta","sidebar_banner",null][Math.floor(Math.random()*3)],
        gclid: Math.random() > 0.5 ? `CL-${Math.random().toString(36).slice(2,14)}` : null,
        ga_client_id: `${Math.floor(Math.random()*9e8)+1e8}.${Math.floor(Date.now()/1000)}`,
        consent_ad_storage: "granted",
        consent_analytics_storage: "granted",
        consent_ad_user_data: Math.random() > 0.3 ? "granted" : "denied",
        consent_ad_personalization: Math.random() > 0.5 ? "granted" : "denied",
        landing_page_url: `https://trumoveinc.com/${["","long-distance-moving","get-quote","faq"][Math.floor(Math.random()*4)]}`,
        referrer: ["https://google.com/","https://facebook.com/","","https://yelp.com/"][Math.floor(Math.random()*4)],
        user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605 Mobile/15E148",
        screen_resolution: ["390x844","414x896","1920x1080","1440x900"][Math.floor(Math.random()*4)],
        browser_language: "en-US",
        device_type: Math.random() > 0.4 ? "mobile" : "desktop",
        geo_city: randomCity(),
        geo_region: "FL",
        geo_country: "US",
        enrichment_timestamp: new Date().toISOString(),
      };
    },
  },
  {
    key: "short_form",
    label: "Short Quote Form",
    icon: FileText,
    description: "Name, email, phone, origin, destination, move date + enrichment",
    build: () => {
      const [fn, ln] = randomName();
      return {
        first_name: fn, last_name: ln,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@gmail.com`,
        phone: randomPhone(),
        source: "website" as const,
        origin_address: `${Math.floor(Math.random()*9000)+1000} Oak St, ${randomCity()}, FL 33101`,
        destination_address: `${Math.floor(Math.random()*9000)+1000} Pine Ave, ${randomCity()}, CA 90210`,
        move_date: futureDate(),
        // Enrichment
        utm_source: ["google","facebook","bing"][Math.floor(Math.random()*3)],
        utm_medium: "cpc",
        utm_campaign: "quote_funnel_v2",
        gclid: Math.random() > 0.4 ? `CL-${Math.random().toString(36).slice(2,14)}` : null,
        ga_client_id: `${Math.floor(Math.random()*9e8)+1e8}.${Math.floor(Date.now()/1000)}`,
        consent_ad_storage: "granted",
        consent_analytics_storage: "granted",
        consent_ad_user_data: "granted",
        consent_ad_personalization: "granted",
        landing_page_url: "https://trumoveinc.com/get-quote",
        referrer: "https://google.com/",
        user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0",
        screen_resolution: "1920x1080",
        browser_language: "en-US",
        device_type: Math.random() > 0.5 ? "mobile" : "desktop",
        geo_city: randomCity(),
        geo_region: "FL",
        geo_country: "US",
        enrichment_timestamp: new Date().toISOString(),
      };
    },
  },
  {
    key: "ppc",
    label: "PPC / Google Ads",
    icon: MousePointer,
    description: "Paid click — GCLID, UTMs, consent, device, geo, contact info",
    build: () => {
      const [fn, ln] = randomName();
      return {
        first_name: fn, last_name: ln,
        email: `${fn.toLowerCase()}@yahoo.com`,
        phone: randomPhone(),
        source: "ppc" as const,
        origin_address: `${Math.floor(Math.random()*9000)+1000} Main St, ${randomCity()}, TX 75001`,
        destination_address: `${Math.floor(Math.random()*9000)+1000} Elm Blvd, ${randomCity()}, NY 10001`,
        move_date: futureDate(),
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "long_distance_movers_exact",
        utm_term: "long distance moving company",
        utm_content: "headline_v3",
        gclid: `CL-${Math.random().toString(36).slice(2,18)}`,
        ga_client_id: `${Math.floor(Math.random()*9e8)+1e8}.${Math.floor(Date.now()/1000)}`,
        consent_ad_storage: "granted",
        consent_analytics_storage: "granted",
        consent_ad_user_data: "granted",
        consent_ad_personalization: "granted",
        landing_page_url: "https://trumoveinc.com/get-quote?utm_source=google&utm_medium=cpc",
        referrer: "https://google.com/",
        user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/125.0",
        screen_resolution: "1440x900",
        browser_language: "en-US",
        device_type: "desktop",
        geo_city: randomCity(),
        geo_region: "TX",
        geo_country: "US",
        enrichment_timestamp: new Date().toISOString(),
      };
    },
  },
  {
    key: "phone",
    label: "Phone Call",
    icon: PhoneCall,
    description: "Manual entry — name, phone, addresses only. No digital enrichment",
    build: () => {
      const [fn, ln] = randomName();
      return {
        first_name: fn, last_name: ln,
        phone: randomPhone(),
        source: "phone" as const,
        origin_address: `${Math.floor(Math.random()*9000)+1000} Maple Dr, ${randomCity()}, GA 30301`,
        destination_address: `${Math.floor(Math.random()*9000)+1000} Cedar Ln, ${randomCity()}, IL 60601`,
        move_date: futureDate(),
        // NO enrichment — phone calls don't have browser data
      };
    },
  },
  {
    key: "referral",
    label: "Referral",
    icon: Share2,
    description: "Referred lead — contact info, referrer URL, no paid UTMs or GCLID",
    build: () => {
      const [fn, ln] = randomName();
      return {
        first_name: fn, last_name: ln,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@outlook.com`,
        phone: randomPhone(),
        source: "referral" as const,
        origin_address: `${Math.floor(Math.random()*9000)+1000} Birch Way, ${randomCity()}, CO 80201`,
        destination_address: `${Math.floor(Math.random()*9000)+1000} Spruce St, ${randomCity()}, WA 98101`,
        move_date: futureDate(),
        // Partial enrichment — organic, no paid markers
        utm_source: "referral",
        utm_medium: "partner",
        utm_campaign: "yelp_reviews",
        referrer: ["https://yelp.com/biz/trumove","https://bbb.org/trumove","https://movingreviews.com"][Math.floor(Math.random()*3)],
        landing_page_url: "https://trumoveinc.com/",
        ga_client_id: `${Math.floor(Math.random()*9e8)+1e8}.${Math.floor(Date.now()/1000)}`,
        consent_ad_storage: "denied",
        consent_analytics_storage: "granted",
        consent_ad_user_data: "denied",
        consent_ad_personalization: "denied",
        user_agent: "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/125.0 Mobile",
        screen_resolution: "412x915",
        browser_language: "en-US",
        device_type: "mobile",
        geo_city: randomCity(),
        geo_region: "CO",
        geo_country: "US",
        enrichment_timestamp: new Date().toISOString(),
      };
    },
  },
];

function DemoLeadDropdown({ onCreated }: { onCreated: () => void }) {
  const handleCreate = async (type: typeof DEMO_LEAD_TYPES[number]) => {
    const leadData = type.build();
    const { error } = await supabase.from("leads").insert(leadData);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: `Demo lead created`, description: `Source: ${type.label}` }); onCreated(); }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/5">
          <Plus className="w-3.5 h-3.5" />
          Demo Lead
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Choose lead source type</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {DEMO_LEAD_TYPES.map((type) => (
          <DropdownMenuItem
            key={type.key}
            onClick={() => handleCreate(type)}
            className="flex flex-col items-start gap-0.5 py-2.5 cursor-pointer"
          >
            <span className="flex items-center gap-2 font-medium text-sm">
              <type.icon className="w-3.5 h-3.5 text-primary" />
              {type.label}
            </span>
            <span className="text-[11px] text-muted-foreground leading-tight pl-[22px]">
              {type.description}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
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
          <div className="flex items-center gap-2">
            <DemoLeadDropdown onCreated={refetch} />
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
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

              return (
                <div
                  key={lead.id}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors"
                >
                  {/* Main row */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Name + badges */}
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
                        <RoutingBadge lead={lead} />
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
                        {lead.geo_city && lead.geo_region && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {lead.geo_city}, {lead.geo_region}
                          </span>
                        )}
                      </div>

                      {/* Contact + route */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {lead.phone || <span className="text-muted-foreground/40 italic">N/A</span>}
                        </span>
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <Mail className="w-3 h-3" /> {lead.email || <span className="text-muted-foreground/40 italic">N/A</span>}
                        </span>
                        <span className="flex items-center gap-1 truncate max-w-[300px]">
                          <MapPin className="w-3 h-3" />
                          {lead.origin_address || "N/A"} → {lead.destination_address || "N/A"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {lead.move_date ? format(new Date(lead.move_date), "MMM d, yyyy") : <span className="text-muted-foreground/40 italic">N/A</span>}
                        </span>
                      </div>
                    </div>

                    {/* Timer + actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Live timer */}
                      <span className="text-[10px] font-mono text-amber-600 bg-amber-500/10 px-2 py-1 rounded-md flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        <ElapsedTimer since={lead.created_at} />
                      </span>

                      <button
                        onClick={() => toggleExpand(lead.id)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                        title="View all data"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

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

                  {/* Expanded enrichment panel — always shows ALL fields */}
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/30 px-4 py-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                        {/* Contact Info */}
                        <div>
                          <p className="font-medium text-foreground mb-1.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-primary" /> Contact Info
                          </p>
                          <div className="space-y-1 text-muted-foreground">
                            <p>First Name: <Val v={lead.first_name} /></p>
                            <p>Last Name: <Val v={lead.last_name} /></p>
                            <p>Email: <Val v={lead.email} /></p>
                            <p>Phone: <Val v={lead.phone} /></p>
                          </div>
                        </div>

                        {/* Move Details */}
                        <div>
                          <p className="font-medium text-foreground mb-1.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-primary" /> Move Details
                          </p>
                          <div className="space-y-1 text-muted-foreground">
                            <p>Origin: <Val v={lead.origin_address} /></p>
                            <p>Destination: <Val v={lead.destination_address} /></p>
                            <p>Move Date: <Val v={lead.move_date ? format(new Date(lead.move_date), "MMM d, yyyy") : null} /></p>
                            <p>Est. Weight: {lead.estimated_weight ? <span className="text-foreground">{lead.estimated_weight.toLocaleString()} lbs</span> : <Val v={null} />}</p>
                            <p>Est. Value: {lead.estimated_value ? <span className="text-foreground">${lead.estimated_value.toLocaleString()}</span> : <Val v={null} />}</p>
                          </div>
                        </div>

                        {/* Attribution */}
                        <div>
                          <p className="font-medium text-foreground mb-1.5 flex items-center gap-1">
                            <Tag className="w-3 h-3 text-primary" /> Attribution
                          </p>
                          <div className="space-y-1 text-muted-foreground">
                            <p>Source: <Val v={lead.utm_source} /></p>
                            <p>Medium: <Val v={lead.utm_medium} /></p>
                            <p>Campaign: <Val v={lead.utm_campaign} /></p>
                            <p>Term: <Val v={lead.utm_term} /></p>
                            <p>Content: <Val v={lead.utm_content} /></p>
                            <p>GCLID: <Val v={lead.gclid ? lead.gclid.slice(0, 20) + "…" : null} mono /></p>
                            <p>GA Client ID: <Val v={lead.ga_client_id} mono /></p>
                            <p>Referrer: <Val v={lead.referrer || null} /></p>
                          </div>
                        </div>

                        {/* Location & Page */}
                        <div>
                          <p className="font-medium text-foreground mb-1.5 flex items-center gap-1">
                            <Globe className="w-3 h-3 text-primary" /> Geo & Page
                          </p>
                          <div className="space-y-1 text-muted-foreground">
                            <p>City: <Val v={lead.geo_city} /></p>
                            <p>Region: <Val v={lead.geo_region} /></p>
                            <p>Country: <Val v={lead.geo_country} /></p>
                            <p className="truncate">Landing Page: {lead.landing_page_url ? (
                              <a href={lead.landing_page_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                                {(() => { try { return new URL(lead.landing_page_url).pathname || "/"; } catch { return lead.landing_page_url; }})()}
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : <Val v={null} />}</p>
                          </div>
                        </div>

                        {/* Device */}
                        <div>
                          <p className="font-medium text-foreground mb-1.5 flex items-center gap-1">
                            <Monitor className="w-3 h-3 text-primary" /> Device
                          </p>
                          <div className="space-y-1 text-muted-foreground">
                            <p>Type: <Val v={lead.device_type} /></p>
                            <p>Screen: <Val v={lead.screen_resolution} /></p>
                            <p>Language: <Val v={lead.browser_language} /></p>
                            <p className="truncate" title={lead.user_agent || ""}>UA: <Val v={lead.user_agent ? lead.user_agent.slice(0, 50) + "…" : null} mono /></p>
                          </div>
                        </div>

                        {/* Consent */}
                        <div>
                          <p className="font-medium text-foreground mb-1.5 flex items-center gap-1">
                            <MousePointer className="w-3 h-3 text-primary" /> Consent
                          </p>
                          <div className="space-y-1 text-muted-foreground">
                            <p className="flex items-center gap-1.5">
                              <ConsentDot value={lead.consent_ad_storage} /> Ad Storage: <Val v={lead.consent_ad_storage} />
                            </p>
                            <p className="flex items-center gap-1.5">
                              <ConsentDot value={lead.consent_analytics_storage} /> Analytics: <Val v={lead.consent_analytics_storage} />
                            </p>
                            <p className="flex items-center gap-1.5">
                              <ConsentDot value={lead.consent_ad_user_data} /> Ad Data: <Val v={lead.consent_ad_user_data} />
                            </p>
                            <p className="flex items-center gap-1.5">
                              <ConsentDot value={lead.consent_ad_personalization} /> Personalization: <Val v={lead.consent_ad_personalization} />
                            </p>
                          </div>
                        </div>

                        {/* Routing & Meta */}
                        <div>
                          <p className="font-medium text-foreground mb-1.5 flex items-center gap-1">
                            <GitBranch className="w-3 h-3 text-primary" /> Routing
                          </p>
                          <div className="space-y-1 text-muted-foreground">
                            <p>Status: <span className="text-amber-600 font-medium">Unrouted</span></p>
                            <p>Assigned To: <Val v={null} /></p>
                            <p>Lead Source: <Val v={lead.source} /></p>
                            <p>Created: <span className="text-foreground">{format(new Date(lead.created_at), "MMM d, yyyy h:mm a")}</span></p>
                            <p>Elapsed: <span className="text-amber-600 font-mono"><ElapsedTimer since={lead.created_at} /></span></p>
                          </div>
                        </div>

                        {/* Lead ID & System */}
                        <div>
                          <p className="font-medium text-foreground mb-1.5 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-primary" /> System
                          </p>
                          <div className="space-y-1 text-muted-foreground">
                            <p>Lead ID: <span className="text-foreground font-mono text-[10px]">{lead.id.slice(0, 8)}…</span></p>
                            <p>Status: <span className="text-foreground capitalize">{lead.status}</span></p>
                            <p>Tags: {lead.tags?.length ? <span className="text-foreground">{(lead.tags as string[]).join(", ")}</span> : <Val v={null} />}</p>
                          </div>
                        </div>
                      </div>
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
