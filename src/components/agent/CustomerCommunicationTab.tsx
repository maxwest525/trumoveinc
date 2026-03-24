import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Send, FileText, Loader2, ArrowUpRight, ArrowDownLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatPhoneNumber } from "@/lib/phoneFormat";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_EMAIL_TEMPLATES = [
  { id: "default-booking", name: "Booking Confirmation", subject: "Your Move is Confirmed - {booking_id}", body: `Dear {customer_name},\n\nThank you for choosing TruMove!\n\nBooking ID: {booking_id}\nMove Date: {move_date}\nPickup: {origin_address}\nDelivery: {dest_address}\n\nBest regards,\nThe TruMove Team` },
  { id: "default-reminder", name: "Day Before Reminder", subject: "Your Move is Tomorrow! - {booking_id}", body: `Hi {customer_name},\n\nYour move is scheduled for tomorrow!\n\n📅 Date: {move_date}\n📍 Pickup: {origin_address}\n\nSee you tomorrow!\nTruMove Team` },
  { id: "default-followup", name: "Post-Move Follow-up", subject: "How Was Your Move? - {booking_id}", body: `Dear {customer_name},\n\nWe hope your move went smoothly!\n\nThank you for choosing TruMove!\n\nWarm regards,\nThe TruMove Team` },
];

const DEFAULT_SMS_TEMPLATES = [
  { id: "default-sms-confirm", name: "Booking Confirmed", body: `TruMove: Your move is confirmed for {move_date}! Booking #{booking_id}. Reply HELP for assistance.` },
  { id: "default-sms-otw", name: "On The Way", body: `TruMove: Your crew is on the way! ETA: {eta}. Track live: {tracking_link}` },
  { id: "default-sms-arrived", name: "Crew Arrived", body: `TruMove: Your crew has arrived at {origin_address}. Please meet them at the entrance.` },
  { id: "default-sms-complete", name: "Move Complete", body: `TruMove: Your move is complete! Thank you. Questions? Call (800) 555-MOVE` },
];

interface Props {
  leadId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  mode: "email" | "sms";
}

export function CustomerCommunicationTab({ leadId, customerName, customerEmail, customerPhone, mode }: Props) {
  const [emailSubject, setEmailSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [recipient, setRecipient] = useState(mode === "email" ? customerEmail : customerPhone);
  const [isSending, setIsSending] = useState(false);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [newTplName, setNewTplName] = useState("");
  const [newTplSubject, setNewTplSubject] = useState("");
  const [newTplBody, setNewTplBody] = useState("");
  const [addToChannel, setAddToChannel] = useState<"email" | "sms" | "both">(mode);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setRecipient(mode === "email" ? customerEmail : customerPhone);
  }, [mode, customerEmail, customerPhone]);

  // Fetch custom templates from DB
  const { data: dbTemplates = [] } = useQuery({
    queryKey: ["message-templates", mode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("message_templates" as any)
        .select("*")
        .eq("channel", mode)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  // Fetch messages
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["customer-messages", leadId, mode],
    queryFn: async () => {
      const { data: portalAccess } = await supabase
        .from("customer_portal_access")
        .select("id")
        .eq("lead_id", leadId)
        .maybeSingle();
      if (!portalAccess) return [];
      const { data, error } = await supabase
        .from("customer_messages")
        .select("*")
        .eq("portal_access_id", portalAccess.id)
        .order("created_at", { ascending: true })
        .limit(100);
      if (error) throw error;
      const channelTag = mode === "email" ? "[EMAIL]" : "[SMS]";
      return (data || []).filter(m => m.content.startsWith(channelTag));
    },
  });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Save template mutation
  const saveTemplate = useMutation({
    mutationFn: async (channels: string[]) => {
      const { data: userData } = await supabase.auth.getUser();
      const inserts = channels.map(ch => ({
        name: newTplName,
        channel: ch,
        subject: ch === "email" ? newTplSubject : null,
        body: newTplBody,
        created_by: userData.user?.id || null,
      }));
      const { error } = await supabase.from("message_templates" as any).insert(inserts as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
      setShowAddTemplate(false);
      setNewTplName("");
      setNewTplSubject("");
      setNewTplBody("");
      toast.success("Template saved");
    },
    onError: (err: any) => toast.error("Failed to save", { description: err.message }),
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("message_templates" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
      toast.success("Template deleted");
    },
  });

  const handleTemplateSelect = (template: any) => {
    if (mode === "email") {
      if (template.subject) setEmailSubject(template.subject);
      setMessageBody(template.body);
    } else {
      setMessageBody(template.body);
    }
  };

  const handleSend = async () => {
    if (!recipient) { toast.error("No recipient"); return; }
    if (!messageBody) { toast.error("Enter a message"); return; }
    setIsSending(true);
    try {
      const payload: Record<string, string> = { channel: mode, to: recipient, body: messageBody };
      if (mode === "email") {
        payload.subject = emailSubject || "Message from TruMove";
        payload.customer_name = customerName;
      }
      const { data, error } = await supabase.functions.invoke("send-customer-message", { body: payload });
      if (error) throw error;
      if (data?.success === false) throw new Error(data.error || "Send failed");

      let { data: portalAccess } = await supabase
        .from("customer_portal_access")
        .select("id")
        .eq("lead_id", leadId)
        .maybeSingle();

      if (!portalAccess) {
        const { data: userData } = await supabase.auth.getUser();
        const { data: newAccess } = await supabase
          .from("customer_portal_access")
          .insert({
            lead_id: leadId,
            customer_email: mode === "email" ? recipient : customerEmail || "",
            invited_by: userData.user?.id || null,
          })
          .select("id")
          .single();
        portalAccess = newAccess;
      }

      if (portalAccess) {
        const { data: userData } = await supabase.auth.getUser();
        await supabase.from("customer_messages").insert({
          portal_access_id: portalAccess.id,
          sender_id: userData.user?.id || null,
          sender_type: "agent",
          content: `[${mode.toUpperCase()}] ${messageBody}`,
        });
        refetchMessages();
      }

      toast.success(`${mode === "email" ? "Email" : "SMS"} sent!`);
      setMessageBody("");
      if (mode === "email") setEmailSubject("");
    } catch (err: any) {
      toast.error("Failed to send", { description: err.message });
    } finally {
      setIsSending(false);
    }
  };

  const defaults = mode === "email" ? DEFAULT_EMAIL_TEMPLATES : DEFAULT_SMS_TEMPLATES;
  const isEmail = mode === "email";
  const Icon = isEmail ? Mail : MessageSquare;

  return (
    <>
      <div className="flex h-[calc(100vh-280px)] min-h-[400px] border border-border rounded-lg bg-background overflow-hidden">
        {/* Templates sidebar */}
        <div className="w-48 shrink-0 border-r border-border bg-muted/20 flex flex-col">
          <div className="px-3 py-2 border-b border-border flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> Templates
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              onClick={() => { setShowAddTemplate(true); setAddToChannel(mode); }}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-1.5 space-y-0.5">
              {/* Default templates */}
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50 px-2.5 pt-1 pb-0.5">Default</p>
              {defaults.map((t) => (
                <button
                  key={t.id}
                  className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  onClick={() => handleTemplateSelect(t)}
                >
                  {t.name}
                </button>
              ))}

              {/* Custom templates */}
              {dbTemplates.length > 0 && (
                <>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50 px-2.5 pt-2 pb-0.5">Custom</p>
                  {dbTemplates.map((t: any) => (
                    <div key={t.id} className="group flex items-center">
                      <button
                        className="flex-1 text-left text-[11px] px-2.5 py-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground truncate"
                        onClick={() => handleTemplateSelect(t)}
                      >
                        {t.name}
                      </button>
                      <button
                        className="opacity-0 group-hover:opacity-100 p-1 text-destructive/60 hover:text-destructive transition-opacity"
                        onClick={() => deleteTemplate.mutate(t.id)}
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold">{isEmail ? "Email" : "SMS"}</span>
            <Badge variant="secondary" className="text-[10px] gap-1">
              {isEmail ? customerEmail || "No email" : customerPhone || "No phone"}
            </Badge>
          </div>

          {/* Message thread */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Icon className="w-8 h-8 text-muted-foreground/15 mb-1.5" />
                <p className="text-xs text-muted-foreground">No {isEmail ? "emails" : "texts"} yet</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">Send the first message below</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isAgent = msg.sender_type === "agent";
                const cleanContent = msg.content.replace(/^\[(EMAIL|SMS)\]\s*/, "");
                return (
                  <div key={msg.id} className={cn("flex", isAgent ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[75%] rounded-xl px-3 py-2 text-sm",
                      isAgent
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted border border-border rounded-bl-sm"
                    )}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {isAgent ? <ArrowUpRight className="w-2.5 h-2.5 opacity-60" /> : <ArrowDownLeft className="w-2.5 h-2.5 opacity-60" />}
                        <span className="text-[9px] font-medium opacity-70">{isAgent ? "You" : customerName}</span>
                      </div>
                      <p className="text-xs whitespace-pre-wrap leading-relaxed">{cleanContent}</p>
                      <p className={cn("text-[9px] mt-1 text-right", isAgent ? "opacity-50" : "text-muted-foreground/60")}>
                        {new Date(msg.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Compose */}
          <div className="border-t border-border bg-muted/20 px-3 py-2 space-y-1.5">
            {isEmail && (
              <div className="flex gap-2">
                <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="To" className="h-6 text-[11px] flex-1" />
                <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Subject" className="h-6 text-[11px] flex-1" />
              </div>
            )}
            {!isEmail && (
              <Input value={recipient} onChange={(e) => setRecipient(formatPhoneNumber(e.target.value))} placeholder="To: (555) 123-4567" className="h-6 text-[11px]" />
            )}
            <div className="flex gap-2 items-end">
              <Textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder={isEmail ? "Write your email..." : "Type your message..."}
                rows={isEmail ? 8 : 3}
                className={cn("text-xs flex-1 min-h-0 resize-none", isEmail && "font-mono")}
                maxLength={!isEmail ? 320 : undefined}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isEmail) { e.preventDefault(); handleSend(); }
                }}
              />
              <Button onClick={handleSend} disabled={isSending || !messageBody.trim()} size="sm" className="h-8 w-8 p-0 shrink-0">
                {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </Button>
            </div>
            {!isEmail && messageBody.length > 160 && (
              <p className="text-[10px] text-amber-500">⚠️ {Math.ceil(messageBody.length / 160)} segments</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Template Dialog */}
      <Dialog open={showAddTemplate} onOpenChange={setShowAddTemplate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Add Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Template Name</Label>
              <Input value={newTplName} onChange={(e) => setNewTplName(e.target.value)} placeholder="e.g. Welcome Message" className="h-8 text-sm" />
            </div>
            {(addToChannel === "email" || addToChannel === "both") && (
              <div className="space-y-1">
                <Label className="text-xs">Subject (Email only)</Label>
                <Input value={newTplSubject} onChange={(e) => setNewTplSubject(e.target.value)} placeholder="Email subject line" className="h-8 text-sm" />
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-xs">Body</Label>
              <Textarea value={newTplBody} onChange={(e) => setNewTplBody(e.target.value)} placeholder="Template content..." rows={5} className="text-sm" />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <div className="flex gap-2 w-full">
              <Button
                size="sm"
                className="flex-1 text-xs"
                disabled={!newTplName || !newTplBody || saveTemplate.isPending}
                onClick={() => saveTemplate.mutate([mode])}
              >
                {saveTemplate.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Add to {mode === "email" ? "Email" : "SMS"} Templates
              </Button>
            </div>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                disabled={!newTplName || !newTplBody || saveTemplate.isPending}
                onClick={() => saveTemplate.mutate(["email"])}
              >
                Add to All Email Templates
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                disabled={!newTplName || !newTplBody || saveTemplate.isPending}
                onClick={() => saveTemplate.mutate(["sms"])}
              >
                Add to All SMS Templates
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
