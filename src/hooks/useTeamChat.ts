import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ChatProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_online: boolean;
  last_seen: string | null;
  role?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender_id: string | null;
  created_at: string;
  sender?: ChatProfile;
}

export interface ChatConversation {
  id: string;
  name: string | null;
  is_group: boolean;
  created_at: string;
  updated_at: string;
  last_message?: ChatMessage;
  members: ChatProfile[];
  unread_count: number;
}

export function useTeamChat() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [profiles, setProfiles] = useState<ChatProfile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  // Fetch all profiles (team members)
  const fetchProfiles = useCallback(async () => {
    if (!currentUserId) return;
    const { data } = await supabase
      .from("profiles")
      .select("id, email, display_name, avatar_url, is_online, last_seen");
    if (data) {
      // Fetch roles
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const roleMap = new Map<string, string>();
      roles?.forEach(r => roleMap.set(r.user_id, r.role));

      setProfiles(
        data
          .filter(p => p.id !== currentUserId)
          .map(p => ({ ...p, is_online: p.is_online ?? false, role: roleMap.get(p.id) || "agent" }))
      );
    }
  }, [currentUserId]);

  // Fetch conversations the user is a member of
  const fetchConversations = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);

    // Get conversation IDs user is a member of
    const { data: memberships } = await supabase
      .from("conversation_memberships")
      .select("conversation_id")
      .eq("user_id", currentUserId);

    if (!memberships || memberships.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const convIds = memberships.map(m => m.conversation_id);

    // Fetch conversations
    const { data: convs } = await supabase
      .from("conversations")
      .select("*")
      .in("id", convIds)
      .order("updated_at", { ascending: false });

    if (!convs) {
      setConversations([]);
      setLoading(false);
      return;
    }

    // For each conversation, get members + last message + unread count
    const enriched: ChatConversation[] = await Promise.all(
      convs.map(async (conv) => {
        // Members
        const { data: memberRows } = await supabase
          .from("conversation_memberships")
          .select("user_id")
          .eq("conversation_id", conv.id);

        const memberIds = (memberRows || []).map(m => m.user_id).filter(id => id !== currentUserId);
        const { data: memberProfiles } = await supabase
          .from("profiles")
          .select("id, email, display_name, avatar_url, is_online, last_seen")
          .in("id", memberIds.length ? memberIds : ["__none__"]);

        // Last message
        const { data: lastMsgs } = await supabase
          .from("messages")
          .select("id, content, sender_id, created_at")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1);

        // Unread count
        const { data: readReceipts } = await supabase
          .from("read_receipts")
          .select("message_id")
          .eq("user_id", currentUserId);

        const readIds = new Set((readReceipts || []).map(r => r.message_id));

        const { data: allMsgs } = await supabase
          .from("messages")
          .select("id, sender_id")
          .eq("conversation_id", conv.id);

        const unread = (allMsgs || []).filter(m => m.sender_id !== currentUserId && !readIds.has(m.id)).length;

        return {
          id: conv.id,
          name: conv.name,
          is_group: conv.is_group ?? false,
          created_at: conv.created_at ?? "",
          updated_at: conv.updated_at ?? "",
          members: (memberProfiles || []).map(p => ({ ...p, is_online: p.is_online ?? false })),
          last_message: lastMsgs?.[0] || undefined,
          unread_count: unread,
        };
      })
    );

    setConversations(enriched);
    setLoading(false);
  }, [currentUserId]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("id, content, sender_id, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (data) {
      // Mark unread messages as read
      if (currentUserId) {
        const { data: existing } = await supabase
          .from("read_receipts")
          .select("message_id")
          .eq("user_id", currentUserId);
        const readSet = new Set((existing || []).map(r => r.message_id));
        const unread = data.filter(m => m.sender_id !== currentUserId && !readSet.has(m.id));
        if (unread.length > 0) {
          await supabase.from("read_receipts").insert(
            unread.map(m => ({ message_id: m.id, user_id: currentUserId }))
          );
        }
      }
      setMessages(data);
    }
  }, [currentUserId]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!selectedConversationId || !currentUserId || !content.trim()) return;
    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedConversationId,
      sender_id: currentUserId,
      content: content.trim(),
    });
    if (error) {
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    } else {
      // Update conversation updated_at
      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", selectedConversationId);
    }
  }, [selectedConversationId, currentUserId, toast]);

  // Start or find a DM conversation with a profile
  const startConversation = useCallback(async (profileId: string): Promise<string | null> => {
    if (!currentUserId) return null;

    // Check if a DM already exists between these two users
    const { data: myMemberships } = await supabase
      .from("conversation_memberships")
      .select("conversation_id")
      .eq("user_id", currentUserId);

    const { data: theirMemberships } = await supabase
      .from("conversation_memberships")
      .select("conversation_id")
      .eq("user_id", profileId);

    const myConvIds = new Set((myMemberships || []).map(m => m.conversation_id));
    const sharedConvIds = (theirMemberships || []).filter(m => myConvIds.has(m.conversation_id)).map(m => m.conversation_id);

    if (sharedConvIds.length > 0) {
      // Check if any is a DM (not group)
      const { data: convs } = await supabase
        .from("conversations")
        .select("id, is_group")
        .in("id", sharedConvIds)
        .eq("is_group", false);

      if (convs && convs.length > 0) {
        return convs[0].id;
      }
    }

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from("conversations")
      .insert({ created_by: currentUserId, is_group: false })
      .select("id")
      .single();

    if (error || !newConv) {
      toast({ title: "Error", description: "Failed to create conversation.", variant: "destructive" });
      return null;
    }

    // Add both members
    await supabase.from("conversation_memberships").insert([
      { conversation_id: newConv.id, user_id: currentUserId },
      { conversation_id: newConv.id, user_id: profileId },
    ]);

    await fetchConversations();
    return newConv.id;
  }, [currentUserId, toast, fetchConversations]);

  // Create group conversation
  const createGroupConversation = useCallback(async (name: string, memberIds: string[]): Promise<string | null> => {
    if (!currentUserId) return null;

    const { data: newConv, error } = await supabase
      .from("conversations")
      .insert({ created_by: currentUserId, is_group: true, name })
      .select("id")
      .single();

    if (error || !newConv) {
      toast({ title: "Error", description: "Failed to create group.", variant: "destructive" });
      return null;
    }

    const allMembers = [currentUserId, ...memberIds];
    await supabase.from("conversation_memberships").insert(
      allMembers.map(uid => ({ conversation_id: newConv.id, user_id: uid }))
    );

    await fetchConversations();
    return newConv.id;
  }, [currentUserId, toast, fetchConversations]);

  // Initial data load
  useEffect(() => {
    if (currentUserId) {
      fetchProfiles();
      fetchConversations();
    }
  }, [currentUserId, fetchProfiles, fetchConversations]);

  // Load messages when conversation selected
  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!selectedConversationId) return;
    const channel = supabase
      .channel(`team-chat-${selectedConversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedConversationId}` },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Mark as read if from someone else
          if (currentUserId && newMsg.sender_id !== currentUserId) {
            supabase.from("read_receipts").insert({ message_id: newMsg.id, user_id: currentUserId });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConversationId, currentUserId]);

  // Realtime for conversation list updates
  useEffect(() => {
    if (!currentUserId) return;
    const channel = supabase
      .channel("team-chat-convos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => { fetchConversations(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, fetchConversations]);

  return {
    currentUserId,
    conversations,
    profiles,
    messages,
    selectedConversationId,
    setSelectedConversationId,
    sendMessage,
    startConversation,
    createGroupConversation,
    loading,
    fetchConversations,
  };
}
