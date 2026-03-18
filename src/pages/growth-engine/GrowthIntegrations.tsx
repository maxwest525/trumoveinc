import { useState, useEffect } from "react";
import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import { cn } from "@/lib/utils";
import {
  Check, X, RefreshCw, Settings,
  Plug, Clock, ChevronDown, ChevronUp, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface IntegrationDef {
  id: string;
  name: string;
  role: string;
  group: string;
  description: string;
  tag?: string;
}

interface ConnectionState {
  integration_id: string;
  connected: boolean;
  status: string;
  last_sync: string | null;
}

const INTEGRATION_GROUPS = [
  { id: "traffic", label: "Traffic Sources", desc: "Where paid leads come from" },
  { id: "routing", label: "Lead Routing & Follow-up", desc: "Get leads to agents fast" },
  { id: "research", label: "Research & Support", desc: "Competitive intel and data" },
  { id: "crm", label: "CRM / System of Record", desc: "Where lead data lives" },
];

const INTEGRATIONS: IntegrationDef[] = [
  { id: "google_ads", name: "Google Ads", role: "Primary traffic source", group: "traffic", description: "High-intent search campaigns for interstate moving leads. Keyword, campaign, and conversion data.", tag: "Primary" },
  { id: "meta_ads", name: "Meta Ads", role: "Primary traffic source", group: "traffic", description: "Facebook and Instagram ad performance, instant forms, retargeting, and creative metrics.", tag: "Primary" },
  { id: "convoso", name: "Convoso", role: "Dialer / queue / callback", group: "routing", description: "Instant-call engine. Leads route here via webhook for immediate dial attempts, callback handling, and queue management.", tag: "Essential" },
  { id: "webhooks", name: "Custom Webhooks", role: "Event routing", group: "routing", description: "Send or receive lead events via webhook endpoints. Powers the routing between forms, Convoso, and CRM.", tag: "Essential" },
  { id: "semrush", name: "SEMrush", role: "Keyword & competitor research", group: "research", description: "Keyword rankings, competitor ad spend, backlink analysis. Used for research, not as a traffic source.", tag: "Research" },
  { id: "firecrawl", name: "Firecrawl", role: "Page scraping & monitoring", group: "research", description: "Scrape competitor landing pages, monitor changes, extract page structures for analysis.", tag: "Research" },
  { id: "ga4", name: "Google Analytics (GA4)", role: "Site analytics", group: "research", description: "Website traffic, behavior flows, and conversion funnels." },
  { id: "gsc", name: "Search Console", role: "Organic search data", group: "research", description: "Organic impressions, clicks, CTR, and keyword positions." },
  { id: "ghl", name: "GoHighLevel (GHL)", role: "CRM / sequences / reporting", group: "crm", description: "Lead management, follow-up sequences, pipeline reporting. Can serve as primary CRM or backup sync.", tag: "Recommended" },
  { id: "granot", name: "Granot CRM", role: "System of record", group: "crm", description: "Moving-specific CRM. Sync lead records, move details, and disposition history.", tag: "Optional" },
  { id: "custom_crm", name: "Custom CRM / API", role: "Flexible integration", group: "crm", description: "Connect any CRM via REST API. Map fields and configure sync rules.", tag: "Flexible" },
];

const OPTIONAL_LATER: IntegrationDef[] = [
  { id: "dashclicks", name: "DashClicks", role: "White-label management", group: "routing", description: "Agency campaign management and fulfillment.", tag: "Optional" },
  { id: "zapier", name: "Zapier", role: "Automation glue", group: "routing", description: "Connect tools with automated workflows.", tag: "Optional" },
  { id: "make", name: "Make (Integromat)", role: "Advanced automation", group: "routing", description: "Multi-step automation builder.", tag: "Optional" },
];

function useIntegrationConnections() {
  return useQuery({
    queryKey: ["integration-connections"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [] as ConnectionState[];

      const { data, error } = await supabase
        .from("integration_connections")
        .select("integration_id, connected, status, last_sync");

      if (error) throw error;
      return (data ?? []) as ConnectionState[];
    },
  });
}

function useToggleConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ integrationId, connect }: { integrationId: string; connect: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (connect) {
        const { error } = await supabase
          .from("integration_connections")
          .upsert({
            user_id: user.id,
            integration_id: integrationId,
            connected: true,
            status: "healthy",
            last_sync: "Just now",
          }, { onConflict: "user_id,integration_id" });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("integration_connections")
          .update({ connected: false, status: "off", last_sync: null })
          .eq("integration_id", integrationId)
          .eq("user_id", user.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integration-connections"] });
    },
  });
}

function IntegrationCard({
  integration,
  connection,
  onConnect,
  onDisconnect,
  isLoading,
}: {
  integration: IntegrationDef;
  connection?: ConnectionState;
  onConnect: () => void;
  onDisconnect: () => void;
  isLoading: boolean;
}) {
  const connected = connection?.connected ?? false;

  return (
    <div className={cn(
      "bg-card rounded-xl border p-4 transition-all hover:shadow-md",
      connected ? "border-emerald-500/20" : "border-border"
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            connected ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
          )}>
            <Plug className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-foreground">{integration.name}</span>
              {integration.tag && (
                <span className={cn(
                  "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full",
                  integration.tag === "Primary" ? "bg-primary/10 text-primary" :
                  integration.tag === "Essential" ? "bg-emerald-500/10 text-emerald-600" :
                  integration.tag === "Research" ? "bg-violet-500/10 text-violet-600" :
                  integration.tag === "Recommended" ? "bg-blue-500/10 text-blue-600" :
                  "bg-muted text-muted-foreground"
                )}>{integration.tag}</span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">{integration.role}</span>
          </div>
        </div>
        {connected ? (
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
            <Check className="w-3 h-3" /> Connected
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <X className="w-3 h-3" /> Off
          </span>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground mb-3">{integration.description}</p>

      {connected && connection?.last_sync && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-2">
          <Clock className="w-3 h-3" />
          Sync: {connection.last_sync}
        </div>
      )}

      <div className="flex gap-2">
        {connected ? (
          <>
            <button
              onClick={() => toast.info(`Testing ${integration.name}...`)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Test
            </button>
            <button
              onClick={() => toast.info(`Configure ${integration.name}`)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              <Settings className="w-3 h-3" /> Configure
            </button>
            <button
              onClick={onDisconnect}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium text-red-600 hover:bg-red-500/10 transition-colors ml-auto"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={onConnect}
            disabled={isLoading}
            className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plug className="w-3 h-3" />}
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

export default function GrowthIntegrations() {
  const [showOptional, setShowOptional] = useState(false);
  const { data: connections = [], isLoading: loadingConnections } = useIntegrationConnections();
  const toggleMutation = useToggleConnection();

  const getConnection = (id: string) => connections.find(c => c.integration_id === id);
  const connectedCount = connections.filter(c => c.connected).length;

  const handleConnect = (id: string, name: string) => {
    toggleMutation.mutate(
      { integrationId: id, connect: true },
      { onSuccess: () => toast.success(`${name} connected`) }
    );
  };

  const handleDisconnect = (id: string, name: string) => {
    toggleMutation.mutate(
      { integrationId: id, connect: false },
      { onSuccess: () => toast.success(`${name} disconnected`) }
    );
  };

  return (
    <GrowthEngineShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Integrations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your tool stack. {connectedCount}/{INTEGRATIONS.length} connected.
          </p>
        </div>

        {INTEGRATION_GROUPS.map(group => {
          const items = INTEGRATIONS.filter(i => i.group === group.id);
          if (items.length === 0) return null;
          const groupConnected = items.filter(i => getConnection(i.id)?.connected).length;
          return (
            <div key={group.id}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sm font-semibold text-foreground">{group.label}</h2>
                <span className="text-[10px] text-muted-foreground">{group.desc}</span>
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground ml-auto">{groupConnected}/{items.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                {items.map(i => (
                  <IntegrationCard
                    key={i.id}
                    integration={i}
                    connection={getConnection(i.id)}
                    onConnect={() => handleConnect(i.id, i.name)}
                    onDisconnect={() => handleDisconnect(i.id, i.name)}
                    isLoading={toggleMutation.isPending && toggleMutation.variables?.integrationId === i.id}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Optional Later */}
        <div className="border border-border/50 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowOptional(!showOptional)}
            className="w-full flex items-center justify-between px-4 py-3 text-left bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-muted-foreground">Optional / Future</span>
              <span className="text-[10px] text-muted-foreground">{OPTIONAL_LATER.length} tools</span>
            </div>
            {showOptional ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {showOptional && (
            <div className="p-4 space-y-2">
              {OPTIONAL_LATER.map(i => (
                <div key={i.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Plug className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[11px] font-medium text-muted-foreground">{i.name}</span>
                    <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{i.role}</span>
                  </div>
                  <button
                    onClick={() => handleConnect(i.id, i.name)}
                    className="text-[10px] font-medium text-primary hover:underline"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </GrowthEngineShell>
  );
}
