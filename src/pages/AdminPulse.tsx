import AdminShell from "@/components/layout/AdminShell";
import PulseDashboard from "@/pages/pulse/PulseDashboard";

export default function AdminPulse() {
  return (
    <AdminShell breadcrumb="/ Pulse Settings">
      <PulseDashboard embedded basePath="/admin/pulse" />
    </AdminShell>
  );
}
