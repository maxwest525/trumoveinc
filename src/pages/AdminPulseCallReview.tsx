import AdminShell from "@/components/layout/AdminShell";
import PulseCallReview from "@/pages/pulse/PulseCallReview";

export default function AdminPulseCallReview() {
  return (
    <AdminShell breadcrumbs={[{ label: "Pulse", href: "/admin/pulse" }, { label: "Call Review" }]}>
      <PulseCallReview embedded basePath="/admin/pulse" />
    </AdminShell>
  );
}
