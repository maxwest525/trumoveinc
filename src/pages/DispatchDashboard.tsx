import DispatchShell from "@/components/layout/DispatchShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Truck, Users, Route, Navigation, CheckCircle,
  AlertTriangle, Clock, Package, ArrowRight, MapPin,
  Phone, CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

const UPCOMING_JOBS = [
  { id: "J-4821", customer: "Sarah Mitchell", origin: "Dallas, TX", destination: "Austin, TX", date: "Apr 3", status: "confirmed", weight: "4,200 lbs" },
  { id: "J-4822", customer: "James Rivera", origin: "Houston, TX", destination: "San Antonio, TX", date: "Apr 3", status: "pending_driver", weight: "6,800 lbs" },
  { id: "J-4823", customer: "Emily Chen", origin: "Fort Worth, TX", destination: "El Paso, TX", date: "Apr 4", status: "confirmed", weight: "3,100 lbs" },
  { id: "J-4824", customer: "Robert Johnson", origin: "Plano, TX", destination: "Lubbock, TX", date: "Apr 5", status: "needs_carrier", weight: "7,500 lbs" },
];

const ACTIVE_VEHICLES = [
  { id: "TRK-01", driver: "Mike Torres", location: "I-35 near Waco, TX", eta: "2h 15m", job: "J-4819", progress: 65 },
  { id: "TRK-03", driver: "Ana Gomez", location: "I-10 near Seguin, TX", eta: "45m", job: "J-4817", progress: 88 },
  { id: "TRK-05", driver: "Chris Park", location: "Loading at origin", eta: "Departing soon", job: "J-4820", progress: 10 },
];

const RECENT_ACTIVITY = [
  { text: "J-4817 marked as delivered", time: "12 min ago", icon: CheckCircle, color: "text-chart-2" },
  { text: "Driver Mike Torres checked in at pickup", time: "28 min ago", icon: MapPin, color: "text-primary" },
  { text: "Carrier assigned to J-4822", time: "1h ago", icon: Truck, color: "text-chart-3" },
  { text: "New job J-4824 created from booking", time: "2h ago", icon: Package, color: "text-chart-4" },
];

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    confirmed: { label: "Confirmed", variant: "default" },
    pending_driver: { label: "Needs Driver", variant: "secondary" },
    needs_carrier: { label: "Needs Carrier", variant: "destructive" },
  };
  const s = map[status] || { label: status, variant: "outline" as const };
  return <Badge variant={s.variant} className="text-[10px]">{s.label}</Badge>;
};

export default function DispatchDashboard() {
  return (
    <DispatchShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Dispatch Dashboard</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Fleet overview, driver assignments & route management</p>
          </div>
          <Button size="sm" className="gap-1.5">
            <Package className="w-3.5 h-3.5" /> New Job
          </Button>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Vehicles En Route", value: 3, icon: Navigation, color: "text-primary" },
            { label: "Delivered Today", value: 5, icon: CheckCircle, color: "text-chart-2" },
            { label: "Active Drivers", value: 8, icon: Users, color: "text-chart-3" },
            { label: "Pending Routes", value: 4, icon: AlertTriangle, color: "text-chart-4" },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center bg-muted", kpi.color)}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground leading-none">{kpi.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Active Vehicles */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              Active Vehicles
              <Badge variant="secondary" className="ml-auto text-[10px]">{ACTIVE_VEHICLES.length} en route</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ACTIVE_VEHICLES.map((v) => (
              <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{v.id}</span>
                    <span className="text-[10px] text-muted-foreground">• {v.driver}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{v.location}</p>
                  <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${v.progress}%` }} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-medium text-foreground">{v.job}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" /> {v.eta}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Two-column: Upcoming Jobs + Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-chart-3" />
                Upcoming Jobs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {UPCOMING_JOBS.map((job) => (
                <div key={job.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/40 transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{job.id}</span>
                      {statusBadge(job.status)}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{job.customer} • {job.weight}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      {job.origin} <ArrowRight className="w-2.5 h-2.5" /> {job.destination}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{job.date}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-chart-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {RECENT_ACTIVITY.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center bg-muted shrink-0 mt-0.5", item.color)}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground">{item.text}</p>
                        <p className="text-[10px] text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DispatchShell>
  );
}
