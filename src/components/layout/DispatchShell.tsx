import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Bell, Menu, MessageSquare, Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { setPortalContext } from "@/hooks/usePortalContext";
import { useIsMobile } from "@/hooks/use-mobile";
import ShellBreadcrumbs, { type BreadcrumbSegment } from "@/components/layout/ShellBreadcrumbs";
import SharedSidebar from "@/components/layout/SharedSidebar";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

interface DispatchShellProps {
  children: ReactNode;
  breadcrumb?: string;
  breadcrumbs?: BreadcrumbSegment[];
}

export default function DispatchShell({ children, breadcrumb = "", breadcrumbs }: DispatchShellProps) {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setPortalContext("dispatch");
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const sidebarWidth = collapsed ? "w-14" : "w-56";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {!isMobile && (
        <aside className={cn("shrink-0 border-r border-border flex flex-col min-h-screen transition-all duration-200", sidebarWidth)}>
          <SharedSidebar title="Dispatch" role="dispatch" collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} isMobile={false} />
        </aside>
      )}

      {isMobile && sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-56 z-50 border-r border-border flex flex-col">
            <SharedSidebar title="Dispatch" role="dispatch" collapsed={false} onToggleCollapse={() => {}} onClose={() => setSidebarOpen(false)} isMobile={true} />
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
              to="/dispatch/team-chat"
              className={cn(
                "p-1.5 rounded-lg transition-colors relative flex items-center gap-1",
                location.pathname === "/dispatch/team-chat" ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
              )}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-medium">Chat</span>
            </Link>
            <div className="w-px h-5 bg-border" />
            <Link to="/" className="p-1.5 rounded-lg hover:bg-muted transition-colors flex items-center gap-1">
              <Home className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Home</span>
            </Link>
            <div className="w-px h-5 bg-border" />
            <ShellBreadcrumbs
              root={{ label: "Dispatch", href: "/dispatch/dashboard" }}
              segments={breadcrumbs}
              legacyString={!breadcrumbs ? breadcrumb : undefined}
            />
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
            </button>
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground ml-1">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 max-w-[1400px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
