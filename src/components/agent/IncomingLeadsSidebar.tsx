import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  UserPlus, Phone, MapPin, Calendar, ChevronRight, Inbox, Loader2, RefreshCw, X,
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

interface IncomingLeadsSidebarProps {
  open: boolean;
  onClose: () => void;
}

const SOURCE_COLORS: Record<string, string> = {
  website: "bg-primary/10 text-primary",
  phone: "bg-chart-2/10 text-chart-2",
  referral: "bg-chart-3/10 text-chart-3",
  social: "bg-chart-4/10 text-chart-4",
  ppc: "bg-chart-5/10 text-chart-5",
};

export default function IncomingLeadsSidebar({ open, onClose }: IncomingLeadsSidebarProps) {
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
      .limit(30);
    setLeads((data as IncomingLead[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchLeads();
  }, [open]);

  // Realtime subscription for new unassigned leads
  useEffect(() => {
    if (!open) return;
    const channel = supabase
      .channel("incoming-leads")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leads" }, (payload) => {
        const newLead = payload.new as IncomingLead;
        if (!newLead.assigned_agent_id) {
          setLeads((prev) => [newLead, ...prev].slice(0, 30));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [open]);

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

  if (!open) return null;

  return (
    <aside className="w-72 xl:w-80 shrink-0 border-l border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Inbox className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Incoming Leads</h2>
          {leads.length > 0 && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-primary/10 text-primary border-0">
              {leads.length}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={fetchLeads}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-muted-foreground", loading && "animate-spin")} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Lead list */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Inbox className="w-8 h-8 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No unclaimed leads</p>
            <p className="text-xs text-muted-foreground/60 mt-1">New leads will appear here in real time</p>
          </div>
        ) : (
          <div className="p-2 space-y-1.5">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-lg border border-border bg-background p-3 hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {lead.first_name} {lead.last_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
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

                <div className="space-y-1 mb-2.5">
                  {lead.phone && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Phone className="w-3 h-3 shrink-0" />
                      <span className="truncate">{lead.phone}</span>
                    </div>
                  )}
                  {lead.origin_address && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{lead.origin_address}</span>
                    </div>
                  )}
                  {lead.move_date && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span>{format(new Date(lead.move_date), "MMM d, yyyy")}</span>
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  className="w-full h-7 text-xs gap-1.5"
                  onClick={() => claimLead(lead.id)}
                  disabled={claiming === lead.id}
                >
                  {claiming === lead.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <UserPlus className="w-3 h-3" />
                  )}
                  Claim Lead
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
