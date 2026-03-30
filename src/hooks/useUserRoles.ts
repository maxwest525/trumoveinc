import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export function useUserRoles() {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchRoles() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) { setLoading(false); return; }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (!cancelled) {
        setRoles((data || []).map((r) => r.role));
        setLoading(false);
      }
    }

    fetchRoles();
    return () => { cancelled = true; };
  }, []);

  const hasRole = (role: AppRole) => roles.includes(role);
  const hasAnyRole = (...r: AppRole[]) => r.some((role) => roles.includes(role));
  const isOwner = roles.includes("owner");

  return { roles, loading, hasRole, hasAnyRole, isOwner };
}
