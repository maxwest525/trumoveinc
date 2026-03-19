import { useState } from "react";
import DispatchShell from "@/components/layout/DispatchShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Truck, MapPin, Users, Route, Clock, CheckCircle,
  AlertTriangle, Navigation, ChevronRight, Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── mock data ── */
const FLEET_VEHICLES = [
  { id: "TM-101", driver: "Carlos M.", status: "en_route", origin: "Miami, FL", destination: "Atlanta, GA", progress: 62, eta: "4h 20m" },
  { id: "TM-204", driver: "Jake R.", status: "loading", origin: "Dallas, TX", destination: "Houston, TX", progress: 0, eta: "6h 10m" },
  { id: "TM-087", driver: "Sarah L.", status: "en_route", origin: "NYC, NY", destination: "Boston, MA", progress: 85, eta: "1h 15m" },
  { id: "TM-312", driver: "Mike P.", status: "delivered", origin: "Denver, CO", destination: "Phoenix, AZ", progress: 100, eta: "—" },
  { id: "TM-155", driver: "Ana G.", status: "idle", origin: "—", destination: "—", progress: 0, eta: "—" },
];

const DRIVER_ASSIGNMENTS = [
  { driver: "Carlos M.", truck: "TM-101", jobs: 3, hoursToday: 6.5, status: "active" },
  { driver: "Jake R.", truck: "TM-204", jobs: 2, hoursToday: 3.0, status: "active" },
  { driver: "Sarah L.", truck: "TM-087", jobs: 4, hoursToday: 8.0, status: "active" },
  { driver: "Mike P.", truck: "TM-312", jobs: 1, hoursToday: 9.5, status: "off_duty" },
  { driver: "Ana G.", truck: "TM-155", jobs: 0, hoursToday: 0, status: "available" },
];

const ROUTES = [
  { id: "RT-001", from: "Miami, FL", to: "Atlanta, GA", distance: "662 mi", stops: 2, status: "active" },
  { id: "RT-002", from: "Dallas, TX", to: "Houston, TX", distance: "239 mi", stops: 0, status: "pending" },
  { id: "RT-003", from: "NYC, NY", to: "Boston, MA", distance: "215 mi", stops: 1, status: "active" },
  { id: "RT-004", from: "Denver, CO", to: "Phoenix, AZ", distance: "602 mi", stops: 3, status: "completed" },
  { id: "RT-005", from: "Chicago, IL", to: "Detroit, MI", distance: "282 mi", stops: 1, status: "pending" },
];

const statusColor: Record<string, string> = {
  en_route: "text-primary",
  loading: "text-chart-4",
  delivered: "text-chart-2",
  idle: "text-muted-foreground",
  active: "text-primary",
  available: "text-chart-2",
  off_duty: "text-muted-foreground",
  pending: "text-chart-4",
  completed: "text-chart-2",
};

const statusBg: Record<string, string> = {
  en_route: "bg-primary/10",
  loading: "bg-chart-4/10",
  delivered: "bg-chart-2/10",
  idle: "bg-muted",
  active: "bg-primary/10",
  available: "bg-chart-2/10",
  off_duty: "bg-muted",
  pending: "bg-chart-4/10",
  completed: "bg-chart-2/10",
};

const statusLabel: Record<string, string> = {
  en_route: "En Route",
  loading: "Loading",
  delivered: "Delivered",
  idle: "Idle",
  active: "Active",
  available: "Available",
  off_duty: "Off Duty",
  pending: "Pending",
  completed: "Completed",
};

export default function DispatchDashboard() {
  const enRoute = FLEET_VEHICLES.filter(v => v.status === "en_route").length;
  const delivered = FLEET_VEHICLES.filter(v => v.status === "delivered").length;
  const activeDrivers = DRIVER_ASSIGNMENTS.filter(d => d.status === "active").length;
  const pendingRoutes = ROUTES.filter(r => r.status === "pending").length;

  return (
    <DispatchShell>
      <div className="space-y-6">
        {/* Page title */}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Dispatch Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Fleet overview, driver assignments & route management</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Vehicles En Route", value: enRoute, icon: Navigation, color: "text-primary" },
            { label: "Delivered Today", value: delivered, icon: CheckCircle, color: "text-chart-2" },
            { label: "Active Drivers", value: activeDrivers, icon: Users, color: "text-chart-3" },
            { label: "Pending Routes", value: pendingRoutes, icon: AlertTriangle, color: "text-chart-4" },
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

        {/* Fleet Tracking */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              Fleet Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left px-4 py-2 font-medium">Vehicle</th>
                    <th className="text-left px-4 py-2 font-medium">Driver</th>
                    <th className="text-left px-4 py-2 font-medium">Status</th>
                    <th className="text-left px-4 py-2 font-medium">Route</th>
                    <th className="text-left px-4 py-2 font-medium">Progress</th>
                    <th className="text-left px-4 py-2 font-medium">ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {FLEET_VEHICLES.map((v) => (
                    <tr key={v.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5 font-semibold text-foreground">{v.id}</td>
                      <td className="px-4 py-2.5 text-foreground">{v.driver}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold", statusBg[v.status], statusColor[v.status])}>
                          <Circle className="w-1.5 h-1.5 fill-current" />
                          {statusLabel[v.status]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {v.origin !== "—" ? (
                          <span className="flex items-center gap-1">
                            {v.origin} <ChevronRight className="w-3 h-3" /> {v.destination}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${v.progress}%` }} />
                          </div>
                          <span className="text-muted-foreground">{v.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{v.eta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Two-column: Driver Assignments + Route Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Driver Assignments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-chart-3" />
                Driver Assignments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left px-4 py-2 font-medium">Driver</th>
                      <th className="text-left px-4 py-2 font-medium">Truck</th>
                      <th className="text-left px-4 py-2 font-medium">Jobs</th>
                      <th className="text-left px-4 py-2 font-medium">Hours</th>
                      <th className="text-left px-4 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DRIVER_ASSIGNMENTS.map((d) => (
                      <tr key={d.driver} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 font-semibold text-foreground">{d.driver}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{d.truck}</td>
                        <td className="px-4 py-2.5 text-foreground">{d.jobs}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{d.hoursToday}h</td>
                        <td className="px-4 py-2.5">
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold", statusBg[d.status], statusColor[d.status])}>
                            <Circle className="w-1.5 h-1.5 fill-current" />
                            {statusLabel[d.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Route Management */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Route className="w-4 h-4 text-chart-4" />
                Route Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left px-4 py-2 font-medium">Route</th>
                      <th className="text-left px-4 py-2 font-medium">From → To</th>
                      <th className="text-left px-4 py-2 font-medium">Dist.</th>
                      <th className="text-left px-4 py-2 font-medium">Stops</th>
                      <th className="text-left px-4 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROUTES.map((r) => (
                      <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 font-semibold text-foreground">{r.id}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            {r.from} <ChevronRight className="w-3 h-3" /> {r.to}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-foreground">{r.distance}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{r.stops}</td>
                        <td className="px-4 py-2.5">
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold", statusBg[r.status], statusColor[r.status])}>
                            <Circle className="w-1.5 h-1.5 fill-current" />
                            {statusLabel[r.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DispatchShell>
  );
}
