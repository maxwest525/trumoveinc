import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Bell, Menu, X, MessageSquare,
  FileText, Search, Swords, Megaphone, PenTool, BarChart3,
  Link2, Shield, Target, Sparkles, Rocket, Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { setPortalContext } from "@/hooks/usePortalContext";
import { useIsMobile } from "@/hooks/use-mobile";
import ShellBreadcrumbs, { type BreadcrumbSegment } from "@/components/layout/ShellBreadcrumbs";
import logoImg from "@/assets/logo.png";

const NAV_ITEMS = [
  { label: "Dashboard", icon: Home, href: "/marketing/dashboard" },
  { label: "SEO Manager", icon: Search, href: "/marketing/seo" },
  { label: "PPC / Paid Ads", icon: Megaphone, href: "/marketing/ppc" },
  { label: "Blog & Content", icon: PenTool, href: "/marketing/blog" },
  { label: "Content Center", icon: FileText, href: "/marketing/content-center" },
  { label: "Email & SMS", icon: FileText, href: "/marketing/templates" },
  { label: "Competitor Intel", icon: Swords, href: "/marketing/competitor-seo" },
  { label: "CRO & Optimization", icon: Target, href: "/marketing/cro" },
  { label: "Recommendations", icon: Sparkles, href: "/marketing/recommendations" },
  { label: "Backlinks", icon: Link2, href: "/marketing/backlinks" },
  { label: "Domain Authority", icon: Shield, href: "/marketing/domain-authority" },
  { label: "Analytics", icon: BarChart3, href: "/marketing/analytics" },
];

interface MarketingShellProps {
  children: ReactNode;
  breadcrumb?: string;
  breadcrumbs?: BreadcrumbSegment[];
}

export default function MarketingShell({ children, breadcrumb = "", breadcrumbs }: MarketingShellProps) {
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
        <img src={logoImg} alt="TruMove" className="h-6" />
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground tracking-tight leading-none">Marketing</span>
          <span className="text-[9px] text-muted-foreground leading-none mt-0.5">AI-Powered Growth Engine</span>
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
              to="/marketing/team-chat"
              className={cn(
                "p-1.5 rounded-lg transition-colors relative",
                location.pathname === "/marketing/team-chat" ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
              )}
            >
              <MessageSquare className="w-4 h-4" />
            </Link>
            <div className="w-px h-5 bg-border" />
            <Link to="/" className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0">
              <Home className="w-4 h-4 text-muted-foreground" />
            </Link>
            <ShellBreadcrumbs
              root={{ label: "Marketing", href: "/marketing/dashboard" }}
              segments={breadcrumbs}
              legacyString={!breadcrumbs ? breadcrumb : undefined}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors relative">
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
