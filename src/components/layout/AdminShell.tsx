import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Sun, Moon, Bell, LayoutDashboard, Users, Link2, Package,
  Zap, ScrollText, Gauge, Sparkles, DollarSign,
  FileText, BookOpen, CreditCard, Settings2, MessageSquare, Trophy,
  Menu, X, Globe,
} from "lucide-react";
import logoImg from "@/assets/logo.png";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { setPortalContext } from "@/hooks/usePortalContext";
import { useIsMobile } from "@/hooks/use-mobile";


const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Users & Roles", icon: Users, href: "/admin/users" },
  { label: "Employee Requests", icon: FileText, href: "/admin/employee-requests" },
  { label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
  { label: "Products & Pricing", icon: DollarSign, href: "/admin/pricing" },
  { label: "Developer", icon: Link2, href: "/admin/developer" },
  { label: "Pulse Settings", icon: Settings2, href: "/admin/pulse" },
  { label: "Domains", icon: Globe, href: "/admin/domains" },
];

const ADVANCED_ITEMS = [
  { label: "Audit Log", icon: ScrollText },
];

interface AdminShellProps {
  children: ReactNode;
  breadcrumb?: string;
}

export default function AdminShell({ children, breadcrumb = "" }: AdminShellProps) {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setPortalContext("admin");
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const sidebarContent = (
    <>
      <div className="px-4 py-4 flex items-center gap-2">
        <img src={logoImg} alt="TruMove" className="h-6" />
        <span className="text-[10px] text-muted-foreground ml-1">Admin</span>
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto p-1 rounded-lg hover:bg-muted">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
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
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {ADVANCED_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => toast.info(`${item.label} coming soon`)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="w-52 shrink-0 border-r border-border bg-card flex flex-col min-h-screen">
          {sidebarContent}
        </aside>
      )}

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-52 z-50 bg-card border-r border-border flex flex-col">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="h-12 border-b border-border bg-card flex items-center justify-between px-3 sm:px-4 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <Menu className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <Link to="/" className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <Home className="w-4 h-4 text-muted-foreground" />
            </Link>
            <span className="text-sm text-muted-foreground truncate">Admin{breadcrumb}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              to="/admin/team-chat"
              className={`p-1.5 rounded-lg transition-colors relative ${
                location.pathname === "/admin/team-chat" ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </Link>
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style={{ background: "hsl(142 71% 45%)" }} />
            </button>
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground ml-1">MW</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 max-w-[1400px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
