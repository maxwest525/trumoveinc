import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteShell from "@/components/layout/SiteShell";
import PortalAuthForm from "@/components/auth/PortalAuthForm";
import { Settings, Users, BarChart3, Megaphone, Receipt, Package, ShieldCheck, Globe, LogOut, Bell, type LucideIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import logoImg from "@/assets/logo.png";
import { useAgentProfile } from "@/hooks/useAgentProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { usePortalStats } from "@/hooks/usePortalStats";
import { motion } from "framer-motion";
import type { Session } from "@supabase/supabase-js";

interface RoleConfig {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  /** Which db roles grant access to this card. owner always sees everything. */
  allowedRoles: string[];
}

const ROLES: RoleConfig[] = [
  { id: "admin", title: "Admin", description: "Team, data, users, integrations, billing & all settings.", icon: Settings, href: "/admin/dashboard", allowedRoles: ["owner", "admin"] },
  { id: "agent", title: "Agent", description: "Leads, deals & customer relationships.", icon: Users, href: "/agent/pipeline", allowedRoles: ["owner", "admin", "agent"] },
  { id: "manager", title: "Manager", description: "Team performance, approvals & campaigns.", icon: BarChart3, href: "/manager/dashboard", allowedRoles: ["owner", "admin", "manager"] },
  { id: "marketing", title: "Marketing", description: "AI campaigns, landing pages & A/B testing.", icon: Megaphone, href: "/marketing/dashboard", allowedRoles: ["owner", "admin", "marketing"] },
  { id: "accounting", title: "Accounting", description: "Invoices, payroll, expenses & revenue.", icon: Receipt, href: "/accounting/dashboard", allowedRoles: ["owner", "admin", "accounting"] },
  { id: "leads", title: "Lead Vendors", description: "Sources, budgets, vendor performance & ROI.", icon: Package, href: "/leads/dashboard", allowedRoles: ["owner", "admin", "marketing"] },
  { id: "compliance", title: "Compliance", description: "FMCSA filings, licensing & insurance audits.", icon: ShieldCheck, href: "/compliance/dashboard", allowedRoles: ["owner", "admin", "manager"] },
];

const STORAGE_KEY = "truemove_remembered_role";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

function WorkspaceCard({
  role,
  onClick,
  stat,
  statLoading,
  index,
}: {
  role: RoleConfig;
  onClick: () => void;
  stat?: string;
  statLoading: boolean;
  index: number;
}) {
  const Icon = role.icon;
  return (
    <motion.button
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      onClick={onClick}
      className="group relative flex flex-col gap-2 rounded-xl border border-border/40 bg-card p-4 hover:border-border hover:shadow-md transition-all duration-200 text-left"
    >
      {/* Stat badge */}
      {statLoading ? (
        <div className="absolute top-3 right-3">
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
      ) : stat ? (
        <span className="absolute top-3 right-3 text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {stat}
        </span>
      ) : null}

      {/* Icon + Title */}
      <div className="flex items-center gap-2.5">
        <Icon className="w-[18px] h-[18px] text-muted-foreground shrink-0" strokeWidth={1.5} />
        <h3 className="font-semibold text-foreground text-[13px] tracking-tight">{role.title}</h3>
      </div>

      {/* Description */}
      <p className="text-[11px] text-muted-foreground/70 leading-relaxed pl-[30px]">{role.description}</p>
    </motion.button>
  );
}

export default function AgentLogin() {
  const navigate = useNavigate();
  const [remember, setRemember] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const { displayName } = useAgentProfile();
  const { stats, loading: statsLoading } = usePortalStats();
  const { unreadCount } = useNotifications();
  const greeting = useMemo(() => getGreeting(), []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch user roles from DB
  useEffect(() => {
    if (!session?.user) {
      setUserRoles([]);
      setRolesLoading(false);
      return;
    }
    const fetchRoles = async () => {
      setRolesLoading(true);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      setUserRoles((data || []).map((r: any) => r.role));
      setRolesLoading(false);
    };
    fetchRoles();
  }, [session?.user?.id]);

  // Filter roles based on user's DB roles
  const visibleRoles = useMemo(() => {
    if (rolesLoading) return [];
    // If no roles found at all, show everything (fallback for first user / dev)
    if (userRoles.length === 0) return ROLES;
    return ROLES.filter((r) => r.allowedRoles.some((ar) => userRoles.includes(ar)));
  }, [userRoles, rolesLoading]);

  useEffect(() => {
    if (!session) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const role = ROLES.find((r) => r.id === saved);
      if (role) navigate(role.href, { replace: true });
    }
    window.scrollTo(0, 0);
  }, [session, navigate]);

  const handleClick = (roleId: string, href: string) => {
    if (remember) localStorage.setItem(STORAGE_KEY, roleId);
    navigate(href);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEY);
  };

  if (loading) {
    return (
      <SiteShell centered backendMode hideHeader>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      </SiteShell>
    );
  }

  if (!session) {
    return (
      <SiteShell centered backendMode hideHeader>
        <div className="flex items-center justify-center min-h-[60vh] px-4 py-16">
          <PortalAuthForm onAuthenticated={() => {}} />
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell centered backendMode hideHeader>
      <div className="flex flex-col items-center justify-center min-h-[100vh] px-4 py-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center gap-2 mb-12"
        >
          <img src={logoImg} alt="TruMove" className="h-8 dark:invert" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-3 flex items-center gap-2">
            {greeting}, {displayName}
            {unreadCount > 0 && (
              <span className="inline-flex items-center gap-1 bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold">
                <Bell className="w-3 h-3" />
                {unreadCount}
              </span>
            )}
          </h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{session.user.email}</span>
            <span className="text-border">·</span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1 hover:text-destructive transition-colors"
            >
              <LogOut className="w-3 h-3" /> Sign out
            </button>
          </div>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full max-w-[900px]">
          {rolesLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          ) : (
            <>
              {visibleRoles.map((role, i) => (
                <WorkspaceCard
                  key={role.id}
                  role={role}
                  onClick={() => handleClick(role.id, role.href)}
                  stat={stats[role.id]}
                  statLoading={statsLoading}
                  index={i}
                />
              ))}

              {/* Customer Facing Sites — always visible */}
              <motion.button
                custom={visibleRoles.length}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                onClick={() => navigate("/customer-facing-sites")}
                className="group relative flex flex-col gap-2 rounded-xl border border-border/40 bg-card p-4 hover:border-border hover:shadow-md transition-all duration-200 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-[18px] h-[18px] text-muted-foreground shrink-0" strokeWidth={1.5} />
                  <h3 className="font-semibold text-foreground text-[13px] tracking-tight">Customer Sites</h3>
                </div>
                <p className="text-[11px] text-muted-foreground/70 leading-relaxed pl-[30px]">Preview & manage public-facing website variants.</p>
              </motion.button>
            </>
          )}
        </div>

        {/* Remember */}
        <motion.label
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="flex items-center gap-2 mt-10 cursor-pointer select-none"
        >
          <Checkbox
            checked={remember}
            onCheckedChange={(v) => setRemember(v === true)}
            className="border-border"
          />
          <span className="text-[11px] text-muted-foreground">Remember my choice on this device</span>
        </motion.label>
      </div>
    </SiteShell>
  );
}
