import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Send, FileText, Copy, Check, Loader2, Clock, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatPhoneNumber } from "@/lib/phoneFormat";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const EMAIL_TEMPLATES = [
  {
    id: "booking-confirm",
    name: "Booking Confirmation",
    subject: "Your Move is Confirmed - {booking_id}",
    body: `Dear {customer_name},\n\nThank you for choosing TruMove for your upcoming relocation!\n\nWe're pleased to confirm your booking:\n• Booking ID: {booking_id}\n• Move Date: {move_date}\n• Pickup: {origin_address}\n• Delivery: {dest_address}\n• Estimated Weight: {weight}\n\nOur team will arrive between {time_window}. Please ensure someone is available to provide access.\n\nIf you have any questions, reply to this email or call us at (800) 555-MOVE.\n\nBest regards,\nThe TruMove Team`,
  },
  {
    id: "day-before",
    name: "Day Before Reminder",
    subject: "Your Move is Tomorrow! - {booking_id}",
    body: `Hi {customer_name},\n\nJust a friendly reminder that your move is scheduled for tomorrow!\n\n📅 Date: {move_date}\n⏰ Arrival Window: {time_window}\n📍 Pickup: {origin_address}\n\nPlease have the following ready:\n✓ Clear pathways for our crew\n✓ Fragile items marked\n✓ Payment method confirmed\n✓ Someone available to sign paperwork\n\nQuestions? Call us anytime at (800) 555-MOVE.\n\nSee you tomorrow!\nTruMove Team`,
  },
  {
    id: "followup",
    name: "Post-Move Follow-up",
    subject: "How Was Your Move? - {booking_id}",
    body: `Dear {customer_name},\n\nWe hope your move went smoothly! Your satisfaction is our top priority.\n\nWe'd love to hear about your experience. Could you take a moment to:\n⭐ Leave us a review: [Review Link]\n📝 Complete our quick survey: [Survey Link]\n\nIf you experienced any issues or have concerns, please reply to this email immediately and we'll address them right away.\n\nThank you for choosing TruMove!\n\nWarm regards,\nThe TruMove Team`,
  },
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
  const [activeTab, setActiveTab] = useState("compose");
  const composeMode = mode;
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [recipient, setRecipient] = useState(mode === "email" ? customerEmail : customerPhone);
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setRecipient(mode === "email" ? customerEmail : customerPhone);
  }, [mode, customerEmail, customerPhone]);

  // Fetch message history from customer_messages
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["customer-messages", leadId],
    queryFn: async () => {
      // First get portal access for this lead
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
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
  });

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (composeMode === "email") {
      const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
      if (template) {
        setEmailSubject(template.subject);
        setMessageBody(template.body);
      }
    } else {
      const template = SMS_TEMPLATES.find((t) => t.id === templateId);
      if (template) setMessageBody(template.body);
    }
    toast.success("Template loaded");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageBody);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    if (!recipient) { toast.error("No recipient"); return; }
    if (!messageBody) { toast.error("Enter a message"); return; }
    setIsSending(true);
    try {
      const channel = composeMode;
      const payload: Record<string, string> = { channel, to: recipient, body: messageBody };
      if (channel === "email") {
        payload.subject = emailSubject || "Message from TruMove";
        payload.customer_name = customerName;
      }

      const { data, error } = await supabase.functions.invoke("send-customer-message", { body: payload });
      if (error) throw error;
      if (data?.success === false) throw new Error(data.error || "Send failed");

      // Log the message
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
          content: `[${channel.toUpperCase()}] ${messageBody}`,
        });
        refetchMessages();
      }

      toast.success(`${channel === "email" ? "Email" : "SMS"} sent!`);
      setMessageBody("");
      if (channel === "email") setEmailSubject("");
      setActiveTab("history");
    } catch (err: any) {
      toast.error(`Failed to send`, { description: err.message });
    } finally {
      setIsSending(false);
    }
  };

  const templates = composeMode === "email" ? EMAIL_TEMPLATES : SMS_TEMPLATES;

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Communication</h3>
          {customerEmail && (
            <Badge variant="secondary" className="text-[10px] gap-1">
              <Mail className="w-3 h-3" /> {customerEmail}
            </Badge>
          )}
          {customerPhone && (
            <Badge variant="secondary" className="text-[10px] gap-1">
              <MessageSquare className="w-3 h-3" /> {customerPhone}
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="compose" className="text-xs gap-1.5">
              <Send className="w-3.5 h-3.5" /> Compose
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs gap-1.5">
              <Clock className="w-3.5 h-3.5" /> History
            </TabsTrigger>
          </TabsList>
          {activeTab === "compose" && (
            <div className="flex gap-1">
              <Button
                variant={composeMode === "email" ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setComposeMode("email")}
              >
                <Mail className="w-3 h-3" /> Email
              </Button>
              <Button
                variant={composeMode === "sms" ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setComposeMode("sms")}
              >
                <MessageSquare className="w-3 h-3" /> SMS
              </Button>
            </div>
          )}
        </div>

        {/* History Tab */}
        <TabsContent value="history" className="mt-4">
          {messages.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Mail className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No messages yet</p>
                <Button variant="outline" size="sm" className="mt-3 gap-1.5 text-xs" onClick={() => setActiveTab("compose")}>
                  <Send className="w-3 h-3" /> Send first message
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => {
                const isAgent = msg.sender_type === "agent";
                const isEmail = msg.content.startsWith("[EMAIL]");
                const isSms = msg.content.startsWith("[SMS]");
                const cleanContent = msg.content.replace(/^\[(EMAIL|SMS)\]\s*/, "");
                return (
                  <div key={msg.id} className={cn(
                    "p-3 rounded-lg border text-sm",
                    isAgent ? "bg-muted/30 border-border" : "bg-primary/5 border-primary/20"
                  )}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {isAgent ? (
                          <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                        ) : (
                          <ArrowDownLeft className="w-3 h-3 text-primary" />
                        )}
                        <span className="text-xs font-medium">{isAgent ? "You" : customerName}</span>
                        {(isEmail || isSms) && (
                          <Badge variant="outline" className="text-[9px] h-4 px-1">
                            {isEmail ? "Email" : "SMS"}
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4">{cleanContent}</p>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Compose Tab */}
        <TabsContent value="compose" className="mt-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Templates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {composeMode === "email" ? "Email" : "SMS"} Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {templates.map((t) => (
                  <Button
                    key={t.id}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-xs h-8",
                      selectedTemplate === t.id ? "bg-foreground text-background border-foreground" : ""
                    )}
                    onClick={() => handleTemplateSelect(t.id)}
                  >
                    {t.name}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Compose */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Compose {composeMode === "email" ? "Email" : "SMS"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{composeMode === "email" ? "To" : "Phone"}</Label>
                  <Input
                    value={recipient}
                    onChange={(e) => setRecipient(composeMode === "sms" ? formatPhoneNumber(e.target.value) : e.target.value)}
                    placeholder={composeMode === "email" ? "customer@email.com" : "(555) 123-4567"}
                    className="h-8 text-sm"
                  />
                </div>
                {composeMode === "email" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Subject</Label>
                    <Input
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Email subject"
                      className="h-8 text-sm"
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">
                      Message {composeMode === "sms" && `(${messageBody.length}/160)`}
                    </Label>
                    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-6 text-[10px] gap-1 px-2">
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <Textarea
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    placeholder="Type your message..."
                    rows={composeMode === "email" ? 8 : 4}
                    className={cn("text-sm", composeMode === "email" && "font-mono")}
                    maxLength={composeMode === "sms" ? 320 : undefined}
                  />
                  {composeMode === "sms" && messageBody.length > 160 && (
                    <p className="text-[10px] text-amber-500">⚠️ Will send as {Math.ceil(messageBody.length / 160)} segments</p>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSend} disabled={isSending} size="sm" className="gap-1.5">
                    {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {isSending ? "Sending…" : `Send ${composeMode === "email" ? "Email" : "SMS"}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
