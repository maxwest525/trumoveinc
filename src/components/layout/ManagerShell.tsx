import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Bell, Menu, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { setPortalContext } from "@/hooks/usePortalContext";
import { useIsMobile } from "@/hooks/use-mobile";
import ShellBreadcrumbs, { type BreadcrumbSegment } from "@/components/layout/ShellBreadcrumbs";
import SharedSidebar from "@/components/layout/SharedSidebar";

interface ManagerShellProps {
  children: ReactNode;
  breadcrumb?: string;
  breadcrumbs?: BreadcrumbSegment[];
}

export default function ManagerShell({ children, breadcrumb = "", breadcrumbs }: ManagerShellProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setPortalContext("manager");
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const sidebarWidth = collapsed ? "w-14" : "w-56";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {!isMobile && (
        <aside className={cn("shrink-0 border-r border-border flex flex-col min-h-screen transition-all duration-200", sidebarWidth)}>
          <SharedSidebar title="Manager" role="manager" collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} isMobile={false} />
        </aside>
      )}

      {isMobile && sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-56 z-50 border-r border-border flex flex-col">
            <SharedSidebar title="Manager" role="manager" collapsed={false} onToggleCollapse={() => {}} onClose={() => setSidebarOpen(false)} isMobile={true} />
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
            <Link to="/" className="p-1.5 rounded-lg hover:bg-muted transition-colors flex items-center gap-1">
              <Home className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Home</span>
            </Link>
            <div className="w-px h-5 bg-border" />
            <ShellBreadcrumbs
              root={{ label: "Management", href: "/manager/dashboard" }}
              segments={breadcrumbs}
              legacyString={!breadcrumbs ? breadcrumb : undefined}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              to="/manager/team-chat"
              className={cn(
                "p-1.5 rounded-lg transition-colors relative flex items-center",
                location.pathname === "/manager/team-chat" ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
              )}
              aria-label="Team Chat"
            >
              <MessageSquare className="w-4 h-4" />
            </Link>
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors relative" aria-label="Notifications">
              <Bell className="w-4 h-4 text-muted-foreground" />
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
