import { Link, useLocation } from "react-router-dom";
import {
  BarChart3, PenTool, Megaphone, FlaskConical,
  Zap, ClipboardList, Eye, Settings, ChevronLeft, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
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

interface SharedSidebarProps {
  title: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export default function SharedSidebar({ title, collapsed, onToggleCollapse, onClose, isMobile }: SharedSidebarProps) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo / collapse toggle */}
      <button
        onClick={() => !isMobile && onToggleCollapse()}
        className="px-3 py-4 flex items-center gap-2.5 hover:bg-muted/30 transition-colors"
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
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="ml-auto p-1 rounded-lg hover:bg-muted">
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
}
