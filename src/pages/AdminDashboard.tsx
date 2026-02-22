import AdminShell from "@/components/layout/AdminShell";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const STATS = [
  { label: "Total Users", value: "48", sub: "5 pending invites" },
  { label: "Active Sessions", value: "23" },
  { label: "Integrations", value: "0/4", sub: "Connected" },
  { label: "Automations", value: "3", sub: "Active" },
];

const QUICK_SETUP = [
  { title: "Add new user", sub: "Invite team members" },
  { title: "Connect DashClicks", sub: "Set up API integration" },
  { title: "Configure analytics", sub: "Connect tracking pixels" },
];

const INTEGRATIONS = [
  { name: "DashClicks", status: "disconnected" },
  { name: "Google Analytics", status: "disconnected" },
  { name: "Meta Pixel", status: "disconnected" },
  { name: "Stripe", status: "disconnected" },
];

const USERS_BY_ROLE = [
  { role: "Admins", count: 3 },
  { role: "Managers", count: 8 },
  { role: "Agents", count: 35 },
  { role: "Demos", count: 2 },
];

const ROLE_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

const ACTIVITY_DATA = [
  { day: "Mon", logins: 32, actions: 85 },
  { day: "Tue", logins: 28, actions: 72 },
  { day: "Wed", logins: 45, actions: 110 },
  { day: "Thu", logins: 38, actions: 95 },
  { day: "Fri", logins: 42, actions: 120 },
  { day: "Sat", logins: 12, actions: 30 },
  { day: "Sun", logins: 8, actions: 18 },
];

const GROWTH_DATA = [
  { month: "Sep", users: 22 },
  { month: "Oct", users: 28 },
  { month: "Nov", users: 31 },
  { month: "Dec", users: 36 },
  { month: "Jan", users: 42 },
  { month: "Feb", users: 48 },
];

export default function AdminDashboard() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">System configuration and settings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <div className="mt-2 text-2xl font-bold text-foreground">{s.value}</div>
              {s.sub && <span className="text-[11px] text-muted-foreground">{s.sub}</span>}
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Activity bar chart */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-4">Weekly Activity</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={ACTIVITY_DATA} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={30} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Bar dataKey="logins" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Logins" />
                <Bar dataKey="actions" fill="hsl(var(--muted-foreground) / 0.3)" radius={[3, 3, 0, 0]} name="Actions" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Users by role pie */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-2">Users by Role</h2>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={USERS_BY_ROLE} dataKey="count" nameKey="role" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3}>
                  {USERS_BY_ROLE.map((_, i) => (
                    <Cell key={i} fill={ROLE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-1">
              {USERS_BY_ROLE.map((u, i) => (
                <div key={u.role} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: ROLE_COLORS[i] }} />
                  <span className="text-[11px] text-muted-foreground">{u.role} ({u.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Growth + Quick Setup + Integrations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Growth line chart */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-4">User Growth</h2>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={GROWTH_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={30} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Setup */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Quick Setup</h2>
            {QUICK_SETUP.map((q, i) => (
              <div key={i} className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{q.title}</p>
                  <p className="text-xs text-muted-foreground">{q.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Integrations */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Integrations</h2>
            {INTEGRATIONS.map((int, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  <span className="text-sm text-foreground">{int.name}</span>
                </div>
                <span className="text-[11px] text-muted-foreground border border-border rounded px-2 py-0.5">{int.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
