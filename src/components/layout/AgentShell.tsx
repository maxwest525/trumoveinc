import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Sun, Moon, Bell, MessagesSquare, Settings, LogOut, User, ChevronDown, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import AgentSidebar from "@/components/agent/AgentSidebar";
import { FloatingDialer } from "@/components/agent/FloatingDialer";
import MiniSoftphone from "@/components/dialer/MiniSoftphone";
import { setPortalContext } from "@/hooks/usePortalContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationsPanel from "@/components/agent/NotificationsPanel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AgentShellProps {
  children: ReactNode | ((props: { openDialer: (number?: string) => void }) => ReactNode);
  breadcrumb?: string;
}

export default function AgentShell({ children, breadcrumb = "" }: AgentShellProps) {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dialerOpen, setDialerOpen] = useState(false);
  const [dialerPrefill, setDialerPrefill] = useState<string | undefined>();
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, loading: notifLoading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [profile, setProfile] = useState<{ display_name: string; avatar_url: string | null; email: string }>({
    display_name: "",
    avatar_url: null,
    email: "",
  });

  useEffect(() => {
    setPortalContext("agent");
    window.scrollTo(0, 0);

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, email")
        .eq("id", session.user.id)
        .single();
      if (data) setProfile({
        display_name: data.display_name || session.user.email?.split("@")[0] || "User",
        avatar_url: data.avatar_url,
        email: data.email || session.user.email || "",
      });
    })();
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const initials = profile.display_name
    ? profile.display_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop sidebar */}
      {!isMobile && <AgentSidebar onDialerToggle={() => setDialerOpen(true)} />}

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-52 bg-card border-r border-border">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs font-semibold text-muted-foreground">Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <AgentSidebar onDialerToggle={() => { setDialerOpen(true); setSidebarOpen(false); }} />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
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
            <span className="text-sm text-muted-foreground truncate">Agent{breadcrumb}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              to="/agent/team-chat"
              className={`p-1.5 rounded-lg transition-colors relative ${
                location.pathname === "/agent/team-chat" ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              <MessagesSquare className="w-4 h-4" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </Link>
            <Popover open={notifOpen} onOpenChange={setNotifOpen}>
              <PopoverTrigger asChild>
                <button className="p-1.5 rounded-lg hover:bg-muted transition-colors relative">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px] leading-none bg-destructive text-destructive-foreground border-2 border-card">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="p-0 w-auto bg-popover z-[100]" sideOffset={8}>
                <NotificationsPanel
                  notifications={notifications}
                  unreadCount={unreadCount}
                  loading={notifLoading}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onDelete={deleteNotification}
                  onClose={() => setNotifOpen(false)}
                />
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 ml-1 px-1.5 py-1 rounded-lg hover:bg-muted transition-colors">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="text-[10px] font-medium bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-medium text-foreground leading-tight truncate max-w-[100px]">
                      {profile.display_name}
                    </p>
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile.display_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{profile.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/agent/profile")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {typeof children === "function" ? children({ openDialer: (num?: string) => { setDialerPrefill(num); setDialerOpen(true); } }) : children}
        </main>
      </div>
      {!isMobile && <IncomingLeadsSidebar open={incomingOpen} onClose={() => setIncomingOpen(false)} />}
      <FloatingDialer open={dialerOpen} onOpenChange={setDialerOpen} prefillNumber={dialerPrefill} />
    </div>
  );
}
