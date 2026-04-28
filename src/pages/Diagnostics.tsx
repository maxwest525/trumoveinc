import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, Trash2, Copy, Activity } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import {
  installGlobalErrorCapture,
  readCapturedErrors,
  clearCapturedErrors,
  type CapturedError,
} from "@/lib/errorCapture";

type CheckStatus = "pending" | "ok" | "warn" | "fail";
interface Check {
  name: string;
  status: CheckStatus;
  detail?: string;
}

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "ok") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === "fail") return <XCircle className="h-4 w-4 text-red-500" />;
  if (status === "warn") return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  return <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />;
}

export default function Diagnostics() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [errors, setErrors] = useState<CapturedError[]>([]);
  const [running, setRunning] = useState(false);
  const [env, setEnv] = useState<Record<string, string>>({});
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    installErrorCapture();
    loadErrors();
    runChecks();
  }, []);

  const loadErrors = () => {
    try {
      const raw = localStorage.getItem(ERROR_LOG_KEY);
      setErrors(raw ? JSON.parse(raw) : []);
    } catch {
      setErrors([]);
    }
  };

  const setCheck = (name: string, status: CheckStatus, detail?: string) => {
    setChecks((prev) => {
      const idx = prev.findIndex((c) => c.name === name);
      const next = { name, status, detail };
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = next;
        return copy;
      }
      return [...prev, next];
    });
  };

  const runChecks = async () => {
    setRunning(true);
    setChecks([]);

    // Env
    const envInfo: Record<string, string> = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "(missing)",
      VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
        ? `${String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY).slice(0, 12)}…`
        : "(missing)",
      VITE_SUPABASE_PROJECT_ID: import.meta.env.VITE_SUPABASE_PROJECT_ID || "(missing)",
      MODE: import.meta.env.MODE,
      origin: window.location.origin,
      userAgent: navigator.userAgent,
    };
    setEnv(envInfo);
    setCheck(
      "Environment variables",
      envInfo.VITE_SUPABASE_URL !== "(missing)" && envInfo.VITE_SUPABASE_PUBLISHABLE_KEY !== "(missing)" ? "ok" : "fail",
      `URL: ${envInfo.VITE_SUPABASE_URL}`
    );

    // Auth session
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      const u = data.session?.user || null;
      setUser(u);
      setCheck("Auth session", u ? "ok" : "warn", u ? `Signed in as ${u.email}` : "No active session");

      if (u) {
        const { data: rolesData, error: roleErr } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", u.id);
        if (roleErr) {
          setCheck("User roles fetch", "fail", roleErr.message);
        } else {
          const r = (rolesData || []).map((x: any) => x.role);
          setRoles(r);
          setCheck("User roles fetch", "ok", r.length ? r.join(", ") : "no roles assigned");
        }
      }
    } catch (e: any) {
      setCheck("Auth session", "fail", e.message || String(e));
    }

    // DB connectivity (lightweight count)
    try {
      const { error } = await supabase.from("profiles").select("id", { count: "exact", head: true });
      if (error) throw error;
      setCheck("Database connectivity", "ok", "profiles table reachable");
    } catch (e: any) {
      setCheck("Database connectivity", "fail", e.message || String(e));
    }

    // Required tables
    const tables = ["leads", "deals", "user_roles", "notifications", "integration_credentials", "marketing_activity_log"];
    for (const t of tables) {
      try {
        const { error } = await supabase.from(t as any).select("*", { count: "exact", head: true });
        if (error) throw error;
        setCheck(`Table: ${t}`, "ok");
      } catch (e: any) {
        setCheck(`Table: ${t}`, "fail", e.message || String(e));
      }
    }

    // Storage buckets
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      setCheck("Storage buckets", "ok", (data || []).map((b: any) => b.name).join(", "));
    } catch (e: any) {
      setCheck("Storage buckets", "warn", e.message || String(e));
    }

    setRunning(false);
  };

  const clearErrors = () => {
    localStorage.removeItem(ERROR_LOG_KEY);
    setErrors([]);
    toast.success("Error log cleared");
  };

  const copyDiagnostics = () => {
    const payload = {
      generated: new Date().toISOString(),
      env,
      user: user ? { id: user.id, email: user.email } : null,
      roles,
      checks,
      errors: errors.slice(0, 50),
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    toast.success("Diagnostics copied to clipboard");
  };

  const okCount = checks.filter((c) => c.status === "ok").length;
  const failCount = checks.filter((c) => c.status === "fail").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;

  return (
    <div className="min-h-screen bg-background p-6">
      <Helmet>
        <title>System Diagnostics — TruMove</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Activity className="h-7 w-7 text-primary" />
              System Diagnostics
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Standalone health check. Reachable even if other pages fail.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyDiagnostics}>
              <Copy className="h-4 w-4 mr-2" /> Copy report
            </Button>
            <Button size="sm" onClick={runChecks} disabled={running}>
              <RefreshCw className={`h-4 w-4 mr-2 ${running ? "animate-spin" : ""}`} />
              Re-run checks
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Passing</CardDescription>
              <CardTitle className="text-3xl text-green-500">{okCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Warnings</CardDescription>
              <CardTitle className="text-3xl text-yellow-500">{warnCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Failures</CardDescription>
              <CardTitle className="text-3xl text-red-500">{failCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Checks */}
        <Card>
          <CardHeader>
            <CardTitle>Health checks</CardTitle>
            <CardDescription>Backend, database, auth, and tables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {checks.map((c) => (
                <div key={c.name} className="flex items-start justify-between gap-4 rounded-md border p-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <StatusIcon status={c.status} />
                    <div className="min-w-0">
                      <div className="font-medium text-sm">{c.name}</div>
                      {c.detail && (
                        <div className="text-xs text-muted-foreground break-all mt-0.5">{c.detail}</div>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={c.status === "ok" ? "default" : c.status === "fail" ? "destructive" : "secondary"}
                  >
                    {c.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
              {checks.length === 0 && (
                <div className="text-sm text-muted-foreground">Running checks…</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Environment */}
        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto">
{JSON.stringify(env, null, 2)}
            </pre>
            {user && (
              <div className="mt-3 text-sm">
                <div><span className="text-muted-foreground">User:</span> {user.email} ({user.id})</div>
                <div><span className="text-muted-foreground">Roles:</span> {roles.join(", ") || "(none)"}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Captured errors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Captured errors ({errors.length})</CardTitle>
              <CardDescription>Window errors, unhandled promise rejections, console.error</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadErrors}>
                <RefreshCw className="h-4 w-4 mr-2" /> Reload
              </Button>
              <Button variant="outline" size="sm" onClick={clearErrors}>
                <Trash2 className="h-4 w-4 mr-2" /> Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {errors.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                No errors captured yet. The page hooks into window/console after mount; navigate around the app and return here.
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {errors.map((e, i) => (
                    <div key={i} className="rounded-md border p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline">{e.type}</Badge>
                        <span className="text-muted-foreground">{new Date(e.ts).toLocaleString()}</span>
                      </div>
                      <div className="font-mono break-all text-foreground">{e.message}</div>
                      {e.source && <div className="text-muted-foreground mt-1">{e.source}</div>}
                      {e.stack && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-muted-foreground">Stack</summary>
                          <pre className="mt-1 whitespace-pre-wrap text-[11px] text-muted-foreground">{e.stack}</pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
