import { useEffect, useState } from "react";
import AgentSidebar, { type SidebarAction } from "@/components/agent/AgentSidebar";
import { Home, Sun, Moon, Bell, Search, LayoutDashboard, Users, Target, CalendarCheck, Headphones, AlertTriangle, CheckCircle, BarChart3, RotateCcw, MoreHorizontal, ChevronDown, ChevronUp, Gauge, Globe, Link2, Package, Sparkles, LineChart, Zap, ScrollText } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import CustomKpiDashboard from "@/components/kpi/CustomKpiDashboard";
import { CombinedWorkspaceModal } from "@/components/agent/CombinedWorkspaceModal";
import { OperationsCenterModal } from "@/components/agent/OperationsCenterModal";
import { CoachingSummaryModal } from "@/components/coaching/CoachingSummaryModal";
import { InternalMessagingModal } from "@/components/messaging/InternalMessagingModal";
import { usePortalContext } from "@/hooks/usePortalContext";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  disabled?: boolean;
}

const MANAGER_NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/manager/dashboard" },
  { label: "My KPIs", icon: Gauge, href: "/kpi" },
  { label: "Team Pipeline", icon: Users, href: "/manager/dashboard", disabled: true },
  { label: "Bookings Oversight", icon: CalendarCheck, href: "/manager/dashboard", disabled: true },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "My KPIs", icon: Gauge, href: "/kpi" },
  { label: "Users & Roles", icon: Users, href: "/admin/users" },
  { label: "Integrations", icon: Link2, href: "/admin/integrations" },
];

function ManagerAdminSidebar({ role }: { role: "manager" | "admin" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAdvanced] = useState(false);

  const items = role === "manager" ? MANAGER_NAV : ADMIN_NAV;
  const roleLabel = role === "manager" ? "Manager" : "Admin";

  const handleResetPreference = () => {
    localStorage.removeItem("truemove_remembered_role");
    navigate("/agent-login");
  };

  return (
    <aside className="w-52 shrink-0 border-r border-border bg-card flex flex-col min-h-screen">
      <div className="px-4 py-4 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
          <span className="text-background text-xs font-bold">G</span>
        </div>
        <span className="text-sm font-bold text-foreground tracking-tight">TRUMOVE</span>
        <span className="text-[10px] text-muted-foreground ml-1">{roleLabel}</span>
      </div>
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.href;
          if (item.disabled) {
            return (
              <div key={item.label} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground/50 cursor-not-allowed">
                <Icon className="w-4 h-4" /><span>{item.label}</span>
              </div>
            );
          }
          return (
            <Link key={item.label} to={item.href} className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors", active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              <Icon className="w-4 h-4" /><span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-2 pb-4 space-y-0.5">
        <button onClick={handleResetPreference} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <RotateCcw className="w-4 h-4" /><span>Reset Preference</span>
        </button>
        <Link to="/agent-login" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Home className="w-4 h-4" /><span>Back to Roles</span>
        </Link>
      </div>
    </aside>
  );
}

export default function KpiDashboard() {
  const { theme, setTheme } = useTheme();
  const portalContext = usePortalContext();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [operationsOpen, setOperationsOpen] = useState(false);
  const [coachingOpen, setCoachingOpen] = useState(false);
  const [messagingOpen, setMessagingOpen] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleAction = (action: SidebarAction) => {
    if (action === "workspace") setWorkspaceOpen(true);
    else if (action === "operations") setOperationsOpen(true);
    else if (action === "coaching") setCoachingOpen(true);
    else if (action === "messaging") setMessagingOpen(true);
  };

  const breadcrumbLabel = portalContext === "admin" ? "Admin" : portalContext === "manager" ? "Management" : "Agent";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {portalContext === "agent" ? (
        <AgentSidebar onAction={handleAction} />
      ) : (
        <ManagerAdminSidebar role={portalContext} />
      )}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-background text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all">
              <Globe className="w-3.5 h-3.5" />
              <span>Website</span>
            </Link>
            <div className="w-px h-4 bg-border" />
            <Link to="/agent-login" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Portal</span>
            </Link>
            <span className="text-xs text-muted-foreground">/ {breadcrumbLabel} / KPIs</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style={{ background: "hsl(142 71% 45%)" }} />
            </button>
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground ml-1">MW</div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <CustomKpiDashboard />
        </main>
      </div>

      {portalContext === "agent" && (
        <>
          <CombinedWorkspaceModal open={workspaceOpen} onOpenChange={setWorkspaceOpen} />
          <OperationsCenterModal open={operationsOpen} onOpenChange={setOperationsOpen} />
          <CoachingSummaryModal open={coachingOpen} onOpenChange={setCoachingOpen} />
          <InternalMessagingModal open={messagingOpen} onOpenChange={setMessagingOpen} />
        </>
      )}
    </div>
  );
}
