import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Bell, Menu, X, MessageSquare,
  BarChart3, PenTool, Megaphone, FlaskConical,
  Zap, ClipboardList, Eye, Settings, ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { setPortalContext } from "@/hooks/usePortalContext";
import { useIsMobile } from "@/hooks/use-mobile";
import ShellBreadcrumbs, { type BreadcrumbSegment } from "@/components/layout/ShellBreadcrumbs";
import logoImg from "@/assets/logo.png";

interface NavItem {
  label: string;
  subtitle: string;
  icon: React.ElementType;
  href: string;
}

const GROUP_HQ: NavItem[] = [
  { label: "Dashboard", subtitle: "Performance, alerts & daily actions", icon: BarChart3, href: "/marketing/dashboard" },
];

const GROUP_ENGINES: NavItem[] = [
  { label: "Content & SEO", subtitle: "Keywords, briefs, blog & rankings", icon: PenTool, href: "/marketing/content-seo" },
  { label: "Advertising", subtitle: "Google Ads, Meta, budgets & spend", icon: Megaphone, href: "/marketing/advertising" },
  { label: "Conversion Lab", subtitle: "A/B tests, funnel & experiments", icon: FlaskConical, href: "/marketing/conversion-lab" },
];

const GROUP_INTEL: NavItem[] = [
  { label: "Action Items", subtitle: "Recommendations, approvals & results", icon: Zap, href: "/marketing/action-items" },
  { label: "Lead Sources", subtitle: "Vendor scores & lead quality", icon: ClipboardList, href: "/marketing/lead-sources" },
  { label: "Competitors", subtitle: "Tracking, gaps & market intel", icon: Eye, href: "/marketing/competitors" },
];

interface MarketingShellProps {
  children: ReactNode;
  breadcrumb?: string;
  breadcrumbs?: BreadcrumbSegment[];
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
                <span className="block text-[10px] text-muted-foreground/70 truncate leading-tight">{item.subtitle}</span>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
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

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Logo / collapse toggle */}
      <button
        onClick={() => !isMobile && setCollapsed((c) => !c)}
        className="px-3 py-4 flex items-center gap-2.5 hover:bg-muted/30 transition-colors"
      >
        <img src={logoImg} alt="TruMove" className="h-6 shrink-0" />
        {!collapsed && (
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-bold text-foreground tracking-tight leading-none">Marketing</span>
            <span className="text-[9px] text-muted-foreground leading-none mt-0.5">AI-Powered Growth Engine</span>
          </div>
        )}
        {!collapsed && !isMobile && <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
        {isMobile && (
          <button onClick={(e) => { e.stopPropagation(); setSidebarOpen(false); }} className="ml-auto p-1 rounded-lg hover:bg-muted">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </button>

      {/* Navigation groups */}
      <nav className="flex-1 px-2 py-1 overflow-y-auto">
        <NavGroup items={GROUP_HQ} collapsed={collapsed} pathname={location.pathname} />
        <div className="h-4" />
        <NavGroup items={GROUP_ENGINES} collapsed={collapsed} pathname={location.pathname} />
        <div className="h-4" />
        <NavGroup items={GROUP_INTEL} collapsed={collapsed} pathname={location.pathname} />
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
      </nav>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {!isMobile && (
        <aside className={cn("shrink-0 border-r border-border flex flex-col min-h-screen transition-all duration-200", sidebarWidth)}>
          {sidebarContent}
        </aside>
      )}

      {isMobile && sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-56 z-50 border-r border-border flex flex-col">
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
                "p-1.5 rounded-lg transition-colors relative flex items-center gap-1",
                location.pathname === "/marketing/team-chat" ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
              )}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-medium">Chat</span>
            </Link>
            <div className="w-px h-5 bg-border" />
            <Link to="/" className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0 flex items-center gap-1">
              <Home className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Home</span>
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
