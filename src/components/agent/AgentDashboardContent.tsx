import { useEffect, useState } from "react";
import {
  Eye, CheckSquare, FileText, CalendarCheck, ChevronRight, DollarSign,
  TrendingUp, Users, Clock, Wrench, Phone, Target, Percent, BarChart3,
  Plus, Minus,
} from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

const PIPELINE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

interface TaskItem {
  id: string;
  subject: string | null;
  description: string | null;
  due_date: string | null;
  type: string;
}

const ALL_KPI_KEYS = [
  "newLeadsToday", "tasksDue", "revenue", "conversionRate",
  "totalCustomers", "bookingsThisWeek", "activeEstimates", "tasksOverdue",
] as const;

type KpiKey = typeof ALL_KPI_KEYS[number];

const KPI_CONFIG: Record<KpiKey, { label: string; icon: any }> = {
  newLeadsToday: { label: "New Leads Today", icon: Eye },
  tasksDue: { label: "Tasks Due", icon: CheckSquare },
  revenue: { label: "Revenue", icon: DollarSign },
  conversionRate: { label: "Conversion Rate", icon: TrendingUp },
  totalCustomers: { label: "Total Customers", icon: Users },
  bookingsThisWeek: { label: "Bookings This Week", icon: CalendarCheck },
  activeEstimates: { label: "Active Estimates", icon: FileText },
  tasksOverdue: { label: "Overdue Tasks", icon: Clock },
};

const DEFAULT_VISIBLE: KpiKey[] = [
  "newLeadsToday", "tasksDue", "revenue", "conversionRate", "totalCustomers", "bookingsThisWeek",
];

function loadVisibleKpis(): KpiKey[] {
  try {
    const saved = localStorage.getItem("agent-dashboard-kpis");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_VISIBLE;
}

function saveVisibleKpis(keys: KpiKey[]) {
  localStorage.setItem("agent-dashboard-kpis", JSON.stringify(keys));
}

export default function AgentDashboardContent() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    newLeadsToday: 0, tasksDue: 0, tasksOverdue: 0, activeEstimates: 0, bookingsThisWeek: 0,
    totalRevenue: 0, conversionRate: 0, totalCustomers: 0,
  });
  const [weeklyLeads, setWeeklyLeads] = useState<{ day: string; leads: number; booked: number }[]>([]);
  const [pipelineData, setPipelineData] = useState<{ stage: string; count: number }[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [visibleKpis, setVisibleKpis] = useState<KpiKey[]>(loadVisibleKpis);

  const toggleKpi = (key: KpiKey) => {
    setVisibleKpis(prev => {
      const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
      saveVisibleKpis(next);
      return next;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1).toISOString();

      const [leadsRes, dealsRes, activitiesRes, stagesRes] = await Promise.all([
        supabase.from("leads").select("id, created_at, first_name, last_name, status"),
        supabase.from("deals").select("id, stage, lead_id, created_at, deal_value, actual_revenue, leads(first_name, last_name)"),
        supabase.from("activities").select("id, subject, description, type, due_date, is_done, created_at"),
        supabase.from("pipeline_stages").select("*").order("display_order"),
      ]);

      const leads = (leadsRes.data as any[]) || [];
      const deals = (dealsRes.data as any[]) || [];
      const activities = (activitiesRes.data as any[]) || [];
      const stages = (stagesRes.data as any[]) || [];

      const newLeadsToday = leads.filter(l => l.created_at >= todayStart).length;
      const tasksDue = activities.filter(a => !a.is_done && a.due_date).length;
      const tasksOverdue = activities.filter(a => !a.is_done && a.due_date && new Date(a.due_date) < now).length;
      const activeEstimates = deals.filter(d => d.stage === "estimate_sent").length;
      const bookingsThisWeek = deals.filter(d => d.stage === "booked" && d.created_at >= weekStart).length;
      const totalRevenue = deals.reduce((sum, d) => sum + (d.actual_revenue || d.deal_value || 0), 0);
      const closedWon = deals.filter(d => d.stage === "closed_won").length;
      const conversionRate = leads.length > 0 ? Math.round((closedWon / leads.length) * 100) : 0;
      const totalCustomers = leads.length;

      setStats({ newLeadsToday, tasksDue, tasksOverdue, activeEstimates, bookingsThisWeek, totalRevenue, conversionRate, totalCustomers });

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weekly: Record<string, { leads: number; booked: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        weekly[dayNames[d.getDay()]] = { leads: 0, booked: 0 };
      }
      leads.forEach(l => {
        const d = new Date(l.created_at);
        const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diff < 7) { const key = dayNames[d.getDay()]; if (weekly[key]) weekly[key].leads++; }
      });
      deals.forEach(d => {
        const dt = new Date(d.created_at);
        const diff = Math.floor((now.getTime() - dt.getTime()) / (1000 * 60 * 60 * 24));
        if (diff < 7 && d.stage === "booked") { const key = dayNames[dt.getDay()]; if (weekly[key]) weekly[key].booked++; }
      });
      setWeeklyLeads(Object.entries(weekly).map(([day, v]) => ({ day, ...v })));

      const activeStages = stages.filter(s => !["closed_won", "closed_lost"].includes(s.stage_key));
      const pipeline = activeStages.map(s => ({
        stage: s.name,
        count: deals.filter(d => d.stage === s.stage_key).length,
      })).filter(d => d.count > 0);
      setPipelineData(pipeline);

      const pending = activities
        .filter(a => !a.is_done)
        .sort((a, b) => (a.due_date || a.created_at).localeCompare(b.due_date || b.created_at))
        .slice(0, 8);
      setTasks(pending);
      setLoading(false);
    };
    fetchData();
  }, []);

  const toggleTask = async (taskId: string) => {
    await supabase.from("activities").update({ is_done: true, completed_at: new Date().toISOString() }).eq("id", taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setStats(prev => ({ ...prev, tasksDue: prev.tasksDue - 1 }));
  };

  if (loading) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto">
        <p className="text-sm text-muted-foreground text-center py-8">Loading dashboard...</p>
      </div>
    );
  }

  const kpiValues: Record<KpiKey, { value: string; sub?: string }> = {
    newLeadsToday: { value: String(stats.newLeadsToday) },
    tasksDue: { value: String(stats.tasksDue), sub: stats.tasksOverdue > 0 ? `${stats.tasksOverdue} overdue` : undefined },
    revenue: { value: `$${stats.totalRevenue.toLocaleString()}` },
    conversionRate: { value: `${stats.conversionRate}%` },
    totalCustomers: { value: String(stats.totalCustomers) },
    bookingsThisWeek: { value: String(stats.bookingsThisWeek) },
    activeEstimates: { value: String(stats.activeEstimates) },
    tasksOverdue: { value: String(stats.tasksOverdue) },
  };

  return (
    <div className="p-3 sm:p-6 max-w-[1400px] mx-auto space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">Welcome back! Here's what needs attention.</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 sm:px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all shrink-0">
              <Wrench className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Customize</span>
              <span className="sm:hidden">Edit</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-0 bg-popover" sideOffset={8}>
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Dashboard KPIs</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Toggle metrics on or off</p>
            </div>
            <div className="py-2">
              {ALL_KPI_KEYS.map(key => {
                const cfg = KPI_CONFIG[key];
                const Icon = cfg.icon;
                const enabled = visibleKpis.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleKpi(key)}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-foreground flex-1 text-left">{cfg.label}</span>
                    <Switch checked={enabled} className="pointer-events-none scale-75" />
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* KPI Stats */}
      {visibleKpis.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {visibleKpis.map((key) => {
            const cfg = KPI_CONFIG[key];
            const val = kpiValues[key];
            const Icon = cfg.icon;
            return (
              <div key={key} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <span className="text-xs text-muted-foreground">{cfg.label}</span>
                  <Icon className="w-4 h-4 text-muted-foreground/50" />
                </div>
                <div className="mt-2 text-2xl font-bold text-foreground">{val.value}</div>
                {val.sub && <span className="text-[11px] text-muted-foreground">{val.sub}</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Charts + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Weekly Leads</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyLeads}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Leads" />
              <Bar dataKey="booked" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Booked" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Pipeline Breakdown</h2>
          {pipelineData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pipelineData} dataKey="count" nameKey="stage" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={4}>
                    {pipelineData.map((_, idx) => (
                      <Cell key={idx} fill={PIPELINE_COLORS[idx % PIPELINE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
                {pipelineData.map((d, i) => (
                  <span key={i} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ background: PIPELINE_COLORS[i % PIPELINE_COLORS.length] }} />
                    {d.stage}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-12">No active deals</p>
          )}
        </div>
      </div>

      {/* Tasks */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">My Tasks</h2>
          <span className="text-xs text-muted-foreground">{tasks.length} pending</span>
        </div>
        <div className="space-y-0">
          {tasks.length > 0 ? tasks.map((t) => {
            const isOverdue = t.due_date && new Date(t.due_date) < new Date();
            return (
              <div key={t.id} className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors group">
                <button
                  onClick={() => toggleTask(t.id)}
                  className="w-4 h-4 rounded border border-border shrink-0 hover:border-primary hover:bg-primary/10 transition-colors"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{t.subject || "Untitled task"}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.description || t.type?.replace("_", " ") || ""}</p>
                </div>
                {t.due_date && (
                  <span className={`text-[11px] shrink-0 flex items-center gap-1 ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                    <Clock className="w-3 h-3" />
                    {new Date(t.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            );
          }) : (
            <p className="text-xs text-muted-foreground text-center py-6">No pending tasks 🎉</p>
          )}
        </div>
      </div>
    </div>
  );
}
