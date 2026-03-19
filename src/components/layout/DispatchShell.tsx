import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Sun, Moon, Bell, LayoutDashboard,
  Truck, MapPin, Users, Route, ClipboardList,
  MessageSquare,
} from "lucide-react";
import logoImg from "@/assets/logo.png";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { setPortalContext } from "@/hooks/usePortalContext";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dispatch/dashboard" },
  { label: "Fleet Tracker", icon: MapPin, href: "/dispatch/fleet" },
  { label: "Driver Assignments", icon: Users, href: "/dispatch/drivers" },
  { label: "Route Management", icon: Route, href: "/dispatch/routes" },
  { label: "Job Board", icon: ClipboardList, href: "/dispatch/jobs" },
];

interface DispatchShellProps {
  children: ReactNode;
  breadcrumb?: string;
}

export default function DispatchShell({ children, breadcrumb = "" }: DispatchShellProps) {
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    setPortalContext("dispatch");
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 border-r border-border bg-card flex flex-col min-h-screen">
        <div className="px-4 py-4 flex items-center gap-2">
          <img src={logoImg} alt="TruMove" className="h-6" />
          <span className="text-[10px] text-muted-foreground ml-1">Dispatch</span>
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
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <Home className="w-4 h-4 text-muted-foreground" />
            </Link>
            <span className="text-sm text-muted-foreground">Dispatch{breadcrumb}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style={{ background: "hsl(142 71% 45%)" }} />
            </button>
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground ml-1">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 max-w-[1400px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
