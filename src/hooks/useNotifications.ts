import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    // Fetch standard notifications
    const { data: notifData } = await supabase
      .from("notifications" as any)
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    const stdNotifs = ((notifData as any as Notification[]) || []);

    // Fetch pulse manager messages for this agent
    const { data: profileData } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", session.user.id)
      .single();

    let pulseNotifs: Notification[] = [];
    if (profileData?.display_name) {
      const { data: pulseMessages } = await supabase
        .from("pulse_agent_messages")
        .select("*")
        .eq("agent_name", profileData.display_name)
        .order("created_at", { ascending: false })
        .limit(20);

      if (pulseMessages) {
        pulseNotifs = (pulseMessages as any[]).map((m) => ({
          id: `pulse-${m.id}`,
          user_id: session.user.id,
          type: "pulse_coaching",
          title: "Pulse: Manager Coaching",
          message: m.message,
          is_read: m.read,
          link: "/agent/pulse",
          metadata: { call_id: m.call_id },
          created_at: m.created_at,
        }));
      }
    }

    // Merge and sort by date
    const all = [...stdNotifs, ...pulseNotifs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, 50);

    setNotifications(all);
    setLoading(false);
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    if (id.startsWith("pulse-")) {
      const realId = id.replace("pulse-", "");
      await supabase
        .from("pulse_agent_messages")
        .update({ read: true })
        .eq("id", realId);
    } else {
      await supabase
        .from("notifications" as any)
        .update({ is_read: true } as any)
        .eq("id", id);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    // Mark standard notifications
    await supabase
      .from("notifications" as any)
      .update({ is_read: true } as any)
      .eq("user_id", session.user.id)
      .eq("is_read", false);

    // Mark pulse messages
    const { data: profileData } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", session.user.id)
      .single();

    if (profileData?.display_name) {
      await supabase
        .from("pulse_agent_messages")
        .update({ read: true })
        .eq("agent_name", profileData.display_name)
        .eq("read", false);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (!id.startsWith("pulse-")) {
      await supabase.from("notifications" as any).delete().eq("id", id);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => fetchNotifications()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pulse_agent_messages" },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification };
}
