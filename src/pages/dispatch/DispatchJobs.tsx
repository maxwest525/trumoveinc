import DispatchShell from "@/components/layout/DispatchShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ClipboardList, ArrowRight, Clock, MapPin, Truck,
  Search, Plus, DollarSign, Weight, Calendar,
  Phone, User, Package, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type JobStatus = "pending" | "assigned" | "in_transit" | "delivered" | "cancelled";

interface Job {
  id: string;
  customer: string;
  phone: string;
  origin: string;
  destination: string;
  moveDate: string;
  status: JobStatus;
  weight: string;
  value: string;
  driver?: string;
  vehicle?: string;
  createdAt: string;
}

const JOBS: Job[] = [
  { id: "J-4824", customer: "Robert Johnson", phone: "(469) 555-0122", origin: "Plano, TX", destination: "Lubbock, TX", moveDate: "Apr 5", status: "pending", weight: "7,500 lbs", value: "$4,200", createdAt: "2h ago" },
  { id: "J-4823", customer: "Emily Chen", phone: "(817) 555-0198", origin: "Fort Worth, TX", destination: "El Paso, TX", moveDate: "Apr 4", status: "pending", weight: "3,100 lbs", value: "$2,800", createdAt: "5h ago" },
  { id: "J-4822", customer: "James Rivera", phone: "(713) 555-0231", origin: "Houston, TX", destination: "San Antonio, TX", moveDate: "Apr 3", status: "assigned", weight: "6,800 lbs", value: "$3,600", driver: "David Washington", vehicle: "TRK-04", createdAt: "Yesterday" },
  { id: "J-4821", customer: "Sarah Mitchell", phone: "(214) 555-0142", origin: "Dallas, TX", destination: "Austin, TX", moveDate: "Apr 3", status: "assigned", weight: "4,200 lbs", value: "$2,400", driver: "Maria Santos", vehicle: "TRK-06", createdAt: "Yesterday" },
  { id: "J-4820", customer: "Kevin Thompson", phone: "(214) 555-0177", origin: "Dallas, TX", destination: "Dallas, TX (local)", moveDate: "Today", status: "in_transit", weight: "2,800 lbs", value: "$1,200", driver: "Chris Park", vehicle: "TRK-05", createdAt: "2 days ago" },
  { id: "J-4819", customer: "Amanda White", phone: "(214) 555-0265", origin: "Dallas, TX", destination: "Austin, TX", moveDate: "Today", status: "in_transit", weight: "4,200 lbs", value: "$2,600", driver: "Mike Torres", vehicle: "TRK-01", createdAt: "2 days ago" },
  { id: "J-4817", customer: "Carlos Mendez", phone: "(832) 555-0309", origin: "Houston, TX", destination: "San Antonio, TX", moveDate: "Today", status: "delivered", weight: "6,800 lbs", value: "$3,800", driver: "Ana Gomez", vehicle: "TRK-03", createdAt: "3 days ago" },
  { id: "J-4815", customer: "Jennifer Adams", phone: "(214) 555-0344", origin: "Dallas, TX", destination: "Houston, TX", moveDate: "Yesterday", status: "delivered", weight: "5,400 lbs", value: "$3,200", driver: "David Washington", vehicle: "TRK-02", createdAt: "4 days ago" },
];

const statusConfig: Record<JobStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "secondary" },
  assigned: { label: "Assigned", variant: "outline" },
  in_transit: { label: "In Transit", variant: "default" },
  delivered: { label: "Delivered", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

export default function DispatchJobs() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<JobStatus | "all">("all");

  const filtered = JOBS.filter((j) => {
    if (filter !== "all" && j.status !== filter) return false;
    if (search && !`${j.id} ${j.customer} ${j.origin} ${j.destination}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts: Record<string, number> = { all: JOBS.length };
  JOBS.forEach((j) => { counts[j.status] = (counts[j.status] || 0) + 1; });

  return (
    <DispatchShell breadcrumb=" / Job Board">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Job Board</h1>
            <p className="text-xs text-muted-foreground mt-0.5">View and manage all dispatch jobs in one place</p>
          </div>
          <Button size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" /> New Job</Button>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Jobs", value: JOBS.length, icon: Package, color: "text-primary" },
            { label: "Pending", value: counts.pending || 0, icon: Clock, color: "text-chart-4" },
            { label: "In Transit", value: counts.in_transit || 0, icon: Truck, color: "text-chart-3" },
            { label: "Revenue", value: "$" + JOBS.reduce((s, j) => s + parseFloat(j.value.replace(/[$,]/g, "")), 0).toLocaleString(), icon: DollarSign, color: "text-chart-2" },
          ].map((k) => {
            const Icon = k.icon;
            return (
              <Card key={k.label}>
                <CardContent className="p-3 flex items-center gap-2.5">
                  <div className={cn("w-8 h-8 rounded-lg bg-muted flex items-center justify-center", k.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground leading-none">{k.value}</p>
                    <p className="text-[10px] text-muted-foreground">{k.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "pending", "assigned", "in_transit", "delivered"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors border",
                filter === s ? "bg-foreground text-background border-foreground" : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
              )}
            >
              {s === "all" ? "All" : statusConfig[s].label} ({counts[s] || 0})
            </button>
          ))}
          <div className="ml-auto relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-xs w-48" />
          </div>
        </div>

        {/* Jobs list */}
        <div className="space-y-3">
          {filtered.map((j) => {
            const cfg = statusConfig[j.status];
            return (
              <Card key={j.id} className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground">{j.id}</span>
                      <Badge variant={cfg.variant} className="text-[10px]">{cfg.label}</Badge>
                      <span className="text-[10px] text-muted-foreground">Created {j.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold text-foreground">{j.value}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2 text-[11px]">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span className="text-foreground font-medium">{j.customer}</span>
                    <span className="text-muted-foreground">•</span>
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{j.phone}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-2 text-[11px]">
                    <MapPin className="w-3 h-3 text-chart-2 shrink-0" />
                    <span className="text-foreground">{j.origin}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <MapPin className="w-3 h-3 text-primary shrink-0" />
                    <span className="text-foreground">{j.destination}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {j.moveDate}</span>
                    <span className="flex items-center gap-1"><Weight className="w-3 h-3" /> {j.weight}</span>
                    {j.driver && (
                      <span className="flex items-center gap-1 text-foreground"><Truck className="w-3 h-3 text-primary" /> {j.driver} • {j.vehicle}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DispatchShell>
  );
}
