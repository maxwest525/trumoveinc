import { Eye, CheckSquare, FileText, CalendarCheck, ChevronRight } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const WEEKLY_LEADS = [
  { day: "Mon", leads: 3, booked: 1 },
  { day: "Tue", leads: 5, booked: 2 },
  { day: "Wed", leads: 4, booked: 1 },
  { day: "Thu", leads: 6, booked: 3 },
  { day: "Fri", leads: 7, booked: 2 },
  { day: "Sat", leads: 2, booked: 1 },
  { day: "Sun", leads: 1, booked: 0 },
];

const PIPELINE_DATA = [
  { stage: "New Lead", count: 12 },
  { stage: "Inventory", count: 8 },
  { stage: "Estimate", count: 7 },
  { stage: "Booked", count: 4 },
];

const PIPELINE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

const STATS = [
  { label: "New Leads Today", value: "8", change: "+12%", icon: Eye },
  { label: "Tasks Due", value: "5", sub: "2 overdue", icon: CheckSquare },
  { label: "Active Estimates", value: "7", change: "+3%", icon: FileText },
  { label: "Bookings This Week", value: "4", icon: CalendarCheck },
];

const NEXT_ACTIONS = [
  { title: "Send inventory to John Smith for approval", sub: "450 CF — awaiting customer review", icon: FileText },
  { title: "Generate estimate for Sarah Johnson", sub: "Inventory approved — ready for pricing", icon: FileText },
  { title: "Follow up with Williams family", sub: "Estimate viewed 2 days ago — no response", icon: Eye },
  { title: "Collect BOL signature — Martinez move", sub: "Pickup scheduled for tomorrow", icon: FileText },
  { title: "Confirm dispatch for booking #1052", sub: "Crew assigned — awaiting confirmation", icon: CalendarCheck },
];

const CLIENT_ACTIVITY = [
  { name: "John Smith", action: "Viewed inventory list", time: "10 min ago" },
  { name: "Sarah Johnson", action: "Signed estimate", time: "1 hour ago" },
  { name: "Mike Williams", action: "Opened estimate email", time: "2 hours ago" },
  { name: "Lisa Chen", action: "Submitted ACH authorization", time: "3 hours ago" },
];

export default function AgentDashboardContent() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back! Here's what needs your attention today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <Icon className="w-4 h-4 text-muted-foreground/50" />
              </div>
              <div className="mt-2 text-2xl font-bold text-foreground">{s.value}</div>
              {s.change && <span className="text-[11px]" style={{ color: "hsl(142 71% 45%)" }}>{s.change}</span>}
              {s.sub && <span className="text-[11px] text-muted-foreground">{s.sub}</span>}
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Weekly Leads</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={WEEKLY_LEADS}>
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
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={PIPELINE_DATA} dataKey="count" nameKey="stage" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={4}>
                {PIPELINE_DATA.map((_, idx) => (
                  <Cell key={idx} fill={PIPELINE_COLORS[idx]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
            {PIPELINE_DATA.map((d, i) => (
              <span key={i} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ background: PIPELINE_COLORS[i] }} />
                {d.stage}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Two-column: Next Actions + Client Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Next Actions */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Next Actions</h2>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">View all tasks</button>
          </div>
          <div className="space-y-0">
            {NEXT_ACTIONS.map((a, i) => {
              const Icon = a.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                >
                  <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Client Activity */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Client Activity</h2>
          <div className="space-y-0">
            {CLIENT_ACTIVITY.map((c, i) => (
              <div key={i} className="flex items-center justify-between py-3 px-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.action}</p>
                </div>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">{c.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
