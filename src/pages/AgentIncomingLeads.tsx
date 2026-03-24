import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AgentShell from "@/components/layout/AgentShell";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  UserPlus, Phone, MapPin, Calendar, Inbox, Loader2, RefreshCw, Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";

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
}

const SOURCE_COLORS: Record<string, string> = {
  website: "bg-primary/10 text-primary",
  phone: "bg-emerald-500/10 text-emerald-600",
  referral: "bg-amber-500/10 text-amber-600",
  social: "bg-violet-500/10 text-violet-600",
  ppc: "bg-rose-500/10 text-rose-600",
};

export default function AgentIncomingLeads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<IncomingLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("leads")
      .select("id, first_name, last_name, phone, email, origin_address, destination_address, move_date, source, status, created_at")
      .is("assigned_agent_id", null)
      .in("status", ["new", "contacted"])
      .order("created_at", { ascending: false })
      .limit(50);
    setLeads((data as IncomingLead[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  // Realtime: new unassigned leads
  useEffect(() => {
    const channel = supabase
      .channel("incoming-leads-page")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leads" }, (payload) => {
        const newLead = payload.new as IncomingLead & { assigned_agent_id: string | null };
        if (!newLead.assigned_agent_id) {
          setLeads((prev) => [newLead as IncomingLead, ...prev].slice(0, 50));
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "leads" }, (payload) => {
        const updated = payload.new as IncomingLead & { assigned_agent_id: string | null };
        if (updated.assigned_agent_id) {
          setLeads((prev) => prev.filter((l) => l.id !== updated.id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const claimLead = async (leadId: string) => {
    setClaiming(leadId);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setClaiming(null); return; }

    await supabase
      .from("leads")
      .update({ assigned_agent_id: session.user.id, status: "contacted" })
      .eq("id", leadId);

    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    setClaiming(null);
    navigate(`/agent/customers/${leadId}`);
  };

  return (
    <AgentShell breadcrumb=" / Incoming Leads">
      <div className="p-3 sm:p-6 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <Inbox className="w-5 h-5 text-primary" />
              Incoming Leads
              {leads.length > 0 && (
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                  {leads.length}
                </Badge>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Unclaimed leads waiting to be assigned</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading} className="gap-1.5">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Inbox className="w-10 h-10 text-muted-foreground/20 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No unclaimed leads</p>
            <p className="text-xs text-muted-foreground/60 mt-1">New leads will appear here in real time</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {lead.first_name} {lead.last_name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn("text-[9px] px-1.5 py-0.5 uppercase tracking-wider shrink-0 border-0",
                      SOURCE_COLORS[lead.source] || "bg-muted text-muted-foreground"
                    )}
                  >
                    {lead.source}
                  </Badge>
                </div>

                <div className="space-y-1.5 mb-3">
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{lead.phone}</span>
                    </div>
                  )}
                  {lead.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                  )}
                  {lead.origin_address && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                      <span className="truncate">{lead.origin_address}</span>
                    </div>
                  )}
                  {lead.destination_address && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                      <span className="truncate">{lead.destination_address}</span>
                    </div>
                  )}
                  {lead.move_date && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>{format(new Date(lead.move_date), "MMM d, yyyy")}</span>
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  className="w-full gap-1.5"
                  onClick={() => claimLead(lead.id)}
                  disabled={claiming === lead.id}
                >
                  {claiming === lead.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                  )}
                  Claim Lead
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AgentShell>
  );
}
