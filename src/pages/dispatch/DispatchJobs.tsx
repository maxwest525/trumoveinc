import DispatchShell from "@/components/layout/DispatchShell";
import { ClipboardList } from "lucide-react";

export default function DispatchJobs() {
  return (
    <DispatchShell breadcrumb=" / Job Board">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Job Board</h1>
          <p className="text-xs text-muted-foreground mt-0.5">View and manage all dispatch jobs in one place</p>
        </div>
        <div className="rounded-xl border border-border bg-card flex flex-col items-center justify-center py-20 text-center">
          <ClipboardList className="w-10 h-10 text-muted-foreground/20 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No jobs yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Jobs from booked deals will populate here automatically</p>
        </div>
      </div>
    </DispatchShell>
  );
}
