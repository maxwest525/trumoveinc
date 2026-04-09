import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteShell from "@/components/layout/SiteShell";
import { useToast } from "@/hooks/use-toast";
import { Lock, Loader2 } from "lucide-react";

function hasRecoveryHash() {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const params = new URLSearchParams(hash);

  return params.get("type") === "recovery" && Boolean(params.get("access_token"));
}

async function waitForRecoverySession() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      return session;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 200));
  }

  return null;
}

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");
  const navigate = useNavigate();
  const { toast } = useToast();
  const recoveryHashPresent = useMemo(() => hasRecoveryHash(), []);

  useEffect(() => {
    let isMounted = true;

    const syncRecoveryState = async () => {
      const session = await waitForRecoverySession();

      if (!isMounted) {
        return;
      }

      if (session || recoveryHashPresent) {
        setStatus("ready");
        return;
      }

      setStatus("invalid");
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) {
        return;
      }

      if (event === "PASSWORD_RECOVERY" || session) {
        setStatus("ready");
      }
    });

    void syncRecoveryState();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [recoveryHashPresent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({ title: "Password too short", description: "Must be at least 6 characters.", variant: "destructive" });
      return;
    }

    const session = await waitForRecoverySession();

    if (!session) {
      setStatus("invalid");
      toast({
        title: "Reset link expired",
        description: "Request a fresh password reset email and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Password updated", description: "You can now sign in with your new password." });
    navigate("/dashboard", { replace: true });
  };

  return (
    <SiteShell centered backendMode>
      <div className="flex items-center justify-center min-h-[60vh] px-4 py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-bold text-foreground text-center mb-2">Set new password</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">Enter your new password below</p>

          {status === "checking" ? (
            <p className="text-sm text-muted-foreground text-center">Verifying your reset link...</p>
          ) : status === "invalid" ? (
            <div className="rounded-lg border border-border bg-card p-5 text-center space-y-3">
              <p className="text-sm font-medium text-foreground">This reset link is no longer valid.</p>
              <p className="text-xs text-muted-foreground">Go back and request a fresh password reset email.</p>
              <button
                type="button"
                onClick={() => navigate("/dashboard", { replace: true })}
                className="w-full h-10 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Password
              </button>
            </form>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
