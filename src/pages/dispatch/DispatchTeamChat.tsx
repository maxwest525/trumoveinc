import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Bell, LayoutDashboard, MapPin, Users, Route,
  ClipboardList, FileSignature, MessageSquare, Menu, X, Truck,
} from "lucide-react";
import logoImg from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { setPortalContext } from "@/hooks/usePortalContext";
import { useIsMobile } from "@/hooks/use-mobile";
import AgentTeamChat from "@/pages/AgentTeamChat";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dispatch/dashboard" },
  { label: "Fleet Tracker", icon: MapPin, href: "/dispatch/fleet" },
  { label: "Driver Assignments", icon: Users, href: "/dispatch/drivers" },
  { label: "Route Management", icon: Route, href: "/dispatch/routes" },
  { label: "Job Board", icon: ClipboardList, href: "/dispatch/jobs" },
  { label: "E-Sign", icon: FileSignature, href: "/dispatch/esign" },
];

export default function DispatchTeamChat() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setPortalContext("dispatch"); }, []);
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const sidebarContent = (
    <>
      <div className="px-4 py-4 flex items-center gap-2">
        <img src={logoImg} alt="TruMove" className="h-6" />
        <span className="text-[10px] text-muted-foreground ml-1">Dispatch</span>
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
            <Link
              to="/dispatch/team-chat"
              className="p-1.5 rounded-lg bg-primary/10 text-primary transition-colors relative"
            >
              <MessageSquare className="w-4 h-4" />
            </Link>
            <Link to="/" className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <Home className="w-4 h-4 text-muted-foreground" />
            </Link>
            <span className="text-sm text-muted-foreground truncate">Dispatch / Team Chat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground ml-1">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-hidden">
          <AgentTeamChat embedded />
        </main>
      </div>
    </div>
  );
}
