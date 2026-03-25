import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Bell, Menu, X,
  LayoutDashboard, Search, Megaphone, Globe, ListTodo, Settings,
  Bot,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { setPortalContext } from "@/hooks/usePortalContext";
import { useIsMobile } from "@/hooks/use-mobile";

import logoImg from "@/assets/logo.png";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/marketing/dashboard" },
  { label: "SEO & GEO Agent", icon: Search, href: "/marketing/seo" },
  { label: "Paid Ads Agent", icon: Megaphone, href: "/marketing/ads" },
  { label: "Website Agent", icon: Globe, href: "/marketing/website" },
  { label: "Templates", icon: FileText, href: "/marketing/templates" },
  { label: "Tasks", icon: ListTodo, href: "/marketing/tasks" },
  { label: "Settings", icon: Settings, href: "/marketing/settings" },
];

interface MarketingShellProps {
  children: ReactNode;
  breadcrumb?: string;
}

export default function MarketingShell({ children, breadcrumb = "" }: MarketingShellProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setPortalContext("admin");
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const sidebarContent = (
    <>
      <div className="px-4 py-4 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground tracking-tight leading-none">Mega</span>
          <span className="text-[9px] text-muted-foreground leading-none mt-0.5">AI Marketing Agents</span>
        </div>
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
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Agent status footer */}
      <div className="px-3 py-3 border-t border-border">
        <div className="space-y-1.5">
          {[
            { label: "SEO Agent", status: "active" },
            { label: "Ads Agent", status: "active" },
            { label: "Website Agent", status: "idle" },
          ].map((a) => (
            <div key={a.label} className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">{a.label}</span>
              <span className="flex items-center gap-1">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  a.status === "active" ? "bg-emerald-500" : "bg-muted-foreground/40"
                )} />
                <span className={cn(
                  a.status === "active" ? "text-emerald-600" : "text-muted-foreground"
                )}>{a.status === "active" ? "Active" : "Idle"}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-52 shrink-0 border-r border-border bg-card flex flex-col min-h-screen">
          {sidebarContent}
        </aside>
      )}

      {/* Mobile Sidebar Overlay */}
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
            <Link to="/" className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0">
              <Home className="w-4 h-4 text-muted-foreground" />
            </Link>
            <span className="text-sm text-muted-foreground truncate hidden sm:inline">Marketing{breadcrumb}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
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
