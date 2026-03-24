import DispatchShell from "@/components/layout/DispatchShell";
import { Users } from "lucide-react";

export default function DispatchDrivers() {
  return (
    <DispatchShell breadcrumb=" / Driver Assignments">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Driver Assignments</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Assign drivers to jobs and manage availability</p>
        </div>
        <div className="rounded-xl border border-border bg-card flex flex-col items-center justify-center py-20 text-center">
          <Users className="w-10 h-10 text-muted-foreground/20 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No drivers assigned</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Driver records will appear here once your team is set up</p>
        </div>
      </div>
    </DispatchShell>
  );
}
