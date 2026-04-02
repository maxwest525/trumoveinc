import DispatchShell from "@/components/layout/DispatchShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users, Phone, Mail, Star, Truck, Clock,
  CheckCircle, Search, Plus, MapPin, Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type DriverStatus = "available" | "on_job" | "off_duty" | "break";

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: DriverStatus;
  rating: number;
  completedJobs: number;
  currentJob?: string;
  vehicle?: string;
  location: string;
  nextAvailable: string;
}

const DRIVERS: Driver[] = [
  { id: "DRV-001", name: "Mike Torres", phone: "(214) 555-0142", email: "mike.t@trucrew.com", status: "on_job", rating: 4.8, completedJobs: 142, currentJob: "J-4819", vehicle: "TRK-01", location: "I-35 near Waco, TX", nextAvailable: "Today 4:30 PM" },
  { id: "DRV-002", name: "Ana Gomez", phone: "(214) 555-0198", email: "ana.g@trucrew.com", status: "on_job", rating: 4.9, completedJobs: 203, currentJob: "J-4817", vehicle: "TRK-03", location: "I-10 near Seguin, TX", nextAvailable: "Today 2:00 PM" },
  { id: "DRV-003", name: "Chris Park", phone: "(214) 555-0231", email: "chris.p@trucrew.com", status: "on_job", rating: 4.6, completedJobs: 87, currentJob: "J-4820", vehicle: "TRK-05", location: "1204 Elm St, Dallas, TX", nextAvailable: "Today 6:00 PM" },
  { id: "DRV-004", name: "David Washington", phone: "(214) 555-0177", email: "david.w@trucrew.com", status: "available", rating: 4.7, completedJobs: 164, location: "HQ – Dallas, TX", nextAvailable: "Now" },
  { id: "DRV-005", name: "Maria Santos", phone: "(214) 555-0265", email: "maria.s@trucrew.com", status: "available", rating: 4.5, completedJobs: 95, location: "HQ – Dallas, TX", nextAvailable: "Now" },
  { id: "DRV-006", name: "James Lee", phone: "(214) 555-0309", email: "james.l@trucrew.com", status: "off_duty", rating: 4.4, completedJobs: 118, location: "Off duty", nextAvailable: "Tomorrow 8:00 AM" },
  { id: "DRV-007", name: "Lisa Brown", phone: "(214) 555-0344", email: "lisa.b@trucrew.com", status: "break", rating: 4.7, completedJobs: 156, location: "HQ – Dallas, TX", nextAvailable: "Today 1:30 PM" },
];

const statusConfig: Record<DriverStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; dot: string }> = {
  available: { label: "Available", variant: "default", dot: "bg-chart-2" },
  on_job: { label: "On Job", variant: "secondary", dot: "bg-primary" },
  off_duty: { label: "Off Duty", variant: "outline", dot: "bg-muted-foreground" },
  break: { label: "On Break", variant: "outline", dot: "bg-chart-4" },
};

export default function DispatchDrivers() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DriverStatus | "all">("all");

  const filtered = DRIVERS.filter((d) => {
    if (filter !== "all" && d.status !== filter) return false;
    if (search && !`${d.name} ${d.id} ${d.phone}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <DispatchShell breadcrumb=" / Driver Assignments">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Driver Assignments</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Assign drivers to jobs and manage availability</p>
          </div>
          <Button size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Driver</Button>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Drivers", value: DRIVERS.length, icon: Users, color: "text-primary" },
            { label: "Available", value: DRIVERS.filter(d => d.status === "available").length, icon: CheckCircle, color: "text-chart-2" },
            { label: "On Job", value: DRIVERS.filter(d => d.status === "on_job").length, icon: Truck, color: "text-chart-3" },
            { label: "Avg Rating", value: (DRIVERS.reduce((s, d) => s + d.rating, 0) / DRIVERS.length).toFixed(1), icon: Star, color: "text-chart-4" },
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
          {(["all", "available", "on_job", "break", "off_duty"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors border",
                filter === s ? "bg-foreground text-background border-foreground" : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
              )}
            >
              {s === "all" ? "All" : statusConfig[s].label}
            </button>
          ))}
          <div className="ml-auto relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Search drivers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-xs w-48" />
          </div>
        </div>

        {/* Driver list */}
        <div className="space-y-3">
          {filtered.map((d) => {
            const cfg = statusConfig[d.status];
            return (
              <Card key={d.id} className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground shrink-0">
                      {d.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{d.name}</span>
                        <Badge variant={cfg.variant} className="text-[10px] gap-1">
                          <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                          {cfg.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{d.id}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {d.phone}</span>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {d.email}</span>
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-chart-4" /> {d.rating} ({d.completedJobs} jobs)</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {d.location}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-[10px]">
                        {d.currentJob && (
                          <span className="flex items-center gap-1 text-foreground font-medium">
                            <Truck className="w-3 h-3 text-primary" /> {d.currentJob} • {d.vehicle}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-3 h-3" /> Next available: {d.nextAvailable}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-[10px] h-7 shrink-0">
                      Assign Job
                    </Button>
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
