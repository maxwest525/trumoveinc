import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export function useUserRoles() {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchRoles = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid);

    setRoles((data || []).map((r) => r.role));
    setLoading(false);
  }, []);

  useEffect(() => {
    // Listen for auth state changes and re-fetch roles accordingly
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const uid = session?.user?.id ?? null;
        setUserId(uid);

        if (!uid) {
          setRoles([]);
          setLoading(false);
        } else {
          setLoading(true);
          fetchRoles(uid);
        }
      }
    );

    // Also resolve the current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);

      if (!uid) {
        setRoles([]);
        setLoading(false);
      } else {
        fetchRoles(uid);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchRoles]);

  const hasRole = (role: AppRole) => roles.includes(role);
  const hasAnyRole = (...r: AppRole[]) => r.some((role) => roles.includes(role));
  const isOwner = roles.includes("owner");

  return { roles, loading, hasRole, hasAnyRole, isOwner, userId };
}
