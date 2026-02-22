import AdminShell from "@/components/layout/AdminShell";
import AdminUsersRoles from "./AdminUsersRoles";

export default function AdminUsersPage() {
  return (
    <AdminShell breadcrumb=" / Users">
      <AdminUsersRoles />
    </AdminShell>
  );
}
