import { useState, useEffect, type ReactNode } from "react";
import CrmFooter from "./CrmFooter";
import { supabase } from "@/integrations/supabase/client";
import { useOpenRequestCount } from "@/hooks/useOpenRequestCount";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Sun, Moon, Bell, LayoutDashboard,
  Target, AlertTriangle, CheckCircle, BarChart3,
  Gauge, Activity, MessageSquare, Trophy,
  Menu, X, ClipboardList,
} from "lucide-react";
import logoImg from "@/assets/logo.png";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { setPortalContext } from "@/hooks/usePortalContext";
import { useIsMobile } from "@/hooks/use-mobile";
import ShellBreadcrumbs, { type BreadcrumbSegment } from "@/components/layout/ShellBreadcrumbs";


const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/manager/dashboard" },
  { label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
  { label: "Pulse Compliance", icon: Activity, href: "/manager/pulse" },
  { label: "Employee Requests", icon: ClipboardList, href: "/manager/employee-requests" },
];

const ADVANCED_ITEMS: { label: string; icon: typeof Target; badge?: number; href?: string }[] = [
  { label: "Estimates Oversight", icon: Target },
];

interface ManagerShellProps {
  children: ReactNode;
  breadcrumb?: string;
  breadcrumbs?: BreadcrumbSegment[];
}

export default function ManagerShell({ children, breadcrumb = "", breadcrumbs }: ManagerShellProps) {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openRequestCount = useOpenRequestCount();

  useEffect(() => {
    setPortalContext("manager");
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const sidebarContent = (
    <>
      <div className="px-4 py-4 flex items-center gap-2">
        <img src={logoImg} alt="TruMove" className="h-6" />
        <span className="text-[10px] text-muted-foreground ml-1">Manager</span>
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto p-1 rounded-lg hover:bg-muted">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.href;
          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" /><span>{item.label}</span>
              {item.label === 'Employee Requests' && openRequestCount > 0 && (
                <span className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-semibold bg-destructive text-destructive-foreground leading-none px-1">
                  {openRequestCount > 99 ? '99+' : openRequestCount}
                </span>
              )}
            </Link>
          );
        })}

        {ADVANCED_ITEMS.map((item) => {
          const Icon = item.icon;
          if (item.href) {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                  active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" /><span>{item.label}</span>
                {item.badge ? <span className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-semibold bg-foreground text-background leading-none px-1">{item.badge}</span> : null}
              </Link>
            );
          }
          return (
            <button
              key={item.label}
              onClick={() => toast.info(`${item.label} coming soon`)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Icon className="w-4 h-4" /><span>{item.label}</span>
              {item.badge ? <span className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-semibold bg-foreground text-background leading-none px-1">{item.badge}</span> : null}
            </button>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {!isMobile && (
        <aside className="w-52 shrink-0 border-r border-border bg-card flex flex-col min-h-screen">
          {sidebarContent}
        </aside>
      )}

      {isMobile && sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-52 z-50 bg-card border-r border-border flex flex-col">
            {sidebarContent}
          </aside>
        </>
      )}

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="h-12 border-b border-border bg-card flex items-center justify-between px-3 sm:px-4 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <Menu className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <Link
              to="/manager/team-chat"
              className={cn(
                "p-1.5 rounded-lg transition-colors relative",
                location.pathname === "/manager/team-chat" ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
              )}
            >
              <MessageSquare className="w-4 h-4" />
            </Link>
            <div className="w-px h-5 bg-border" />
            <Link to="/" className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <Home className="w-4 h-4 text-muted-foreground" />
            </Link>
            <ShellBreadcrumbs
              root={{ label: "Management", href: "/manager/dashboard" }}
              segments={breadcrumbs}
              legacyString={!breadcrumbs ? breadcrumb : undefined}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground ml-1">MW</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 max-w-[1400px] mx-auto w-full">
          {children}
        </main>
        <CrmFooter />
      </div>
    </div>
  );
}
