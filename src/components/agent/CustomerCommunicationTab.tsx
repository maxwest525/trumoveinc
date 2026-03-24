import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, MessageSquare, Send, FileText, Loader2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatPhoneNumber } from "@/lib/phoneFormat";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const EMAIL_TEMPLATES = [
  { id: "booking-confirm", name: "Booking Confirmation", subject: "Your Move is Confirmed - {booking_id}", body: `Dear {customer_name},\n\nThank you for choosing TruMove for your upcoming relocation!\n\nWe're pleased to confirm your booking:\n• Booking ID: {booking_id}\n• Move Date: {move_date}\n• Pickup: {origin_address}\n• Delivery: {dest_address}\n\nBest regards,\nThe TruMove Team` },
  { id: "day-before", name: "Day Before Reminder", subject: "Your Move is Tomorrow! - {booking_id}", body: `Hi {customer_name},\n\nJust a friendly reminder that your move is scheduled for tomorrow!\n\n📅 Date: {move_date}\n📍 Pickup: {origin_address}\n\nSee you tomorrow!\nTruMove Team` },
  { id: "followup", name: "Post-Move Follow-up", subject: "How Was Your Move? - {booking_id}", body: `Dear {customer_name},\n\nWe hope your move went smoothly!\n\nThank you for choosing TruMove!\n\nWarm regards,\nThe TruMove Team` },
];

const SMS_TEMPLATES = [
  { id: "sms-confirm", name: "Booking Confirmed", body: `TruMove: Your move is confirmed for {move_date}! Booking #{booking_id}. Reply HELP for assistance.` },
  { id: "sms-otw", name: "On The Way", body: `TruMove: Your crew is on the way! ETA: {eta}. Track live: {tracking_link}` },
  { id: "sms-arrived", name: "Crew Arrived", body: `TruMove: Your crew has arrived at {origin_address}. Please meet them at the entrance.` },
  { id: "sms-complete", name: "Move Complete", body: `TruMove: Your move is complete! Thank you for choosing us. Questions? Call (800) 555-MOVE` },
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecipient(mode === "email" ? customerEmail : customerPhone);
  }, [mode, customerEmail, customerPhone]);

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
      // Filter by channel type
      const channelTag = mode === "email" ? "[EMAIL]" : "[SMS]";
      return (data || []).filter(m => m.content.startsWith(channelTag));
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleTemplateSelect = (template: any) => {
    if (mode === "email") {
      setEmailSubject(template.subject);
      setMessageBody(template.body);
    } else {
      setMessageBody(template.body);
    }
    toast.success("Template loaded");
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

      const { data: portalAccess } = await supabase
        .from("customer_portal_access")
        .select("id")
        .eq("lead_id", leadId)
        .maybeSingle();

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

  const templates = mode === "email" ? EMAIL_TEMPLATES : SMS_TEMPLATES;
  const isEmail = mode === "email";
  const Icon = isEmail ? Mail : MessageSquare;

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[400px] border border-border rounded-lg bg-background overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">{isEmail ? "Email" : "SMS"}</span>
          <Badge variant="secondary" className="text-[10px] gap-1">
            {isEmail ? customerEmail || "No email" : customerPhone || "No phone"}
          </Badge>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
              <FileText className="w-3 h-3" /> Templates
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48 p-1.5">
            {templates.map((t) => (
              <Button
                key={t.id}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-7"
                onClick={() => handleTemplateSelect(t)}
              >
                {t.name}
              </Button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {/* Message thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Icon className="w-10 h-10 text-muted-foreground/15 mb-2" />
            <p className="text-sm text-muted-foreground">No {isEmail ? "emails" : "texts"} yet</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">Send the first message below</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isAgent = msg.sender_type === "agent";
            const cleanContent = msg.content.replace(/^\[(EMAIL|SMS)\]\s*/, "");
            return (
              <div key={msg.id} className={cn("flex", isAgent ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[75%] rounded-xl px-3.5 py-2.5 text-sm",
                  isAgent
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted border border-border rounded-bl-sm"
                )}>
                  <div className="flex items-center gap-1.5 mb-1">
                    {isAgent ? (
                      <ArrowUpRight className="w-3 h-3 opacity-60" />
                    ) : (
                      <ArrowDownLeft className="w-3 h-3 opacity-60" />
                    )}
                    <span className="text-[10px] font-medium opacity-70">
                      {isAgent ? "You" : customerName}
                    </span>
                  </div>
                  <p className="text-xs whitespace-pre-wrap leading-relaxed">{cleanContent}</p>
                  <p className={cn(
                    "text-[9px] mt-1.5 text-right",
                    isAgent ? "opacity-50" : "text-muted-foreground/60"
                  )}>
                    {new Date(msg.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Compose area */}
      <div className="border-t border-border bg-muted/20 px-4 py-3 space-y-2">
        {isEmail && (
          <div className="flex gap-2">
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="To: customer@email.com"
              className="h-7 text-xs flex-1"
            />
            <Input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Subject"
              className="h-7 text-xs flex-1"
            />
          </div>
        )}
        {!isEmail && (
          <Input
            value={recipient}
            onChange={(e) => setRecipient(formatPhoneNumber(e.target.value))}
            placeholder="To: (555) 123-4567"
            className="h-7 text-xs"
          />
        )}
        <div className="flex gap-2 items-end">
          <Textarea
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder={isEmail ? "Write your email..." : "Type your message..."}
            rows={isEmail ? 3 : 2}
            className={cn("text-xs flex-1 min-h-0 resize-none", isEmail && "font-mono")}
            maxLength={!isEmail ? 320 : undefined}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isEmail) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button onClick={handleSend} disabled={isSending || !messageBody.trim()} size="sm" className="h-9 w-9 p-0 shrink-0">
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        {!isEmail && messageBody.length > 160 && (
          <p className="text-[10px] text-amber-500">⚠️ {Math.ceil(messageBody.length / 160)} segments ({messageBody.length}/320)</p>
        )}
      </div>
    </div>
  );
}
