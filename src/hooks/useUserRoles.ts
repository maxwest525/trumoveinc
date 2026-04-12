import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export function useUserRoles() {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    async function fetchRoles(uid: string) {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);

      if (mountedRef.current) {
        setRoles((data || []).map((r) => r.role));
        setLoading(false);
      }
    }

    // Set up auth listener FIRST (before getSession) per Supabase best practice
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mountedRef.current) return;
        const uid = session?.user?.id ?? null;
        setUserId(uid);

        if (!uid) {
          setRoles([]);
          setLoading(false);
        } else {
          setLoading(true);
          // Defer the fetch to next tick so the Supabase client
          // has fully applied the new token from this auth event
          setTimeout(() => {
            if (mountedRef.current) fetchRoles(uid);
          }, 0);
        }
      }
    );

    // Then resolve the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mountedRef.current) return;
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
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const hasRole = (role: AppRole) => roles.includes(role);
  const hasAnyRole = (...r: AppRole[]) => r.some((role) => roles.includes(role));
  const isOwner = roles.includes("owner");

  return { roles, loading, hasRole, hasAnyRole, isOwner, userId };
}
