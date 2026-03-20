import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "authed" | "anon">("loading");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setStatus(session ? "authed" : "anon");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setStatus(s ? "authed" : "anon");
    });
    return () => subscription.unsubscribe();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "anon") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
