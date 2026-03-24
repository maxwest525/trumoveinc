import AgentShell from "@/components/layout/AgentShell";
import { Inbox } from "lucide-react";

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
  return (
    <AgentShell breadcrumb=" / Incoming Leads">
      <div className="p-3 sm:p-6 max-w-[1200px] mx-auto">
        <div className="mb-4">
          <h1 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <Inbox className="w-5 h-5 text-primary" />
            Incoming Leads
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Leads from external sources will appear here automatically</p>
        </div>

        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Inbox className="w-12 h-12 text-muted-foreground/20 mb-4" />
          <p className="text-sm font-medium text-muted-foreground">No incoming leads yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">Once triggers are configured, new leads will appear here in real time</p>
        </div>
      </div>
    </AgentShell>
  );
}
