import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Users, Plus, Shield, Crown, BarChart3, UserCheck, Loader2, Mail, X, Sparkles,
  DollarSign, Pencil, Trash2, Check, Send, KeyRound, ChevronDown,
  Truck, Palette, Bot, Lock, Phone, MapPin, AtSign, Building2,
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
  phone: string | null;
  username: string | null;
  company_email: string | null;
  personal_email: string | null;
  address: string | null;
  created_at: string | null;
  role: AppRole | null;
  is_active: boolean;
}

const ROLE_CONFIG: Record<AppRole, { label: string; icon: React.ElementType; color: string }> = {
  owner: { label: "Owner", icon: Crown, color: "text-amber-700 dark:text-amber-400" },
  admin: { label: "Admin", icon: Shield, color: "text-blue-700 dark:text-blue-400" },
  manager: { label: "Manager", icon: BarChart3, color: "text-purple-700 dark:text-purple-400" },
  agent: { label: "Agent", icon: UserCheck, color: "text-green-700 dark:text-green-400" },
  marketing: { label: "Marketing", icon: Sparkles, color: "text-pink-700 dark:text-pink-400" },
  accounting: { label: "Accounting", icon: DollarSign, color: "text-teal-700 dark:text-teal-400" },
};

// The 6 dashboard portal cards that permissions toggle on/off
const PERMISSION_CARDS = [
  { key: "agent", label: "Agent", icon: UserCheck },
  { key: "manager", label: "Manager", icon: BarChart3 },
  { key: "owner_admin", label: "Owner / Admin", icon: Crown },
  { key: "dispatch", label: "Dispatch", icon: Truck },
  { key: "marketing", label: "Marketing", icon: Sparkles },
  { key: "creative_studio", label: "Creative Studio", icon: Palette },
] as const;

type PermKey = (typeof PERMISSION_CARDS)[number]["key"];

const DEFAULT_PERMISSIONS: Record<AppRole, Record<PermKey, boolean>> = {
  owner: { agent: true, manager: true, owner_admin: true, dispatch: true, marketing: true, creative_studio: true },
  admin: { agent: true, manager: true, owner_admin: true, dispatch: true, marketing: true, creative_studio: true },
  manager: { agent: true, manager: true, owner_admin: false, dispatch: true, marketing: false, creative_studio: false },
  agent: { agent: true, manager: false, owner_admin: false, dispatch: false, marketing: false, creative_studio: false },
  marketing: { agent: false, manager: false, owner_admin: false, dispatch: false, marketing: true, creative_studio: true },
  accounting: { agent: false, manager: false, owner_admin: false, dispatch: true, marketing: false, creative_studio: false },
};

export default function AdminUsersRoles() {
  const { toast } = useToast();
  const { isOwner, userId } = useUserRole();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("agent");
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

  // Edit profile modal
  const [editProfileUser, setEditProfileUser] = useState<UserWithRole | null>(null);
  const [profileForm, setProfileForm] = useState({
    first_name: "", last_name: "", username: "", company_email: "", personal_email: "", phone: "", address: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Roles & Permissions
  const [rolePerms, setRolePerms] = useState<Record<AppRole, Record<PermKey, boolean>>>(() =>
    JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS))
  );
  const [pendingRoleChanges, setPendingRoleChanges] = useState(false);
  const [confirmSaveRoles, setConfirmSaveRoles] = useState(false);

  // Delete confirmation
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserWithRole | null>(null);

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
      phone: p.phone ?? null,
      username: p.username ?? null,
      company_email: p.company_email ?? null,
      personal_email: p.personal_email ?? null,
      address: p.address ?? null,
      created_at: p.created_at,
      role: roleMap.get(p.id) ?? null,
      is_active: !!roleMap.get(p.id),
    }));

    const order: Record<string, number> = { owner: 0, admin: 1, manager: 2, agent: 3, marketing: 4, accounting: 5 };
    combined.sort((a, b) => (order[a.role ?? ""] ?? 6) - (order[b.role ?? ""] ?? 6));

    setUsers(combined);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  // ─── Toggle active/inactive ───────────────────────────────────
  const handleToggleActive = async (user: UserWithRole) => {
    if (user.id === userId) return;
    setChangingRole(user.id);

    if (user.is_active) {
      // Deactivate: remove role
      const { data, error } = await supabase.functions.invoke("invite-user", {
        body: { action: "remove_role", user_id: user.id },
      });
      if (error || data?.error) {
        toast({ title: "Failed", description: data?.error || error?.message, variant: "destructive" });
      } else {
        toast({ title: "User deactivated", description: `${user.display_name || user.email} can no longer log in.` });
      }
    } else {
      // Reactivate: assign agent role by default
      const { data, error } = await supabase.functions.invoke("invite-user", {
        body: { action: "assign_role", user_id: user.id, role: "agent" },
      });
      if (error || data?.error) {
        toast({ title: "Failed", description: data?.error || error?.message, variant: "destructive" });
      } else {
        toast({ title: "User activated", description: `${user.display_name || user.email} is now active as Agent.` });
      }
    }

    setChangingRole(null);
    fetchUsers();
  };

  // ─── Handlers ─────────────────────────────────────────────────
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteFirstName.trim() || !inviteLastName.trim()) return;
    setInviting(true);

    const displayName = `${inviteFirstName.trim()} ${inviteLastName.trim()}`;

    const { data, error } = await supabase.functions.invoke("invite-user", {
      body: {
        action: "invite",
        email: inviteEmail.trim(),
        role: inviteRole,
        display_name: displayName,
        phone: invitePhone.trim() || undefined,
      },
    });

    setInviting(false);
    if (error || data?.error) {
      toast({ title: "Invite failed", description: data?.error || error?.message, variant: "destructive" });
    } else {
      toast({ title: "Invite sent", description: `${displayName} invited as ${ROLE_CONFIG[inviteRole].label}` });
      setInviteFirstName("");
      setInviteLastName("");
      setInviteEmail("");
      setInvitePhone("");
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
      toast({ title: "Invite resent", description: "A branded email has been sent to set their password." });
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
    if (role === "owner" || role === "admin") return;
    setRolePerms((prev) => ({
      ...prev,
      [role]: { ...prev[role], [perm]: !prev[role][perm] },
    }));
    setPendingRoleChanges(true);
  };

  const handleSaveRolePerms = () => {
    setPendingRoleChanges(false);
    setConfirmSaveRoles(false);
    toast({ title: "Permissions saved", description: "Role permissions have been updated for all affected users." });
  };

  const availableRoles: AppRole[] = isOwner
    ? ["owner", "admin", "manager", "agent", "marketing", "accounting"]
    : ["admin", "manager", "agent", "marketing", "accounting"];

  const editableRoles: AppRole[] = ["manager", "agent", "marketing", "accounting"];

  return (
    <div className="space-y-8">
      {/* ═══════════════ USERS SECTION ═══════════════ */}
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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_120px_140px_180px] items-center gap-4 px-5 py-2.5 border-b border-border bg-muted/30">
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
              return (
                <div
                  key={user.id}
                  className={cn(
                    "grid grid-cols-1 sm:grid-cols-[1fr_120px_140px_180px] items-center gap-3 sm:gap-4 px-5 py-3 border-b border-border/50 last:border-0 transition-colors",
                    user.is_active ? "hover:bg-muted/20" : "opacity-60 bg-muted/10"
                  )}
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

                  {/* Status dropdown */}
                  <div>
                    {isSelf ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (changingRole === user.id) ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                    ) : (
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-medium rounded-md px-2.5 py-1 border transition-colors cursor-pointer",
                          user.is_active
                            ? "border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            : "border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        )}
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full", user.is_active ? "bg-emerald-500" : "bg-red-400")} />
                        {user.is_active ? "Active" : "Inactive"}
                        <ChevronDown className="w-3 h-3 ml-0.5" />
                      </button>
                    )}
                  </div>

                  {/* Role dropdown (no pill) */}
                  <div>
                    {isSelf ? (
                      <span className={cn("flex items-center gap-1.5 text-xs font-medium", roleConfig?.color)}>
                        {RoleIcon && <RoleIcon className="w-3 h-3" />}
                        {roleConfig?.label ?? "No role"}
                      </span>
                    ) : (changingRole === user.id) ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                    ) : (
                      <select
                        value={user.role ?? ""}
                        onChange={(e) => {
                          const val = e.target.value as AppRole;
                          if (val) handleChangeRole(user.id, val);
                        }}
                        className="h-7 px-2 rounded border border-border bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="" disabled>Assign…</option>
                        {availableRoles.map((r) => (
                          <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    {(deletingUser === user.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    ) : isSelf ? (
                      <span className="text-[11px] text-muted-foreground">—</span>
                    ) : (
                      <>
                        <button onClick={() => setInviteConfirmUser(user)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Send password setup email">
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

      {/* ═══════════════ ROLES & PERMISSIONS ═══════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5" /> Roles & Permissions
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">Control which dashboard portals each role can access.</p>
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

        {/* Permissions grid */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Header */}
          <div className="grid items-center gap-0 border-b border-border bg-muted/30" style={{ gridTemplateColumns: `160px repeat(${PERMISSION_CARDS.length}, 1fr)` }}>
            <div className="px-4 py-3">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Role</span>
            </div>
            {PERMISSION_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.key} className="px-2 py-3 text-center">
                  <Icon className="w-3.5 h-3.5 mx-auto mb-1 text-muted-foreground" />
                  <span className="text-[10px] font-medium text-muted-foreground leading-tight block">{card.label}</span>
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
                style={{ gridTemplateColumns: `160px repeat(${PERMISSION_CARDS.length}, 1fr)` }}
              >
                <div className="px-4 py-3 flex items-center gap-2">
                  <RIcon className={cn("w-4 h-4", config.color)} />
                  <span className={cn("text-sm font-semibold", config.color)}>{config.label}</span>
                  <span className="text-[10px] text-muted-foreground">({userCount})</span>
                  {isLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                </div>
                {PERMISSION_CARDS.map((card) => (
                  <div key={card.key} className="flex justify-center py-3">
                    {isLocked ? (
                      <div className="w-9 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                    ) : (
                      <Switch
                        checked={perms[card.key]}
                        onCheckedChange={() => handleToggleRolePerm(role, card.key)}
                      />
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════ INVITE MODAL ═══════════════ */}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John"
                    value={inviteFirstName}
                    onChange={(e) => setInviteFirstName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Doe"
                    value={inviteLastName}
                    onChange={(e) => setInviteLastName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Personal Email</label>
                <input
                  type="email"
                  required
                  placeholder="john@personal.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone Number</label>
                <input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as AppRole)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {availableRoles.map((r) => (
                    <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={inviting || !inviteEmail.trim() || !inviteFirstName.trim() || !inviteLastName.trim()}
                className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {inviting && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Invitation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ SET PASSWORD DIALOG ═══════════════ */}
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

      {/* ═══════════════ DIALOGS ═══════════════ */}
      <AlertDialog open={!!inviteConfirmUser} onOpenChange={(open) => !open && setInviteConfirmUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Password Setup Email?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a branded TruMove email to <span className="font-medium text-foreground">{inviteConfirmUser?.email}</span> prompting them to set up their password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (inviteConfirmUser) { handleResendInvite(inviteConfirmUser.id); setInviteConfirmUser(null); } }}>
              Send Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

      <AlertDialog open={confirmSaveRoles} onOpenChange={setConfirmSaveRoles}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Permission Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Updated permissions will apply to all users assigned to the modified roles.
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
