import { useState, useRef, useCallback } from "react";
import MarketingShell from "@/components/layout/MarketingShell";
import {
  Mail, MessageSquare, Plus, Trash2, Save, Eye, Code, Paintbrush,
  Copy, Loader2, FileText, ChevronDown, Bold, Italic, Link2,
  Image, AlignLeft, List, Type, Hash, User, MapPin, Calendar,
  Phone, Package, Truck, DollarSign, Pencil, CheckCircle2, Blocks,
} from "lucide-react";
import EmailBlockEditor, { blocksToHtml } from "@/components/email-builder/EmailBlockEditor";
import { type EmailBlock } from "@/components/email-builder/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ─── Merge Tags ───
const MERGE_TAGS = [
  { tag: "{customer_name}", label: "Customer Name", icon: User, desc: "Full name" },
  { tag: "{first_name}", label: "First Name", icon: User, desc: "First name only" },
  { tag: "{last_name}", label: "Last Name", icon: User, desc: "Last name only" },
  { tag: "{email}", label: "Email", icon: Mail, desc: "Customer email" },
  { tag: "{phone}", label: "Phone", icon: Phone, desc: "Phone number" },
  { tag: "{origin_address}", label: "Origin Address", icon: MapPin, desc: "Pickup address" },
  { tag: "{dest_address}", label: "Destination", icon: MapPin, desc: "Delivery address" },
  { tag: "{move_date}", label: "Move Date", icon: Calendar, desc: "Scheduled date" },
  { tag: "{booking_id}", label: "Booking ID", icon: Package, desc: "Reference number" },
  { tag: "{estimated_value}", label: "Estimate", icon: DollarSign, desc: "Quote amount" },
  { tag: "{tracking_link}", label: "Tracking Link", icon: Truck, desc: "Live tracking URL" },
  { tag: "{eta}", label: "ETA", icon: Calendar, desc: "Estimated arrival" },
  { tag: "{agent_name}", label: "Agent Name", icon: User, desc: "Assigned agent" },
  { tag: "{company_name}", label: "Company Name", icon: FileText, desc: "TruMove Inc" },
];

// ─── Starter Templates ───
const EMAIL_STARTERS = [
  {
    name: "Welcome Email",
    subject: "Welcome to TruMove, {first_name}!",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #16a34a; padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to TruMove!</h1>
  </div>
  <div style="padding: 32px 24px; background: #ffffff;">
    <p style="font-size: 16px; color: #1a1a1a;">Hi {first_name},</p>
    <p style="font-size: 14px; color: #555; line-height: 1.6;">Thank you for choosing TruMove for your upcoming move. We're committed to making your relocation as smooth and stress-free as possible.</p>
    <p style="font-size: 14px; color: #555; line-height: 1.6;">Your dedicated agent will be reaching out shortly to discuss your move details.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="{tracking_link}" style="display: inline-block; background: #16a34a; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Track Your Move</a>
    </div>
    <p style="font-size: 12px; color: #999; text-align: center;">Questions? Reply to this email or call us anytime.</p>
  </div>
</div>`,
  },
  {
    name: "Quote Follow-Up",
    subject: "Your Moving Quote — {booking_id}",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #0f172a; padding: 28px 24px; border-radius: 12px 12px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Your Moving Quote</h1>
    <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px;">Reference: {booking_id}</p>
  </div>
  <div style="padding: 28px 24px; background: #ffffff;">
    <p style="font-size: 15px; color: #1a1a1a;">Hi {first_name},</p>
    <p style="font-size: 14px; color: #555; line-height: 1.6;">Here's your personalized moving estimate:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 0; font-size: 13px; color: #666;">From:</td>
        <td style="padding: 10px 0; font-size: 13px; font-weight: 600; text-align: right;">{origin_address}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 0; font-size: 13px; color: #666;">To:</td>
        <td style="padding: 10px 0; font-size: 13px; font-weight: 600; text-align: right;">{dest_address}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 0; font-size: 13px; color: #666;">Move Date:</td>
        <td style="padding: 10px 0; font-size: 13px; font-weight: 600; text-align: right;">{move_date}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; font-size: 15px; color: #1a1a1a; font-weight: 700;">Estimated Cost:</td>
        <td style="padding: 10px 0; font-size: 18px; font-weight: 700; text-align: right; color: #16a34a;">{estimated_value}</td>
      </tr>
    </table>
    <div style="text-align: center; margin: 24px 0;">
      <a href="{tracking_link}" style="display: inline-block; background: #16a34a; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Book Your Move</a>
    </div>
  </div>
</div>`,
  },
  {
    name: "Move Reminder",
    subject: "Your Move is Tomorrow, {first_name}!",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
  <div style="background: #16a34a; padding: 24px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 20px;">🚚 Your Move is Tomorrow!</h1>
  </div>
  <div style="padding: 24px;">
    <p style="font-size: 14px; color: #555;">Hi {first_name},</p>
    <p style="font-size: 14px; color: #555; line-height: 1.6;">Just a reminder that your move is scheduled for <strong>{move_date}</strong>.</p>
    <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 4px 0; font-size: 13px;"><strong>📍 Pickup:</strong> {origin_address}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>📍 Delivery:</strong> {dest_address}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>📋 Ref:</strong> {booking_id}</p>
    </div>
    <p style="font-size: 13px; color: #555;">Please ensure everything is packed and ready. Your crew will arrive at the scheduled time.</p>
    <p style="font-size: 12px; color: #999; margin-top: 20px;">— The TruMove Team</p>
  </div>
</div>`,
  },
];

const SMS_STARTERS = [
  { name: "Booking Confirmed", body: "TruMove: Hi {first_name}, your move is confirmed for {move_date}! Booking #{booking_id}. From: {origin_address} → {dest_address}. Questions? Reply HELP." },
  { name: "Crew On The Way", body: "TruMove: Your crew is on the way! ETA: {eta}. Track live: {tracking_link}" },
  { name: "Move Complete", body: "TruMove: Your move is complete, {first_name}! Thank you for choosing us. Questions? Call (800) 555-MOVE." },
  { name: "Quote Ready", body: "TruMove: Hi {first_name}, your moving quote is ready! Estimated cost: {estimated_value}. View details: {tracking_link}" },
  { name: "Payment Reminder", body: "TruMove: Hi {first_name}, reminder: your deposit for booking #{booking_id} is due. Questions? Reply or call (800) 555-MOVE." },
];

export default function MarketingTemplates() {
  const [channel, setChannel] = useState<"email" | "sms">("email");
  const [editorMode, setEditorMode] = useState<"builder" | "code" | "preview">("builder");
  const [showPreview, setShowPreview] = useState(false);
  const [emailBlocks, setEmailBlocks] = useState<EmailBlock[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [tplName, setTplName] = useState("");
  const [tplSubject, setTplSubject] = useState("");
  const [tplBody, setTplBody] = useState("");
  

  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["marketing-templates", channel],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("message_templates" as any)
        .select("*")
        .eq("channel", channel)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  // Save / Update
  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (editingId) {
        const { error } = await supabase
          .from("message_templates" as any)
          .update({
            name: tplName,
            subject: channel === "email" ? tplSubject : null,
            body: tplBody,
          } as any)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("message_templates" as any).insert({
          name: tplName,
          channel,
          subject: channel === "email" ? tplSubject : null,
          body: tplBody,
          created_by: userData.user?.id || null,
        } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-templates"] });
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
      toast.success(editingId ? "Template updated" : "Template saved — available everywhere");
      resetForm();
    },
    onError: (err: any) => toast.error("Save failed", { description: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("message_templates" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-templates"] });
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
      toast.success("Template deleted");
      resetForm();
    },
  });

  const resetForm = () => {
    setTplName("");
    setTplSubject("");
    setTplBody("");
    setEditingId(null);
  };

  const loadTemplate = (t: any) => {
    setTplName(t.name);
    setTplSubject(t.subject || "");
    setTplBody(t.body);
    setEditingId(t.id || null);
  };

  const loadStarter = (s: any) => {
    setTplName(s.name);
    setTplSubject(s.subject || "");
    setTplBody(s.body);
    setEditingId(null);
  };

  const insertTag = useCallback((tag: string) => {
    const el = bodyRef.current;
    if (!el) {
      setTplBody((prev) => prev + tag);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newVal = tplBody.slice(0, start) + tag + tplBody.slice(end);
    setTplBody(newVal);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  }, [tplBody]);

  const charCount = tplBody.length;
  const smsSegments = Math.ceil(charCount / 160) || 1;

  // Resolve merge tags for preview
  const previewResolve = (text: string) => {
    return text
      .replace(/\{customer_name\}/g, "Jane Smith")
      .replace(/\{first_name\}/g, "Jane")
      .replace(/\{last_name\}/g, "Smith")
      .replace(/\{email\}/g, "jane@example.com")
      .replace(/\{phone\}/g, "(555) 123-4567")
      .replace(/\{origin_address\}/g, "123 Oak St, Miami FL 33101")
      .replace(/\{dest_address\}/g, "456 Pine Ave, New York NY 10001")
      .replace(/\{move_date\}/g, "April 15, 2026")
      .replace(/\{booking_id\}/g, "TM-2026-0042")
      .replace(/\{estimated_value\}/g, "$3,450")
      .replace(/\{tracking_link\}/g, "https://trumoveinc.com/track/TM-2026-0042")
      .replace(/\{eta\}/g, "2:30 PM")
      .replace(/\{agent_name\}/g, "Mike Wilson")
      .replace(/\{company_name\}/g, "TruMove Inc");
  };

  return (
    <MarketingShell breadcrumb=" / Templates">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Template Builder</h1>
              <p className="text-xs text-muted-foreground">Create beautiful email & SMS templates with merge tags</p>
            </div>
          </div>
        </div>

        {/* Channel Tabs */}
        <Tabs value={channel} onValueChange={(v) => { setChannel(v as "email" | "sms"); resetForm(); }}>
          <TabsList className="h-9">
            <TabsTrigger value="email" className="gap-1.5 text-xs">
              <Mail className="w-3.5 h-3.5" /> Email Templates
            </TabsTrigger>
            <TabsTrigger value="sms" className="gap-1.5 text-xs">
              <MessageSquare className="w-3.5 h-3.5" /> SMS Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="mt-3">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
              {/* Sidebar — Templates list */}
              <div className="lg:col-span-1 bg-card rounded-xl border border-border">
                <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Your Templates</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={resetForm}>
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <ScrollArea className="h-[280px]">
                  <div className="p-2 space-y-0.5">
                    {/* Starters */}
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50 px-2 pt-1 pb-1">Starters</p>
                    {EMAIL_STARTERS.map((s, i) => (
                      <button key={i} onClick={() => loadStarter(s)} className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex items-center gap-2">
                        <Paintbrush className="w-3 h-3 shrink-0 text-primary/50" />
                        <span className="truncate">{s.name}</span>
                      </button>
                    ))}
                    {/* Saved */}
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50 px-2 pt-2 pb-1">Saved</p>
                    {isLoading && <p className="text-[10px] text-muted-foreground px-2">Loading...</p>}
                    {templates.length === 0 && !isLoading && (
                      <p className="text-[10px] text-muted-foreground/50 px-2">No saved templates</p>
                    )}
                    {templates.map((t: any) => (
                      <div key={t.id} className="group flex items-center">
                        <button onClick={() => loadTemplate(t)} className={cn(
                          "flex-1 text-left text-[11px] px-2.5 py-1.5 rounded-md hover:bg-muted transition-colors truncate",
                          editingId === t.id ? "bg-primary/5 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                        )}>
                          {t.name}
                        </button>
                        <button onClick={() => deleteMutation.mutate(t.id)} className="opacity-0 group-hover:opacity-100 p-1 text-destructive/50 hover:text-destructive transition-opacity">
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="lg:col-span-3 space-y-3">
                {/* Name + Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Template Name</Label>
                    <Input value={tplName} onChange={(e) => setTplName(e.target.value)} placeholder="e.g. Welcome Email" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Subject Line <span className="text-[9px] text-muted-foreground/50">(supports merge tags)</span></Label>
                    <Input value={tplSubject} onChange={(e) => setTplSubject(e.target.value)} placeholder="e.g. Welcome, {first_name}!" className="h-8 text-sm" />
                  </div>
                </div>

                {/* Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-0.5">
                    <button onClick={() => setEditorMode("builder")} className={cn("px-3 py-1 rounded-md text-[10px] font-medium transition-colors", editorMode === "builder" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
                      <Blocks className="w-3 h-3 inline mr-1" />Visual Builder
                    </button>
                    <button onClick={() => { setEditorMode("code"); if (emailBlocks.length > 0 && !tplBody) setTplBody(blocksToHtml(emailBlocks)); }} className={cn("px-3 py-1 rounded-md text-[10px] font-medium transition-colors", editorMode === "code" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
                      <Code className="w-3 h-3 inline mr-1" />HTML
                    </button>
                    <button onClick={() => { setEditorMode("preview"); if (emailBlocks.length > 0 && !tplBody) setTplBody(blocksToHtml(emailBlocks)); }} className={cn("px-3 py-1 rounded-md text-[10px] font-medium transition-colors", editorMode === "preview" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
                      <Eye className="w-3 h-3 inline mr-1" />Preview
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-[10px] h-7 gap-1" onClick={() => {
                      const html = emailBlocks.length > 0 ? blocksToHtml(emailBlocks) : tplBody;
                      navigator.clipboard.writeText(html);
                      toast.success("Copied to clipboard");
                    }}>
                      <Copy className="w-3 h-3" /> Copy HTML
                    </Button>
                  </div>
                </div>

                {/* Editor Area */}
                {editorMode === "builder" && (
                  <EmailBlockEditor blocks={emailBlocks} onChange={(blocks) => {
                    setEmailBlocks(blocks);
                    setTplBody(blocksToHtml(blocks));
                  }} />
                )}

                {editorMode === "code" && (
                  <>
                    {/* Merge Tags Bar */}
                    <div className="bg-card rounded-xl border border-border p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[11px] font-bold text-foreground">Merge Tags</span>
                        <span className="text-[9px] text-muted-foreground">— click to insert at cursor</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {MERGE_TAGS.map((mt) => {
                          const Icon = mt.icon;
                          return (
                            <button
                              key={mt.tag}
                              onClick={() => insertTag(mt.tag)}
                              title={mt.desc}
                              className="inline-flex items-center gap-1 bg-muted/50 hover:bg-primary/10 hover:text-primary border border-border rounded-md px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors"
                            >
                              <Icon className="w-2.5 h-2.5" />
                              {mt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="bg-card rounded-xl border border-border overflow-hidden min-h-[350px]">
                      <Textarea
                        ref={bodyRef}
                        value={tplBody}
                        onChange={(e) => setTplBody(e.target.value)}
                        placeholder="Paste HTML or write your email template here...&#10;&#10;Use merge tags like {first_name} to personalize."
                        className="min-h-[350px] font-mono text-xs border-0 rounded-none resize-none focus-visible:ring-0"
                      />
                    </div>
                  </>
                )}

                {editorMode === "preview" && (
                  <div className="bg-muted/30 rounded-xl border border-border p-4 min-h-[400px]">
                    {tplBody ? (
                      <div className="bg-white rounded-lg border border-border shadow-sm mx-auto max-w-[620px]">
                        <div dangerouslySetInnerHTML={{ __html: previewResolve(tplBody) }} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[300px] text-center">
                        <Paintbrush className="w-8 h-8 text-muted-foreground/15 mb-2" />
                        <p className="text-xs text-muted-foreground">Add blocks in Visual Builder or write HTML to see a preview</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      className="gap-1.5 text-xs"
                      disabled={!tplName || !tplBody || saveMutation.isPending}
                      onClick={() => saveMutation.mutate()}
                    >
                      {saveMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      {editingId ? "Update Template" : "Save Email Template"}
                    </Button>
                  </div>
                  <p className="text-[9px] text-muted-foreground">
                    <CheckCircle2 className="w-2.5 h-2.5 inline mr-0.5 text-emerald-500" />
                    Templates auto-appear in agent communication tabs
                  </p>
                </div>
              </div>

          {/* ═══ SMS TAB ═══ */}
          <TabsContent value="sms" className="mt-3">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
              {/* Sidebar */}
              <div className="lg:col-span-1 bg-card rounded-xl border border-border">
                <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">SMS Templates</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={resetForm}>
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <ScrollArea className="h-[280px]">
                  <div className="p-2 space-y-0.5">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50 px-2 pt-1 pb-1">Starters</p>
                    {SMS_STARTERS.map((s, i) => (
                      <button key={i} onClick={() => loadStarter(s)} className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex items-center gap-2">
                        <MessageSquare className="w-3 h-3 shrink-0 text-primary/50" />
                        <span className="truncate">{s.name}</span>
                      </button>
                    ))}
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50 px-2 pt-2 pb-1">Saved</p>
                    {templates.length === 0 && !isLoading && (
                      <p className="text-[10px] text-muted-foreground/50 px-2">No saved templates</p>
                    )}
                    {templates.map((t: any) => (
                      <div key={t.id} className="group flex items-center">
                        <button onClick={() => loadTemplate(t)} className={cn(
                          "flex-1 text-left text-[11px] px-2.5 py-1.5 rounded-md hover:bg-muted transition-colors truncate",
                          editingId === t.id ? "bg-primary/5 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                        )}>
                          {t.name}
                        </button>
                        <button onClick={() => deleteMutation.mutate(t.id)} className="opacity-0 group-hover:opacity-100 p-1 text-destructive/50 hover:text-destructive transition-opacity">
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* SMS Editor */}
              <div className="lg:col-span-3 space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Template Name</Label>
                  <Input value={tplName} onChange={(e) => setTplName(e.target.value)} placeholder="e.g. Booking Confirmed" className="h-8 text-sm" />
                </div>

                {/* Merge Tags */}
                <div className="bg-card rounded-xl border border-border p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[11px] font-bold text-foreground">Merge Tags</span>
                    <span className="text-[9px] text-muted-foreground">— click to insert at cursor</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {MERGE_TAGS.map((mt) => {
                      const Icon = mt.icon;
                      return (
                        <button
                          key={mt.tag}
                          onClick={() => insertTag(mt.tag)}
                          title={mt.desc}
                          className="inline-flex items-center gap-1 bg-muted/50 hover:bg-primary/10 hover:text-primary border border-border rounded-md px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors"
                        >
                          <Icon className="w-2.5 h-2.5" />
                          {mt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SMS Body */}
                <Textarea
                  ref={bodyRef}
                  value={tplBody}
                  onChange={(e) => setTplBody(e.target.value)}
                  placeholder="Type your SMS template here...&#10;Use {first_name}, {move_date} etc. to personalize."
                  className="min-h-[140px] text-sm"
                />

                {/* Character count + Segment info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn("text-[10px] font-medium", charCount > 160 ? "text-amber-600" : "text-muted-foreground")}>
                      {charCount} characters · {smsSegments} segment{smsSegments > 1 ? "s" : ""}
                    </span>
                    {charCount > 160 && (
                      <span className="text-[9px] text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        Multi-segment SMS — higher cost
                      </span>
                    )}
                  </div>
                </div>

                {/* SMS Preview */}
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[11px] font-bold text-foreground">Preview</span>
                  </div>
                  <div className="max-w-xs mx-auto">
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 text-sm text-foreground leading-relaxed">
                      {tplBody ? previewResolve(tplBody) : <span className="text-muted-foreground/50 italic text-xs">Your SMS preview will appear here...</span>}
                    </div>
                    <p className="text-[9px] text-muted-foreground/50 mt-1.5 text-right">Delivered</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      className="gap-1.5 text-xs"
                      disabled={!tplName || !tplBody || saveMutation.isPending}
                      onClick={() => saveMutation.mutate()}
                    >
                      {saveMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      {editingId ? "Update Template" : "Save SMS Template"}
                    </Button>
                  </div>
                  <p className="text-[9px] text-muted-foreground">
                    <CheckCircle2 className="w-2.5 h-2.5 inline mr-0.5 text-emerald-500" />
                    Templates auto-appear in agent communication tabs
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </MarketingShell>
  );
}
