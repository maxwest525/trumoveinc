import DispatchShell from "@/components/layout/DispatchShell";
import { Route } from "lucide-react";

export default function DispatchRoutes() {
  return (
    <DispatchShell breadcrumb=" / Route Management">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Route Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Plan, optimize, and monitor delivery routes</p>
        </div>
        <div className="rounded-xl border border-border bg-card flex flex-col items-center justify-center py-20 text-center">
          <Route className="w-10 h-10 text-muted-foreground/20 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No routes created</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Routes will appear here once dispatch operations begin</p>
        </div>
      </div>
    </DispatchShell>
  );
}
