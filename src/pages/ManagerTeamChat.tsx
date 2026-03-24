import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Bell, LayoutDashboard,
  Trophy, Activity, MessageSquare, Menu, X,
} from "lucide-react";
import logoImg from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { setPortalContext } from "@/hooks/usePortalContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotifications } from "@/hooks/useNotifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationsPanel } from "@/components/agent/NotificationsPanel";
import { Badge } from "@/components/ui/badge";
import AgentTeamChat from "@/pages/AgentTeamChat";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/manager/dashboard" },
  { label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
  { label: "Pulse Dashboard", icon: Activity, href: "/manager/pulse" },
];

export default function ManagerTeamChat() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  useEffect(() => {
    setPortalContext("manager");
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
            <Link key={item.label} to={item.href} className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
              active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}>
              <Icon className="w-4 h-4" /><span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {!isMobile && (
        <aside className="w-52 shrink-0 border-r border-border bg-card flex flex-col h-full">
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
      <div className="flex-1 flex flex-col h-full min-w-0">
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
            <span className="text-sm text-muted-foreground truncate">Management / Team Chat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              to="/manager/team-chat"
              className="p-1.5 rounded-lg bg-primary/10 text-primary transition-colors relative"
            >
              <MessageSquare className="w-4 h-4" />
            </Link>
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-1.5 rounded-lg hover:bg-muted transition-colors relative">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 text-[10px] leading-none flex items-center justify-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <NotificationsPanel
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onDelete={deleteNotification}
                />
              </PopoverContent>
            </Popover>
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground ml-1">MW</div>
          </div>
        </header>
        <main className="flex-1 overflow-hidden">
          <AgentTeamChat embedded />
        </main>
      </div>
    </div>
  );
}
