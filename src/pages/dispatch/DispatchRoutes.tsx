import DispatchShell from "@/components/layout/DispatchShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Route, ArrowRight, Clock, MapPin, Truck, Plus,
  Navigation, Calendar, Weight, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RouteStatus = "active" | "planned" | "completed";

interface RouteItem {
  id: string;
  name: string;
  status: RouteStatus;
  origin: string;
  destination: string;
  distance: string;
  estimatedTime: string;
  stops: number;
  driver?: string;
  vehicle?: string;
  departure: string;
  jobs: string[];
  totalWeight: string;
}

const ROUTES: RouteItem[] = [
  { id: "RT-101", name: "Dallas → Austin Express", status: "active", origin: "Dallas, TX", destination: "Austin, TX", distance: "195 mi", estimatedTime: "3h 15m", stops: 1, driver: "Mike Torres", vehicle: "TRK-01", departure: "Today 8:00 AM", jobs: ["J-4819"], totalWeight: "4,200 lbs" },
  { id: "RT-102", name: "Houston → San Antonio", status: "active", origin: "Houston, TX", destination: "San Antonio, TX", distance: "197 mi", estimatedTime: "3h 00m", stops: 0, driver: "Ana Gomez", vehicle: "TRK-03", departure: "Today 7:30 AM", jobs: ["J-4817"], totalWeight: "6,800 lbs" },
  { id: "RT-103", name: "Dallas Local Pickup", status: "active", origin: "1204 Elm St, Dallas", destination: "HQ Warehouse", distance: "12 mi", estimatedTime: "35m", stops: 2, driver: "Chris Park", vehicle: "TRK-05", departure: "Today 10:00 AM", jobs: ["J-4820", "J-4821"], totalWeight: "8,400 lbs" },
  { id: "RT-104", name: "Fort Worth → El Paso", status: "planned", origin: "Fort Worth, TX", destination: "El Paso, TX", distance: "580 mi", estimatedTime: "8h 30m", stops: 1, departure: "Apr 4, 6:00 AM", jobs: ["J-4823"], totalWeight: "3,100 lbs" },
  { id: "RT-105", name: "Plano → Lubbock", status: "planned", origin: "Plano, TX", destination: "Lubbock, TX", distance: "330 mi", estimatedTime: "5h 00m", stops: 0, departure: "Apr 5, 7:00 AM", jobs: ["J-4824"], totalWeight: "7,500 lbs" },
  { id: "RT-100", name: "Dallas → Houston Multi-stop", status: "completed", origin: "Dallas, TX", destination: "Houston, TX", distance: "240 mi", estimatedTime: "4h 10m", stops: 3, driver: "David Washington", vehicle: "TRK-02", departure: "Yesterday 7:00 AM", jobs: ["J-4815", "J-4816"], totalWeight: "11,200 lbs" },
];

const statusMap: Record<RouteStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  active: { label: "In Progress", variant: "default" },
  planned: { label: "Planned", variant: "secondary" },
  completed: { label: "Completed", variant: "outline" },
};

export default function DispatchRoutes() {
  return (
    <DispatchShell breadcrumb=" / Route Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Route Management</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Plan, optimize, and monitor delivery routes</p>
          </div>
          <Button size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Create Route</Button>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Active Routes", value: ROUTES.filter(r => r.status === "active").length, color: "text-primary" },
            { label: "Planned", value: ROUTES.filter(r => r.status === "planned").length, color: "text-chart-4" },
            { label: "Completed Today", value: ROUTES.filter(r => r.status === "completed").length, color: "text-chart-2" },
          ].map((k) => (
            <Card key={k.label}>
              <CardContent className="p-3 text-center">
                <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
                <p className="text-[10px] text-muted-foreground">{k.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Route list */}
        <div className="space-y-3">
          {ROUTES.map((r) => {
            const s = statusMap[r.status];
            return (
              <Card key={r.id} className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Route className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">{r.name}</span>
                        <Badge variant={s.variant} className="text-[10px]">{s.label}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{r.id}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>

                  {/* Route visualization */}
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <div className="w-2 h-2 rounded-full bg-chart-2" />
                      <span className="text-foreground font-medium">{r.origin}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="flex-1 h-px bg-border" />
                      {r.stops > 0 && (
                        <span className="text-[9px] text-muted-foreground px-1.5 py-0.5 rounded-full bg-muted">
                          {r.stops} stop{r.stops > 1 ? "s" : ""}
                        </span>
                      )}
                      <div className="flex-1 h-px bg-border" />
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-foreground font-medium">{r.destination}</span>
                    </div>
                  </div>

                  {/* Details row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> {r.distance}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {r.estimatedTime}</span>
                    <span className="flex items-center gap-1"><Weight className="w-3 h-3" /> {r.totalWeight}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {r.departure}</span>
                    {r.driver && (
                      <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> {r.driver} • {r.vehicle}</span>
                    )}
                    <span className="flex items-center gap-1">Jobs: {r.jobs.join(", ")}</span>
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
