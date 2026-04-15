import { Link, useLocation } from "react-router-dom";
import {
  BarChart3, PenTool, Megaphone, FlaskConical,
  Zap, ClipboardList, Eye, Settings, ChevronLeft, X,
  Users, FileText, DollarSign, Code, Activity,
  GitPullRequest, UserCheck, Truck, MapPin, Route, Briefcase,
  Phone, MessageSquare, Shield, Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logoImg from "@/assets/logo.png";

interface NavItem {
  label: string;
  subtitle: string;
  icon: React.ElementType;
  href: string;
}

type PortalRole = "agent" | "manager" | "admin" | "marketing" | "dispatch";

// ─── Admin ───
const ADMIN_ITEMS: NavItem[] = [
  { label: "Dashboard", subtitle: "Overview & system health", icon: BarChart3, href: "/admin/dashboard" },
  { label: "Users & Roles", subtitle: "Team accounts & permissions", icon: Users, href: "/admin/users" },
  { label: "Employee Requests", subtitle: "Time off & approvals", icon: FileText, href: "/admin/employee-requests" },
  { label: "Products & Pricing", subtitle: "Services, rates & rules", icon: DollarSign, href: "/admin/pricing" },
  { label: "Developer", subtitle: "API keys & integrations", icon: Code, href: "/admin/developer" },
  { label: "Pulse Settings", subtitle: "Compliance & call monitoring", icon: Activity, href: "/admin/pulse" },
];

// ─── Agent ───
const AGENT_ITEMS: NavItem[] = [
  { label: "Dashboard", subtitle: "Daily overview & tasks", icon: BarChart3, href: "/agent/dashboard" },
  { label: "Pipeline", subtitle: "Deals & stages", icon: GitPullRequest, href: "/agent/pipeline" },
  { label: "Incoming Leads", subtitle: "New leads to work", icon: Zap, href: "/agent/incoming" },
  { label: "My Customers", subtitle: "Contacts & accounts", icon: UserCheck, href: "/agent/customers" },
  { label: "Operations", subtitle: "Jobs & dispatch", icon: Briefcase, href: "/agent/operations" },
  { label: "E-Sign", subtitle: "Documents & signatures", icon: FileText, href: "/agent/esign" },
  { label: "Dialer", subtitle: "Click-to-call & logs", icon: Phone, href: "/agent/dialer" },
  { label: "Messages", subtitle: "SMS & email threads", icon: MessageSquare, href: "/agent/messages" },
  { label: "Pulse", subtitle: "Call coaching & compliance", icon: Shield, href: "/agent/pulse" },
];

// ─── Manager ───
const MANAGER_ITEMS: NavItem[] = [
  { label: "Dashboard", subtitle: "Team performance & KPIs", icon: BarChart3, href: "/manager/dashboard" },
  { label: "Leaderboard", subtitle: "Rankings & competitions", icon: Trophy, href: "/leaderboard" },
  { label: "Pulse Dashboard", subtitle: "Call monitoring & alerts", icon: Activity, href: "/manager/pulse" },
];

// ─── Dispatch ───
const DISPATCH_ITEMS: NavItem[] = [
  { label: "Dashboard", subtitle: "Operations overview", icon: BarChart3, href: "/dispatch/dashboard" },
  { label: "Fleet Tracker", subtitle: "Live vehicle positions", icon: Truck, href: "/dispatch/fleet" },
  { label: "Driver Assignments", subtitle: "Crew & driver mgmt", icon: UserCheck, href: "/dispatch/drivers" },
  { label: "Route Management", subtitle: "Routes & scheduling", icon: Route, href: "/dispatch/routes" },
  { label: "Job Board", subtitle: "Active & pending jobs", icon: ClipboardList, href: "/dispatch/jobs" },
  { label: "E-Sign", subtitle: "BOL & documents", icon: FileText, href: "/dispatch/esign" },
];

// ─── Marketing (grouped) ───
const MARKETING_HQ: NavItem[] = [
  { label: "Dashboard", subtitle: "Performance, alerts & daily actions", icon: BarChart3, href: "/marketing/dashboard" },
];
const MARKETING_ENGINES: NavItem[] = [
  { label: "Content & SEO", subtitle: "Keywords, briefs, blog & rankings", icon: PenTool, href: "/marketing/content-seo" },
  { label: "Advertising", subtitle: "Google Ads, Meta, budgets & spend", icon: Megaphone, href: "/marketing/advertising" },
  { label: "Conversion Lab", subtitle: "A/B tests, funnel & experiments", icon: FlaskConical, href: "/marketing/conversion-lab" },
];
const MARKETING_INTEL: NavItem[] = [
  { label: "Action Items", subtitle: "Recommendations, approvals & results", icon: Zap, href: "/marketing/action-items" },
  { label: "Lead Sources", subtitle: "Vendor scores & lead quality", icon: ClipboardList, href: "/marketing/lead-sources" },
  { label: "Competitors", subtitle: "Tracking, gaps & market intel", icon: Eye, href: "/marketing/competitors" },
];

function getNavConfig(role: PortalRole) {
  switch (role) {
    case "admin": return { groups: [ADMIN_ITEMS] };
    case "agent": return { groups: [AGENT_ITEMS] };
    case "manager": return { groups: [MANAGER_ITEMS] };
    case "dispatch": return { groups: [DISPATCH_ITEMS] };
    case "marketing": return { groups: [MARKETING_HQ, MARKETING_ENGINES, MARKETING_INTEL] };
  }
}

function NavGroup({ items, collapsed, pathname }: { items: NavItem[]; collapsed: boolean; pathname: string }) {
  return (
    <div className="space-y-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors relative",
              active
                ? "bg-[#f0fdf4] text-foreground border-l-[3px] border-[#16a34a] pl-[9px]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title={collapsed ? item.label : undefined}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && (
              <div className="min-w-0">
                <span className="block truncate">{item.label}</span>
                <span className="block text-[10px] text-muted-foreground/70 line-clamp-2 leading-tight">{item.subtitle}</span>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}

interface SharedSidebarProps {
  title: string;
  role: PortalRole;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export default function SharedSidebar({ title, role, collapsed, onToggleCollapse, onClose, isMobile }: SharedSidebarProps) {
  const location = useLocation();
  const { groups } = getNavConfig(role);
  const showSettings = role === "marketing";

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo / collapse toggle */}
      <Link
        to="/dashboard"
        onClick={(e) => {
          if (!isMobile) {
            e.preventDefault();
            onToggleCollapse();
          }
        }}
        className="px-3 py-4 flex items-center gap-2.5 hover:bg-muted/30 transition-colors cursor-pointer"
      >
        <img src={logoImg} alt="TruMove" className="h-6 shrink-0" />
        {!collapsed && (
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-bold text-foreground tracking-tight leading-none">{title}</span>
            <span className="text-[9px] text-muted-foreground leading-none mt-0.5">AI-Powered Growth Engine</span>
          </div>
        )}
        {!collapsed && !isMobile && <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
        {isMobile && onClose && (
          <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); onClose(); }} className="ml-auto p-1 rounded-lg hover:bg-muted">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </Link>

      {/* Navigation groups */}
      <nav className="flex-1 px-2 py-1 overflow-y-auto">
        {groups.map((group, i) => (
          <div key={i}>
            {i > 0 && <div className="h-4" />}
            <NavGroup items={group} collapsed={collapsed} pathname={location.pathname} />
          </div>
        ))}

        {showSettings && (
          <>
            <div className="h-4" />
            <div className="px-0">
              <Link
                to="/marketing/settings"
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                  location.pathname === "/marketing/settings"
                    ? "bg-[#f0fdf4] text-foreground border-l-[3px] border-[#16a34a] pl-[9px]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title={collapsed ? "Settings" : undefined}
              >
                <Settings className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Settings</span>}
              </Link>
            </div>
          </>
        )}
      </nav>
    </div>
  );
}
