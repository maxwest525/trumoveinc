import DispatchShell from "@/components/layout/DispatchShell";
import { MapPin } from "lucide-react";

export default function DispatchFleet() {
  return (
    <DispatchShell breadcrumb=" / Fleet Tracker">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Fleet Tracker</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time vehicle location and status monitoring</p>
        </div>
        <div className="rounded-xl border border-border bg-card flex flex-col items-center justify-center py-20 text-center">
          <MapPin className="w-10 h-10 text-muted-foreground/20 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No vehicles tracked yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Vehicle GPS data will appear here once fleet tracking is configured</p>
        </div>
      </div>
    </DispatchShell>
  );
}
