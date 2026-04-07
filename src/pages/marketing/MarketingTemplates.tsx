import { useState, useRef, useCallback } from "react";
import MarketingShell from "@/components/layout/MarketingShell";
import {
  Mail, MessageSquare, Plus, Trash2, Save, Eye, Code, Paintbrush,
  Copy, Loader2, FileText, Bold, Italic, Link2,
  Image, AlignLeft, List, Type, Hash, User, MapPin, Calendar,
  Phone, Package, Truck, DollarSign, Pencil, CheckCircle2, Blocks,
  ExternalLink, Search, LayoutTemplate, Sparkles,
} from "lucide-react";
import { openInOutlook } from "@/lib/openInOutlook";
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
  { tag: "{inventory_table}", label: "Inventory Table", icon: Package, desc: "Full item list by room" },
  { tag: "{total_cuft}", label: "Total Cu Ft", icon: Package, desc: "Total cubic feet" },
  { tag: "{total_weight}", label: "Total Weight", icon: Package, desc: "Total weight (lbs)" },
  { tag: "{total_items}", label: "Total Items", icon: Package, desc: "Total item count" },
  { tag: "{price_per_cuft}", label: "Price/Cu Ft", icon: DollarSign, desc: "Rate per cubic foot" },
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
      <tr style="border-bottom: 1px solid #e5e7eb;"><td style="padding: 10px 0; font-size: 13px; color: #666;">From:</td><td style="padding: 10px 0; font-size: 13px; font-weight: 600; text-align: right;">{origin_address}</td></tr>
      <tr style="border-bottom: 1px solid #e5e7eb;"><td style="padding: 10px 0; font-size: 13px; color: #666;">To:</td><td style="padding: 10px 0; font-size: 13px; font-weight: 600; text-align: right;">{dest_address}</td></tr>
      <tr style="border-bottom: 1px solid #e5e7eb;"><td style="padding: 10px 0; font-size: 13px; color: #666;">Move Date:</td><td style="padding: 10px 0; font-size: 13px; font-weight: 600; text-align: right;">{move_date}</td></tr>
      <tr><td style="padding: 10px 0; font-size: 15px; color: #1a1a1a; font-weight: 700;">Estimated Cost:</td><td style="padding: 10px 0; font-size: 18px; font-weight: 700; text-align: right; color: #16a34a;">{estimated_value}</td></tr>
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
  <div style="background: #16a34a; padding: 24px; text-align: center;"><h1 style="color: #ffffff; margin: 0; font-size: 20px;">🚚 Your Move is Tomorrow!</h1></div>
  <div style="padding: 24px;">
    <p style="font-size: 14px; color: #555;">Hi {first_name},</p>
    <p style="font-size: 14px; color: #555; line-height: 1.6;">Just a reminder that your move is scheduled for <strong>{move_date}</strong>.</p>
    <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 4px 0; font-size: 13px;"><strong>📍 Pickup:</strong> {origin_address}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>📍 Delivery:</strong> {dest_address}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>📋 Ref:</strong> {booking_id}</p>
    </div>
    <p style="font-size: 13px; color: #555;">Please ensure everything is packed and ready.</p>
    <p style="font-size: 12px; color: #999; margin-top: 20px;">— The TruMove Team</p>
  </div>
</div>`,
  },
  {
    name: "Inventory Summary",
    subject: "Your Inventory & Moving Estimate — {booking_id}",
    body: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 0; overflow: hidden;">
  <div style="background: #22c55e; padding: 4px 0;"></div>
  <div style="padding: 32px 32px 20px; text-align: center;"><img src="/images/logo-email.png" alt="TruMove" style="height: 28px; margin-bottom: 16px;" /></div>
  <div style="background: #0a0a0a; padding: 36px 32px; text-align: center;"><h1 style="color: #ffffff; margin: 0 0 8px; font-size: 26px; font-weight: 700; letter-spacing: -0.3px;">Your Inventory Summary</h1><p style="color: #9ca3af; margin: 0; font-size: 14px;">Reference: {booking_id}</p></div>
  <div style="padding: 28px 32px;">
    <p style="font-size: 15px; color: #1a1a1a; margin: 0 0 16px;">Hi {first_name},</p>
    <p style="font-size: 14px; color: #555; line-height: 1.7; margin: 0 0 24px;">Here's a complete breakdown of the items we'll be moving for you.</p>
    <div style="background: #f8fafc; border-radius: 10px; padding: 20px; margin: 0 0 24px; border: 1px solid #e5e7eb;">
      <table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 8px 0; text-align: center; border-right: 1px solid #e5e7eb;"><p style="margin: 0; font-size: 22px; font-weight: 700; color: #0a0a0a;">{total_items}</p><p style="margin: 4px 0 0; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Items</p></td><td style="padding: 8px 0; text-align: center; border-right: 1px solid #e5e7eb;"><p style="margin: 0; font-size: 22px; font-weight: 700; color: #0a0a0a;">{total_cuft}</p><p style="margin: 4px 0 0; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Cu Ft</p></td><td style="padding: 8px 0; text-align: center;"><p style="margin: 0; font-size: 22px; font-weight: 700; color: #0a0a0a;">{total_weight}</p><p style="margin: 4px 0 0; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Lbs</p></td></tr></table>
    </div>
    <div style="background: #0a0a0a; border-radius: 10px; padding: 20px 24px; margin: 0 0 24px; text-align: center;"><p style="margin: 0 0 4px; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">Estimated Total</p><p style="margin: 0; font-size: 30px; font-weight: 700; color: #22c55e;">{estimated_value}</p><p style="margin: 6px 0 0; font-size: 12px; color: #6b7280;">at {price_per_cuft}/cu ft</p></div>
    <h2 style="font-size: 16px; font-weight: 700; color: #0a0a0a; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #22c55e; display: inline-block;">Inventory by Room</h2>
    {inventory_table}
    <div style="margin: 28px 0 0; text-align: center;"><a href="{tracking_link}" style="display: inline-block; background: #22c55e; color: #ffffff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">Confirm Your Move →</a></div>
  </div>
  <div style="border-top: 1px solid #e5e7eb; padding: 20px 32px; text-align: center;"><p style="margin: 0; font-size: 14px; color: #374151;">Questions?</p><p style="margin: 6px 0 0; font-size: 13px; color: #6b7280;">Reply or call <strong>(800) 555-MOVE</strong></p></div>
  <div style="padding: 20px 32px; text-align: center;"><p style="margin: 0; font-size: 11px; color: #9ca3af; line-height: 1.6;">TruMove Inc · Licensed & Insured</p></div>
  <div style="background: #0a0a0a; padding: 4px 0;"></div>
</div>`,
  },
];

const BLANK_BRANDED_BLOCKS: EmailBlock[] = [
  { id: "brand-top-accent", type: "header", props: { text: " ", bgColor: "#22c55e", textColor: "#22c55e", fontSize: 1, padding: 3, align: "center" } },
  { id: "brand-logo-area", type: "image", props: { src: "/images/logo-email.png", alt: "TruMove Inc", width: 20, align: "center", padding: 32 } },
  { id: "brand-hero", type: "header", props: { text: "Your move starts here.", bgColor: "#0a0a0a", textColor: "#ffffff", fontSize: 28, padding: 40, align: "center" } },
  { id: "brand-hero-sub", type: "text", props: { text: "We make moving effortless — from first quote to final delivery.", fontSize: 15, textColor: "#9ca3af", lineHeight: 1.5, padding: 0, align: "center" } },
  { id: "brand-hero-cta", type: "button", props: { text: "Get Your Free Quote", href: "{tracking_link}", bgColor: "#22c55e", textColor: "#ffffff", borderRadius: 8, fontSize: 15, padding: 32, align: "center" } },
  { id: "brand-hero-end", type: "header", props: { text: " ", bgColor: "#0a0a0a", textColor: "#0a0a0a", fontSize: 1, padding: 12, align: "center" } },
  { id: "brand-spacer-1", type: "spacer", props: { height: 12 } },
  { id: "brand-body", type: "text", props: { text: "Hi {first_name},\n\nThanks for reaching out to TruMove. We're putting together your personalized moving plan right now.\n\nHere's what happens next:", fontSize: 14, textColor: "#374151", lineHeight: 1.8, padding: 28, align: "left" } },
  { id: "brand-step-1", type: "text", props: { text: "✅  Your dedicated move coordinator reviews your details\n✅  We match you with top-rated, vetted carriers\n✅  You get a transparent, binding quote — no surprises", fontSize: 14, textColor: "#0a0a0a", lineHeight: 2.0, padding: 20, align: "left" } },
  { id: "brand-accent-line", type: "divider", props: { color: "#22c55e", thickness: 2, padding: 16 } },
  { id: "brand-closing", type: "text", props: { text: "Questions? Just reply to this email — a real person will get back to you within the hour.", fontSize: 14, textColor: "#6b7280", lineHeight: 1.7, padding: 24, align: "center" } },
  { id: "brand-cta-2", type: "button", props: { text: "View My Quote →", href: "{tracking_link}", bgColor: "#0a0a0a", textColor: "#ffffff", borderRadius: 6, fontSize: 14, padding: 8, align: "center" } },
  { id: "brand-spacer-2", type: "spacer", props: { height: 20 } },
  { id: "brand-divider-footer", type: "divider", props: { color: "#e5e7eb", thickness: 1, padding: 0 } },
  { id: "brand-footer", type: "text", props: { text: "TruMove Inc · Licensed & Insured\n(800) 555-MOVE · support@trumoveinc.com\n\nYou're receiving this because you requested a quote.\nUnsubscribe · Privacy Policy", fontSize: 11, textColor: "#9ca3af", lineHeight: 1.7, padding: 24, align: "center" } },
  { id: "brand-bottom-accent", type: "header", props: { text: " ", bgColor: "#0a0a0a", textColor: "#0a0a0a", fontSize: 1, padding: 4, align: "center" } },
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
  const [editorMode, setEditorMode] = useState<"builder" | "code" | "preview">("preview");
  const [showPreview, setShowPreview] = useState(false);
  const [emailBlocks, setEmailBlocks] = useState<EmailBlock[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sidebarSearch, setSidebarSearch] = useState("");

  const [tplName, setTplName] = useState("");
  const [tplSubject, setTplSubject] = useState("");
  const [tplBody, setTplBody] = useState("");

  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

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

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (editingId) {
        const { error } = await supabase.from("message_templates" as any).update({ name: tplName, subject: channel === "email" ? tplSubject : null, body: tplBody } as any).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("message_templates" as any).insert({ name: tplName, channel, subject: channel === "email" ? tplSubject : null, body: tplBody, created_by: userData.user?.id || null } as any);
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
    setTplName(""); setTplSubject(""); setTplBody(""); setEditingId(null); setEmailBlocks([]); setEditorMode("builder");
  };

  const loadTemplate = (t: any) => {
    setTplName(t.name); setTplSubject(t.subject || ""); setTplBody(t.body); setEditingId(t.id || null); setEmailBlocks([]);
    if (channel === "email") setEditorMode("code");
  };

  const loadStarter = (s: any) => {
    setTplName(s.name); setTplSubject(s.subject || ""); setTplBody(s.body); setEditingId(null); setEmailBlocks([]);
    if (channel === "email") setEditorMode("code");
  };

  const loadBlankBranded = () => {
    const blocks = JSON.parse(JSON.stringify(BLANK_BRANDED_BLOCKS)) as EmailBlock[];
    setTplName("New Email"); setTplSubject(""); setEmailBlocks(blocks); setTplBody(blocksToHtml(blocks)); setEditingId(null); setEditorMode("builder");
  };

  const insertTag = useCallback((tag: string) => {
    const el = bodyRef.current;
    if (!el) { setTplBody((prev) => prev + tag); return; }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newVal = tplBody.slice(0, start) + tag + tplBody.slice(end);
    setTplBody(newVal);
    setTimeout(() => { el.focus(); el.setSelectionRange(start + tag.length, start + tag.length); }, 0);
  }, [tplBody]);

  const charCount = tplBody.length;
  const smsSegments = Math.ceil(charCount / 160) || 1;

  const previewResolve = (text: string) => {
    const sampleInventoryTable = `<div style="margin:0 0 12px;border:1px solid #f0f0f0;border-radius:8px;overflow:hidden;"><div style="font-size:12px;font-weight:600;color:#374151;padding:10px 14px;background:#f8fafc;border-bottom:1px solid #f0f0f0;">Living Room</div><table style="width:100%;border-collapse:collapse;"><tr><td style="font-size:10px;font-weight:600;color:#9ca3af;padding:8px 14px;text-transform:uppercase;border-bottom:1px solid #f0f0f0;">Item</td><td style="font-size:10px;font-weight:600;color:#9ca3af;padding:8px 14px;text-align:center;border-bottom:1px solid #f0f0f0;">Qty</td><td style="font-size:10px;font-weight:600;color:#9ca3af;padding:8px 14px;text-align:right;border-bottom:1px solid #f0f0f0;">Cu Ft</td><td style="font-size:10px;font-weight:600;color:#9ca3af;padding:8px 14px;text-align:right;border-bottom:1px solid #f0f0f0;">Lbs</td></tr><tr><td style="font-size:13px;color:#374151;padding:8px 14px;">3-Seat Sofa</td><td style="font-size:13px;color:#374151;padding:8px 14px;text-align:center;">1</td><td style="font-size:13px;color:#374151;padding:8px 14px;text-align:right;">50</td><td style="font-size:13px;color:#374151;padding:8px 14px;text-align:right;">120</td></tr></table></div>`;
    return text.replace(/\{customer_name\}/g, "Jane Smith").replace(/\{first_name\}/g, "Jane").replace(/\{last_name\}/g, "Smith").replace(/\{email\}/g, "jane@example.com").replace(/\{phone\}/g, "(555) 123-4567").replace(/\{origin_address\}/g, "123 Oak St, Miami FL 33101").replace(/\{dest_address\}/g, "456 Pine Ave, New York NY 10001").replace(/\{move_date\}/g, "April 15, 2026").replace(/\{booking_id\}/g, "TM-2026-0042").replace(/\{estimated_value\}/g, "$3,450").replace(/\{tracking_link\}/g, "https://trumoveinc.com/track/TM-2026-0042").replace(/\{eta\}/g, "2:30 PM").replace(/\{agent_name\}/g, "Mike Wilson").replace(/\{company_name\}/g, "TruMove Inc").replace(/\{inventory_table\}/g, sampleInventoryTable).replace(/\{total_cuft\}/g, "680").replace(/\{total_weight\}/g, "5,100").replace(/\{total_items\}/g, "42").replace(/\{price_per_cuft\}/g, "$7.50");
  };

  // Filter sidebar items
  const lowerSearch = sidebarSearch.toLowerCase();
  const filteredStarters = channel === "email"
    ? EMAIL_STARTERS.filter(s => s.name.toLowerCase().includes(lowerSearch))
    : SMS_STARTERS.filter(s => s.name.toLowerCase().includes(lowerSearch));
  const filteredTemplates = templates.filter((t: any) => t.name.toLowerCase().includes(lowerSearch));

  const TemplateList = () => (
    <div className="flex flex-col h-full">
      {/* Sidebar header */}
      <div className="px-4 py-3.5 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Templates</span>
          </div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary" onClick={resetForm}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
            placeholder="Search templates..."
            className="h-8 pl-8 text-xs bg-muted/30 border-border/50 focus:bg-background"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {/* Starters section */}
          <div className="flex items-center gap-2 px-2 pt-1 pb-2">
            <Sparkles className="w-3 h-3 text-primary/60" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">Starters</span>
          </div>

          {channel === "email" && (
            <button onClick={loadBlankBranded} className="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/5 transition-all group flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15">
                <Blocks className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium text-foreground block truncate">Blank (TruMove Branded)</span>
                <span className="text-[10px] text-muted-foreground">Visual Builder</span>
              </div>
            </button>
          )}

          {filteredStarters.map((s, i) => (
            <button key={i} onClick={() => loadStarter(s)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/60 transition-all group flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-muted">
                {channel === "email" ? <Paintbrush className="w-3.5 h-3.5 text-muted-foreground" /> : <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />}
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground truncate transition-colors">{s.name}</span>
            </button>
          ))}

          {/* Saved section */}
          <div className="flex items-center gap-2 px-2 pt-4 pb-2">
            <Save className="w-3 h-3 text-muted-foreground/40" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">Saved</span>
            {filteredTemplates.length > 0 && (
              <Badge variant="secondary" className="text-[9px] h-4 px-1.5 ml-auto">{filteredTemplates.length}</Badge>
            )}
          </div>

          {isLoading && <p className="text-[11px] text-muted-foreground px-3 py-2">Loading...</p>}
          {filteredTemplates.length === 0 && !isLoading && (
            <div className="px-3 py-6 text-center">
              <FileText className="w-6 h-6 text-muted-foreground/15 mx-auto mb-2" />
              <p className="text-[11px] text-muted-foreground/50">No saved templates yet</p>
            </div>
          )}
          {filteredTemplates.map((t: any) => (
            <div key={t.id} className="group flex items-center rounded-lg hover:bg-muted/40 transition-all">
              <button onClick={() => loadTemplate(t)} className={cn(
                "flex-1 text-left px-3 py-2 rounded-lg truncate text-xs transition-colors",
                editingId === t.id ? "bg-primary/8 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              )}>
                {t.name}
              </button>
              <button onClick={() => deleteMutation.mutate(t.id)} className="opacity-0 group-hover:opacity-100 p-1.5 mr-1 text-muted-foreground hover:text-destructive transition-all rounded-md hover:bg-destructive/10">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const MergeTagsBar = () => (
    <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
          <Hash className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-xs font-semibold text-foreground">Merge Tags</span>
        <span className="text-[10px] text-muted-foreground/60 ml-1">Click to insert at cursor</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {MERGE_TAGS.map((mt) => {
          const Icon = mt.icon;
          return (
            <button
              key={mt.tag}
              onClick={() => insertTag(mt.tag)}
              title={mt.desc}
              className="inline-flex items-center gap-1.5 bg-muted/40 hover:bg-primary/10 hover:text-primary border border-border/40 hover:border-primary/30 rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground transition-all"
            >
              <Icon className="w-2.5 h-2.5" />
              {mt.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <MarketingShell breadcrumb=" / Templates">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">Template Builder</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Design and manage your email & SMS templates</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] gap-1 border-primary/20 text-primary">
              <CheckCircle2 className="w-3 h-3" /> Auto-syncs to agents
            </Badge>
          </div>
        </div>

        {/* Channel Tabs */}
        <Tabs value={channel} onValueChange={(v) => { setChannel(v as "email" | "sms"); resetForm(); setSidebarSearch(""); }}>
          <TabsList className="h-10 bg-muted/30 p-1 rounded-xl">
            <TabsTrigger value="email" className="gap-2 text-xs rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-5">
              <Mail className="w-3.5 h-3.5" /> Email
            </TabsTrigger>
            <TabsTrigger value="sms" className="gap-2 text-xs rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-5">
              <MessageSquare className="w-3.5 h-3.5" /> SMS
            </TabsTrigger>
          </TabsList>

          {/* ═══ EMAIL TAB ═══ */}
          <TabsContent value="email" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
              {/* Sidebar */}
              <div className="bg-card rounded-xl border border-border overflow-hidden lg:max-h-[calc(100vh-14rem)]">
                <TemplateList />
              </div>

              {/* Editor area */}
              <div className="space-y-4">
                {/* Name + Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Template Name</Label>
                    <Input value={tplName} onChange={(e) => setTplName(e.target.value)} placeholder="e.g. Welcome Email" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Subject Line <span className="text-[9px] text-muted-foreground/40">(merge tags supported)</span></Label>
                    <Input value={tplSubject} onChange={(e) => setTplSubject(e.target.value)} placeholder="e.g. Welcome, {first_name}!" className="h-9 text-sm" />
                  </div>
                </div>

                {/* Mode Toggle + Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5 bg-muted/30 rounded-xl p-1 border border-border/40">
                    <button onClick={() => setEditorMode("builder")} className={cn("px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5", editorMode === "builder" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                      <Blocks className="w-3.5 h-3.5" /> Builder
                    </button>
                    <button onClick={() => { setEditorMode("code"); if (emailBlocks.length > 0 && !tplBody) setTplBody(blocksToHtml(emailBlocks)); }} className={cn("px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5", editorMode === "code" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                      <Code className="w-3.5 h-3.5" /> HTML
                    </button>
                    <button onClick={() => { setEditorMode("preview"); if (emailBlocks.length > 0 && !tplBody) setTplBody(blocksToHtml(emailBlocks)); }} className={cn("px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5", editorMode === "preview" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5 rounded-lg" onClick={() => {
                    const html = emailBlocks.length > 0 ? blocksToHtml(emailBlocks) : tplBody;
                    navigator.clipboard.writeText(html);
                    toast.success("Copied to clipboard");
                  }}>
                    <Copy className="w-3.5 h-3.5" /> Copy HTML
                  </Button>
                </div>

                {/* Editor Area */}
                {editorMode === "builder" && (
                  <EmailBlockEditor blocks={emailBlocks} onChange={(blocks) => { setEmailBlocks(blocks); setTplBody(blocksToHtml(blocks)); }} />
                )}

                {editorMode === "code" && (
                  <div className="space-y-4">
                    <MergeTagsBar />
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                      <Textarea
                        ref={bodyRef}
                        value={tplBody}
                        onChange={(e) => setTplBody(e.target.value)}
                        placeholder="Paste HTML or write your email template here...&#10;&#10;Use merge tags like {first_name} to personalize."
                        className="min-h-[380px] font-mono text-xs border-0 rounded-none resize-none focus-visible:ring-0 bg-background"
                      />
                    </div>
                  </div>
                )}

                {editorMode === "preview" && (
                  <div className="bg-muted/20 rounded-xl border border-border p-6 min-h-[420px]">
                    {tplBody ? (
                      <div className="bg-white rounded-xl border border-border shadow-sm mx-auto max-w-[620px] overflow-hidden">
                        <div dangerouslySetInnerHTML={{ __html: previewResolve(tplBody) }} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[320px] text-center">
                        <Paintbrush className="w-10 h-10 text-muted-foreground/10 mb-3" />
                        <p className="text-sm text-muted-foreground/60">Add blocks in Visual Builder or write HTML to see a preview</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <Button size="sm" className="gap-2 text-xs h-9 px-5 rounded-lg" disabled={!tplName || !tplBody || saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                      {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      {editingId ? "Update Template" : "Save Template"}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 text-xs h-9 rounded-lg" disabled={!tplBody} onClick={() => { openInOutlook({ to: "", subject: tplSubject || tplName || "Template Preview", body: tplBody }); toast.success("Opening in Outlook..."); }}>
                      <ExternalLink className="w-3.5 h-3.5" /> Test in Outlook
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ═══ SMS TAB ═══ */}
          <TabsContent value="sms" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
              {/* Sidebar */}
              <div className="bg-card rounded-xl border border-border overflow-hidden lg:max-h-[calc(100vh-14rem)]">
                <TemplateList />
              </div>

              {/* SMS Editor */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Template Name</Label>
                  <Input value={tplName} onChange={(e) => setTplName(e.target.value)} placeholder="e.g. Booking Confirmed" className="h-9 text-sm" />
                </div>

                <MergeTagsBar />

                {/* SMS Body */}
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <Textarea
                    ref={bodyRef}
                    value={tplBody}
                    onChange={(e) => setTplBody(e.target.value)}
                    placeholder="Type your SMS template here...&#10;Use {first_name}, {move_date} etc. to personalize."
                    className="min-h-[160px] text-sm border-0 rounded-none resize-none focus-visible:ring-0"
                  />
                  <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/50 bg-muted/20">
                    <div className="flex items-center gap-3">
                      <span className={cn("text-[11px] font-medium", charCount > 160 ? "text-amber-600" : "text-muted-foreground")}>
                        {charCount} chars · {smsSegments} segment{smsSegments > 1 ? "s" : ""}
                      </span>
                      {charCount > 160 && (
                        <Badge variant="outline" className="text-[9px] h-4 border-amber-500/30 text-amber-600 bg-amber-500/5">
                          Multi-segment
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* SMS Preview */}
                <div className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                      <Eye className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">Live Preview</span>
                  </div>
                  <div className="max-w-sm mx-auto">
                    {/* Phone mockup */}
                    <div className="bg-muted/30 rounded-2xl border border-border p-4 space-y-2">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <MessageSquare className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-[11px] font-semibold text-foreground">TruMove</span>
                      </div>
                      <div className="bg-primary/10 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-foreground leading-relaxed">
                        {tplBody ? previewResolve(tplBody) : <span className="text-muted-foreground/40 italic text-xs">Your SMS preview will appear here...</span>}
                      </div>
                      <p className="text-[9px] text-muted-foreground/40 text-right pr-1">Delivered · Now</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <Button size="sm" className="gap-2 text-xs h-9 px-5 rounded-lg" disabled={!tplName || !tplBody || saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                    {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    {editingId ? "Update Template" : "Save SMS Template"}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MarketingShell>
  );
}
