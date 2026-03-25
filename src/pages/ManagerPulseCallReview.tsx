import ManagerShell from "@/components/layout/ManagerShell";
import PulseCallReview from "@/pages/pulse/PulseCallReview";

export default function ManagerPulseCallReview() {
  return (
    <ManagerShell breadcrumbs={[{ label: "Pulse", href: "/manager/pulse" }, { label: "Call Review" }]}>
      <PulseCallReview embedded basePath="/manager/pulse" />
    </ManagerShell>
  );
}
