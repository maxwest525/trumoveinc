import DispatchShell from "@/components/layout/DispatchShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin, Truck, Clock, Fuel, Wrench, Search,
  Navigation, CheckCircle, AlertTriangle, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type VehicleStatus = "en_route" | "idle" | "maintenance" | "loading";

interface Vehicle {
  id: string;
  name: string;
  plate: string;
  status: VehicleStatus;
  driver: string;
  location: string;
  fuelLevel: number;
  mileage: string;
  lastUpdate: string;
  currentJob?: string;
}

const VEHICLES: Vehicle[] = [
  { id: "TRK-01", name: "26ft Box Truck", plate: "TX-4829", status: "en_route", driver: "Mike Torres", location: "I-35 near Waco, TX", fuelLevel: 72, mileage: "48,320 mi", lastUpdate: "2 min ago", currentJob: "J-4819" },
  { id: "TRK-02", name: "18ft Cargo Van", plate: "TX-3891", status: "idle", driver: "Unassigned", location: "HQ Yard – Dallas, TX", fuelLevel: 95, mileage: "31,200 mi", lastUpdate: "1h ago" },
  { id: "TRK-03", name: "26ft Box Truck", plate: "TX-5512", status: "en_route", driver: "Ana Gomez", location: "I-10 near Seguin, TX", fuelLevel: 55, mileage: "62,100 mi", lastUpdate: "5 min ago", currentJob: "J-4817" },
  { id: "TRK-04", name: "53ft Semi Trailer", plate: "TX-7703", status: "maintenance", driver: "—", location: "Service Center – Irving, TX", fuelLevel: 30, mileage: "112,400 mi", lastUpdate: "3h ago" },
  { id: "TRK-05", name: "26ft Box Truck", plate: "TX-6621", status: "loading", driver: "Chris Park", location: "1204 Elm St, Dallas, TX", fuelLevel: 88, mileage: "29,800 mi", lastUpdate: "8 min ago", currentJob: "J-4820" },
  { id: "TRK-06", name: "18ft Cargo Van", plate: "TX-4410", status: "idle", driver: "Unassigned", location: "HQ Yard – Dallas, TX", fuelLevel: 100, mileage: "15,600 mi", lastUpdate: "45 min ago" },
];

const statusConfig: Record<VehicleStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Truck }> = {
  en_route: { label: "En Route", variant: "default", icon: Navigation },
  idle: { label: "Idle", variant: "secondary", icon: CheckCircle },
  maintenance: { label: "Maintenance", variant: "destructive", icon: Wrench },
  loading: { label: "Loading", variant: "outline", icon: Truck },
};

export default function DispatchFleet() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<VehicleStatus | "all">("all");

  const filtered = VEHICLES.filter((v) => {
    if (filter !== "all" && v.status !== filter) return false;
    if (search && !`${v.id} ${v.name} ${v.driver} ${v.plate}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: VEHICLES.length,
    en_route: VEHICLES.filter((v) => v.status === "en_route").length,
    idle: VEHICLES.filter((v) => v.status === "idle").length,
    maintenance: VEHICLES.filter((v) => v.status === "maintenance").length,
    loading: VEHICLES.filter((v) => v.status === "loading").length,
  };

  return (
    <DispatchShell breadcrumb=" / Fleet Tracker">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Fleet Tracker</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Real-time vehicle location and status monitoring</p>
          </div>
          <Button size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Vehicle</Button>
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "en_route", "idle", "loading", "maintenance"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors border",
                filter === s
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
              )}
            >
              {s === "all" ? "All" : statusConfig[s].label} ({counts[s]})
            </button>
          ))}
          <div className="ml-auto relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search vehicles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs w-48"
            />
          </div>
        </div>

        {/* Vehicle cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((v) => {
            const cfg = statusConfig[v.status];
            const StatusIcon = cfg.icon;
            return (
              <Card key={v.id} className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Truck className="w-4 h-4 text-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{v.id} — {v.name}</p>
                        <p className="text-[10px] text-muted-foreground">{v.plate}</p>
                      </div>
                    </div>
                    <Badge variant={cfg.variant} className="text-[10px] gap-1">
                      <StatusIcon className="w-3 h-3" /> {cfg.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{v.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>Updated {v.lastUpdate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Fuel className="w-3 h-3 shrink-0" />
                      <span>Fuel: {v.fuelLevel}%</span>
                      <div className="flex-1 h-1 rounded-full bg-muted ml-1">
                        <div
                          className={cn("h-full rounded-full", v.fuelLevel > 50 ? "bg-chart-2" : v.fuelLevel > 25 ? "bg-chart-4" : "bg-destructive")}
                          style={{ width: `${v.fuelLevel}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Navigation className="w-3 h-3 shrink-0" />
                      <span>{v.mileage}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border">
                    <span className="text-[10px] text-muted-foreground">Driver: <span className="text-foreground font-medium">{v.driver}</span></span>
                    {v.currentJob && <Badge variant="outline" className="text-[10px]">{v.currentJob}</Badge>}
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
