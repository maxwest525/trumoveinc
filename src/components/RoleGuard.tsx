import { Navigate } from "react-router-dom";
import { useUserRoles } from "@/hooks/useUserRoles";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface RoleGuardProps {
  /** Roles that grant access — owners always pass */
  allowedRoles: AppRole[];
  children: React.ReactNode;
}

/**
 * Wraps a route element. If the user lacks the required role (and isn't an owner),
 * they're redirected to /dashboard.
 */
export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { isOwner, hasAnyRole, loading } = useUserRoles();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isOwner && !hasAnyRole(...allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
