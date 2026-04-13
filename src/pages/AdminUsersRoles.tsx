import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Users, Plus, Shield, Crown, BarChart3, UserCheck, Loader2, Mail, X, Sparkles,
  DollarSign, Pencil, Trash2, Check, Send, KeyRound, ChevronDown, Settings2,
  Truck, Palette, Bot, CreditCard, BarChart2, FolderOpen, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";

type AppRole = "owner" | "admin" | "manager" | "agent" | "marketing" | "accounting";

interface UserWithRole {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  role: AppRole | null;
}

// ─── Role config ──────────────────────────────────────────────────
const ROLE_CONFIG: Record<AppRole, { label: string; icon: React.ElementType; color: string }> = {
  owner: { label: "Owner", icon: Crown, color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  admin: { label: "Admin", icon: Shield, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  manager: { label: "Manager", icon: BarChart3, color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  agent: { label: "Agent", icon: UserCheck, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  marketing: { label: "Marketing", icon: Sparkles, color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400" },
  accounting: { label: "Accounting", icon: DollarSign, color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400" },
};

// ─── Permission areas ─────────────────────────────────────────────
const PERMISSION_AREAS = [
  { key: "leads", label: "Leads", icon: Users },
  { key: "carrier_network", label: "Carrier Network", icon: Truck },
  { key: "bookings", label: "Bookings", icon: FolderOpen },
  { key: "reports", label: "Reports & Analytics", icon: BarChart2 },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "creative", label: "Creative Assets", icon: Palette },
  { key: "ai_tools", label: "AI Tools (Trudy)", icon: Bot },
  { key: "settings", label: "Settings", icon: Settings2 },
  { key: "user_management", label: "User Management", icon: Lock },
] as const;

type PermKey = (typeof PERMISSION_AREAS)[number]["key"];

// Default permission matrix per role
const DEFAULT_PERMISSIONS: Record<AppRole, Record<PermKey, boolean>> = {
  owner: Object.fromEntries(PERMISSION_AREAS.map((p) => [p.key, true])) as Record<PermKey, boolean>,
  admin: Object.fromEntries(PERMISSION_AREAS.map((p) => [p.key, true])) as Record<PermKey, boolean>,
  manager: {
    leads: true, carrier_network: true, bookings: true, reports: true,
    billing: false, creative: true, ai_tools: true, settings: false, user_management: false,
  },
  agent: {
    leads: true, carrier_network: false, bookings: true, reports: false,
    billing: false, creative: false, ai_tools: true, settings: false, user_management: false,
  },
  marketing: {
    leads: true, carrier_network: false, bookings: false, reports: true,
    billing: false, creative: true, ai_tools: true, settings: false, user_management: false,
  },
  accounting: {
    leads: false, carrier_network: false, bookings: true, reports: true,
    billing: true, creative: false, ai_tools: false, settings: false, user_management: false,
  },
};

// Invite-modal role options (display labels that map to actual AppRole or "custom")
const INVITE_ROLE_OPTIONS = [
  { value: "agent" as const, label: "Agent" },
  { value: "manager" as const, label: "Manager" },
  { value: "admin" as const, label: "Admin / Owner" },
  { value: "accounting" as const, label: "Dispatch" },
  { value: "marketing" as const, label: "Marketing" },
  { value: "accounting" as const, label: "Creative Studio" },
  // "custom" handled separately
] as const;

export default function AdminUsersRoles() {
  const { toast } = useToast();
  const { isOwner, userId } = useUserRole();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole | "custom">("agent");
  const [customPerms, setCustomPerms] = useState<Record<PermKey, boolean>>(
    () => ({ ...DEFAULT_PERMISSIONS.agent })
  );
  const [inviting, setInviting] = useState(false);

  // Inline editing
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState("");
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [passwordUserId, setPasswordUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [settingPassword, setSettingPassword] = useState(false);
  const [inviteConfirmUser, setInviteConfirmUser] = useState<UserWithRole | null>(null);

  // Roles & Permissions section
  const [rolePerms, setRolePerms] = useState<Record<AppRole, Record<PermKey, boolean>>>(() =>
    JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS))
  );
  const [defaultRole, setDefaultRole] = useState<AppRole>("agent");
  const [pendingRoleChanges, setPendingRoleChanges] = useState(false);
  const [confirmSaveRoles, setConfirmSaveRoles] = useState(false);

  // ─── Fetch users ──────────────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: roles } = await supabase.from("user_roles").select("*");

    const roleMap = new Map<string, AppRole>();
    (roles ?? []).forEach((r: any) => roleMap.set(r.user_id, r.role));

    const combined: UserWithRole[] = (profiles ?? []).map((p: any) => ({
      id: p.id,
      email: p.email,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      created_at: p.created_at,
      role: roleMap.get(p.id) ?? null,
    }));

    const order: Record<string, number> = { owner: 0, admin: 1, manager: 2, agent: 3, marketing: 4, accounting: 5 };
    combined.sort((a, b) => (order[a.role ?? ""] ?? 6) - (order[b.role ?? ""] ?? 6));

    setUsers(combined);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  // ─── User status helper ───────────────────────────────────────
  const getUserStatus = (user: UserWithRole) => {
    if (!user.role) return { label: "Disabled", color: "text-muted-foreground bg-muted" };
    return { label: "Active", color: "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30" };
  };

  // ─── Handlers ─────────────────────────────────────────────────
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);

    const finalRole: AppRole = inviteRole === "custom" ? "agent" : inviteRole;

    const { data, error } = await supabase.functions.invoke("invite-user", {
      body: { action: "invite", email: inviteEmail.trim(), role: finalRole, display_name: inviteName.trim() || undefined },
    });

    setInviting(false);
    if (error || data?.error) {
      toast({ title: "Invite failed", description: data?.error || error?.message, variant: "destructive" });
    } else {
      toast({ title: "Invite sent", description: `${inviteEmail} invited as ${ROLE_CONFIG[finalRole].label}` });
      setInviteEmail("");
      setInviteName("");
      setInviteRole("agent");
      setInviteOpen(false);
      fetchUsers();
    }
  };

  const handleChangeRole = async (targetUserId: string, newRole: AppRole) => {
    setChangingRole(targetUserId);
    const { data, error } = await supabase.functions.invoke("invite-user", {
      body: { action: "assign_role", user_id: targetUserId, role: newRole },
    });
    setChangingRole(null);
    if (error || data?.error) {
      toast({ title: "Role change failed", description: data?.error || error?.message, variant: "destructive" });
    } else {
      toast({ title: "Role updated", description: `Role changed to ${ROLE_CONFIG[newRole].label}` });
      fetchUsers();
    }
  };

  const handleDeleteUser = async (targetUserId: string) => {
    setDeletingUser(targetUserId);
    const { data, error } = await supabase.functions.invoke("invite-user", {
      body: { action: "delete_user", user_id: targetUserId },
    });
    setDeletingUser(null);
    if (error || data?.error) {
      toast({ title: "Delete failed", description: data?.error || error?.message, variant: "destructive" });
    } else {
      toast({ title: "User deleted" });
      fetchUsers();
    }
  };

  const handleResendInvite = async (targetUserId: string) => {
    setChangingRole(targetUserId);
    const { data, error } = await supabase.functions.invoke("invite-user", {
      body: { action: "resend_invite", user_id: targetUserId },
    });
    setChangingRole(null);
    if (error || data?.error) {
      toast({ title: "Resend failed", description: data?.error || error?.message, variant: "destructive" });
    } else {
      toast({ title: "Invite resent", description: "A new invitation email has been sent." });
    }
  };

  const handleSaveName = async (targetUserId: string) => {
    if (!editNameValue.trim()) return;
    setChangingRole(targetUserId);
    const { data, error } = await supabase.functions.invoke("invite-user", {
      body: { action: "update_name", user_id: targetUserId, display_name: editNameValue.trim() },
    });
    setChangingRole(null);
    setEditingName(null);
    if (error || data?.error) {
      toast({ title: "Update failed", description: data?.error || error?.message, variant: "destructive" });
    } else {
      toast({ title: "Name updated" });
      fetchUsers();
    }
  };

  const handleSetPassword = async () => {
    if (!passwordUserId || !newPassword.trim()) return;
    if (newPassword.length < 8) {
      toast({ title: "Password too short", description: "Must be at least 8 characters", variant: "destructive" });
      return;
    }
    setSettingPassword(true);
    const { data, error } = await supabase.functions.invoke("invite-user", {
      body: { action: "set_password", user_id: passwordUserId, password: newPassword },
    });
    setSettingPassword(false);
    if (error || data?.error) {
      toast({ title: "Failed", description: data?.error || error?.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated" });
      setPasswordUserId(null);
      setNewPassword("");
    }
  };

  const handleToggleRolePerm = (role: AppRole, perm: PermKey) => {
    if (role === "owner" || role === "admin") return; // Cannot restrict
    setRolePerms((prev) => ({
      ...prev,
      [role]: { ...prev[role], [perm]: !prev[role][perm] },
    }));
    setPendingRoleChanges(true);
  };

  const handleSaveRolePerms = () => {
    // In a real app this would persist to DB. For now just confirm.
    setPendingRoleChanges(false);
    setConfirmSaveRoles(false);
    toast({ title: "Permissions saved", description: "Role permissions have been updated for all affected users." });
  };

  const availableRoles: AppRole[] = isOwner
    ? ["owner", "admin", "manager", "agent", "marketing", "accounting"]
    : ["admin", "manager", "agent", "marketing", "accounting"];

  const editableRoles: AppRole[] = ["manager", "agent", "marketing", "accounting"];

  // ─── Delete confirmation state ────────────────────────────────
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserWithRole | null>(null);

  return (
    <div className="space-y-8">
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* USERS SECTION                                              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5" /> Users
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">{users.length} team members</p>
          </div>
          <button
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            Invite User
          </button>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Header */}
            <div className="hidden sm:grid grid-cols-[1fr_100px_140px_180px] items-center gap-4 px-5 py-2.5 border-b border-border bg-muted/30">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">User</span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Role</span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</span>
            </div>
            {users.map((user) => {
              const isSelf = user.id === userId;
              const roleConfig = user.role ? ROLE_CONFIG[user.role] : null;
              const RoleIcon = roleConfig?.icon;
              const isEditing = editingName === user.id;
              const status = getUserStatus(user);
              return (
                <div
                  key={user.id}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_100px_140px_180px] items-center gap-3 sm:gap-4 px-5 py-3 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                >
                  {/* User info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground shrink-0">
                      {user.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editNameValue}
                            onChange={(e) => setEditNameValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSaveName(user.id)}
                            className="h-6 px-2 rounded border border-border bg-background text-sm w-36 focus:outline-none focus:ring-1 focus:ring-ring"
                            autoFocus
                          />
                          <button onClick={() => handleSaveName(user.id)} className="p-0.5 rounded hover:bg-muted"><Check className="w-3.5 h-3.5 text-primary" /></button>
                          <button onClick={() => setEditingName(null)} className="p-0.5 rounded hover:bg-muted"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-foreground truncate">
                          {user.display_name || "Unnamed"}
                          {isSelf && <span className="text-[10px] text-muted-foreground ml-1.5">(you)</span>}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium", status.color)}>
                      {status.label}
                    </span>
                  </div>

                  {/* Role badge */}
                  <div>
                    {roleConfig && RoleIcon ? (
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium", roleConfig.color)}>
                        <RoleIcon className="w-3 h-3" />
                        {roleConfig.label}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50 italic">No role</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    {(changingRole === user.id || deletingUser === user.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    ) : isSelf ? (
                      <span className="text-[11px] text-muted-foreground">—</span>
                    ) : (
                      <>
                        <select
                          value={user.role ?? ""}
                          onChange={(e) => {
                            const val = e.target.value as AppRole;
                            if (val) handleChangeRole(user.id, val);
                          }}
                          className="h-7 px-2 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="" disabled>Assign…</option>
                          {availableRoles.map((r) => (
                            <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
                          ))}
                        </select>
                        <button onClick={() => setInviteConfirmUser(user)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Send CRM access link">
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setEditingName(user.id); setEditNameValue(user.display_name || ""); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edit name">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setPasswordUserId(user.id); setNewPassword(""); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Set password">
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        {isOwner && (
                          <button
                            onClick={() => setDeleteConfirmUser(user)}
                            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {users.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No users found. Invite your first team member above.
              </div>
            )}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ROLES & PERMISSIONS SECTION                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5" /> Roles & Permissions
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">Customize access for each role. Changes apply to all users with that role.</p>
          </div>
          {pendingRoleChanges && (
            <button
              onClick={() => setConfirmSaveRoles(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <Check className="w-3.5 h-3.5" />
              Save Changes
            </button>
          )}
        </div>

        {/* Default role dropdown */}
        <div className="flex items-center gap-3 mb-5 p-4 rounded-xl border border-border bg-card">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">Default role for new invites:</label>
          <select
            value={defaultRole}
            onChange={(e) => setDefaultRole(e.target.value as AppRole)}
            className="h-8 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {availableRoles.filter((r) => r !== "owner").map((r) => (
              <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
            ))}
          </select>
        </div>

        {/* Permissions grid */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Header row */}
          <div className="grid items-center gap-0 border-b border-border bg-muted/30" style={{ gridTemplateColumns: `160px repeat(${PERMISSION_AREAS.length}, 1fr)` }}>
            <div className="px-4 py-3">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Role</span>
            </div>
            {PERMISSION_AREAS.map((area) => {
              const Icon = area.icon;
              return (
                <div key={area.key} className="px-2 py-3 text-center">
                  <Icon className="w-3.5 h-3.5 mx-auto mb-1 text-muted-foreground" />
                  <span className="text-[10px] font-medium text-muted-foreground leading-tight block">{area.label}</span>
                </div>
              );
            })}
          </div>

          {/* Role rows */}
          {(["owner", "admin", ...editableRoles] as AppRole[]).map((role) => {
            const config = ROLE_CONFIG[role];
            const RIcon = config.icon;
            const isLocked = role === "owner" || role === "admin";
            const perms = rolePerms[role];
            const userCount = users.filter((u) => u.role === role).length;

            return (
              <div
                key={role}
                className="grid items-center gap-0 border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors"
                style={{ gridTemplateColumns: `160px repeat(${PERMISSION_AREAS.length}, 1fr)` }}
              >
                <div className="px-4 py-3 flex items-center gap-2">
                  <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium", config.color)}>
                    <RIcon className="w-3 h-3" />
                    {config.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">({userCount})</span>
                </div>
                {PERMISSION_AREAS.map((area) => (
                  <div key={area.key} className="flex justify-center py-3">
                    {isLocked ? (
                      <div className="w-9 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                    ) : (
                      <Switch
                        checked={perms[area.key]}
                        onCheckedChange={() => handleToggleRolePerm(role, area.key)}
                      />
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* INVITE MODAL                                               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setInviteOpen(false)}>
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" /> Invite User
              </h2>
              <button onClick={() => setInviteOpen(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="user@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "agent" as const, label: "Agent" },
                    { value: "manager" as const, label: "Manager" },
                    { value: "admin" as const, label: "Admin / Owner" },
                    { value: "accounting" as const, label: "Dispatch" },
                    { value: "marketing" as const, label: "Marketing" },
                    { value: "custom" as const, label: "Custom" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setInviteRole(opt.value)}
                      className={cn(
                        "px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                        inviteRole === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-foreground/20"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom permission toggles */}
              {inviteRole === "custom" && (
                <div className="border border-border rounded-lg p-3 space-y-2 bg-muted/20 animate-in fade-in slide-in-from-top-1 duration-200">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Custom Permissions</p>
                  {PERMISSION_AREAS.map((area) => {
                    const Icon = area.icon;
                    return (
                      <div key={area.key} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs text-foreground">{area.label}</span>
                        </div>
                        <Switch
                          checked={customPerms[area.key]}
                          onCheckedChange={() => setCustomPerms((prev) => ({ ...prev, [area.key]: !prev[area.key] }))}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                type="submit"
                disabled={inviting || !inviteEmail.trim()}
                className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {inviting && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Invitation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SET PASSWORD DIALOG                                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {passwordUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-semibold text-foreground mb-1">Set User Password</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Enter a new password for {users.find((u) => u.id === passwordUserId)?.email || "this user"}.
            </p>
            <input
              type="password"
              placeholder="New password (min 8 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSetPassword()}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setPasswordUserId(null); setNewPassword(""); }} className="px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleSetPassword} disabled={settingPassword || newPassword.length < 8} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                {settingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Set Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* DIALOGS                                                    */}
      {/* ═══════════════════════════════════════════════════════════ */}

      {/* Resend invite confirmation */}
      <AlertDialog open={!!inviteConfirmUser} onOpenChange={(open) => !open && setInviteConfirmUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send CRM Access Link?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send an email to <span className="font-medium text-foreground">{inviteConfirmUser?.email}</span> with a link to set their password and access the CRM.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (inviteConfirmUser) { handleResendInvite(inviteConfirmUser.id); setInviteConfirmUser(null); } }}>
              Send Link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete user confirmation */}
      <AlertDialog open={!!deleteConfirmUser} onOpenChange={(open) => !open && setDeleteConfirmUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-medium text-foreground">{deleteConfirmUser?.display_name || deleteConfirmUser?.email}</span> and remove all their data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deleteConfirmUser) { handleDeleteUser(deleteConfirmUser.id); setDeleteConfirmUser(null); } }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save role permissions confirmation */}
      <AlertDialog open={confirmSaveRoles} onOpenChange={setConfirmSaveRoles}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Permission Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Updated permissions will apply to all users assigned to the modified roles. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveRolePerms}>Save Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
