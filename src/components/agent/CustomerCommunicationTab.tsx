import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Send, FileText, Loader2, ArrowUpRight, ArrowDownLeft, Plus, Trash2, Pencil, Inbox, Reply, Clock, ExternalLink, RotateCw } from "lucide-react";
import { openInOutlook } from "@/lib/openInOutlook";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatPhoneNumber } from "@/lib/phoneFormat";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EMAIL_STARTERS, SMS_STARTERS } from "@/lib/starterTemplates";

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
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const isEmail = mode === "email";
  const Icon = isEmail ? Mail : MessageSquare;

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
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      const channelTag = mode === "email" ? "[EMAIL]" : "[SMS]";
      return (data || []).filter((m: any) => m.content.startsWith(channelTag));
    },
  });

  useEffect(() => {
    if (!isEmail && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isEmail]);

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
    setComposing(true);
    setSelectedEmailId(null);
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
        const subjectPrefix = isEmail && emailSubject ? `Subject: ${emailSubject}\n` : "";
        await supabase.from("customer_messages").insert({
          portal_access_id: portalAccess.id,
          sender_id: userData.user?.id || null,
          sender_type: "agent",
          content: `[${mode.toUpperCase()}] ${subjectPrefix}${messageBody}`,
        });
        refetchMessages();
      }

      toast.success(`${mode === "email" ? "Email" : "SMS"} sent!`);
      setMessageBody("");
      if (mode === "email") {
        setEmailSubject("");
        setComposing(false);
      }
    } catch (err: any) {
      toast.error("Failed to send", { description: err.message });
    } finally {
      setIsSending(false);
    }
  };

  const defaults = mode === "email" ? EMAIL_STARTERS : SMS_STARTERS;

  // Parse email messages to extract subject
  const parseEmailMessage = (msg: any) => {
    const raw = msg.content.replace(/^\[(EMAIL|SMS)\]\s*/, "");
    const subjectMatch = raw.match(/^Subject:\s*(.+)\n/);
    const subject = subjectMatch ? subjectMatch[1] : "(No Subject)";
    const body = subjectMatch ? raw.replace(/^Subject:\s*.+\n/, "") : raw;
    return { subject, body };
  };

  const selectedMessage = messages.find((m: any) => m.id === selectedEmailId);

  // ─── Templates sidebar (shared) ───
  const templatesSidebar = (
    <div className="w-48 shrink-0 border-r border-border bg-muted/20 flex flex-col">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <FileText className="w-3 h-3" /> Templates
        </p>
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => { setShowAddTemplate(true); setAddToChannel(mode); }}>
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-1.5 space-y-0.5">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50 px-2.5 pt-1 pb-0.5">Default</p>
          {defaults.map((t) => (
            <button key={t.id} className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" onClick={() => handleTemplateSelect(t)}>
              {t.name}
            </button>
          ))}
          {dbTemplates.length > 0 && (
            <>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50 px-2.5 pt-2 pb-0.5">Custom</p>
              {dbTemplates.map((t: any) => (
                <div key={t.id} className="group flex items-center">
                  <button className="flex-1 text-left text-[11px] px-2.5 py-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground truncate" onClick={() => handleTemplateSelect(t)}>
                    {t.name}
                  </button>
                  <button className="opacity-0 group-hover:opacity-100 p-1 text-destructive/60 hover:text-destructive transition-opacity" onClick={() => deleteTemplate.mutate(t.id)}>
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // ─── Add Template Dialog ───
  const templateDialog = (
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
            <Button size="sm" className="flex-1 text-xs" disabled={!newTplName || !newTplBody || saveTemplate.isPending} onClick={() => saveTemplate.mutate([mode])}>
              {saveTemplate.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
              Add to {mode === "email" ? "Email" : "SMS"} Templates
            </Button>
          </div>
          <div className="flex gap-2 w-full">
            <Button variant="outline" size="sm" className="flex-1 text-xs" disabled={!newTplName || !newTplBody || saveTemplate.isPending} onClick={() => saveTemplate.mutate(["email"])}>
              Add to All Email Templates
            </Button>
            <Button variant="outline" size="sm" className="flex-1 text-xs" disabled={!newTplName || !newTplBody || saveTemplate.isPending} onClick={() => saveTemplate.mutate(["sms"])}>
              Add to All SMS Templates
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // ═══════════════════════════════════════
  // EMAIL MODE — Inbox-style layout
  // ═══════════════════════════════════════
  if (isEmail) {
    return (
      <>
        <div className="flex h-[calc(100vh-280px)] min-h-[400px] border border-border rounded-lg bg-background overflow-hidden">
          {templatesSidebar}

          {/* Email list pane */}
          <div className="w-72 shrink-0 border-r border-border flex flex-col">
            {/* Inbox header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
              <div className="flex items-center gap-1.5">
                <Inbox className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold">Inbox</span>
                {messages.length > 0 && (
                  <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{messages.length}</Badge>
                )}
              </div>
              <Button
                variant="default"
                size="sm"
                className="h-6 text-[10px] gap-1 px-2"
                onClick={() => { setComposing(true); setSelectedEmailId(null); setEmailSubject(""); setMessageBody(""); setRecipient(customerEmail); }}
              >
                <Pencil className="w-3 h-3" /> Compose
              </Button>
            </div>

            {/* Email list */}
            <ScrollArea className="flex-1">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
                  <Mail className="w-8 h-8 text-muted-foreground/15 mb-2" />
                  <p className="text-xs text-muted-foreground">No emails yet</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">Click Compose to send one</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {messages.map((msg: any) => {
                    const { subject } = parseEmailMessage(msg);
                    const isAgent = msg.sender_type === "agent";
                    const isSelected = selectedEmailId === msg.id;
                    const date = new Date(msg.created_at);
                    const isToday = new Date().toDateString() === date.toDateString();
                    const timeStr = isToday
                      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : date.toLocaleDateString([], { month: "short", day: "numeric" });

                    return (
                      <button
                        key={msg.id}
                        onClick={() => { setSelectedEmailId(msg.id); setComposing(false); }}
                        className={cn(
                          "w-full text-left px-3 py-2.5 transition-colors hover:bg-muted/50",
                          isSelected && "bg-primary/5 border-l-2 border-l-primary"
                        )}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] font-semibold text-foreground truncate flex items-center gap-1">
                            {isAgent ? (
                              <ArrowUpRight className="w-3 h-3 text-primary shrink-0" />
                            ) : (
                              <ArrowDownLeft className="w-3 h-3 text-muted-foreground shrink-0" />
                            )}
                            {isAgent ? "You" : customerName}
                          </span>
                          <span className="text-[9px] text-muted-foreground/60 shrink-0 ml-2 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {timeStr}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-foreground/80 truncate">{subject}</p>
                        <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5 leading-snug">
                          {parseEmailMessage(msg).body.slice(0, 80)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right pane: Read or Compose */}
          <div className="flex-1 flex flex-col min-w-0">
            {composing ? (
              /* ── Compose pane ── */
              <div className="flex-1 flex flex-col">
                <div className="px-4 py-2 border-b border-border bg-muted/30 flex items-center gap-2">
                  <Pencil className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold">New Email</span>
                </div>
                <div className="flex-1 flex flex-col px-4 py-3 space-y-2 overflow-auto">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Label className="text-[10px] text-muted-foreground w-10 shrink-0">To</Label>
                      <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="recipient@email.com" className="h-7 text-xs flex-1" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-[10px] text-muted-foreground w-10 shrink-0">Subject</Label>
                      <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Email subject" className="h-7 text-xs flex-1" />
                    </div>
                  </div>
                  <Separator />
                  <Textarea
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    placeholder="Write your email..."
                    className="flex-1 text-sm resize-none min-h-[200px]"
                  />
                </div>
                <div className="px-4 py-2 border-t border-border bg-muted/20 flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setComposing(false)}>
                    Cancel
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      disabled={!recipient || !messageBody.trim()}
                      onClick={() => {
                        openInOutlook({ to: recipient, subject: emailSubject || "Message from TruMove", body: messageBody });
                        toast.success("Opening in Outlook...");
                      }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open in Outlook
                    </Button>
                    <Button onClick={handleSend} disabled={isSending || !messageBody.trim()} size="sm" className="gap-1.5 text-xs">
                      {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Send Direct
                    </Button>
                  </div>
                </div>
              </div>
            ) : selectedMessage ? (
              /* ── Read pane ── */
              <div className="flex-1 flex flex-col">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {parseEmailMessage(selectedMessage).subject}
                  </h3>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {selectedMessage.sender_type === "agent" ? (
                        <><ArrowUpRight className="w-3 h-3 text-primary" /> Sent to {customerEmail}</>
                      ) : (
                        <><ArrowDownLeft className="w-3 h-3" /> From {customerName} ({customerEmail})</>
                      )}
                    </span>
                    <span>
                      {new Date(selectedMessage.created_at).toLocaleString([], {
                        weekday: "short", month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <ScrollArea className="flex-1 px-4 py-4">
                  <div className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90 max-w-2xl">
                    {parseEmailMessage(selectedMessage).body}
                  </div>
                </ScrollArea>
                <div className="px-4 py-2 border-t border-border bg-muted/20 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => {
                      const { subject } = parseEmailMessage(selectedMessage);
                      setComposing(true);
                      setSelectedEmailId(null);
                      setEmailSubject(`Re: ${subject.replace(/^Re:\s*/i, "")}`);
                      setMessageBody("");
                      setRecipient(customerEmail);
                    }}
                  >
                    <Reply className="w-3.5 h-3.5" /> Reply
                  </Button>
                  {selectedMessage.sender_type === "agent" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => {
                        const { subject, body } = parseEmailMessage(selectedMessage);
                        setComposing(true);
                        setSelectedEmailId(null);
                        setEmailSubject(subject);
                        setMessageBody(body);
                        setRecipient(customerEmail);
                      }}
                    >
                      <RotateCw className="w-3.5 h-3.5" /> Resend
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              /* ── Empty state ── */
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <Mail className="w-12 h-12 text-muted-foreground/10 mb-3" />
                <p className="text-sm text-muted-foreground/60">Select an email to read</p>
                <p className="text-xs text-muted-foreground/40 mt-1">or click Compose to write a new one</p>
              </div>
            )}
          </div>
        </div>
        {templateDialog}
      </>
    );
  }

  // ═══════════════════════════════════════
  // SMS MODE — Chat bubble layout (unchanged)
  // ═══════════════════════════════════════
  const smsMessages = [...messages].reverse();

  return (
    <>
      <div className="flex h-[calc(100vh-280px)] min-h-[400px] border border-border rounded-lg bg-background overflow-hidden">
        {templatesSidebar}

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold">SMS</span>
            <Badge variant="secondary" className="text-[10px] gap-1">
              {customerPhone || "No phone"}
            </Badge>
          </div>

          {/* Message thread */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
            {smsMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground/15 mb-1.5" />
                <p className="text-xs text-muted-foreground">No texts yet</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">Send the first message below</p>
              </div>
            ) : (
              smsMessages.map((msg: any) => {
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
            <Input value={recipient} onChange={(e) => setRecipient(formatPhoneNumber(e.target.value))} placeholder="To: (555) 123-4567" className="h-6 text-[11px]" />
            <div className="flex gap-2 items-end">
              <Textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Type your message..."
                rows={3}
                className="text-xs flex-1 min-h-0 resize-none"
                maxLength={320}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
              />
              <Button onClick={handleSend} disabled={isSending || !messageBody.trim()} size="sm" className="h-8 w-8 p-0 shrink-0">
                {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </Button>
            </div>
            {messageBody.length > 160 && (
              <p className="text-[10px] text-amber-500">⚠️ {Math.ceil(messageBody.length / 160)} segments</p>
            )}
          </div>
        </div>
      </div>
      {templateDialog}
    </>
  );
}
