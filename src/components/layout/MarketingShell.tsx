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

interface MarketingShellProps {
  children: ReactNode;
  breadcrumb?: string;
  breadcrumbs?: BreadcrumbSegment[];
}

export default function MarketingShell({ children, breadcrumb = "", breadcrumbs }: MarketingShellProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setPortalContext("admin");
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const sidebarWidth = collapsed ? "w-14" : "w-56";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {!isMobile && (
        <aside className={cn("shrink-0 border-r border-border flex flex-col min-h-screen transition-all duration-200", sidebarWidth)}>
          <SharedSidebar title="Marketing" role="marketing" collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} isMobile={false} />
        </aside>
      )}

      {isMobile && sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-56 z-50 border-r border-border flex flex-col">
            <SharedSidebar title="Marketing" role="marketing" collapsed={false} onToggleCollapse={() => {}} onClose={() => setSidebarOpen(false)} isMobile={true} />
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
            <Link to="/" className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0 flex items-center gap-1">
              <Home className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Home</span>
            </Link>
            <div className="w-px h-5 bg-border" />
            <ShellBreadcrumbs
              root={{ label: "Marketing", href: "/marketing/dashboard" }}
              segments={breadcrumbs}
              legacyString={!breadcrumbs ? breadcrumb : undefined}
            />
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/marketing/team-chat"
              className={cn(
                "p-1.5 rounded-lg transition-colors relative flex items-center gap-1",
                location.pathname === "/marketing/team-chat" ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
              )}
              aria-label="Team Chat"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-medium">Chat</span>
            </Link>
            <div className="w-px h-5 bg-border" />
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
