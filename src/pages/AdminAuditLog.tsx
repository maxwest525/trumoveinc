import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { SharedSidebar } from "@/components/layout/SharedSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Download, RefreshCw, Search, Shield } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface AuditRow {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: "INSERT" | "UPDATE" | "DELETE";
  table_name: string;
  record_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_fields: string[] | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

const PAGE_SIZE = 100;

export default function AdminAuditLog() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [selected, setSelected] = useState<AuditRow | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (error) {
      toast.error("Failed to load audit log: " + error.message);
      setRows([]);
    } else {
      setRows((data ?? []) as AuditRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const tableNames = useMemo(
    () => Array.from(new Set(rows.map((r) => r.table_name))).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (actionFilter !== "all" && r.action !== actionFilter) return false;
      if (tableFilter !== "all" && r.table_name !== tableFilter) return false;
      if (!q) return true;
      return (
        (r.actor_email ?? "").toLowerCase().includes(q) ||
        (r.record_id ?? "").toLowerCase().includes(q) ||
        r.table_name.toLowerCase().includes(q)
      );
    });
  }, [rows, search, actionFilter, tableFilter]);

  const exportCsv = () => {
    const header = [
      "timestamp", "actor_email", "action", "table", "record_id", "changed_fields",
    ];
    const lines = [header.join(",")];
    for (const r of filtered) {
      lines.push([
        r.created_at,
        r.actor_email ?? "",
        r.action,
        r.table_name,
        r.record_id ?? "",
        (r.changed_fields ?? []).join("|"),
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${format(new Date(), "yyyyMMdd-HHmm")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const actionBadge = (a: AuditRow["action"]) => {
    const map: Record<string, string> = {
      INSERT: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
      UPDATE: "bg-blue-500/15 text-blue-700 border-blue-500/30",
      DELETE: "bg-red-500/15 text-red-700 border-red-500/30",
    };
    return (
      <Badge variant="outline" className={map[a]}>{a}</Badge>
    );
  };

  return (
    <>
      <Helmet>
        <title>Audit Log | Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="flex min-h-screen bg-background">
        <SharedSidebar role="admin" />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl p-6 space-y-6">
            <header className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Audit Log</h1>
                  <p className="text-sm text-muted-foreground">
                    System-wide record of changes for compliance. Retained 365 days.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={load} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={exportCsv} disabled={!filtered.length}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </header>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Filters</CardTitle>
                <CardDescription>
                  Showing latest {PAGE_SIZE} entries. {filtered.length} match current filters.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search actor, record id, table…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger><SelectValue placeholder="Action" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All actions</SelectItem>
                      <SelectItem value="INSERT">Insert</SelectItem>
                      <SelectItem value="UPDATE">Update</SelectItem>
                      <SelectItem value="DELETE">Delete</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={tableFilter} onValueChange={setTableFilter}>
                    <SelectTrigger><SelectValue placeholder="Table" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All tables</SelectItem>
                      {tableNames.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[160px]">Timestamp</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Record</TableHead>
                      <TableHead>Changed fields</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Loading…</TableCell></TableRow>
                    ) : filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No entries match.</TableCell></TableRow>
                    ) : (
                      filtered.map((r) => (
                        <TableRow
                          key={r.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelected(r)}
                        >
                          <TableCell className="font-mono text-xs">
                            {format(new Date(r.created_at), "MMM d, HH:mm:ss")}
                          </TableCell>
                          <TableCell className="text-sm">
                            {r.actor_email ?? <span className="text-muted-foreground">system</span>}
                          </TableCell>
                          <TableCell>{actionBadge(r.action)}</TableCell>
                          <TableCell className="font-mono text-xs">{r.table_name}</TableCell>
                          <TableCell className="font-mono text-xs truncate max-w-[200px]">
                            {r.record_id ?? "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {r.changed_fields?.length ? r.changed_fields.slice(0, 3).join(", ") + (r.changed_fields.length > 3 ? `, +${r.changed_fields.length - 3}` : "") : "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {actionBadge(selected.action)}
                  <span className="font-mono text-sm">{selected.table_name}</span>
                </SheetTitle>
                <SheetDescription>
                  {format(new Date(selected.created_at), "PPpp")} · {selected.actor_email ?? "system"}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4 text-sm">
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Record ID</div>
                  <code className="block bg-muted p-2 rounded text-xs break-all">{selected.record_id ?? "—"}</code>
                </div>
                {selected.changed_fields?.length ? (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Changed fields</div>
                    <div className="flex flex-wrap gap-1">
                      {selected.changed_fields.map((f) => (
                        <Badge key={f} variant="secondary" className="font-mono text-xs">{f}</Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                {selected.old_data && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Before</div>
                    <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-64">
                      {JSON.stringify(selected.old_data, null, 2)}
                    </pre>
                  </div>
                )}
                {selected.new_data && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">After</div>
                    <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-64">
                      {JSON.stringify(selected.new_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
