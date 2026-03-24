import DispatchShell from "@/components/layout/DispatchShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Truck, Users, Route, Navigation, CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DispatchDashboard() {
  return (
    <DispatchShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Dispatch Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Fleet overview, driver assignments & route management</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Vehicles En Route", value: 0, icon: Navigation, color: "text-primary" },
            { label: "Delivered Today", value: 0, icon: CheckCircle, color: "text-chart-2" },
            { label: "Active Drivers", value: 0, icon: Users, color: "text-chart-3" },
            { label: "Pending Routes", value: 0, icon: AlertTriangle, color: "text-chart-4" },
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
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Truck className="w-10 h-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No vehicles tracked yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Vehicle data will appear here once fleet tracking is configured</p>
            </div>
          </CardContent>
        </Card>

        {/* Two-column: Driver Assignments + Route Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-chart-3" />
                Driver Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Users className="w-8 h-8 text-muted-foreground/20 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No driver assignments</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Assignments will populate once drivers and jobs are set up</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Route className="w-4 h-4 text-chart-4" />
                Route Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Route className="w-8 h-8 text-muted-foreground/20 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No routes yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Routes will appear here once dispatch operations begin</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DispatchShell>
  );
}
