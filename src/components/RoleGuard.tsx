import { Navigate, useLocation } from "react-router-dom";
import { useUserRoles } from "@/hooks/useUserRoles";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface RoleGuardProps {
  /** Roles that grant access — owners always pass */
  allowedRoles: AppRole[];
  children: React.ReactNode;
}

/**
 * Wraps a route element.
 * - Not signed in → redirect to /dashboard with saved `from` location
 * - Signed in but wrong role → show explicit "no access" UI
 * - Signed in with correct role or owner → render children
 */
export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { isOwner, hasAnyRole, loading, userId } = useUserRoles();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not signed in — redirect to dashboard, preserve intended route
  if (!userId) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  // Signed in but lacks required role
  if (!isOwner && !hasAnyRole(...allowedRoles)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
        <ShieldAlert className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your account doesn't have the required role to view this section.
          Contact an admin if you believe this is a mistake.
        </p>
        <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
          Back to Workspace
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
