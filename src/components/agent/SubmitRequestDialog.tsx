import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";

const CATEGORIES = [
  { value: "pto", label: "PTO / Time Off" },
  { value: "equipment", label: "Equipment Request" },
  { value: "it", label: "IT / Tech Support" },
  { value: "hr", label: "HR / Policy Question" },
  { value: "complaint", label: "Complaint / Issue" },
  { value: "other", label: "Other" },
];

interface SubmitRequestDialogProps {
  trigger: React.ReactNode;
}

export default function SubmitRequestDialog({ trigger }: SubmitRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({ title: "Please fill in subject and message", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, email")
        .eq("id", user?.id || "")
        .maybeSingle();

      const categoryLabel = CATEGORIES.find(c => c.value === category)?.label || "";
      const fullSubject = categoryLabel ? `[${categoryLabel}] ${subject.trim()}` : subject.trim();

      const { error } = await supabase.from("support_tickets").insert({
        name: profile?.display_name || user?.email?.split("@")[0] || "Agent",
        email: profile?.email || user?.email || "",
        subject: fullSubject,
        message: message.trim(),
      });

      if (error) throw error;

      toast({ title: "Request submitted successfully" });
      setCategory("");
      setSubject("");
      setMessage("");
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to submit request", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Submit a Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select category..." /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subject *</label>
            <Input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Brief description of your request"
              className="h-9 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Details *</label>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Provide details about your request..."
              rows={4}
              className="text-sm resize-none"
            />
          </div>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
